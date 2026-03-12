import { motion } from "framer-motion";

interface Props {
  moodScore: number | null;
  previousMoodScore?: number | null;
}

const MOOD_EMOJI = ["\u{1F62B}", "\u{1F61F}", "\u{1F610}", "\u{1F642}", "\u{1F525}"];
const MOOD_COLORS = ["text-red-500", "text-orange-500", "text-yellow-500", "text-lime-500", "text-emerald-500"];

export function MoodIndicator({ moodScore, previousMoodScore }: Props) {
  if (moodScore == null) {
    return <span className="text-slate-300 text-xs">{"\u2014"}</span>;
  }

  const emoji = MOOD_EMOJI[moodScore - 1];
  const color = MOOD_COLORS[moodScore - 1];
  const trend = previousMoodScore != null ? moodScore - previousMoodScore : null;

  return (
    <motion.span
      className={`inline-flex items-center gap-1 ${color}`}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 400 }}
    >
      <span className="text-base">{emoji}</span>
      {trend !== null && trend !== 0 && (
        <span className={`text-xs ${trend > 0 ? "text-emerald-500" : "text-red-500"}`}>
          {trend > 0 ? "\u2191" : "\u2193"}
        </span>
      )}
    </motion.span>
  );
}
