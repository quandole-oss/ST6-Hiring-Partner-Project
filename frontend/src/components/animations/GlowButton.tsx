import { motion } from "framer-motion";
import type { ReactNode, CSSProperties } from "react";

interface Props {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  glowColor?: string;
  style?: CSSProperties;
}

export function GlowButton({ children, className = "", glowColor = "rgba(59, 130, 246, 0.5)", onClick, disabled, style }: Props) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={style}
      className={`relative overflow-hidden ${className}`}
      whileHover={disabled ? {} : { scale: 1.03 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
    >
      <motion.div
        className="absolute inset-0 rounded-md pointer-events-none"
        initial={{ boxShadow: `0 0 0px ${glowColor}` }}
        whileHover={{ boxShadow: `0 0 20px ${glowColor}, 0 0 40px ${glowColor}` }}
        transition={{ duration: 0.3 }}
      />
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
