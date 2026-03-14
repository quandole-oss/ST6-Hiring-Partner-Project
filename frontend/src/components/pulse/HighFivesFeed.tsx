import { motion, AnimatePresence } from "framer-motion";
import { useHighFives, useDeleteHighFive } from "../../api/pulse";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../hooks/useToast";

interface Props {
  weekStart: string;
}

export function HighFivesFeed({ weekStart }: Props) {
  const { data: highFives, isLoading } = useHighFives(weekStart);
  const deleteHighFive = useDeleteHighFive();
  const { user } = useAuth();
  const { addToast } = useToast();

  if (isLoading) return <p className="text-sm text-slate-400">Loading...</p>;
  if (!highFives?.length) return <p className="text-sm text-slate-400">No high fives yet this week.</p>;

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {highFives.map((hf) => (
          <motion.div
            key={hf.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-xl border border-slate-100 p-3 bg-slate-50/50"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                  <span className="font-medium text-slate-700">{hf.giverName}</span>
                  <span>gave</span>
                  <span className="font-medium text-[#0f4c5c]">{hf.receiverTeamName}</span>
                  <span>a high five</span>
                  {!hf.isPublic && (
                    <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                  )}
                </div>
                <p className="text-sm text-slate-700">{hf.message}</p>
              </div>
              {user?.memberId === hf.giverId && (
                <button
                  onClick={() => deleteHighFive.mutate(hf.id, {
                    onSuccess: () => addToast("High five removed"),
                    onError: (err) => addToast((err as Error).message),
                  })}
                  className="text-slate-300 hover:text-red-400 transition-colors shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
