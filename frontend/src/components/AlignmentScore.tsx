import { motion } from "framer-motion";
import { AnimatedNumber } from "./animations/AnimatedNumber";

export function AlignmentScoreDisplay({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color = pct >= 80 ? "text-green-600" : pct >= 50 ? "text-yellow-600" : "text-red-600";

  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={`text-3xl font-bold ${color}`}>
        <AnimatedNumber value={pct} suffix="%" />
      </div>
      <div className="text-sm text-gray-500">Alignment</div>
    </motion.div>
  );
}
