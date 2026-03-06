import { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";

interface Props {
  value: number;
  suffix?: string;
  className?: string;
  duration?: number;
}

export function AnimatedNumber({ value, suffix = "", className, duration = 1 }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration,
      ease: "easeOut",
      onUpdate(v) {
        setDisplayed(Math.round(v));
      },
    });
    return () => controls.stop();
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      {displayed}{suffix}
    </span>
  );
}
