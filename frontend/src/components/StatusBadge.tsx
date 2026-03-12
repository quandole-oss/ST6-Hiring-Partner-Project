import { motion } from "framer-motion";
import type { CommitStatus } from "../types";

const STATUS_CONFIG: Record<CommitStatus, { bg: string; text: string; dot: string; label: string }> = {
  DRAFT: {
    bg: "bg-slate-100",
    text: "text-slate-600",
    dot: "bg-slate-400",
    label: "Draft",
  },
  LOCKED: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-500",
    label: "Locked",
  },
  RECONCILING: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
    label: "Reconciling",
  },
  RECONCILED: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    label: "Reconciled",
  },
  CARRY_FORWARD: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    dot: "bg-purple-500",
    label: "Carry Forward",
  },
};

export function StatusBadge({ status }: { status: CommitStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <motion.span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${config.bg} ${config.text}`}
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} shrink-0`} />
      {config.label}
    </motion.span>
  );
}
