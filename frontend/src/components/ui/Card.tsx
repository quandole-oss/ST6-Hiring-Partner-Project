import type { ReactNode, CSSProperties } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  onClick?: () => void;
}

const PADDING = {
  none: "",
  sm: "p-3",
  md: "p-5",
  lg: "p-6",
};

export function Card({ children, className = "", style, hover, padding = "md", onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-100 ${PADDING[padding]} ${
        hover ? "transition-all duration-150 hover:-translate-y-0.5 hover:border-slate-200 cursor-pointer" : ""
      } ${onClick ? "cursor-pointer" : ""} ${className}`}
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)", ...style }}
    >
      {children}
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  iconBg?: string;
  trend?: { value: number; label: string };
  sublabel?: string;
}

export function MetricCard({ label, value, icon, iconBg, trend, sublabel }: MetricCardProps) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
        {icon && (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: iconBg ?? "linear-gradient(135deg, #145e6e 0%, #0d3340 100%)" }}
          >
            {icon}
          </div>
        )}
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-900 tracking-tight">{value}</div>
        {sublabel && <div className="text-xs text-slate-400 mt-0.5">{sublabel}</div>}
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs font-medium ${trend.value >= 0 ? "text-emerald-600" : "text-red-500"}`}>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d={trend.value >= 0 ? "M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" : "M2.25 6 9 12.75l4.306-4.306a11.95 11.95 0 0 1 5.814 5.518l2.74 1.22m0 0-5.94 2.281m5.94-2.28-2.28-5.941"} />
          </svg>
          {trend.label}
        </div>
      )}
    </Card>
  );
}
