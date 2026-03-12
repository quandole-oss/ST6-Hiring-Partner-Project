import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAiQa } from "../api/dashboard";
import { shouldUseMock, getMockQaResponse } from "../services/aiSummaryService";
import { GlowButton } from "./animations/GlowButton";

interface Props {
  teamId: string;
}

interface QaEntry {
  question: string;
  answer: string;
  generatedAt: string;
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

export function AIQAPanel({ teamId }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState<QaEntry[]>([]);
  const [latestAnswer, setLatestAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const askMutation = useAiQa();
  const historyEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const handleAsk = async () => {
    if (!question.trim() || loading) return;
    const q = question.trim();
    setQuestion("");
    setLoading(true);
    setLatestAnswer(null);

    try {
      let response: QaEntry;
      if (shouldUseMock()) {
        response = await getMockQaResponse(q);
      } else {
        response = await askMutation.mutateAsync({ question: q, teamId });
      }
      setLatestAnswer(response.answer);
      setHistory((prev) => [...prev, response]);
    } catch {
      setHistory((prev) => [...prev, { question: q, answer: "Sorry, I couldn't process that question. Please try again.", generatedAt: new Date().toISOString() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="rounded-lg border border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 overflow-hidden"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <h3 className="font-semibold text-purple-800 flex items-center gap-2">
          <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            AI Q&amp;A
          </span>
          <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-medium">Ask anything</span>
        </h3>
        <svg className={`w-5 h-5 text-purple-400 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="px-4 pb-4 space-y-3"
          >
            {/* History */}
            {history.length > 0 && (
              <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
                {history.map((entry, i) => (
                  <div key={i} className="space-y-1">
                    <div className="text-xs font-medium text-purple-700">Q: {entry.question}</div>
                    <div className="text-sm text-gray-700 leading-relaxed bg-white/60 rounded-lg p-2.5">
                      {i === history.length - 1 && latestAnswer ? (
                        <TypingReveal text={entry.answer} />
                      ) : (
                        <span className="whitespace-pre-line">{entry.answer}</span>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={historyEndRef} />
              </div>
            )}

            {/* Loading shimmer */}
            {loading && (
              <div className="space-y-2">
                <div className="h-4 rounded w-full overflow-hidden bg-purple-100">
                  <div className="h-full w-full bg-gradient-to-r from-purple-100 via-purple-300 to-purple-100 animate-shimmer" />
                </div>
                <div className="h-4 rounded w-4/6 overflow-hidden bg-purple-100">
                  <div className="h-full w-full bg-gradient-to-r from-purple-100 via-purple-300 to-purple-100 animate-shimmer" />
                </div>
              </div>
            )}

            {/* Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAsk()}
                placeholder="Ask about your team's work..."
                className="flex-1 rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-400 outline-none"
                disabled={loading}
              />
              <GlowButton
                onClick={handleAsk}
                disabled={!question.trim() || loading}
                className="rounded-lg bg-purple-600 px-4 py-2 text-sm text-white hover:bg-purple-700 disabled:opacity-50"
                glowColor="rgba(147, 51, 234, 0.5)"
              >
                Ask
              </GlowButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
