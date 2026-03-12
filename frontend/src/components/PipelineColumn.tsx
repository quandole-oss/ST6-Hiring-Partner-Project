import { useDroppable } from "@dnd-kit/core";
import type { CommitStatus } from "../types";
import type { ReactNode } from "react";

const COLUMN_CONFIG: Record<CommitStatus, {
  bg: string;
  border: string;
  badge: string;
  headerBg: string;
  dot: string;
  label: string;
}> = {
  DRAFT: {
    bg: "bg-slate-50",
    border: "border-slate-200",
    badge: "bg-slate-100 text-slate-600",
    headerBg: "bg-white",
    dot: "bg-slate-400",
    label: "Draft",
  },
  LOCKED: {
    bg: "bg-blue-50/50",
    border: "border-blue-200",
    badge: "bg-blue-100 text-blue-700",
    headerBg: "bg-white",
    dot: "bg-blue-500",
    label: "Locked",
  },
  RECONCILING: {
    bg: "bg-amber-50/50",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-700",
    headerBg: "bg-white",
    dot: "bg-amber-500",
    label: "Reconciling",
  },
  RECONCILED: {
    bg: "bg-emerald-50/50",
    border: "border-emerald-200",
    badge: "bg-emerald-100 text-emerald-700",
    headerBg: "bg-white",
    dot: "bg-emerald-500",
    label: "Reconciled",
  },
  CARRY_FORWARD: {
    bg: "bg-purple-50/50",
    border: "border-purple-200",
    badge: "bg-purple-100 text-purple-700",
    headerBg: "bg-white",
    dot: "bg-purple-500",
    label: "Carry Forward",
  },
};

interface Props {
  status: CommitStatus;
  count: number;
  children: ReactNode;
}

export function PipelineColumn({ status, count, children }: Props) {
  const { isOver, setNodeRef } = useDroppable({ id: status });
  const config = COLUMN_CONFIG[status];

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-2xl border-2 ${config.border} ${config.bg} min-h-[420px] transition-all duration-200 ${
        isOver ? "ring-2 ring-st6-teal-500/40 border-st6-teal-500 scale-[1.01]" : ""
      }`}
      style={{ boxShadow: isOver ? "0 8px 24px rgba(20,94,110,0.15)" : "0 1px 3px rgba(0,0,0,0.04)" }}
    >
      {/* Column header */}
      <div className={`flex items-center justify-between px-4 py-3.5 border-b ${config.border} ${config.headerBg} rounded-t-2xl`}>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${config.dot}`} />
          <h3 className="text-sm font-semibold text-slate-700">{config.label}</h3>
        </div>
        <span className={`text-xs font-bold rounded-full px-2.5 py-0.5 ${config.badge}`}>
          {count}
        </span>
      </div>

      {/* Cards area */}
      <div className="flex-1 p-3 space-y-2">
        {children}
      </div>
    </div>
  );
}
