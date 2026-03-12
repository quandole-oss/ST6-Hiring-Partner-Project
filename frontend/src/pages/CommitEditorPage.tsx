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
import { useToast } from "../hooks/useToast";
import type { ChessCategory, CommitItem, ItemFlag } from "../types";

export function CommitEditorPage() {
  const { id } = useParams<{ id: string }>();

  if (id) {
    return <CommitEditor commitId={id} />;
  }
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

  if (teamsLoading) return <div className="p-8 text-slate-500">Loading...</div>;
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

  return (
    <motion.div
      className="p-6 lg:p-8 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Commit Editor</h1>
        <p className="text-sm text-slate-500 mt-1">Select a team and member to manage weekly commits.</p>
      </div>

      {/* Context Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
          <span className={`font-medium ${teamId ? "text-[#0f4c5c]" : "text-slate-400"}`}>1. Team</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
          <span className={`font-medium ${memberId ? "text-[#0f4c5c]" : "text-slate-400"}`}>2. Member</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Team</label>
            <div className="relative">
              <select
                value={teamId}
                onChange={(e) => { setTeamId(e.target.value); setMemberId(""); }}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none appearance-none transition-all duration-150 focus:ring-2 focus:ring-st6-teal-400/30 focus:border-st6-teal-500 hover:border-slate-300"
                style={{ boxShadow: "inset 0 1px 2px rgba(0,0,0,0.04)", paddingRight: "2.5rem" }}
              >
                <option value="">Select team...</option>
                {teams?.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <AnimatePresence>
            {teamId && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Member</label>
                <div className="relative">
                  <select
                    value={memberId}
                    onChange={(e) => setMemberId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none appearance-none transition-all duration-150 focus:ring-2 focus:ring-st6-teal-400/30 focus:border-st6-teal-500 hover:border-slate-300"
                    style={{ boxShadow: "inset 0 1px 2px rgba(0,0,0,0.04)", paddingRight: "2.5rem" }}
                  >
                    <option value="">Select member...</option>
                    {members?.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {memberId && (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-base font-semibold text-slate-800 tracking-tight">Existing Commits</h2>
            {commits && commits.length > 0 ? (
              <div className="space-y-2">
                {commits.map((c, i) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      to={`/commits/${c.id}`}
                      className="block bg-white rounded-xl border border-slate-100 p-4 transition-all duration-150 hover:-translate-y-0.5"
                      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-800">Week of {c.weekStart}</span>
                        <StatusBadge status={c.status} />
                      </div>
                      <span className="text-sm text-slate-500">{c.items.length} items</span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No commits found.</p>
            )}

            <div className="flex items-end gap-3 pt-4 border-t border-slate-200">
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Week start</label>
                <input
                  type="date"
                  value={weekStart}
                  onChange={(e) => setWeekStart(e.target.value)}
                  className="block rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition-all duration-150 focus:ring-2 focus:ring-st6-teal-400/30 focus:border-st6-teal-500"
                  style={{ boxShadow: "inset 0 1px 2px rgba(0,0,0,0.04)" }}
                />
              </div>
              <GlowButton
                onClick={handleCreate}
                disabled={createCommit.isPending}
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all duration-150 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #f57c00 0%, #e65100 100%)", boxShadow: "0 4px 12px rgba(245,124,0,0.3)" }}
                glowColor="rgba(245, 124, 0, 0.5)"
              >
                {createCommit.isPending ? "Creating..." : "New Commit"}
              </GlowButton>
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

  // Deep linking: auto-open TaskDetailsModal from ?openItem=id
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

  if (isLoading) return <div className="p-8 text-slate-500">Loading...</div>;
  if (isError) return <div className="p-8"><ErrorAlert message={(error as Error)?.message ?? "Failed to load commit"} /></div>;
  if (!commit) return <div className="p-8 text-red-500">Commit not found</div>;

  const isDraft = commit.status === "DRAFT";
  const totalSP = commit.items.reduce((sum, i) => sum + (i.effortEstimate ?? 0), 0);
  const hasNullSP = commit.items.some((i) => i.effortEstimate == null);
  const hasStaleItems = commit.items.some((i) => i.flaggedStale);
  const firstStaleItem = commit.items.find((i) => i.flaggedStale);
  const canLock = isDraft && commit.items.length > 0 && !hasNullSP && !hasStaleItems;

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setChess("");
    setStoryPoints(null);
    setImpact(3);
    setOutcomeId(undefined);
    setEditingItem(null);
    setShowForm(false);
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
    deleteItemMut.mutate(item.id, {
      onError: (err) => addToast((err as Error).message),
    });
  };

  const handleSubmit = () => {
    if (!title.trim()) return;
    const data = {
      title,
      description: description || undefined,
      chessCategory: chess || undefined,
      effortEstimate: storyPoints ?? undefined,
      impactEstimate: impact,
      outcomeId,
      sortOrder: editingItem ? editingItem.sortOrder : commit.items.length,
    };

    if (editingItem) {
      updateItem.mutate(
        { itemId: editingItem.id, req: data },
        {
          onSuccess: () => {
            if (outcomeId) addToast("Linked to RCDO outcome");
            resetForm();
          },
          onError: (err) => addToast((err as Error).message),
        }
      );
    } else {
      createItem.mutate(data, {
        onSuccess: () => {
          if (outcomeId) addToast("Linked to RCDO outcome");
          resetForm();
        },
        onError: (err) => addToast((err as Error).message),
      });
    }
  };

  const showReconLink = commit.status !== "DRAFT";

  return (
    <motion.div
      className="p-6 lg:p-8 space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link to="/editor" className="text-xs text-slate-400 hover:text-[#0f4c5c] transition-colors">&larr; Back to selector</Link>
          <h1 className="text-2xl font-bold text-slate-800 mt-1">Weekly Commit</h1>
          <p className="text-sm text-slate-500">
            {commit.teamMemberName} &middot; Week of {commit.weekStart}
          </p>
          {commit.items.length > 0 && (
            <p className="text-sm font-semibold text-[#0f4c5c] mt-1">
              Total SP: <AnimatedNumber value={totalSP} />
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={commit.status} />
          {showReconLink && (
            <Link
              to={`/commits/${commit.id}/reconcile`}
              className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors"
            >
              Reconciliation
            </Link>
          )}
        </div>
      </div>

      {/* Split layout: main + sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
        {/* Main column */}
        <div className="space-y-4">
          {/* Add Item Form */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4"
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 12 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                layout
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-800">{editingItem ? "Edit Item" : "New Commit Item"}</h3>
                  {/* AI Suggestion */}
                  <div className="text-xs text-purple-600 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg px-3 py-1.5 border border-purple-100">
                    AI suggests: Focus on high-impact deliverables
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Item title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#0f4c5c]/20 focus:border-[#0f4c5c] outline-none"
                />
                <textarea
                  placeholder="Description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#0f4c5c]/20 focus:border-[#0f4c5c] outline-none"
                  rows={2}
                />
                <div className="grid grid-cols-3 gap-3">
                  <select
                    value={chess}
                    onChange={(e) => setChess(e.target.value as ChessCategory)}
                    className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#0f4c5c]/20 focus:border-[#0f4c5c] outline-none"
                  >
                    <option value="">Category...</option>
                    <option value="STRATEGIC">Strategic</option>
                    <option value="TACTICAL">Tactical</option>
                    <option value="OPERATIONAL">Operational</option>
                    <option value="MAINTENANCE">Maintenance</option>
                  </select>
                  <FibonacciSelector value={storyPoints} onChange={setStoryPoints} />
                  <label className="text-sm text-slate-600">
                    Impact ({impact})
                    <input type="range" min={1} max={5} value={impact} onChange={(e) => setImpact(+e.target.value)} className="w-full accent-[#0f4c5c]" />
                  </label>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1 font-medium uppercase tracking-wide">Link to Outcome (optional)</p>
                  <RcdoSelector onSelect={(id) => setOutcomeId(id)} />
                </div>
                <div className="flex items-center gap-3">
                  <GlowButton
                    onClick={handleSubmit}
                    disabled={!title.trim() || createItem.isPending || updateItem.isPending}
                    className="rounded-lg bg-[#0f4c5c] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#145e6e] disabled:opacity-50"
                    glowColor="rgba(15, 76, 92, 0.5)"
                  >
                    {createItem.isPending || updateItem.isPending
                      ? "Saving..."
                      : editingItem
                        ? "Update Item"
                        : "Add Item"}
                  </GlowButton>
                  <button
                    onClick={resetForm}
                    className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Items header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">Commit Items ({commit.items.length})</h2>
            {isDraft && (
              <motion.button
                onClick={() => { if (showForm) resetForm(); else setShowForm(true); }}
                className="text-sm font-medium text-[#0f4c5c] hover:text-[#145e6e] flex items-center gap-1"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {showForm ? "Cancel" : (
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

          {/* Items list */}
          <div className="space-y-3">
            <AnimatePresence>
              {commit.items.map((item) => (
                <CommitItemCard
                  key={item.id}
                  item={item}
                  isDraft={isDraft}
                  isLocked={commit.status === "LOCKED"}
                  onClick={() => setSelectedItem(item)}
                  onEdit={() => handleEdit(item)}
                  onDelete={() => handleDelete(item)}
                  onCategoryChange={
                    ["DRAFT", "LOCKED", "RECONCILING"].includes(commit.status)
                      ? (category) => {
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
                className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-10 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-slate-400 text-sm">No items yet. Add your first commit item.</p>
              </motion.div>
            )}
          </div>

          {/* Lock / Resolve buttons at bottom */}
          <div className="flex justify-end pt-2">
            {isDraft && hasStaleItems && (
              <GlowButton
                onClick={() => setShowStaleWarning(true)}
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all duration-150"
                style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", boxShadow: "0 4px 12px rgba(245,158,11,0.3)" }}
                glowColor="rgba(245, 158, 11, 0.5)"
              >
                Resolve Stale Tasks
              </GlowButton>
            )}
            {isDraft && !hasStaleItems && (
              <GlowButton
                onClick={() => lockCommit.mutate(commit.id, { onError: (err) => addToast((err as Error).message) })}
                disabled={!canLock}
                className="rounded-xl px-6 py-3 text-sm font-semibold text-white uppercase tracking-wide transition-all duration-150 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #f57c00 0%, #e65100 100%)", boxShadow: "0 4px 14px rgba(245,124,0,0.35)" }}
                glowColor="rgba(245, 124, 0, 0.5)"
              >
                Lock Week
              </GlowButton>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 tracking-tight">Chess Layer Grid</h3>
            <ChessGrid items={commit.items} />
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <motion.button
              onClick={() => setShowHistory(!showHistory)}
              className="text-sm font-medium text-slate-500 hover:text-[#0f4c5c] flex items-center gap-1 w-full"
              whileHover={{ scale: 1.02 }}
            >
              <svg className={`w-4 h-4 transition-transform ${showHistory ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
              Audit History
            </motion.button>
            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3"
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
            onDelete={() => {
              handleDelete(firstStaleItem);
              setShowStaleWarning(false);
            }}
            onEdit={() => {
              handleEdit(firstStaleItem);
              setShowStaleWarning(false);
            }}
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
