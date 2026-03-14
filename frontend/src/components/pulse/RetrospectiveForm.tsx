import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRetrospectives, useUpsertRetrospective } from "../../api/pulse";
import { useTeamContext } from "../../contexts/TeamContext";
import { RcdoSelector } from "../RcdoSelector";
import { useToast } from "../../hooks/useToast";

const PROMPTS = [
  { key: "WHAT_WORKED", label: "What worked well this week?", icon: "M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" },
  { key: "HOW_BETTER", label: "How can we do this better?", icon: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" },
  { key: "WHAT_NEXT", label: "What needs to be done next?", icon: "M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" },
  { key: "BLOCKERS", label: "What blockers need to be removed?", icon: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126Z" },
];

export function RetrospectiveForm() {
  const { weekStart } = useTeamContext();
  const { data: entries } = useRetrospectives(weekStart);
  const upsert = useUpsertRetrospective();
  const { addToast } = useToast();

  const [responses, setResponses] = useState<Record<string, string>>({});
  const [outcomeIds, setOutcomeIds] = useState<Record<string, string | undefined>>({});
  const [showRcdo, setShowRcdo] = useState<string | null>(null);

  useEffect(() => {
    if (entries) {
      const r: Record<string, string> = {};
      const o: Record<string, string | undefined> = {};
      for (const e of entries) {
        r[e.promptKey] = e.response;
        o[e.promptKey] = e.outcomeId ?? undefined;
      }
      setResponses(r);
      setOutcomeIds(o);
    }
  }, [entries]);

  const handleSave = (promptKey: string) => {
    const response = responses[promptKey]?.trim();
    if (!response) return;
    upsert.mutate(
      { weekStart, promptKey, response, outcomeId: outcomeIds[promptKey] },
      {
        onSuccess: () => addToast("Saved"),
        onError: (err) => addToast((err as Error).message),
      }
    );
  };

  return (
    <div className="space-y-4">
      {PROMPTS.map((prompt, idx) => (
        <motion.div
          key={prompt.key}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="rounded-xl border border-slate-100 bg-white p-4"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-[#0f4c5c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={prompt.icon} />
            </svg>
            <h4 className="text-sm font-semibold text-slate-700">{prompt.label}</h4>
          </div>

          <textarea
            value={responses[prompt.key] ?? ""}
            onChange={(e) => setResponses((prev) => ({ ...prev, [prompt.key]: e.target.value }))}
            placeholder="Type your response..."
            rows={3}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-[#0f4c5c]/30 focus:border-[#0f4c5c] outline-none resize-none"
          />

          <div className="flex items-center justify-between mt-2">
            <button
              type="button"
              onClick={() => setShowRcdo(showRcdo === prompt.key ? null : prompt.key)}
              className="text-xs text-slate-500 hover:text-[#0f4c5c] flex items-center gap-1 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m9.86-2.04a4.5 4.5 0 0 0-1.242-7.244l-4.5-4.5a4.5 4.5 0 0 0-6.364 6.364l1.757 1.757" />
              </svg>
              {outcomeIds[prompt.key] ? "RCDO Linked" : "Link RCDO"}
            </button>

            <motion.button
              type="button"
              onClick={() => handleSave(prompt.key)}
              disabled={!responses[prompt.key]?.trim() || upsert.isPending}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #0f4c5c, #1a6b7a)" }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Save
            </motion.button>
          </div>

          {showRcdo === prompt.key && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-2"
            >
              <RcdoSelector
                onSelect={(outcomeId) => {
                  setOutcomeIds((prev) => ({ ...prev, [prompt.key]: outcomeId }));
                  setShowRcdo(null);
                }}
              />
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
