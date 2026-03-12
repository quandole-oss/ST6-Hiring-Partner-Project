import { motion } from "framer-motion";

interface Props {
  value: number | null;
  onChange: (score: number) => void;
  disabled?: boolean;
}

const MOODS = [
  { score: 1, label: "Struggling", color: "bg-red-100 border-red-300 text-red-600", activeColor: "bg-red-500 text-white border-red-500" },
  { score: 2, label: "Tough", color: "bg-orange-100 border-orange-300 text-orange-600", activeColor: "bg-orange-500 text-white border-orange-500" },
  { score: 3, label: "Neutral", color: "bg-yellow-100 border-yellow-300 text-yellow-600", activeColor: "bg-yellow-500 text-white border-yellow-500" },
  { score: 4, label: "Good", color: "bg-lime-100 border-lime-300 text-lime-600", activeColor: "bg-lime-500 text-white border-lime-500" },
  { score: 5, label: "Great", color: "bg-emerald-100 border-emerald-300 text-emerald-600", activeColor: "bg-emerald-500 text-white border-emerald-500" },
];

export function MoodSelector({ value, onChange, disabled }: Props) {
  return (
    <div>
      <div className="flex gap-2">
        {MOODS.map((mood) => (
          <motion.button
            key={mood.score}
            type="button"
            disabled={disabled}
            onClick={() => onChange(mood.score)}
            className={`flex-1 py-2 px-1 rounded-lg border text-xs font-medium transition-colors ${
              value === mood.score ? mood.activeColor : mood.color
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            whileHover={disabled ? {} : { scale: 1.05, y: -2 }}
            whileTap={disabled ? {} : { scale: 0.95 }}
          >
            <div className="text-lg">{["\u{1F62B}", "\u{1F61F}", "\u{1F610}", "\u{1F642}", "\u{1F525}"][mood.score - 1]}</div>
            <div className="mt-0.5 hidden sm:block">{mood.label}</div>
          </motion.button>
        ))}
      </div>
      {value && (
        <motion.p
          className="text-xs text-slate-500 mt-2 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Feeling: {MOODS[value - 1].label}
        </motion.p>
      )}
    </div>
  );
}
