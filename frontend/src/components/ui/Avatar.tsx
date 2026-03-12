const AVATAR_COLORS = [
  ["#0d3340", "#145e6e"],
  ["#4338ca", "#6366f1"],
  ["#7c3aed", "#8b5cf6"],
  ["#be123c", "#f43f5e"],
  ["#b45309", "#f59e0b"],
  ["#065f46", "#10b981"],
  ["#0369a1", "#0ea5e9"],
  ["#c2410c", "#f97316"],
];

function getGradient(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const [from, to] = AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
  return `linear-gradient(135deg, ${from} 0%, ${to} 100%)`;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

type Size = "xs" | "sm" | "md" | "lg";

const SIZES: Record<Size, { container: string; text: string }> = {
  xs: { container: "w-6 h-6 rounded-md text-[10px]", text: "" },
  sm: { container: "w-8 h-8 rounded-lg text-xs", text: "" },
  md: { container: "w-10 h-10 rounded-xl text-sm", text: "" },
  lg: { container: "w-12 h-12 rounded-xl text-base", text: "" },
};

interface Props {
  name: string;
  size?: Size;
  className?: string;
}

export function Avatar({ name, size = "md", className = "" }: Props) {
  const { container } = SIZES[size];
  return (
    <span
      className={`inline-flex items-center justify-center font-bold text-white shrink-0 ${container} ${className}`}
      style={{ background: getGradient(name) }}
    >
      {getInitials(name)}
    </span>
  );
}
