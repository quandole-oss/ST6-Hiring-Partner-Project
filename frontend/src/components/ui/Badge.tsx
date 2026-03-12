import type { ReactNode } from "react";

type Variant = "teal" | "orange" | "slate" | "blue" | "amber" | "emerald" | "purple" | "red";

const VARIANTS: Record<Variant, string> = {
  teal: "bg-[#0f4c5c]/10 text-[#0f4c5c] border border-[#0f4c5c]/20",
  orange: "bg-orange-50 text-orange-700 border border-orange-200",
  slate: "bg-slate-100 text-slate-600 border border-slate-200",
  blue: "bg-blue-50 text-blue-700 border border-blue-200",
  amber: "bg-amber-50 text-amber-700 border border-amber-200",
  emerald: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  purple: "bg-purple-50 text-purple-700 border border-purple-200",
  red: "bg-red-50 text-red-700 border border-red-200",
};

interface Props {
  children: ReactNode;
  variant?: Variant;
  dot?: boolean;
  className?: string;
}

export function Badge({ children, variant = "slate", dot, className = "" }: Props) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${VARIANTS[variant]} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${getDotColor(variant)}`} />}
      {children}
    </span>
  );
}

function getDotColor(variant: Variant) {
  const map: Record<Variant, string> = {
    teal: "bg-[#0f4c5c]",
    orange: "bg-orange-500",
    slate: "bg-slate-400",
    blue: "bg-blue-500",
    amber: "bg-amber-500",
    emerald: "bg-emerald-500",
    purple: "bg-purple-500",
    red: "bg-red-500",
  };
  return map[variant];
}
