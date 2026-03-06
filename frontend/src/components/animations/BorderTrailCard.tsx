import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  trailColor?: string;
  className?: string;
  persist?: boolean;
}

export function BorderTrailCard({ children, trailColor = "#d1d5db", className = "", persist = false }: Props) {
  return (
    <motion.div
      className={`relative overflow-hidden group ${className}`}
      whileHover={{ y: -2, boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className={`absolute inset-0 rounded-xl pointer-events-none ${persist ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
        style={{
          background: `linear-gradient(90deg, transparent, ${trailColor}40, transparent)`,
          backgroundSize: "200% 100%",
        }}
        animate={{ backgroundPosition: ["0% 0%", "200% 0%"] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
