import { useState, useEffect, useRef } from "react";
import socket from "../socket.js";
import PlayerCard from "../components/PlayerCard.jsx";
import BidPanel from "../components/BidPanel.jsx";
import TimerBar from "../components/TimerBar.jsx";
import TeamSidebar from "../components/TeamSidebar.jsx";
import PlayerListSidebar from "../components/PlayerListSidebar.jsx";

export default function AuctionRoom({ roomState, setRoomState, myId, initialAuctionData }) {
  const [auctionData, setAuctionData] = useState(initialAuctionData);
  const [currentBid, setCurrentBid] = useState(null);
  const [highestBidder, setHighestBidder] = useState(null);
  const [highestBidderName, setHighestBidderName] = useState(null);
  const [timer, setTimer] = useState(10);
  const [soldMessage, setSoldMessage] = useState(null);
  const [auctionEnded, setAuctionEnded] = useState(false);
  const [finalState, setFinalState] = useState(null);
  const [soldHistory, setSoldHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("players");
  const soldMsgTimeout = useRef(null);

  const isHost = roomState?.host === myId;
  const auctionStarted = !!auctionData;
  const myUser = roomState?.users?.find((u) => u.id === myId);

  useEffect(() => {
    if (initialAuctionData) {
      setAuctionData(initialAuctionData);
      setCurrentBid(initialAuctionData.currentBid);
      setHighestBidder(initialAuctionData.highestBidder);
      setHighestBidderName(initialAuctionData.highestBidderName);
      setTimer(initialAuctionData.timer);
    }
  }, [initialAuctionData]);

  useEffect(() => {
    socket.on("auction_started", (data) => {
      setAuctionData(data);
      setCurrentBid(data.currentBid);
      setHighestBidder(data.highestBidder);
      setHighestBidderName(data.highestBidderName);
      setTimer(data.timer);
    });

    socket.on("bid_update", (data) => {
      setCurrentBid(data.currentBid);
      setHighestBidder(data.highestBidder);
      setHighestBidderName(data.highestBidderName);
      setTimer(data.timer);
      setRoomState(data.roomState);
    });

    socket.on("timer_tick", ({ timer }) => {
      setTimer(timer);
    });

    socket.on("new_player", (data) => {
      setAuctionData(data);
      setCurrentBid(data.currentBid);
      setHighestBidder(data.highestBidder);
      setHighestBidderName(data.highestBidderName);
      setTimer(data.timer);
      setRoomState(data.roomState);
      setSoldMessage(null);
    });

    socket.on("player_sold", ({ player, soldTo, roomState: rs }) => {
      setRoomState(rs);
      setSoldMessage({ player, soldTo });
      setSoldHistory((prev) => [{ player, soldTo }, ...prev.slice(0, 19)]);
      if (soldMsgTimeout.current) clearTimeout(soldMsgTimeout.current);
      soldMsgTimeout.current = setTimeout(() => setSoldMessage(null), 2000);
    });

    socket.on("room_update", ({ roomState: rs }) => {
      setRoomState(rs);
    });

    socket.on("auction_ended", ({ finalState: fs }) => {
      setAuctionEnded(true);
      setFinalState(fs);
    });

    return () => {
      socket.off("auction_started");
      socket.off("bid_update");
      socket.off("timer_tick");
      socket.off("new_player");
      socket.off("player_sold");
      socket.off("room_update");
      socket.off("auction_ended");
    };
  }, []);

  const handleBid = (increment) => {
    const newBid = Math.round(((currentBid || 0) + increment) * 10) / 10;
    socket.emit("place_bid", { amount: newBid });
  };

  const handleStartAuction = () => {
    socket.emit("start_auction");
  };

  if (auctionEnded && finalState) {
    return <FinalScreen finalState={finalState} myId={myId} />;
  }

  return (
    <div className="min-h-screen cricket-bg flex flex-col">
      {/* Top Bar */}
      <header className="bg-pitch-800 border-b border-pitch-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏆</span>
          <div>
            <h1 className="font-display text-xl text-gold-400 tracking-widest leading-none">IPL AUCTION</h1>
            <p className="text-xs text-blue-400 font-mono">ROOM: {roomState?.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {auctionData && (
            <span className="text-xs text-blue-300 bg-pitch-700 px-3 py-1 rounded-full border border-pitch-600">
              Player {(auctionData.currentIndex || 0) + 1}/{auctionData.totalPlayers}
            </span>
          )}
          <div className="text-right">
            <p className="text-xs text-blue-400">Your Budget</p>
            <p className="text-gold-400 font-display text-lg leading-none">₹{myUser?.budget || 0}Cr</p>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-56 bg-pitch-800 border-r border-pitch-700 flex-col hidden lg:flex">
          <div className="flex border-b border-pitch-700">
            {["players", "sold"].map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`flex-1 py-2 text-xs uppercase tracking-widest font-semibold transition-colors ${
                  activeTab === t ? "text-gold-400 border-b-2 border-gold-400" : "text-blue-400 hover:text-blue-200"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto">
            {activeTab === "players" ? (
              <PlayerListSidebar auctionData={auctionData} />
            ) : (
              <SoldHistorySidebar history={soldHistory} />
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!auctionStarted ? (
            <WaitingLobby
              roomState={roomState}
              myId={myId}
              isHost={isHost}
              onStart={handleStartAuction}
            />
          ) : (
            <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto">
              <TimerBar timer={timer} />

              {/* Sold Message Overlay */}
              {soldMessage && (
                <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
                  <div className="bg-pitch-800 border-2 border-gold-400 rounded-2xl p-8 text-center animate-bounce-in shadow-2xl">
                    <div className="text-5xl mb-2">{soldMessage.player.image}</div>
                    <p className="font-display text-3xl text-gold-400">SOLD!</p>
                    <p className="text-white text-xl font-semibold">{soldMessage.player.name}</p>
                    {soldMessage.soldTo ? (
                      <>
                        <p className="text-blue-300 mt-1">to <span className="text-gold-400 font-bold">{soldMessage.soldTo.name}</span></p>
                        <p className="text-green-400 font-display text-2xl">₹{soldMessage.soldTo.price}Cr</p>
                      </>
                    ) : (
                      <p className="text-red-400 mt-2">UNSOLD</p>
                    )}
                  </div>
                </div>
              )}

              {auctionData?.currentPlayer && (
                <PlayerCard
                  player={auctionData.currentPlayer}
                  currentBid={currentBid}
                  highestBidderName={highestBidderName}
                  myId={myId}
                  highestBidder={highestBidder}
                />
              )}

              <BidPanel
                currentBid={currentBid}
                myBudget={myUser?.budget || 0}
                isHighestBidder={highestBidder === myId}
                onBid={handleBid}
              />

              {/* Users Row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {roomState?.users?.map((user) => (
                  <div
                    key={user.id}
                    className={`bg-pitch-800 rounded-xl p-3 border transition-all ${
                      user.id === highestBidder
                        ? "border-gold-400 bg-gold-500/10"
                        : "border-pitch-700"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{user.id === myId ? "👤" : "🏏"}</span>
                      <span className="text-sm font-semibold text-white truncate">{user.name}</span>
                      {user.id === highestBidder && <span className="text-xs text-gold-400">👑</span>}
                      {user.id === roomState.host && <span className="text-xs text-blue-400">H</span>}
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-blue-400">₹{user.budget}Cr</span>
                      <span className="text-green-400">{user.teamCount} players</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - My Team */}
        <div className="w-56 bg-pitch-800 border-l border-pitch-700 hidden lg:block overflow-y-auto">
          <TeamSidebar myUser={myUser} />
        </div>
      </div>
    </div>
  );
}

// ─── Waiting Lobby ────────────────────────────────────────────────────────────
function WaitingLobby({ roomState, myId, isHost, onStart }) {
  const [budgetInput, setBudgetInput] = useState(roomState?.defaultBudget || 100);
  const [budgetSaved, setBudgetSaved] = useState(false);

  const handleBudgetChange = (val) => {
    setBudgetInput(val);
    setBudgetSaved(false);
  };

  const saveBudget = () => {
    const parsed = parseFloat(budgetInput);
    if (isNaN(parsed) || parsed < 10) return;
    socket.emit("set_budget", { budget: parsed });
    setBudgetSaved(true);
    setTimeout(() => setBudgetSaved(false), 2000);
  };

  // sync if roomState budget changes (another user joined etc)
  useEffect(() => {
    if (roomState?.defaultBudget) setBudgetInput(roomState.defaultBudget);
  }, [roomState?.defaultBudget]);

  const BUDGET_PRESETS = [50, 100, 150, 200, 500];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6">
      <div className="text-center">
        <div className="text-6xl mb-4">🏟️</div>
        <h2 className="font-display text-4xl text-gold-400 tracking-widest">AUCTION LOBBY</h2>
        <p className="text-blue-400 mt-2">
          Room: <span className="text-white font-mono font-bold">{roomState?.id}</span>
        </p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        {/* Budget Config — host only */}
        <div className="bg-pitch-800 rounded-2xl border border-pitch-700 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs text-blue-400 uppercase tracking-widest font-semibold">
              Starting Budget
            </h3>
            {!isHost && (
              <span className="text-xs text-pitch-600 italic">Set by host</span>
            )}
          </div>

          {isHost ? (
            <>
              {/* Preset buttons */}
              <div className="flex gap-2 flex-wrap mb-3">
                {BUDGET_PRESETS.map((b) => (
                  <button
                    key={b}
                    onClick={() => handleBudgetChange(b)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      budgetInput === b
                        ? "bg-gold-500 text-pitch-900 border-gold-400"
                        : "bg-pitch-900 text-blue-300 border-pitch-700 hover:border-blue-500"
                    }`}
                  >
                    ₹{b}Cr
                  </button>
                ))}
              </div>

              {/* Custom input */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 text-sm">₹</span>
                  <input
                    type="number"
                    min="10"
                    max="10000"
                    step="10"
                    value={budgetInput}
                    onChange={(e) => handleBudgetChange(parseFloat(e.target.value) || "")}
                    className="w-full bg-pitch-900 border border-pitch-700 rounded-xl pl-7 pr-3 py-2.5 text-white focus:outline-none focus:border-gold-500 transition-colors text-sm"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 text-xs">Cr</span>
                </div>
                <button
                  onClick={saveBudget}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                    budgetSaved
                      ? "bg-green-600 text-white border-green-500"
                      : "bg-pitch-700 text-blue-300 border-pitch-600 hover:bg-pitch-600 hover:text-white"
                  }`}
                >
                  {budgetSaved ? "✓ Saved" : "Apply"}
                </button>
              </div>
              <p className="text-xs text-blue-600 mt-2">Min ₹10Cr · All players get this budget</p>
            </>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-white font-display text-3xl text-gold-400">
                ₹{roomState?.defaultBudget || 100}Cr
              </span>
              <span className="text-xs text-blue-500">per team</span>
            </div>
          )}
        </div>

        {/* Players list */}
        <div className="bg-pitch-800 rounded-2xl border border-pitch-700 p-5">
          <h3 className="text-xs text-blue-400 uppercase tracking-widest font-semibold mb-3">
            Players in Room ({roomState?.users?.length})
          </h3>
          <div className="space-y-2">
            {roomState?.users?.map((user) => (
              <div key={user.id} className="flex items-center justify-between py-2 border-b border-pitch-700 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{user.id === myId ? "👤" : "🏏"}</span>
                  <span className="text-white font-medium">{user.name}</span>
                  {user.id === myId && <span className="text-xs text-blue-400">(you)</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gold-400">₹{user.budget}Cr</span>
                  {user.id === roomState.host && (
                    <span className="text-xs bg-gold-500/20 text-gold-400 px-2 py-1 rounded-full border border-gold-500/30">
                      HOST
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {isHost ? (
          <button
            onClick={onStart}
            className="w-full py-4 bg-gold-500 hover:bg-gold-400 text-pitch-900 font-display text-2xl tracking-widest rounded-xl transition-all active:scale-95"
          >
            START AUCTION
          </button>
        ) : (
          <div className="flex items-center justify-center gap-3 text-blue-400 py-4">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <span>Waiting for host to start...</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sold History Sidebar ─────────────────────────────────────────────────────
function SoldHistorySidebar({ history }) {
  if (history.length === 0) {
    return <div className="p-4 text-blue-600 text-xs text-center">No players sold yet</div>;
  }
  return (
    <div className="p-2 space-y-2">
      {history.map((item, i) => (
        <div key={i} className="bg-pitch-900 rounded-lg p-2 border border-pitch-700">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-sm">{item.player.image}</span>
            <span className="text-xs text-white font-medium truncate">{item.player.name}</span>
          </div>
          {item.soldTo ? (
            <div className="flex justify-between text-xs">
              <span className="text-blue-400 truncate">{item.soldTo.name}</span>
              <span className="text-gold-400 font-bold">₹{item.soldTo.price}Cr</span>
            </div>
          ) : (
            <span className="text-xs text-red-400">Unsold</span>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Final Screen ─────────────────────────────────────────────────────────────
function FinalScreen({ finalState, myId }) {
  const sortedUsers = [...(finalState?.users || [])].sort((a, b) => b.teamCount - a.teamCount);
  return (
    <div className="min-h-screen cricket-bg flex flex-col items-center justify-center p-6">
      <div className="text-center mb-8">
        <div className="text-7xl mb-4">🏆</div>
        <h1 className="font-display text-5xl text-gold-400 tracking-widest">AUCTION COMPLETE</h1>
        <p className="text-blue-400 mt-2">Final Teams</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-5xl">
        {sortedUsers.map((user, idx) => (
          <div
            key={user.id}
            className={`bg-pitch-800 rounded-2xl border p-5 ${
              user.id === myId ? "border-gold-400" : "border-pitch-700"
            }`}
          >
            <div className="flex items-center gap-2 mb-4">
              {idx === 0 && <span className="text-2xl">🥇</span>}
              {idx === 1 && <span className="text-2xl">🥈</span>}
              {idx === 2 && <span className="text-2xl">🥉</span>}
              <div>
                <h3 className="font-semibold text-white text-lg">{user.name}</h3>
                <p className="text-xs text-blue-400">₹{user.budget}Cr remaining · {user.teamCount} players</p>
              </div>
            </div>
            <div className="space-y-1">
              {user.team.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <span>{p.image}</span>
                    <span className="text-white">{p.name}</span>
                  </span>
                  <span className="text-gold-400 text-xs">₹{p.soldPrice}Cr</span>
                </div>
              ))}
              {user.team.length === 0 && <p className="text-blue-600 text-xs">No players bought</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}