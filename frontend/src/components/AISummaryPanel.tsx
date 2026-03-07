import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTeamSummary } from "../api/dashboard";
import { GlowButton } from "./animations/GlowButton";

interface Props {
  teamId: string;
  teamName?: string;
}

function TypingReveal({ text }: { text: string }) {
  const [visibleCount, setVisibleCount] = useState(0);
  const words = text.split(" ");

  useEffect(() => {
    setVisibleCount(0);
    if (words.length === 0) return;
    const interval = setInterval(() => {
      setVisibleCount((prev) => {
        if (prev >= words.length) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 1000 / words.length);
    return () => clearInterval(interval);
  }, [text, words.length]);

  return (
    <span className="whitespace-pre-line">
      {words.slice(0, visibleCount).join(" ")}
      {visibleCount < words.length && (
        <span className="inline-block w-1.5 h-4 bg-purple-400 animate-pulse ml-0.5 align-middle rounded-sm" />
      )}
    </span>
  );
}

export function AISummaryPanel({ teamId, teamName }: Props) {
  const { data: summary, isLoading, isFetching, refetch } = useTeamSummary(teamId, teamName);
  const [showTyping, setShowTyping] = useState(false);

  useEffect(() => {
    if (summary) {
      setShowTyping(true);
      const timeout = setTimeout(() => setShowTyping(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [summary?.generatedAt]);

  return (
    <motion.div
      className="rounded-lg border border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 p-4 space-y-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-purple-800 flex items-center gap-2">
          <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            AI Summary
          </span>
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
        <div className="space-y-2">
          <div className="h-4 rounded w-full overflow-hidden bg-purple-100">
            <div className="h-full w-full bg-gradient-to-r from-purple-100 via-purple-300 to-purple-100 animate-shimmer" />
          </div>
          <div className="h-4 rounded w-5/6 overflow-hidden bg-purple-100">
            <div className="h-full w-full bg-gradient-to-r from-purple-100 via-purple-300 to-purple-100 animate-shimmer" />
          </div>
          <div className="h-4 rounded w-4/6 overflow-hidden bg-purple-100">
            <div className="h-full w-full bg-gradient-to-r from-purple-100 via-purple-300 to-purple-100 animate-shimmer" />
          </div>
        </div>
      )}

      {summary && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-sm text-gray-700 leading-relaxed">
            {showTyping ? <TypingReveal text={summary.summary} /> : (
              <span className="whitespace-pre-line">{summary.summary}</span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Generated {new Date(summary.generatedAt).toLocaleString()}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
