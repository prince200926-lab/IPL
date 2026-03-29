export default function TimerBar({ timer }) {
  const pct = (timer / 10) * 100;
  const color = timer <= 3 ? "bg-red-500" : timer <= 6 ? "bg-yellow-500" : "bg-green-500";
  const textColor = timer <= 3 ? "text-red-400" : timer <= 6 ? "text-yellow-400" : "text-green-400";

  return (
    <div className="bg-pitch-800 rounded-xl border border-pitch-700 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-blue-400 uppercase tracking-widest font-semibold">Time Remaining</span>
        <span className={`font-display text-2xl leading-none ${textColor} ${timer <= 3 ? "animate-pulse" : ""}`}>
          {timer}s
        </span>
      </div>
      <div className="h-2 bg-pitch-900 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}