import { motion, AnimatePresence } from "framer-motion";
import type { CompletionStatus } from "../../types";

const STATUS_CONFIG: Record<CompletionStatus, { label: string; color: string; bg: string; icon: string }> = {
  COMPLETED: { label: "Completed", color: "border-green-500 bg-green-500", bg: "bg-green-50", icon: "check" },
  PARTIAL: { label: "Partial", color: "border-yellow-500 bg-yellow-500", bg: "bg-yellow-50", icon: "half" },
  NOT_STARTED: { label: "Not Started", color: "border-gray-300 bg-white", bg: "bg-gray-50", icon: "empty" },
  DEFERRED: { label: "Deferred", color: "border-purple-500 bg-purple-500", bg: "bg-purple-50", icon: "defer" },
};

interface Props {
  status: CompletionStatus;
  onChange: (status: CompletionStatus) => void;
  disabled?: boolean;
}

export function AnimatedCheckbox({ status, onChange, disabled }: Props) {
  const statuses: CompletionStatus[] = ["COMPLETED", "PARTIAL", "NOT_STARTED", "DEFERRED"];

  return (
    <div className="flex gap-2 flex-wrap">
      {statuses.map((s) => {
        const config = STATUS_CONFIG[s];
        const isActive = status === s;
        return (
          <motion.button
            key={s}
            type="button"
            disabled={disabled}
            onClick={() => onChange(s)}
            className={`flex items-center gap-2 rounded-lg border-2 px-3 py-1.5 text-xs font-medium transition-colors
              ${isActive ? `${config.bg} border-current` : "bg-white border-gray-200 hover:border-gray-300"}
              disabled:opacity-50 disabled:cursor-not-allowed`}
            whileHover={disabled ? {} : { scale: 1.05 }}
            whileTap={disabled ? {} : { scale: 0.95 }}
          >
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
              ${isActive ? config.color : "border-gray-300 bg-white"}`}
            >
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    {config.icon === "check" && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {config.icon === "half" && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    {config.icon === "defer" && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {config.label}
          </motion.button>
        );
      })}
    </div>
  );
}
