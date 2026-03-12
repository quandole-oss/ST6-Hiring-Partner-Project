import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTeamSummary } from "../api/dashboard";
import { GlowButton } from "./animations/GlowButton";
import { MarkdownContent } from "./MarkdownContent";

interface Props {
  teamId: string;
  teamName?: string;
}

function TypingReveal({ text }: { text: string }) {
  const [visibleCount, setVisibleCount] = useState(0);
  const words = text.split(" ");
  const done = visibleCount >= words.length;

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

  if (done) {
    return <MarkdownContent content={text} />;
  }

  return (
    <span className="whitespace-pre-line">
      {words.slice(0, visibleCount).join(" ")}
      <span className="inline-block w-1.5 h-4 bg-purple-400 animate-pulse ml-0.5 align-middle rounded-sm" />
    </span>
  );
}

export function AISummaryPanel({ teamId, teamName }: Props) {
  const { data: summary, isLoading, isFetching, error, refetch } = useTeamSummary(teamId, teamName);
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
      className="rounded-2xl border border-purple-100 p-5 space-y-3"
      style={{
        background: "linear-gradient(135deg, rgba(147,51,234,0.04) 0%, rgba(59,130,246,0.04) 100%)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.8)",
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)" }}>
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
            </svg>
          </div>
          <h3 className="font-semibold text-slate-800 text-sm">AI Summary</h3>
        </div>
        <GlowButton
          onClick={() => refetch()}
          disabled={isFetching}
          className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50 transition-all duration-150"
          style={{ background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)", boxShadow: "0 3px 8px rgba(124,58,237,0.3)" }}
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

      {error && !isFetching && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          AI summary is temporarily unavailable. Please try again later.
        </div>
      )}

      {summary && !error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-sm text-gray-700 leading-relaxed">
            {showTyping ? <TypingReveal text={summary.summary} /> : (
              <MarkdownContent content={summary.summary} />
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
