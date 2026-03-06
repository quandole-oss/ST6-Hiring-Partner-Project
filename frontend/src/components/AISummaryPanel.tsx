import { motion } from "framer-motion";
import { useTeamSummary } from "../api/dashboard";
import { GlowButton } from "./animations/GlowButton";

interface Props {
  teamId: string;
}

export function AISummaryPanel({ teamId }: Props) {
  const { data: summary, isLoading, isFetching, refetch } = useTeamSummary(teamId);

  return (
    <motion.div
      className="rounded-lg border border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 p-4 space-y-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-purple-800 flex items-center gap-2">
          <span>AI Summary</span>
        </h3>
        <GlowButton
          onClick={() => refetch()}
          disabled={isFetching}
          className="rounded bg-purple-600 px-3 py-1 text-xs text-white hover:bg-purple-700 disabled:opacity-50"
          glowColor="rgba(147, 51, 234, 0.5)"
        >
          {isFetching ? "Generating..." : summary ? "Regenerate" : "Generate Summary"}
        </GlowButton>
      </div>

      {(isLoading || isFetching) && !summary && (
        <div className="space-y-2 animate-pulse">
          <div className="h-4 bg-purple-200 rounded w-full" />
          <div className="h-4 bg-purple-200 rounded w-5/6" />
          <div className="h-4 bg-purple-200 rounded w-4/6" />
        </div>
      )}

      {summary && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-sm text-gray-700 leading-relaxed">{summary.summary}</p>
          <p className="text-xs text-gray-400 mt-2">
            Generated {new Date(summary.generatedAt).toLocaleString()}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
