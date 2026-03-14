import { useState } from "react";
import { motion } from "framer-motion";
import { useTeams } from "../../api/teams";
import { useCreateHighFive } from "../../api/pulse";
import { useTeamContext } from "../../contexts/TeamContext";
import { useToast } from "../../hooks/useToast";

export function HighFiveForm() {
  const { weekStart } = useTeamContext();
  const { data: teams } = useTeams();
  const createHighFive = useCreateHighFive();
  const { addToast } = useToast();

  const [receiverTeamId, setReceiverTeamId] = useState("");
  const [message, setMessage] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiverTeamId || !message.trim()) return;
    createHighFive.mutate(
      { receiverTeamId, weekStart, message: message.trim(), isPublic },
      {
        onSuccess: () => {
          addToast("High five sent!");
          setMessage("");
          setReceiverTeamId("");
        },
        onError: (err) => addToast((err as Error).message),
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Team</label>
        <select
          value={receiverTeamId}
          onChange={(e) => setReceiverTeamId(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-[#0f4c5c]/30 focus:border-[#0f4c5c] outline-none"
        >
          <option value="">Select a team...</option>
          {teams?.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Great work on..."
          rows={3}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-[#0f4c5c]/30 focus:border-[#0f4c5c] outline-none resize-none"
        />
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsPublic(!isPublic)}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors"
        >
          {isPublic ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          )}
          {isPublic ? "Public" : "Private"}
        </button>

        <motion.button
          type="submit"
          disabled={!receiverTeamId || !message.trim() || createHighFive.isPending}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(135deg, #0f4c5c, #1a6b7a)" }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {createHighFive.isPending ? "Sending..." : "Send High Five"}
        </motion.button>
      </div>
    </form>
  );
}
