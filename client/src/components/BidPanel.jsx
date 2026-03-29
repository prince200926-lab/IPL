import { useState } from "react";

const PRESET_INCREMENTS = [0.1, 0.5, 1, 2, 5, 10, 15, 25];

export default function BidPanel({ currentBid, myBudget, isHighestBidder, onBid }) {
  const [customIncrement, setCustomIncrement] = useState("");
  const [selectedIncrement, setSelectedIncrement] = useState(1);

  const handlePreset = (inc) => {
    setSelectedIncrement(inc);
    setCustomIncrement("");
  };

  const handleCustomChange = (e) => {
    const val = e.target.value;
    // allow decimals up to 1 place
    if (val === "" || /^\d*\.?\d?$/.test(val)) {
      setCustomIncrement(val);
      const parsed = parseFloat(val);
      if (!isNaN(parsed) && parsed > 0) setSelectedIncrement(parsed);
    }
  };

  const activeIncrement = customIncrement !== ""
    ? (parseFloat(customIncrement) || 0)
    : selectedIncrement;

  const newBid = Math.round((currentBid + activeIncrement) * 10) / 10;
  const canAfford = myBudget >= newBid && activeIncrement > 0;

  const formatCr = (val) => {
    if (val < 1) return `₹${Math.round(val * 100)}L`;
    return `₹${val}Cr`;
  };

  return (
    <div className="bg-pitch-800 rounded-2xl border border-pitch-700 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs text-blue-400 uppercase tracking-widest font-semibold">Place Bid</h3>
        {isHighestBidder && (
          <span className="text-xs bg-gold-500/20 text-gold-400 px-3 py-1 rounded-full border border-gold-500/30 animate-pulse">
            👑 You're Winning!
          </span>
        )}
      </div>

      {/* Preset increment buttons */}
      <div>
        <p className="text-xs text-blue-600 mb-2">Quick increments</p>
        <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-8">
          {PRESET_INCREMENTS.map((inc) => (
            <button
              key={inc}
              onClick={() => handlePreset(inc)}
              className={`py-2 rounded-xl text-xs font-bold tracking-wide transition-all border ${
                selectedIncrement === inc && customIncrement === ""
                  ? "bg-gold-500 text-pitch-900 border-gold-400"
                  : "bg-pitch-900 text-blue-300 border-pitch-700 hover:border-blue-500 hover:text-white"
              }`}
            >
              {formatCr(inc)}
            </button>
          ))}
        </div>
      </div>

      {/* Custom increment input */}
      <div>
        <p className="text-xs text-blue-600 mb-2">Custom increment (in Cr)</p>
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 text-sm font-bold">+</span>
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={customIncrement}
              onChange={handleCustomChange}
              placeholder="e.g. 0.1 or 3.5"
              className="w-full bg-pitch-900 border border-pitch-700 rounded-xl pl-7 pr-3 py-2.5 text-white placeholder-pitch-600 focus:outline-none focus:border-gold-500 transition-colors text-sm"
            />
          </div>
          <span className="text-blue-500 text-xs whitespace-nowrap">
            = {activeIncrement > 0 ? formatCr(activeIncrement) : "—"}
          </span>
        </div>
      </div>

      {/* Bid button */}
      <button
        onClick={() => canAfford && onBid(activeIncrement)}
        disabled={!canAfford}
        className={`w-full py-3.5 rounded-xl font-display text-2xl tracking-widest transition-all active:scale-95 border ${
          canAfford
            ? "bg-ipl-blue hover:bg-blue-600 text-white border-blue-500"
            : "bg-pitch-900 text-pitch-600 border-pitch-700 cursor-not-allowed"
        }`}
      >
        BID {activeIncrement > 0 ? formatCr(newBid) : "—"}
      </button>

      <div className="flex justify-between text-xs text-blue-600">
        <span>Current: ₹{currentBid}Cr → Next: {activeIncrement > 0 ? formatCr(newBid) : "set increment"}</span>
        <span>Budget left: ₹{myBudget}Cr</span>
      </div>
    </div>
  );
}