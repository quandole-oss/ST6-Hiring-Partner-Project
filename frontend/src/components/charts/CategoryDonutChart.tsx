import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS: Record<string, string> = {
  STRATEGIC: "#6366f1",
  TACTICAL: "#10b981",
  OPERATIONAL: "#f59e0b",
  MAINTENANCE: "#6b7280",
};

interface Props {
  breakdown: Record<string, number>;
}

export function CategoryDonutChart({ breakdown }: Props) {
  const data = Object.entries(breakdown).map(([name, value]) => ({ name, value }));

  if (data.length === 0) {
    return (
      <div className="p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Chess Category Distribution</h3>
        <p className="text-sm text-slate-400 text-center py-8">No data available</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold text-slate-700 mb-3">Chess Category Distribution</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={90}
            dataKey="value"
            paddingAngle={2}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={COLORS[entry.name] ?? "#9ca3af"} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
