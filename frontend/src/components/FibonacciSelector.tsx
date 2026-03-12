import { motion } from "framer-motion";
import { FIBONACCI_POINTS } from "../types";

interface Props {
  value: number | null;
  onChange: (value: number) => void;
  disabled?: boolean;
  label?: string;
}

export function FibonacciSelector({ value, onChange, disabled, label = "Story Points" }: Props) {
  return (
    <div>
      {label && (
        <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          {label}
        </span>
      )}
      <div className="flex gap-1.5 flex-wrap">
        {FIBONACCI_POINTS.map((pt) => (
          <motion.button
            key={pt}
            type="button"
            disabled={disabled}
            onClick={() => onChange(pt)}
            className={`w-9 h-9 rounded-xl text-sm font-semibold border transition-all duration-150 ${
              value === pt
                ? "text-white border-transparent"
                : "bg-white text-slate-600 border-slate-200 hover:border-st6-teal-400 hover:text-st6-teal-700 hover:bg-st6-teal-50"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
            style={value === pt ? {
              background: "linear-gradient(135deg, #145e6e 0%, #0d3340 100%)",
              boxShadow: "0 4px 10px rgba(13,51,64,0.3)",
            } : {}}
            whileHover={disabled ? {} : { scale: 1.08 }}
            whileTap={disabled ? {} : { scale: 0.92 }}
          >
            {pt}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
