import { motion } from "framer-motion";
import type { CommitItem, ChessCategory, ItemFlag } from "../types";
import { formatEffort, formatImpact } from "../utils/metrics";
import { BorderTrailCard } from "./animations/BorderTrailCard";

const CHESS_COLORS: Record<string, string> = {
  STRATEGIC: "border-l-indigo-500",
  TACTICAL: "border-l-emerald-500",
  OPERATIONAL: "border-l-amber-500",
  MAINTENANCE: "border-l-gray-400",
};

const CHESS_BG: Record<string, string> = {
  STRATEGIC: "bg-indigo-50 text-indigo-700",
  TACTICAL: "bg-emerald-50 text-emerald-700",
  OPERATIONAL: "bg-amber-50 text-amber-700",
  MAINTENANCE: "bg-gray-100 text-gray-600",
};

const TRAIL_COLORS: Record<string, string> = {
  STRATEGIC: "#6366f1",
  TACTICAL: "#10b981",
  OPERATIONAL: "#f59e0b",
  MAINTENANCE: "#6b7280",
};

const RISK_BADGE: Record<string, string> = {
  BLOCKED: "bg-red-100 text-red-700",
  AT_RISK: "bg-orange-100 text-orange-700",
};

interface Props {
  item: CommitItem;
  isDraft?: boolean;
  isLocked?: boolean;
  isReconciled?: boolean;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onFlagChange?: (flag: ItemFlag, note?: string) => void;
  onCategoryChange?: (category: ChessCategory) => void;
}

function cfBadgeColor(count: number): string {
  if (count >= 3) return "bg-red-100 text-red-700";
  if (count === 2) return "bg-orange-100 text-orange-700";
  return "bg-gray-100 text-gray-600";
}

export function CommitItemCard({ item, isDraft, isLocked, isReconciled, onClick, onEdit, onDelete, onFlagChange, onCategoryChange }: Props) {
  const trailColor = item.flaggedStale
    ? "#f59e0b"
    : item.riskFlag === "BLOCKED"
      ? "#ef4444"
      : item.riskFlag === "AT_RISK"
        ? "#f97316"
        : (TRAIL_COLORS[item.chessCategory ?? ""] ?? "#d1d5db");
  const persistTrail = item.flaggedStale || item.riskFlag != null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
    >
      <BorderTrailCard
        trailColor={trailColor}
        persist={persistTrail}
        className={`rounded-xl border border-slate-200 border-l-4 ${CHESS_COLORS[item.chessCategory ?? ""] ?? "border-l-gray-300"} bg-white shadow-sm`}
      >
        <div className={`p-4${onClick ? " cursor-pointer" : ""}`} onClick={onClick}>
          {/* Top row: status + metrics */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              {item.riskFlag && (
                <motion.span
                  className={`text-xs font-semibold rounded-full px-2.5 py-0.5 ${RISK_BADGE[item.riskFlag]}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  {item.riskFlag === "BLOCKED" ? "BLOCKED" : "AT RISK"}
                </motion.span>
              )}
              {isReconciled && (
                <motion.span
                  className="text-xs font-semibold rounded-full px-2.5 py-0.5 bg-green-100 text-green-700"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  Done
                </motion.span>
              )}
            </div>
            <div className="text-xs text-slate-400 shrink-0 text-right">
              {(item.effortEstimate != null || item.impactEstimate != null) && (
                <div className="flex gap-3">
                  {item.effortEstimate != null && (
                    <span className="flex items-center gap-1">
                      <span className="text-slate-300">Size</span>
                      <span className="font-medium text-slate-500">{formatEffort(item.effortEstimate)}</span>
                    </span>
                  )}
                  {item.impactEstimate != null && (
                    <span className="flex items-center gap-1">
                      <span className="text-slate-300">Impact</span>
                      <span className="font-medium text-slate-500">{formatImpact(item.impactEstimate)}</span>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Title + description */}
          <div className="mt-2">
            <h4 className={`font-semibold text-slate-800 transition-all duration-300 ${isReconciled ? "line-through text-slate-400" : ""}`}>
              {item.title}
            </h4>
            {item.description && (
              <p className={`text-sm text-slate-500 mt-0.5 ${isReconciled ? "line-through text-slate-300" : ""}`}>
                {item.description}
              </p>
            )}
          </div>

          {/* Category, badges, outcome, actions */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {item.chessCategory && (
              onCategoryChange ? (
                <select
                  value={item.chessCategory}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => onCategoryChange(e.target.value as ChessCategory)}
                  className={`text-xs font-medium rounded-full px-2.5 py-1 border-none cursor-pointer ${CHESS_BG[item.chessCategory] ?? "bg-gray-100 text-gray-600"}`}
                >
                  <option value="STRATEGIC">Strategic</option>
                  <option value="TACTICAL">Tactical</option>
                  <option value="OPERATIONAL">Operational</option>
                  <option value="MAINTENANCE">Maintenance</option>
                </select>
              ) : (
                <span className={`text-xs font-medium rounded-full px-2.5 py-1 ${CHESS_BG[item.chessCategory] ?? "bg-gray-100 text-gray-600"}`}>
                  {item.chessCategory}
                </span>
              )
            )}
            {item.carryForwardCount > 0 && (
              <span className={`text-xs font-medium rounded-full px-2.5 py-1 ${cfBadgeColor(item.carryForwardCount)}`}>
                CF: {item.carryForwardCount}/3
              </span>
            )}
            {item.outcomeTitle && (
              <motion.span
                className="inline-flex items-center gap-1.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700 px-2.5 py-1"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                title="Linked outcome"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m9.86-2.04a4.5 4.5 0 0 0-1.242-7.244l-4.5-4.5a4.5 4.5 0 0 0-6.364 6.364l1.757 1.757" />
                </svg>
                {item.outcomeTitle}
              </motion.span>
            )}

            {/* Actions */}
            <div className="ml-auto flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              {isLocked && onFlagChange && (
                <>
                  <motion.button
                    onClick={() => onFlagChange(item.riskFlag === "BLOCKED" ? null : "BLOCKED")}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                      item.riskFlag === "BLOCKED"
                        ? "bg-red-600 text-white"
                        : "text-slate-400 hover:text-red-600 hover:bg-red-50"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Block
                  </motion.button>
                  <motion.button
                    onClick={() => onFlagChange(item.riskFlag === "AT_RISK" ? null : "AT_RISK")}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                      item.riskFlag === "AT_RISK"
                        ? "bg-orange-500 text-white"
                        : "text-slate-400 hover:text-orange-600 hover:bg-orange-50"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    At Risk
                  </motion.button>
                </>
              )}
              {isDraft && onEdit && (
                <motion.button
                  onClick={onEdit}
                  className="text-xs text-slate-400 hover:text-[#0f4c5c] px-2 py-1 rounded-full hover:bg-slate-100"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Edit
                </motion.button>
              )}
              {isDraft && onDelete && (
                <motion.button
                  onClick={onDelete}
                  className="text-xs text-slate-400 hover:text-red-600 px-2 py-1 rounded-full hover:bg-red-50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Delete
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </BorderTrailCard>
    </motion.div>
  );
}
