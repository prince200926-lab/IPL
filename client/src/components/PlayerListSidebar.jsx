const ROLE_COLORS = {
  Batsman: "text-blue-400",
  Bowler: "text-red-400",
  "All-Rounder": "text-purple-400",
  Wicketkeeper: "text-yellow-400",
};

export default function PlayerListSidebar({ auctionData }) {
  if (!auctionData) {
    return <div className="p-4 text-blue-700 text-xs text-center">Waiting for auction to start...</div>;
  }

  const { players, currentIndex, sold } = auctionData;
  const soldIds = new Set((sold || []).map((s) => s.id));

  return (
    <div className="p-2 space-y-1">
      {(players || []).map((p, idx) => {
        const isCurrent = idx === currentIndex;
        const isSold = soldIds.has(p.id);
        const isPast = idx < currentIndex;

        return (
          <div
            key={p.id}
            className={`rounded-lg p-2 border text-xs transition-all ${
              isCurrent
                ? "bg-gold-500/10 border-gold-400 animate-pulse"
                : isSold || isPast
                ? "bg-pitch-900/50 border-pitch-800 opacity-50"
                : "bg-pitch-900 border-pitch-700"
            }`}
          >
            <div className="flex items-center gap-1">
              <span>{p.image}</span>
              <span className={`font-medium ${isCurrent ? "text-gold-400" : "text-white"} truncate`}>{p.name}</span>
            </div>
            <div className="flex justify-between mt-0.5">
              <span className={ROLE_COLORS[p.role] || "text-blue-400"}>{p.role}</span>
              <span className="text-blue-500">₹{p.basePrice}Cr</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}