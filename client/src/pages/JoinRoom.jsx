import { useState } from "react";

export default function JoinRoom({ onJoin, error }) {
  const [userName, setUserName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [mode, setMode] = useState("create");

  const handleSubmit = () => {
    if (!userName.trim() || !roomId.trim()) return;
    onJoin({ roomId: roomId.trim().toUpperCase(), userName: userName.trim(), create: mode === "create" });
  };

  const generateId = () => {
    setRoomId(Math.random().toString(36).substring(2, 8).toUpperCase());
  };

  return (
    <div className="min-h-screen cricket-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-6xl mb-3">🏆</div>
          <h1 className="font-display text-6xl text-gold-400 tracking-widest leading-none">IPL</h1>
          <h2 className="font-display text-3xl text-white tracking-[0.3em] mt-1">MOCK AUCTION</h2>
          <p className="text-pitch-600 text-sm mt-2 font-body text-blue-300">Multiplayer Real-Time Cricket Auction</p>
        </div>

        {/* Card */}
        <div className="bg-pitch-800 rounded-2xl border border-pitch-700 p-8 shadow-2xl">
          {/* Mode Toggle */}
          <div className="flex rounded-xl overflow-hidden border border-pitch-700 mb-6">
            {["create", "join"].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-3 text-sm font-semibold uppercase tracking-widest transition-all ${
                  mode === m
                    ? "bg-gold-500 text-pitch-900"
                    : "bg-transparent text-blue-300 hover:bg-pitch-700"
                }`}
              >
                {m === "create" ? "Create Room" : "Join Room"}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-blue-400 uppercase tracking-widest font-semibold mb-2 block">
                Your Name
              </label>
              <input
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-pitch-900 border border-pitch-700 rounded-xl px-4 py-3 text-white placeholder-pitch-600 focus:outline-none focus:border-gold-500 transition-colors"
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>

            <div>
              <label className="text-xs text-blue-400 uppercase tracking-widest font-semibold mb-2 block">
                Room ID
              </label>
              <div className="flex gap-2">
                <input
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                  placeholder="e.g. IPL2024"
                  className="flex-1 bg-pitch-900 border border-pitch-700 rounded-xl px-4 py-3 text-white placeholder-pitch-600 focus:outline-none focus:border-gold-500 transition-colors font-mono tracking-widest"
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
                {mode === "create" && (
                  <button
                    onClick={generateId}
                    className="px-4 py-3 bg-pitch-700 hover:bg-pitch-600 rounded-xl text-blue-300 text-sm transition-colors border border-pitch-600"
                  >
                    🎲
                  </button>
                )}
              </div>
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-700/50 rounded-xl px-4 py-3 text-red-400 text-sm animate-fade-in">
                ⚠️ {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!userName.trim() || !roomId.trim()}
              className="w-full py-4 bg-gold-500 hover:bg-gold-400 disabled:opacity-40 disabled:cursor-not-allowed text-pitch-900 font-display text-2xl tracking-widest rounded-xl transition-all active:scale-95 mt-2"
            >
              {mode === "create" ? "CREATE ROOM" : "JOIN ROOM"}
            </button>
          </div>
        </div>

        <p className="text-center text-pitch-600 text-xs mt-6 text-blue-900">
          Each team starts with ₹100 Cr budget
        </p>
      </div>
    </div>
  );
}