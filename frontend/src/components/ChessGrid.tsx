import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CommitItem } from "../types";
import { formatEffort, formatImpact } from "../utils/metrics";

const QUADRANT_LABELS = [
  { effort: "low", impact: "high", label: "Quick Wins", col: 0, row: 0 },
  { effort: "high", impact: "high", label: "Major Projects", col: 1, row: 0 },
  { effort: "low", impact: "low", label: "Fill-Ins", col: 0, row: 1 },
  { effort: "high", impact: "low", label: "Thankless Tasks", col: 1, row: 1 },
];

function getQuadrant(item: CommitItem): { col: number; row: number } {
  const effort = item.effortEstimate ?? 3;
  const impact = item.impactEstimate ?? 3;
  return { col: effort >= 5 ? 1 : 0, row: impact > 3 ? 0 : 1 };
}

const CATEGORY_COLORS: Record<string, string> = {
  STRATEGIC: "bg-indigo-200 border-indigo-400",
  TACTICAL: "bg-emerald-200 border-emerald-400",
  OPERATIONAL: "bg-amber-200 border-amber-400",
  MAINTENANCE: "bg-gray-200 border-gray-400",
};

const CATEGORY_BACK_COLORS: Record<string, string> = {
  STRATEGIC: "bg-indigo-400 text-white",
  TACTICAL: "bg-emerald-400 text-white",
  OPERATIONAL: "bg-amber-400 text-white",
  MAINTENANCE: "bg-gray-400 text-white",
};

function FlipCard({ item }: { item: CommitItem }) {
  const [flipped, setFlipped] = useState(false);
  const frontColor = CATEGORY_COLORS[item.chessCategory ?? ""] ?? "bg-gray-100 border-gray-300";
  const backColor = CATEGORY_BACK_COLORS[item.chessCategory ?? ""] ?? "bg-gray-500 text-white";

  return (
    <div
      className="relative cursor-pointer"
      style={{ perspective: "600px" }}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
    >
      <AnimatePresence mode="wait">
        {!flipped ? (
          <motion.div
            key="front"
            className={`text-xs px-2 py-1 rounded border ${frontColor}`}
            initial={{ rotateY: -90 }}
            animate={{ rotateY: 0 }}
            exit={{ rotateY: 90 }}
            transition={{ duration: 0.2 }}
            title={item.title}
          >
            {item.title.length > 20 ? item.title.slice(0, 20) + "..." : item.title}
          </motion.div>
        ) : (
          <motion.div
            key="back"
            className={`text-xs px-2 py-1 rounded ${backColor}`}
            initial={{ rotateY: -90 }}
            animate={{ rotateY: 0 }}
            exit={{ rotateY: 90 }}
            transition={{ duration: 0.2 }}
          >
            <div className="font-semibold">{item.chessCategory}</div>
            <div className="opacity-80">Size: {formatEffort(item.effortEstimate)} | Impact: {formatImpact(item.impactEstimate)}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ChessGrid({ items }: { items: CommitItem[] }) {
  const buckets: CommitItem[][][] = [[[], []], [[], []]];
  for (const item of items) {
    if (item.effortEstimate != null && item.impactEstimate != null) {
      const { col, row } = getQuadrant(item);
      buckets[row][col].push(item);
    }
  }

  return (
    <motion.div
      className="rounded-lg border border-gray-300 overflow-hidden"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="grid grid-cols-[auto_1fr_1fr]">
        <div />
        <div className="text-center text-xs font-semibold text-gray-500 py-1">Low Effort</div>
        <div className="text-center text-xs font-semibold text-gray-500 py-1">High Effort</div>

        <div className="flex items-center justify-center text-xs font-semibold text-gray-500 px-2 [writing-mode:vertical-lr] rotate-180">
          High Impact
        </div>
        {QUADRANT_LABELS.slice(0, 2).map((q) => (
          <div key={q.label} className="min-h-[120px] border border-gray-200 p-2 bg-white">
            <div className="text-xs font-medium text-gray-400 mb-1">{q.label}</div>
            <div className="flex flex-wrap gap-1">
              {buckets[q.row][q.col].map((item) => (
                <FlipCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        ))}

        <div className="flex items-center justify-center text-xs font-semibold text-gray-500 px-2 [writing-mode:vertical-lr] rotate-180">
          Low Impact
        </div>
        {QUADRANT_LABELS.slice(2).map((q) => (
          <div key={q.label} className="min-h-[120px] border border-gray-200 p-2 bg-white">
            <div className="text-xs font-medium text-gray-400 mb-1">{q.label}</div>
            <div className="flex flex-wrap gap-1">
              {buckets[q.row][q.col].map((item) => (
                <FlipCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
