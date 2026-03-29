const ROLE_ICONS = {
  Batsman: "🏏",
  Bowler: "🎯",
  "All-Rounder": "⚡",
  Wicketkeeper: "🧤",
};

export default function TeamSidebar({ myUser }) {
  if (!myUser) return null;
  const team = myUser.team || [];
  const totalSpent = 100 - myUser.budget;

  return (
    <div className="p-3">
      <div className="mb-3">
        <h3 className="text-xs text-blue-400 uppercase tracking-widest font-semibold mb-1">My Team</h3>
        <div className="flex justify-between text-xs">
          <span className="text-green-400">{team.length} players</span>
          <span className="text-gold-400">₹{myUser.budget}Cr left</span>
        </div>
        {/* Budget bar */}
        <div className="h-1.5 bg-pitch-900 rounded-full mt-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-gold-500 rounded-full transition-all"
            style={{ width: `${myUser.budget}%` }}
          />
        </div>
      </div>

      {team.length === 0 ? (
        <div className="text-center py-8 text-blue-700 text-xs">
          <div className="text-3xl mb-2">🏟️</div>
          No players yet
        </div>
      ) : (
        <div className="space-y-1">
          {team.map((p) => (
            <div key={p.id} className="bg-pitch-900 rounded-lg p-2 border border-pitch-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span className="text-sm">{ROLE_ICONS[p.role] || "🏏"}</span>
                  <span className="text-xs text-white font-medium truncate max-w-[90px]">{p.name}</span>
                </div>
                <span className="text-gold-400 text-xs font-bold">₹{p.soldPrice}</span>
              </div>
              <div className="text-xs text-blue-500 ml-5">{p.role}</div>
            </div>
          ))}
        </div>
      )}

      {team.length > 0 && (
        <div className="mt-3 pt-3 border-t border-pitch-700">
          <div className="flex justify-between text-xs">
            <span className="text-blue-400">Total Spent</span>
            <span className="text-red-400 font-bold">₹{totalSpent}Cr</span>
          </div>
        </div>
      )}
    </div>
  );
}