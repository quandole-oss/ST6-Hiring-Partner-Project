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
      style={style}
      {...listeners}
      {...attributes}
      className={`bg-white rounded-lg border border-slate-200 p-3 shadow-sm cursor-grab active:cursor-grabbing transition-opacity ${
        isDragging ? "opacity-50 shadow-lg z-50" : ""
      } ${isPending ? "opacity-50" : ""}`}
      layout
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-slate-800 truncate">
          {commit.teamMemberName}
        </span>
        <StatusBadge status={commit.status} />
      </div>
      <div className="text-xs text-slate-500">
        Week of {commit.weekStart}
      </div>
      <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
        <span>{commit.items.length} items</span>
        <span>{totalSP} SP</span>
        {commit.hasBlockedItems && (
          <span className="text-red-600 font-medium bg-red-50 px-1.5 py-0.5 rounded">
            BLOCKED
          </span>
        )}
      </div>
    </motion.div>
  );
}
