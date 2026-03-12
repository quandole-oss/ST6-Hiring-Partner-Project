import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import { useTeamContext } from "../contexts/TeamContext";
import { getCurrentMonday } from "../utils/week";
import { motion, AnimatePresence } from "framer-motion";
import {
  useCommit,
  useCommits,
  useCreateCommit,
  useCreateItem,
  useUpdateItem,
  useDeleteItem,
  useLockCommit,
  useUpdateItemFlag,
  useUpdateItemCategory,
} from "../api/commits";
import { useTeams, useTeamMembers } from "../api/teams";
import { CommitItemCard } from "../components/CommitItemCard";
import { ChessGrid } from "../components/ChessGrid";
import { RcdoSelector } from "../components/RcdoSelector";
import { StatusBadge } from "../components/StatusBadge";
import { ErrorAlert } from "../components/ErrorAlert";
import { FibonacciSelector } from "../components/FibonacciSelector";
import { CarryForwardWarning } from "../components/CarryForwardWarning";
import { AuditTimeline } from "../components/AuditTimeline";
import { TaskDetailsModal } from "../components/TaskDetailsModal";
import { GlowButton } from "../components/animations/GlowButton";
import { AnimatedNumber } from "../components/animations/AnimatedNumber";
import { Combobox } from "../components/ui/Combobox";
import { Avatar } from "../components/ui/Avatar";
import { useToast } from "../hooks/useToast";
import type { ChessCategory, CommitItem, ItemFlag } from "../types";

export function CommitEditorPage() {
  const { id } = useParams<{ id: string }>();
  if (id) return <CommitEditor commitId={id} />;
  return <CommitSelector />;
}

function CommitSelector() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { data: teams, isLoading: teamsLoading, isError: teamsError, error: teamsErr } = useTeams();
  const { teamId, setTeamId } = useTeamContext();
  const { data: members } = useTeamMembers(teamId);
  const [memberId, setMemberId] = useState("");
  const { data: commits } = useCommits(memberId);
  const createCommit = useCreateCommit();
  const [weekStart, setWeekStart] = useState(getCurrentMonday);

  if (teamsLoading) return (
    <div className="p-8 flex items-center gap-3 text-slate-400">
      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      Loading teams...
    </div>
  );
  if (teamsError) return <div className="p-8"><ErrorAlert message={(teamsErr as Error)?.message ?? "Failed to load teams"} /></div>;

  const handleCreate = () => {
    if (!memberId || !weekStart) return;
    createCommit.mutate(
      { teamMemberId: memberId, weekStart },
      {
        onSuccess: (commit) => navigate(`/commits/${commit.id}`),
        onError: (err) => addToast((err as Error).message),
      }
    );
  };

  const teamOptions = (teams ?? []).map((t) => ({ value: t.id, label: t.name }));
  const memberOptions = (members ?? []).map((m) => ({ value: m.id, label: m.name }));
  const selectedMember = members?.find((m) => m.id === memberId);

  return (
    <motion.div
      className="p-6 lg:p-8 max-w-3xl"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Page header */}
      <div className="flex items-center gap-4 mb-8">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: "linear-gradient(135deg, #145e6e 0%, #0d3340 100%)", boxShadow: "0 4px 16px rgba(13,51,64,0.3)" }}
        >
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Commit Editor</h1>
          <p className="text-sm text-slate-500 mt-0.5">Select a team and member to manage weekly commits.</p>
        </div>
      </div>

      {/* Selector card */}
      <div
        className="bg-white rounded-2xl border border-slate-100 p-6 mb-6"
        style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)" }}
      >
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
            style={teamId
              ? { background: "linear-gradient(135deg, #145e6e, #0d3340)", color: "#fff" }
              : { background: "#f1f5f9", color: "#94a3b8" }}
          >
            {teamId ? (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            ) : "1"}
          </div>
          <span className={`text-sm font-semibold transition-colors ${teamId ? "text-[#0f4c5c]" : "text-slate-400"}`}>Team</span>
          <div className="flex-1 h-px bg-slate-100 mx-1" />
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
            style={memberId
              ? { background: "linear-gradient(135deg, #145e6e, #0d3340)", color: "#fff" }
              : { background: "#f1f5f9", color: "#94a3b8" }}
          >
            {memberId ? (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            ) : "2"}
          </div>
          <span className={`text-sm font-semibold transition-colors ${memberId ? "text-[#0f4c5c]" : "text-slate-400"}`}>Member</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Combobox
            label="Team"
            options={teamOptions}
            value={teamId}
            onChange={(v) => { setTeamId(v); setMemberId(""); }}
            placeholder="Select a team..."
            searchable={teamOptions.length > 5}
          />
          <AnimatePresence>
            {teamId && (
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.25 }}
              >
                <Combobox
                  label="Member"
                  options={memberOptions}
                  value={memberId}
                  onChange={setMemberId}
                  placeholder="Select a member..."
                  searchable={memberOptions.length > 5}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Selected member preview */}
        <AnimatePresence>
          {selectedMember && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 16 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="flex items-center gap-3 rounded-xl p-3 overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(20,94,110,0.06) 0%, rgba(13,51,64,0.03) 100%)",
                border: "1px solid rgba(20,94,110,0.12)"
              }}
            >
              <Avatar name={selectedMember.name} size="md" />
              <div>
                <p className="font-semibold text-slate-800 text-sm">{selectedMember.name}</p>
                <p className="text-xs text-slate-500">Team member selected</p>
              </div>
              <div className="ml-auto">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Ready
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Commits list + create */}
      <AnimatePresence>
        {memberId && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-2">
                Existing Commits
                {commits && commits.length > 0 && (
                  <span
                    className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold text-white"
                    style={{ background: "#0f4c5c" }}
                  >
                    {commits.length}
                  </span>
                )}
              </h2>
            </div>

            {commits && commits.length > 0 ? (
              <div className="space-y-2">
                {commits.map((c, i) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      to={`/commits/${c.id}`}
                      className="group flex items-center justify-between bg-white rounded-xl border border-slate-100 p-4 transition-all duration-150 hover:-translate-y-0.5 hover:border-slate-200 hover:shadow-md"
                      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: "linear-gradient(135deg, rgba(20,94,110,0.1), rgba(13,51,64,0.06))" }}
                        >
                          <svg className="w-4 h-4 text-[#0f4c5c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">Week of {c.weekStart}</p>
                          <p className="text-xs text-slate-400">{c.items.length} item{c.items.length !== 1 ? "s" : ""}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={c.status} />
                        <svg className="w-4 h-4 text-slate-300 group-hover:text-[#0f4c5c] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                        </svg>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-slate-500">No commits yet</p>
                <p className="text-xs text-slate-400 mt-1">Create a new commit below to get started.</p>
              </div>
            )}

            {/* Create new commit */}
            <div
              className="bg-white rounded-2xl border border-slate-100 p-5"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
            >
              <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-[#f57c00]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Create New Commit
              </h3>
              <div className="flex items-end gap-3 flex-wrap">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Week Start</label>
                  <input
                    type="date"
                    value={weekStart}
                    onChange={(e) => setWeekStart(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition-all duration-150 focus:ring-2 focus:ring-[#145e6e]/20 focus:border-[#145e6e]"
                    style={{ boxShadow: "inset 0 1px 2px rgba(0,0,0,0.04)" }}
                  />
                </div>
                <GlowButton
                  onClick={handleCreate}
                  disabled={createCommit.isPending}
                  className="rounded-xl px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50 flex items-center gap-2"
                  style={{ background: "linear-gradient(135deg, #f57c00 0%, #e65100 100%)", boxShadow: "0 4px 14px rgba(245,124,0,0.35)" }}
                  glowColor="rgba(245, 124, 0, 0.5)"
                >
                  {createCommit.isPending ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Creating...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      New Commit
                    </>
                  )}
                </GlowButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CommitEditor({ commitId }: { commitId: string }) {
  const { data: commit, isLoading, isError, error } = useCommit(commitId);
  const createItem = useCreateItem(commitId);
  const updateItem = useUpdateItem(commitId);
  const deleteItemMut = useDeleteItem(commitId);
  const lockCommit = useLockCommit();
  const updateItemFlag = useUpdateItemFlag(commitId);
  const updateItemCategory = useUpdateItemCategory(commitId);
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<CommitItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<CommitItem | null>(null);

  useEffect(() => {
    const openItemId = searchParams.get("openItem");
    if (openItemId && commit) {
      const found = commit.items.find((i) => i.id === openItemId);
      if (found) {
        setSelectedItem(found);
        setSearchParams({}, { replace: true });
      }
    }
  }, [commit, searchParams, setSearchParams]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [chess, setChess] = useState<ChessCategory | "">("");
  const [storyPoints, setStoryPoints] = useState<number | null>(null);
  const [impact, setImpact] = useState(3);
  const [outcomeId, setOutcomeId] = useState<string | undefined>();
  const [showStaleWarning, setShowStaleWarning] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  if (isLoading) return (
    <div className="p-8 flex items-center gap-3 text-slate-400">
      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      Loading commit...
    </div>
  );
  if (isError) return <div className="p-8"><ErrorAlert message={(error as Error)?.message ?? "Failed to load commit"} /></div>;
  if (!commit) return <div className="p-8 text-red-500">Commit not found</div>;

  const isDraft = commit.status === "DRAFT";
  const totalSP = commit.items.reduce((sum, i) => sum + (i.effortEstimate ?? 0), 0);
  const hasNullSP = commit.items.some((i) => i.effortEstimate == null);
  const hasStaleItems = commit.items.some((i) => i.flaggedStale);
  const firstStaleItem = commit.items.find((i) => i.flaggedStale);
  const canLock = isDraft && commit.items.length > 0 && !hasNullSP && !hasStaleItems;
  const showReconLink = commit.status !== "DRAFT";

  const resetForm = () => {
    setTitle(""); setDescription(""); setChess(""); setStoryPoints(null);
    setImpact(3); setOutcomeId(undefined); setEditingItem(null); setShowForm(false);
  };

  const handleEdit = (item: CommitItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setDescription(item.description ?? "");
    setChess(item.chessCategory ?? "");
    setStoryPoints(item.effortEstimate);
    setImpact(item.impactEstimate ?? 3);
    setOutcomeId(item.outcomeId ?? undefined);
    setShowForm(true);
  };

  const handleDelete = (item: CommitItem) => {
    if (!window.confirm(`Delete "${item.title}"?`)) return;
    deleteItemMut.mutate(item.id, { onError: (err) => addToast((err as Error).message) });
  };

  const handleSubmit = () => {
    if (!title.trim()) return;
    const data = {
      title, description: description || undefined,
      chessCategory: chess || undefined,
      effortEstimate: storyPoints ?? undefined,
      impactEstimate: impact, outcomeId,
      sortOrder: editingItem ? editingItem.sortOrder : commit.items.length,
    };
    if (editingItem) {
      updateItem.mutate({ itemId: editingItem.id, req: data }, {
        onSuccess: () => { if (outcomeId) addToast("Linked to RCDO outcome"); resetForm(); },
        onError: (err) => addToast((err as Error).message),
      });
    } else {
      createItem.mutate(data, {
        onSuccess: () => { if (outcomeId) addToast("Linked to RCDO outcome"); resetForm(); },
        onError: (err) => addToast((err as Error).message),
      });
    }
  };

  const CHESS_OPTIONS = [
    { value: "STRATEGIC", label: "Strategic" },
    { value: "TACTICAL", label: "Tactical" },
    { value: "OPERATIONAL", label: "Operational" },
    { value: "MAINTENANCE", label: "Maintenance" },
  ];

  return (
    <motion.div
      className="p-6 lg:p-8 space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Link
            to="/editor"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-[#0f4c5c] transition-colors mb-3 group"
          >
            <svg className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Back to selector
          </Link>
          <div className="flex items-center gap-3">
            <Avatar name={commit.teamMemberName} size="lg" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Weekly Commit</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                <span className="font-semibold text-slate-700">{commit.teamMemberName}</span>
                <span className="mx-2 text-slate-300">·</span>
                Week of {commit.weekStart}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {commit.items.length > 0 && (
            <div
              className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-bold"
              style={{
                background: "linear-gradient(135deg, rgba(20,94,110,0.08), rgba(13,51,64,0.05))",
                border: "1px solid rgba(20,94,110,0.15)",
                color: "#0f4c5c"
              }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5" />
              </svg>
              <AnimatedNumber value={totalSP} /> SP
            </div>
          )}
          <StatusBadge status={commit.status} />
          {showReconLink && (
            <Link
              to={`/commits/${commit.id}/reconcile`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              Reconciliation
            </Link>
          )}
        </div>
      </div>

      {/* Split layout */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
        {/* Main column */}
        <div className="space-y-4">
          {/* Items header + add button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-800">Commit Items</h2>
              {commit.items.length > 0 && (
                <span
                  className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white"
                  style={{ background: "#0f4c5c" }}
                >
                  {commit.items.length}
                </span>
              )}
            </div>
            {isDraft && (
              <motion.button
                onClick={() => { if (showForm) resetForm(); else setShowForm(true); }}
                className="inline-flex items-center gap-1.5 text-sm font-bold rounded-xl px-4 py-2 transition-all duration-150"
                style={showForm
                  ? { background: "rgba(239,68,68,0.08)", color: "#dc2626" }
                  : { background: "linear-gradient(135deg, #145e6e, #0d3340)", color: "#fff", boxShadow: "0 4px 12px rgba(13,51,64,0.25)" }
                }
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                {showForm ? (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                    Cancel
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add Item
                  </>
                )}
              </motion.button>
            )}
          </div>

          {/* Add/Edit form */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                layout
                style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
              >
                <div
                  className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between"
                  style={{ background: "linear-gradient(135deg, rgba(20,94,110,0.04), rgba(13,51,64,0.02))" }}
                >
                  <h3 className="font-bold text-slate-800 text-sm">
                    {editingItem ? "Edit Item" : "New Commit Item"}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-purple-600 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg px-3 py-1.5 border border-purple-100">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                    </svg>
                    AI: Focus on high-impact deliverables
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <input
                    type="text"
                    placeholder="Item title *"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all duration-150 focus:ring-2 focus:ring-[#145e6e]/20 focus:border-[#145e6e]"
                    style={{ boxShadow: "inset 0 1px 2px rgba(0,0,0,0.04)" }}
                  />
                  <textarea
                    placeholder="Description (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all duration-150 focus:ring-2 focus:ring-[#145e6e]/20 focus:border-[#145e6e] resize-none"
                    style={{ boxShadow: "inset 0 1px 2px rgba(0,0,0,0.04)" }}
                    rows={2}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Combobox
                      label="Category"
                      options={CHESS_OPTIONS}
                      value={chess}
                      onChange={(v) => setChess(v as ChessCategory)}
                      placeholder="Category..."
                    />
                    <div>
                      <FibonacciSelector value={storyPoints} onChange={setStoryPoints} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Impact ({impact})
                      </label>
                      <input
                        type="range"
                        min={1}
                        max={5}
                        value={impact}
                        onChange={(e) => setImpact(+e.target.value)}
                        className="w-full accent-[#0f4c5c] mt-2"
                      />
                      <div className="flex justify-between text-xs text-slate-400 mt-1">
                        <span>Low</span><span>High</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Link to Outcome (optional)</p>
                    <RcdoSelector onSelect={(id) => setOutcomeId(id)} />
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <GlowButton
                      onClick={handleSubmit}
                      disabled={!title.trim() || createItem.isPending || updateItem.isPending}
                      className="rounded-xl px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                      style={{ background: "linear-gradient(135deg, #145e6e 0%, #0d3340 100%)", boxShadow: "0 4px 12px rgba(13,51,64,0.3)" }}
                      glowColor="rgba(13, 51, 64, 0.4)"
                    >
                      {createItem.isPending || updateItem.isPending
                        ? "Saving..."
                        : editingItem ? "Update Item" : "Add Item"}
                    </GlowButton>
                    <button
                      onClick={resetForm}
                      className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Items list */}
          <div className="space-y-2">
            <AnimatePresence>
              {commit.items.map((item) => (
                <CommitItemCard
                  key={item.id}
                  item={item}
                  isDraft={isDraft}
                  isLocked={!isDraft}
                  onClick={() => setSelectedItem(item)}
                  onEdit={isDraft ? () => handleEdit(item) : undefined}
                  onDelete={isDraft ? () => handleDelete(item) : undefined}
                  onCategoryChange={
                    isDraft
                      ? (category: ChessCategory) => {
                          updateItemCategory.mutate(
                            { itemId: item.id, chessCategory: category },
                            {
                              onSuccess: () => addToast("Category updated"),
                              onError: (err) => addToast((err as Error).message),
                            }
                          );
                        }
                      : undefined
                  }
                  onFlagChange={(flag: ItemFlag) => {
                    updateItemFlag.mutate(
                      { itemId: item.id, riskFlag: flag },
                      {
                        onSuccess: () => addToast(flag ? `Item flagged as ${flag}` : "Flag cleared"),
                        onError: (err) => addToast((err as Error).message),
                      }
                    );
                  }}
                />
              ))}
            </AnimatePresence>

            {commit.items.length === 0 && (
              <motion.div
                className="rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: "linear-gradient(135deg, rgba(20,94,110,0.1), rgba(13,51,64,0.06))" }}
                >
                  <svg className="w-6 h-6 text-[#0f4c5c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-slate-500">No items yet</p>
                <p className="text-xs text-slate-400 mt-1">Click "Add Item" above to add your first commit item.</p>
              </motion.div>
            )}
          </div>

          {/* Lock / Resolve buttons */}
          <div className="flex justify-end pt-2">
            {isDraft && hasStaleItems && (
              <GlowButton
                onClick={() => setShowStaleWarning(true)}
                className="rounded-xl px-5 py-2.5 text-sm font-bold text-white"
                style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", boxShadow: "0 4px 12px rgba(245,158,11,0.3)" }}
                glowColor="rgba(245, 158, 11, 0.5)"
              >
                Resolve Stale Tasks
              </GlowButton>
            )}
            {isDraft && !hasStaleItems && (
              <div className="flex flex-col items-end gap-2">
                {!canLock && commit.items.length > 0 && hasNullSP && (
                  <p className="text-xs text-slate-400">All items need story points before locking.</p>
                )}
                <GlowButton
                  onClick={() => lockCommit.mutate(commit.id, { onError: (err) => addToast((err as Error).message) })}
                  disabled={!canLock}
                  className="rounded-xl px-6 py-3 text-sm font-bold text-white uppercase tracking-wide disabled:opacity-50 flex items-center gap-2"
                  style={{ background: "linear-gradient(135deg, #f57c00 0%, #e65100 100%)", boxShadow: "0 4px 14px rgba(245,124,0,0.35)" }}
                  glowColor="rgba(245, 124, 0, 0.5)"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                  Lock Week
                </GlowButton>
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          <div
            className="bg-white rounded-2xl border border-slate-100 p-4"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
          >
            <h3 className="text-sm font-bold text-slate-700 mb-3 tracking-tight flex items-center gap-2">
              <svg className="w-4 h-4 text-[#0f4c5c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
              </svg>
              Chess Layer Grid
            </h3>
            <ChessGrid items={commit.items} />
          </div>

          <div
            className="bg-white rounded-2xl border border-slate-100 p-4"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
          >
            <motion.button
              onClick={() => setShowHistory(!showHistory)}
              className="text-sm font-bold text-slate-700 hover:text-[#0f4c5c] flex items-center gap-2 w-full transition-colors"
            >
              <motion.svg
                animate={{ rotate: showHistory ? 90 : 0 }}
                transition={{ duration: 0.2 }}
                className="w-4 h-4 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </motion.svg>
              <svg className="w-4 h-4 text-[#0f4c5c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              Audit History
            </motion.button>
            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 overflow-hidden"
                >
                  <AuditTimeline commitId={commitId} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showStaleWarning && firstStaleItem && (
          <CarryForwardWarning
            item={firstStaleItem}
            onDelete={() => { handleDelete(firstStaleItem); setShowStaleWarning(false); }}
            onEdit={() => { handleEdit(firstStaleItem); setShowStaleWarning(false); }}
            onClose={() => setShowStaleWarning(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedItem && (
          <TaskDetailsModal
            item={selectedItem}
            commitStatus={commit.status}
            onClose={() => setSelectedItem(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
