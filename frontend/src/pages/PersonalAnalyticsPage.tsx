import { useState } from "react";
import { motion } from "framer-motion";
import { useTeamContext } from "../contexts/TeamContext";
import { useTeamMembers } from "../api/teams";
import { usePersonalAnalytics } from "../api/analytics";
import { AnimatedNumber } from "../components/animations/AnimatedNumber";
import { BorderTrailCard } from "../components/animations/BorderTrailCard";
import { StreakDisplay } from "../components/charts/StreakDisplay";
import { OutputTrendChart } from "../components/charts/OutputTrendChart";
import { BusiestDaysChart } from "../components/charts/BusiestDaysChart";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { ErrorAlert } from "../components/ErrorAlert";

const CAT_COLORS: Record<string, string> = {
  STRATEGIC: "#6366f1",
  TACTICAL: "#10b981",
  OPERATIONAL: "#f59e0b",
  MAINTENANCE: "#6b7280",
};

export function PersonalAnalyticsPage() {
  const { teamId } = useTeamContext();
  const { data: members } = useTeamMembers(teamId);
  const [memberId, setMemberId] = useState("");
  const { data: analytics, isLoading, isError, error } = usePersonalAnalytics(memberId);

  return (
    <motion.div
      className="p-6 lg:p-8 space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f4c5c] via-[#1a6b7a] to-[#f57c00] p-8">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white">My Analytics</h1>
          <p className="text-white/70 mt-1">Your personal performance insights</p>
          <div className="mt-4">
            <select
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className="rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-2.5 text-sm text-white placeholder-white/50 focus:ring-2 focus:ring-white/40 outline-none"
            >
              <option value="" className="text-slate-800">Select yourself...</option>
              {members?.map((m) => (
                <option key={m.id} value={m.id} className="text-slate-800">{m.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/4" />
      </div>

      {isLoading && memberId && <div className="text-slate-500">Loading analytics...</div>}
      {isError && <ErrorAlert message={(error as Error)?.message ?? "Failed to load analytics"} />}

      {analytics && (
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: "Weeks Tracked", value: analytics.summary.totalWeeks, color: "text-slate-800" },
              { label: "Total Items", value: analytics.summary.totalItems, color: "text-[#0f4c5c]" },
              { label: "Total SP", value: analytics.summary.totalStoryPoints, color: "text-indigo-600" },
              { label: "Completion Rate", value: Math.round(analytics.summary.completionRate * 100), suffix: "%", color: "text-emerald-600" },
              { label: "Avg SP/Week", value: Math.round(analytics.summary.avgStoryPointsPerWeek * 10) / 10, color: "text-[#f57c00]" },
            ].map((stat) => (
              <BorderTrailCard key={stat.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 text-center">
                <div className={`text-3xl font-bold ${stat.color}`}>
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-xs text-slate-500 mt-1 font-medium">{stat.label}</div>
              </BorderTrailCard>
            ))}
          </div>

          {/* Streak */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <StreakDisplay streak={analytics.streak} />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <OutputTrendChart data={analytics.outputTrend} />
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <BusiestDaysChart data={analytics.busiestDays} />
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Category Breakdown (by SP)</h3>
              {analytics.categoryBreakdown.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">No categorized items yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={analytics.categoryBreakdown.map((c) => ({ name: c.category, value: c.storyPoints }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {analytics.categoryBreakdown.map((c) => (
                        <Cell key={c.category} fill={CAT_COLORS[c.category] ?? "#9ca3af"} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
