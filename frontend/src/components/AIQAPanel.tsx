import { useState, useRef, useEffect } from "react";
import { useAiQa } from "../api/dashboard";
import { useTeamContext } from "../contexts/TeamContext";
import { shouldUseMock, getMockQaResponse } from "../services/aiSummaryService";
import { GlowButton } from "./animations/GlowButton";
import { MarkdownContent } from "./MarkdownContent";

interface QaEntry {
  question: string;
  answer: string;
  generatedAt: string;
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

export function AIQAPanel() {
  const { teamId } = useTeamContext();
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
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sorry, I couldn't process that question. Please try again.";
      setHistory((prev) => [...prev, { question: q, answer: msg, generatedAt: new Date().toISOString() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
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
                  <MarkdownContent content={entry.answer} />
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
    </div>
  );
}
