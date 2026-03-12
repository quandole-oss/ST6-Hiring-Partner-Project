import { motion } from "framer-motion";
import type { ReactNode, CSSProperties } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost" | "orange";
type Size = "sm" | "md" | "lg";

interface Props {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: Variant;
  size?: Size;
  className?: string;
  style?: CSSProperties;
  type?: "button" | "submit" | "reset";
  icon?: ReactNode;
  loading?: boolean;
}

const VARIANTS: Record<Variant, { base: string; style: CSSProperties }> = {
  primary: {
    base: "text-white font-semibold",
    style: { background: "linear-gradient(135deg, #145e6e 0%, #0d3340 100%)", boxShadow: "0 4px 12px rgba(13,51,64,0.28)" },
  },
  orange: {
    base: "text-white font-semibold",
    style: { background: "linear-gradient(135deg, #f57c00 0%, #e65100 100%)", boxShadow: "0 4px 12px rgba(245,124,0,0.32)" },
  },
  secondary: {
    base: "text-slate-700 font-medium bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50",
    style: { boxShadow: "0 1px 3px rgba(0,0,0,0.06)" },
  },
  danger: {
    base: "text-white font-semibold",
    style: { background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", boxShadow: "0 4px 12px rgba(239,68,68,0.28)" },
  },
  ghost: {
    base: "text-slate-600 font-medium hover:bg-slate-100",
    style: {},
  },
};

const SIZES: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs rounded-lg",
  md: "px-4 py-2.5 text-sm rounded-xl",
  lg: "px-6 py-3 text-sm rounded-xl",
};

export function Button({
  children,
  onClick,
  disabled,
  variant = "primary",
  size = "md",
  className = "",
  style,
  type = "button",
  icon,
  loading,
}: Props) {
  const v = VARIANTS[variant];
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center gap-2 transition-all duration-150 ${v.base} ${SIZES[size]} ${
        disabled || loading ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
      style={{ ...v.style, ...style }}
      whileHover={disabled || loading ? {} : { scale: 1.02 }}
      whileTap={disabled || loading ? {} : { scale: 0.97 }}
    >
      {loading ? (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </motion.button>
  );
}
