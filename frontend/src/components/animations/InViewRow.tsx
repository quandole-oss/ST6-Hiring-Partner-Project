import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  index?: number;
  className?: string;
  as?: "tr" | "div";
}

export function InViewRow({ children, index = 0, className = "", as = "div" }: Props) {
  const Component = as === "tr" ? motion.tr : motion.div;

  return (
    <Component
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
    >
      {children}
    </Component>
  );
}
