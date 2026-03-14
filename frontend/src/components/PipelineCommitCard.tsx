import { useDraggable } from "@dnd-kit/core";
import { motion } from "framer-motion";
import { StatusBadge } from "./StatusBadge";
import type { WeeklyCommit } from "../types";

interface Props {
  commit: WeeklyCommit;
  isPending?: boolean;
  onClick?: () => void;
}

export function PipelineCommitCard({ commit, isPending, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: commit.id,
    data: { commit },
  });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  const totalSP = commit.items.reduce((sum, i) => sum + (i.effortEstimate ?? 0), 0);

  return (
    <motion.div
      ref={setNodeRef}
      style={{
        ...(style ?? {}),
        boxShadow: isDragging
          ? "0 20px 40px rgba(0,0,0,0.2)"
          : "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
      }}
      {...listeners}
      {...attributes}
      className={`bg-white rounded-xl border border-slate-200 p-3.5 cursor-grab active:cursor-grabbing transition-all duration-150 ${
        isDragging ? "opacity-40 shadow-xl z-50 rotate-1" : "hover:-translate-y-0.5"
      } ${isPending ? "opacity-50" : ""}`}
      layout
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <span className="text-sm font-semibold text-slate-800 leading-tight truncate">
          {commit.teamMemberName}
        </span>
        <StatusBadge status={commit.status} />
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-50 rounded-full px-2 py-0.5 border border-slate-100">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
          </svg>
          {commit.items.length} items
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-50 rounded-full px-2 py-0.5 border border-slate-100">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
          </svg>
          {totalSP} SP
        </span>
        {commit.hasBlockedItems && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 rounded-full px-2 py-0.5 border border-red-100">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            Blocked
          </span>
        )}
      </div>
    </motion.div>
  );
}
