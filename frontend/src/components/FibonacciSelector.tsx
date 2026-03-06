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
      {label && <span className="text-sm text-gray-600 block mb-1">{label}</span>}
      <div className="flex gap-1">
        {FIBONACCI_POINTS.map((pt) => (
          <motion.button
            key={pt}
            type="button"
            disabled={disabled}
            onClick={() => onChange(pt)}
            className={`w-9 h-9 rounded-md text-sm font-medium border transition-colors ${
              value === pt
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            whileHover={disabled ? {} : { scale: 1.1 }}
            whileTap={disabled ? {} : { scale: 0.9 }}
          >
            {pt}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
