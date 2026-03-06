import { motion } from "framer-motion";

interface Props {
  value: number; // 0-100
  className?: string;
  barClassName?: string;
}

export function AnimatedProgress({ value, className = "", barClassName = "" }: Props) {
  const color = value >= 80 ? "bg-green-500" : value >= 50 ? "bg-yellow-500" : "bg-red-500";

  return (
    <div className={`h-2 w-full rounded-full bg-gray-200 overflow-hidden ${className}`}>
      <motion.div
        className={`h-full rounded-full ${color} ${barClassName}`}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  );
}
