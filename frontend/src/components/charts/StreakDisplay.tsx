import { motion } from "framer-motion";
import type { Streak } from "../../types";

interface Props {
  streak: Streak;
}

export function StreakDisplay({ streak }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🔥</span>
          <div>
            <div className="text-3xl font-bold text-orange-500">{streak.currentStreak}</div>
            <div className="text-xs text-slate-500">Current Streak</div>
          </div>
        </div>
        <div className="h-12 w-px bg-slate-200" />
        <div>
          <div className="text-2xl font-bold text-slate-700">{streak.longestStreak}</div>
          <div className="text-xs text-slate-500">Best Streak</div>
        </div>
      </div>

      <div>
        <div className="text-xs text-slate-500 mb-2">Last 12 weeks</div>
        <div className="flex gap-1">
          {streak.lastTwelveWeeks.map((completed, i) => (
            <motion.div
              key={i}
              className={`w-6 h-6 rounded-sm ${completed ? "bg-emerald-500" : "bg-slate-200"}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.05, type: "spring", stiffness: 500 }}
              title={completed ? "Completed" : "Incomplete"}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
