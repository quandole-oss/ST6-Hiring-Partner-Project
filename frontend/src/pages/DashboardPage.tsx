import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTeamContext } from "../contexts/TeamContext";
import { motion } from "framer-motion";
import { useTeamDashboard, useAlignmentMetrics } from "../api/dashboard";
import { useTeams } from "../api/teams";
import { AlignmentScoreDisplay } from "../components/AlignmentScore";
import { StatusBadge } from "../components/StatusBadge";
import { ErrorAlert } from "../components/ErrorAlert";
import { AnimatedNumber } from "../components/animations/AnimatedNumber";
import { AnimatedProgress } from "../components/animations/AnimatedProgress";
import { InViewRow } from "../components/animations/InViewRow";
import { GlowButton } from "../components/animations/GlowButton";
import { AISummaryPanel } from "../components/AISummaryPanel";
import { AIQAPanel } from "../components/AIQAPanel";
import { SPBarChart } from "../components/charts/SPBarChart";
import { CategoryDonutChart } from "../components/charts/CategoryDonutChart";
import { Combobox } from "../components/ui/Combobox";

export function DashboardPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const { setTeamId: setContextTeamId } = useTeamContext();

  useEffect(() => {
    if (teamId) setContextTeamId(teamId);
  }, [teamId, setContextTeamId]);

  if (teamId) {
    return <DashboardView teamId={teamId} />;
  }
  return <TeamSelector />;
}

function TeamSelector() {
  const navigate = useNavigate();
  const { data: teams, isLoading, isError, error } = useTeams();
  const { teamId: contextTeamId } = useTeamContext();
  const [selected, setSelected] = useState(contextTeamId);
  if (isLoading) return (
    <div className="p-8 flex items-center gap-3 text-slate-400">
      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      Loading teams...
    </div>
  );
  if (isError) return <div className="p-8"><ErrorAlert message={(error as Error)?.message ?? "Failed to load teams"} /></div>;
  const teamOptions = (teams ?? []).map((t) => ({ value: t.id, label: t.name }));
  const selectedTeam = teams?.find((t) => t.id === selected);
  return (
    <motion.div
      className="p-6 lg:p-8 max-w-2xl"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: "linear-gradient(135deg, #145e6e 0%, #0d3340 100%)", boxShadow: "0 4px 16px rgba(13,51,64,0.3)" }}
        >
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manager Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Select a team to view performance metrics.</p>
        </div>
      </div>

      {/* Team selector card */}
      <div
        className="bg-white rounded-2xl border border-slate-100 p-6"
        style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)" }}
      >
        <div className="mb-4">
          <Combobox
            label="Team"
            options={teamOptions}
            value={selected}
            onChange={setSelected}
            placeholder="Select a team..."
            searchable={teamOptions.length > 5}
          />
        </div>

        {/* Selected team preview */}
        {selectedTeam && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 rounded-xl p-3 mb-4"
            style={{
              background: "linear-gradient(135deg, rgba(20,94,110,0.06), rgba(13,51,64,0.03))",
              border: "1px solid rgba(20,94,110,0.12)"
            }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg, #145e6e, #0d3340)" }}
            >
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">{selectedTeam.name}</p>
              <p className="text-xs text-slate-500">Team selected</p>
            </div>
            <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Ready
            </span>
          </motion.div>
        )}

        <GlowButton
          onClick={() => selected && navigate(`/dashboard/${selected}`)}
          disabled={!selected}
          className="w-full rounded-xl py-2.5 text-sm font-bold text-white disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg, #f57c00 0%, #e65100 100%)", boxShadow: "0 4px 14px rgba(245,124,0,0.35)" }}
          glowColor="rgba(245, 124, 0, 0.5)"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3" />
          </svg>
          View Dashboard
        </GlowButton>
      </div>
    </motion.div>
  );
}

function DashboardView({ teamId }: { teamId: string }) {
  const { data: team, isLoading, isError, error } = useTeamDashboard(teamId);
  const { data: alignment } = useAlignmentMetrics();

  if (isLoading) return <div className="p-8 text-slate-500">Loading...</div>;
  if (isError) return <div className="p-8"><ErrorAlert message={(error as Error)?.message ?? "Failed to load dashboard"} /></div>;
  if (!team) return <div className="p-8 text-red-500">Team not found</div>;

  const totalSP = team.members.reduce((s, m) => s + m.totalStoryPoints, 0);
  const completedSP = team.members.reduce((s, m) => s + m.completedStoryPoints, 0);

  return (
    <motion.div
      className="p-6 lg:p-8 space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full" style={{ background: "rgba(13,51,64,0.08)", color: "#145e6e" }}>
              {team.teamName}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Manager Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Weekly performance overview and alignment metrics</p>
        </div>
      </div>

      <AISummaryPanel teamId={teamId} />
      <AIQAPanel teamId={teamId} />

      {/* Metrics grid */}
      {alignment && (
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {[
            { label: "Alignment", content: <AlignmentScoreDisplay score={alignment.overallAlignment} />, icon: "🎯" },
            { label: "Total Items", value: alignment.totalItems, color: "text-slate-800", icon: "📋" },
            { label: "RCDO Linked", value: alignment.linkedItems, color: "text-st6-teal-700", icon: "🔗" },
            { label: "Unlinked", value: alignment.unlinkedItems, color: "text-st6-orange", icon: "⚠️" },
            { label: "Total SP", value: totalSP, color: "text-indigo-600", icon: "📊" },
            { label: "Completed SP", value: completedSP, color: "text-emerald-600", icon: "✅" },
          ].map((metric) => (
            <div
              key={metric.label}
              className="bg-white rounded-2xl border border-slate-100 p-5 text-center transition-all duration-200 hover:-translate-y-0.5"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)" }}
            >
              <div className="text-lg mb-1">{metric.icon}</div>
              {metric.content ?? (
                <div className={`text-3xl font-bold tracking-tight ${metric.color}`}>
                  <AnimatedNumber value={metric.value!} />
                </div>
              )}
              <div className="text-xs text-slate-500 mt-1.5 font-medium uppercase tracking-wide">{metric.label}</div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden transition-all duration-200 hover:-translate-y-0.5" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <SPBarChart members={team.members} />
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden transition-all duration-200 hover:-translate-y-0.5" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <CategoryDonutChart breakdown={team.categoryBreakdown} />
        </div>
      </div>

      {/* Member table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider" style={{ background: "#f8fafc" }}>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Items</th>
                <th className="py-3 px-4 text-right">SP</th>
                <th className="py-3 px-4 text-right">Completed</th>
                <th className="py-3 px-4 text-right">Blocked</th>
                <th className="py-3 px-4 text-right">At Risk</th>
                <th className="py-3 px-4 text-right">Completion</th>
                <th className="py-3 px-4 text-right">Alignment</th>
              </tr>
            </thead>
            <tbody>
              {[...team.members]
                .sort((a, b) => b.blockedItems - a.blockedItems)
                .map((m, i) => {
                const spPercent = m.totalStoryPoints > 0 ? Math.round((m.completedStoryPoints / m.totalStoryPoints) * 100) : 0;
                return (
                  <InViewRow key={m.memberId} index={i} as="tr" className={`border-b border-slate-50 hover:bg-slate-50/50 ${m.blockedItems > 0 ? "border-l-4 border-l-red-400" : ""}`}>
                    <td className="py-3 px-4 font-medium text-slate-800">{m.memberName}</td>
                    <td className="py-3 px-4">
                      {m.commitStatus ? <StatusBadge status={m.commitStatus} /> : <span className="text-slate-400 text-xs">No commit</span>}
                    </td>
                    <td className="py-3 px-4 text-right">{m.totalItems}</td>
                    <td className="py-3 px-4 text-right font-medium">{m.totalStoryPoints}</td>
                    <td className="py-3 px-4 text-right">{m.completedItems}</td>
                    <td className="py-3 px-4 text-right">{m.blockedItems > 0 ? <span className="text-red-600 font-semibold">{m.blockedItems}</span> : <span className="text-slate-300">0</span>}</td>
                    <td className="py-3 px-4 text-right">{m.atRiskItems > 0 ? <span className="text-orange-600 font-semibold">{m.atRiskItems}</span> : <span className="text-slate-300">0</span>}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <AnimatedProgress value={spPercent} className="w-16" />
                        <span className="text-slate-600 tabular-nums">{spPercent}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums">{Math.round(m.alignmentScore * 100)}%</td>
                  </InViewRow>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
