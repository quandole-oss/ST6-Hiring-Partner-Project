import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  useCommit,
  useStartReconciliation,
  useSubmitReconciliation,
  useUpdateReconciliation,
} from "../api/commits";
import { StatusBadge } from "../components/StatusBadge";
import { ErrorAlert } from "../components/ErrorAlert";
import { FibonacciSelector } from "../components/FibonacciSelector";
import { GlowButton } from "../components/animations/GlowButton";
import { ScrollProgress } from "../components/animations/ScrollProgress";
import { AnimatedCheckbox } from "../components/animations/AnimatedCheckbox";
import { useToast } from "../hooks/useToast";
import type { CommitItem, CompletionStatus } from "../types";
import { formatEffort, formatImpact } from "../utils/metrics";

export function ReconciliationPage() {
  const { id } = useParams<{ id: string }>();
  const { data: commit, isLoading, isError, error } = useCommit(id ?? "");
  const startRecon = useStartReconciliation();
  const submitRecon = useSubmitReconciliation();
  const { addToast } = useToast();

  if (isLoading) return <div className="p-8 text-slate-500">Loading...</div>;
  if (isError) return <div className="p-8"><ErrorAlert message={(error as Error)?.message ?? "Failed to load commit"} /></div>;
  if (!commit) return <div className="p-8 text-red-500">Commit not found</div>;

  const canStartRecon = commit.status === "LOCKED";
  const isReconciling = commit.status === "RECONCILING";
  const canSubmit = isReconciling && commit.items.every((i) => i.reconciliation != null);

  return (
    <>
      <ScrollProgress />
      <motion.div
        className="p-6 lg:p-8 space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-start justify-between">
          <div>
            <Link to={`/commits/${commit.id}`} className="text-xs text-slate-400 hover:text-[#0f4c5c] transition-colors">
              &larr; Back to Commit
            </Link>
            <h1 className="text-2xl font-bold text-slate-800 mt-1">Reconciliation</h1>
            <p className="text-sm text-slate-500">
              {commit.teamMemberName} &middot; Week of {commit.weekStart}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={commit.status} />
            {canStartRecon && (
              <GlowButton
                onClick={() => startRecon.mutate(commit.id, { onError: (err) => addToast((err as Error).message) })}
                className="rounded-lg bg-[#f57c00] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#e65100]"
                glowColor="rgba(245, 124, 0, 0.5)"
              >
                Begin Reconciliation
              </GlowButton>
            )}
            {canSubmit && (
              <GlowButton
                onClick={() => submitRecon.mutate(commit.id, { onError: (err) => addToast((err as Error).message) })}
                className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
                glowColor="rgba(22, 163, 74, 0.5)"
              >
                Submit Reconciliation
              </GlowButton>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="font-semibold text-slate-700 mb-3">Planned Items</h2>
            <div className="space-y-3">
              {commit.items.map((item, i) => {
                const isCompleted = item.reconciliation?.completionStatus === "COMPLETED";
                return (
                  <motion.div
                    key={item.id}
                    className="bg-white rounded-xl border border-slate-200 p-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <h4 className={`font-medium text-slate-800 transition-all duration-500 ${isCompleted ? "line-through text-slate-400" : ""}`}>
                      {item.title}
                    </h4>
                    {item.description && (
                      <p className={`text-sm text-slate-500 mt-0.5 ${isCompleted ? "line-through text-slate-300" : ""}`}>
                        {item.description}
                      </p>
                    )}
                    <div className="text-xs text-slate-400 mt-2">
                      {item.chessCategory} &middot; Size: {formatEffort(item.effortEstimate)} | Impact: {formatImpact(item.impactEstimate)}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="font-semibold text-slate-700 mb-3">Actual Completion</h2>
            <div className="space-y-3">
              {commit.items.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <ReconciliationEntry item={item} commitId={commit.id} disabled={!isReconciling} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

function ReconciliationEntry({
  item,
  commitId,
  disabled,
}: {
  item: CommitItem;
  commitId: string;
  disabled: boolean;
}) {
  const update = useUpdateReconciliation(commitId, item.id);
  const { addToast } = useToast();
  const [status, setStatus] = useState<CompletionStatus>(
    item.reconciliation?.completionStatus ?? "NOT_STARTED"
  );
  const [notes, setNotes] = useState(item.reconciliation?.notes ?? "");
  const [actualSP, setActualSP] = useState<number | null>(item.reconciliation?.actualStoryPoints ?? item.effortEstimate);

  const handleSave = () => {
    update.mutate(
      { completionStatus: status, notes: notes || undefined, actualStoryPoints: actualSP ?? undefined },
      { onError: (err) => addToast((err as Error).message) }
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
      <h4 className="font-medium text-sm text-slate-800">{item.title}</h4>
      <AnimatedCheckbox status={status} onChange={setStatus} disabled={disabled} />
      <textarea
        placeholder="Notes..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        disabled={disabled}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-[#0f4c5c]/20 focus:border-[#0f4c5c] outline-none disabled:bg-slate-50"
        rows={2}
      />
      <FibonacciSelector value={actualSP} onChange={setActualSP} disabled={disabled} label="Actual Story Points" />
      {!disabled && (
        <GlowButton
          onClick={handleSave}
          disabled={update.isPending}
          className="rounded-lg bg-[#0f4c5c] px-4 py-2 text-xs font-medium text-white hover:bg-[#145e6e] disabled:opacity-50"
          glowColor="rgba(15, 76, 92, 0.5)"
        >
          {update.isPending ? "Saving..." : item.reconciliation ? "Update" : "Save"}
        </GlowButton>
      )}
    </div>
  );
}
