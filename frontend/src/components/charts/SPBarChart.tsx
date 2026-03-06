import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { DashboardMember } from "../../types";

interface Props {
  members: DashboardMember[];
}

export function SPBarChart({ members }: Props) {
  const data = members.map((m) => ({
    name: m.memberName,
    Committed: m.totalStoryPoints,
    Completed: m.completedStoryPoints,
  }));

  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold text-slate-700 mb-3">Story Points: Committed vs Completed</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="Committed" fill="#0f4c5c" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Completed" fill="#22c55e" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
