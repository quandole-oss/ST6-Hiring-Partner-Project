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
import { SPBarChart } from "../components/charts/SPBarChart";
import { CategoryDonutChart } from "../components/charts/CategoryDonutChart";

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

  if (isLoading) return <div className="p-8 text-slate-500">Loading...</div>;
  if (isError) return <div className="p-8"><ErrorAlert message={(error as Error)?.message ?? "Failed to load teams"} /></div>;

  return (
    <motion.div
      className="p-6 lg:p-8 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Manager Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Select a team to view performance metrics.</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Team</label>
        <div className="flex gap-3 mt-2">
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#0f4c5c]/20 focus:border-[#0f4c5c] outline-none"
          >
            <option value="">Select team...</option>
            {teams?.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <GlowButton
            onClick={() => selected && navigate(`/dashboard/${selected}`)}
            disabled={!selected}
            className="rounded-lg bg-[#0f4c5c] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#145e6e] disabled:opacity-50"
            glowColor="rgba(15, 76, 92, 0.5)"
          >
            View Dashboard
          </GlowButton>
        </div>
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
