import { motion } from "framer-motion";
import type { CommitStatus } from "../types";

const STATUS_STYLES: Record<CommitStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  LOCKED: "bg-blue-100 text-blue-700",
  RECONCILING: "bg-yellow-100 text-yellow-700",
  RECONCILED: "bg-green-100 text-green-700",
  CARRY_FORWARD: "bg-purple-100 text-purple-700",
};

const SHIMMER_COLORS: Record<CommitStatus, string> = {
  DRAFT: "from-gray-100 via-gray-200 to-gray-100",
  LOCKED: "from-blue-100 via-blue-200 to-blue-100",
  RECONCILING: "from-yellow-100 via-yellow-200 to-yellow-100",
  RECONCILED: "from-green-100 via-green-200 to-green-100",
  CARRY_FORWARD: "from-purple-100 via-purple-200 to-purple-100",
};

export function StatusBadge({ status }: { status: CommitStatus }) {
  return (
    <motion.span
      className={`relative inline-block rounded-full px-3 py-1 text-xs font-medium overflow-hidden ${STATUS_STYLES[status]}`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <motion.div
        className={`absolute inset-0 bg-gradient-to-r ${SHIMMER_COLORS[status]}`}
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
      />
      <span className="relative z-10">{status.replace("_", " ")}</span>
    </motion.span>
  );
}
