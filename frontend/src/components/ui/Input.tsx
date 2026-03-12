import type { InputHTMLAttributes, ReactNode } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ReactNode;
  error?: string;
}

export function Input({ label, icon, error, className = "", ...props }: Props) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {icon}
          </span>
        )}
        <input
          {...props}
          className={`w-full rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all duration-150
            focus:ring-2 focus:ring-[#145e6e]/20 focus:border-[#145e6e]
            hover:border-slate-300
            ${icon ? "pl-9" : "px-3.5"} py-2.5
            ${error ? "border-red-400 focus:ring-red-400/20 focus:border-red-400" : ""}
            ${className}`}
          style={{ boxShadow: "inset 0 1px 2px rgba(0,0,0,0.04)" }}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
