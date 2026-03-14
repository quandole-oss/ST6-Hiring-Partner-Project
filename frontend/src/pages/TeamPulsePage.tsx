import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTeamContext } from "../contexts/TeamContext";
import { useAuth } from "../contexts/AuthContext";
import { useCommits, useUpdateMood } from "../api/commits";
import { MoodSelector } from "../components/MoodSelector";
import { HighFiveForm } from "../components/pulse/HighFiveForm";
import { HighFivesFeed } from "../components/pulse/HighFivesFeed";
import { RetrospectiveForm } from "../components/pulse/RetrospectiveForm";
import { useToast } from "../hooks/useToast";

export function TeamPulsePage() {
  const { weekStart } = useTeamContext();
  const { user } = useAuth();
  const { addToast } = useToast();

  const { data: commits } = useCommits(user?.memberId ?? "");
  const currentCommit = commits?.find((c) => c.weekStart === weekStart);
  const updateMood = useUpdateMood(currentCommit?.id ?? "");

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
          <div className="flex items-center gap-3 mb-1">
            <svg className="w-8 h-8 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
            <h1 className="text-3xl font-bold text-white">Team Pulse</h1>
          </div>
          <p className="text-white/70 mt-1">Weekly team health, recognition, and reflection</p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/4" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Section 1: Pulse Check (Mood) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-slate-100 p-6"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
          >
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#f57c00]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
              </svg>
              Pulse Check
            </h2>
            {currentCommit ? (
              <MoodSelector
                value={currentCommit.moodScore}
                onChange={(score) =>
                  updateMood.mutate(score, {
                    onSuccess: () => addToast("Mood updated"),
                    onError: (err) => addToast((err as Error).message),
                  })
                }
                disabled={updateMood.isPending}
              />
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-slate-500 mb-2">Create your weekly commit first to track your mood</p>
                <Link
                  to="/editor"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0f4c5c] hover:text-[#1a6b7a] transition-colors"
                >
                  Go to Commit Editor
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>
            )}
          </motion.div>

          {/* Section 2: Give a High Five */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-slate-100 p-6"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
          >
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="text-xl">🖐</span>
              Give a High Five
            </h2>
            <HighFiveForm />
            <div className="mt-4 pt-4 border-t border-slate-100">
              <h3 className="text-sm font-semibold text-slate-600 mb-3">This Week's High Fives</h3>
              <HighFivesFeed weekStart={weekStart} />
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-slate-100 p-6"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
        >
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#0f4c5c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            Weekly Retrospective
          </h2>
          <RetrospectiveForm />
        </motion.div>
      </div>
    </motion.div>
  );
}
