import { useState } from "react";
import { motion } from "framer-motion";
import type { CommitStatus } from "../types";

const STANDARD_TRANSITIONS: Record<CommitStatus, CommitStatus | null> = {
  DRAFT: "LOCKED",
  LOCKED: "RECONCILING",
  RECONCILING: "RECONCILED",
  RECONCILED: "CARRY_FORWARD",
  CARRY_FORWARD: null,
};

interface Props {
  commitId: string;
  fromStatus: CommitStatus;
  toStatus: CommitStatus;
  onConfirm: (notes: string) => void;
  onCancel: () => void;
  isPending: boolean;
}

export function StatusChangeModal({ fromStatus, toStatus, onConfirm, onCancel, isPending }: Props) {
  const [notes, setNotes] = useState("");
  const isNonStandard = STANDARD_TRANSITIONS[fromStatus] !== toStatus;
  const canConfirm = notes.trim().length >= 10 && !isPending;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 space-y-4"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        role="dialog"
        aria-label="Status change justification"
      >
        <h3 className="text-lg font-bold text-slate-800">
          Move: {fromStatus.replace("_", " ")} → {toStatus.replace("_", " ")}
        </h3>

        {isNonStandard && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
            <strong>Warning:</strong> This is a non-standard transition. Standard flow is{" "}
            DRAFT → LOCKED → RECONCILING → RECONCILED → CARRY FORWARD.
            A manual override will be logged in the audit trail.
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-slate-700">
            Justification <span className="text-slate-400">(min 10 characters)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Explain why this status change is needed..."
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#0f4c5c]/20 focus:border-[#0f4c5c] outline-none resize-none"
            rows={3}
            autoFocus
          />
          <p className="text-xs text-slate-400 mt-1">{notes.trim().length}/10 characters</p>
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            disabled={isPending}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(notes.trim())}
            disabled={!canConfirm}
            className="rounded-lg bg-[#0f4c5c] px-4 py-2 text-sm font-medium text-white hover:bg-[#145e6e] disabled:opacity-50 transition-colors"
          >
            {isPending ? "Saving..." : "Confirm"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
