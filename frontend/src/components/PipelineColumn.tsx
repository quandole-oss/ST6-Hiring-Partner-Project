import { useDroppable } from "@dnd-kit/core";
import type { CommitStatus } from "../types";
import type { ReactNode } from "react";

const COLUMN_COLORS: Record<CommitStatus, { bg: string; border: string; badge: string }> = {
  DRAFT: { bg: "bg-gray-50", border: "border-gray-200", badge: "bg-gray-100 text-gray-700" },
  LOCKED: { bg: "bg-blue-50", border: "border-blue-200", badge: "bg-blue-100 text-blue-700" },
  RECONCILING: { bg: "bg-yellow-50", border: "border-yellow-200", badge: "bg-yellow-100 text-yellow-700" },
  RECONCILED: { bg: "bg-green-50", border: "border-green-200", badge: "bg-green-100 text-green-700" },
  CARRY_FORWARD: { bg: "bg-purple-50", border: "border-purple-200", badge: "bg-purple-100 text-purple-700" },
};

interface Props {
  status: CommitStatus;
  count: number;
  children: ReactNode;
}

export function PipelineColumn({ status, count, children }: Props) {
  const { isOver, setNodeRef } = useDroppable({ id: status });
  const colors = COLUMN_COLORS[status];

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-xl border-2 ${colors.border} ${colors.bg} min-h-[400px] transition-all ${
        isOver ? "ring-2 ring-[#0f4c5c] border-[#0f4c5c] bg-[#0f4c5c]/5" : ""
      }`}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/50">
        <h3 className="text-sm font-semibold text-slate-700">
          {status.replace("_", " ")}
        </h3>
        <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${colors.badge}`}>
          {count}
        </span>
      </div>
      <div className="flex-1 p-3 space-y-2">
        {children}
      </div>
    </div>
  );
}
