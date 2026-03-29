const ROLE_COLORS = {
  Batsman: "bg-blue-500/20 text-blue-300 border-blue-500/40",
  Bowler: "bg-red-500/20 text-red-300 border-red-500/40",
  "All-Rounder": "bg-purple-500/20 text-purple-300 border-purple-500/40",
  Wicketkeeper: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
};

export default function PlayerCard({ player, currentBid, highestBidderName, myId, highestBidder }) {
  return (
    <div className="bg-pitch-800 rounded-2xl border border-pitch-700 p-6 animate-slide-in">
      <div className="flex items-start gap-6">
        {/* Avatar */}
        <div className="w-24 h-24 bg-pitch-900 rounded-2xl flex items-center justify-center text-5xl border border-pitch-700 flex-shrink-0">
          {player.image}
        </div>
        {/* Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display text-3xl text-white tracking-wide leading-none">{player.name}</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs px-3 py-1 rounded-full border font-semibold ${ROLE_COLORS[player.role] || "bg-pitch-700 text-blue-300 border-pitch-600"}`}>
                  {player.role}
                </span>
                <span className="text-xs text-blue-400 bg-pitch-900 px-3 py-1 rounded-full border border-pitch-700">
                  {player.team}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-blue-400 uppercase tracking-widest">Base Price</p>
              <p className="font-display text-2xl text-blue-300">₹{player.basePrice}Cr</p>
            </div>
          </div>

          {/* Current Bid */}
          <div className="mt-4 flex items-end gap-4">
            <div>
              <p className="text-xs text-blue-400 uppercase tracking-widest mb-1">Current Bid</p>
              <p className={`font-display text-4xl leading-none ${highestBidder ? "text-gold-400" : "text-white"}`}>
                ₹{currentBid}Cr
              </p>
            </div>
            {highestBidderName && (
              <div className="pb-1">
                <p className="text-xs text-blue-400 uppercase tracking-widest mb-1">Highest Bidder</p>
                <div className="flex items-center gap-2">
                  <span className="text-gold-400">👑</span>
                  <span className="text-white font-semibold">{highestBidderName}</span>
                  {highestBidder === myId && (
                    <span className="text-xs bg-gold-500/20 text-gold-400 px-2 py-0.5 rounded-full border border-gold-500/30">YOU</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}