import { useState } from "react";
import { useTeamContext } from "../contexts/TeamContext";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { motion, AnimatePresence } from "framer-motion";
import { useTeams, useTeamMembers } from "../api/teams";
import { useTeamCommits, useOverrideCommit } from "../api/commits";
import { PipelineColumn } from "../components/PipelineColumn";
import { PipelineCommitCard } from "../components/PipelineCommitCard";
import { StatusChangeModal } from "../components/StatusChangeModal";
import { ErrorAlert } from "../components/ErrorAlert";
import { useToast } from "../hooks/useToast";
import type { CommitStatus, WeeklyCommit } from "../types";

const STATUSES: CommitStatus[] = ["DRAFT", "LOCKED", "RECONCILING", "RECONCILED", "CARRY_FORWARD"];

interface PendingDrop {
  commit: WeeklyCommit;
  toStatus: CommitStatus;
}

export function PipelinePage() {
  const { data: teams, isLoading: teamsLoading, isError: teamsError, error: teamsErr } = useTeams();
  const { teamId, setTeamId, weekStart } = useTeamContext();
  const { data: members } = useTeamMembers(teamId);
  const memberIds = members?.map((m) => m.id) ?? [];
  const { data: allCommits, isLoading: commitsLoading } = useTeamCommits(memberIds, weekStart);
  const overrideCommit = useOverrideCommit();
  const { addToast } = useToast();
  const [pendingDrop, setPendingDrop] = useState<PendingDrop | null>(null);

  const commitsByStatus = STATUSES.reduce<Record<CommitStatus, WeeklyCommit[]>>(
    (acc, s) => {
      acc[s] = allCommits?.filter((c) => c.status === s) ?? [];
      return acc;
    },
    {} as Record<CommitStatus, WeeklyCommit[]>
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const toStatus = over.id as CommitStatus;
    const commit = active.data.current?.commit as WeeklyCommit | undefined;
    if (!commit || commit.status === toStatus) return;

    setPendingDrop({ commit, toStatus });
  };

  const confirmDrop = (notes: string) => {
    if (!pendingDrop) return;
    overrideCommit.mutate(
      { id: pendingDrop.commit.id, targetStatus: pendingDrop.toStatus, notes },
      {
        onSuccess: () => {
          addToast(`Moved to ${pendingDrop.toStatus.replace("_", " ")}`);
          setPendingDrop(null);
        },
        onError: (err) => {
          addToast((err as Error).message);
          setPendingDrop(null);
        },
      }
    );
  };

  if (teamsLoading) return <div className="p-8 text-slate-500">Loading...</div>;
  if (teamsError) return <div className="p-8"><ErrorAlert message={(teamsErr as Error)?.message ?? "Failed to load teams"} /></div>;

  return (
    <motion.div
      className="p-6 lg:p-8 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Pipeline</h1>
        <p className="text-sm text-slate-500 mt-1">Drag commits between status columns. All moves are audit-logged.</p>
      </div>

      {/* Team selector */}
      <div className="max-w-xs">
        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Team</label>
        <select
          value={teamId}
          onChange={(e) => setTeamId(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-[#0f4c5c]/20 focus:border-[#0f4c5c] outline-none transition"
        >
          <option value="">Select team...</option>
          {teams?.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      {teamId && (
        <>
          {commitsLoading && <div className="text-slate-500 text-sm">Loading commits...</div>}

          {!commitsLoading && (
            <DndContext onDragEnd={handleDragEnd}>
              <div className="grid grid-cols-5 gap-4 min-w-[900px] overflow-x-auto">
                {STATUSES.map((status) => (
                  <PipelineColumn key={status} status={status} count={commitsByStatus[status].length}>
                    {commitsByStatus[status].map((commit) => (
                      <PipelineCommitCard
                        key={commit.id}
                        commit={commit}
                        isPending={pendingDrop?.commit.id === commit.id}
                      />
                    ))}
                  </PipelineColumn>
                ))}
              </div>
            </DndContext>
          )}

          {!commitsLoading && (!allCommits || allCommits.length === 0) && (
            <p className="text-sm text-slate-400">No commits found for this team.</p>
          )}
        </>
      )}

      <AnimatePresence>
        {pendingDrop && (
          <StatusChangeModal
            commitId={pendingDrop.commit.id}
            fromStatus={pendingDrop.commit.status}
            toStatus={pendingDrop.toStatus}
            onConfirm={confirmDrop}
            onCancel={() => setPendingDrop(null)}
            isPending={overrideCommit.isPending}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
