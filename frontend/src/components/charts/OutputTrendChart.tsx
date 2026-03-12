import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { WeeklyOutput } from "../../types";

interface Props {
  data: WeeklyOutput[];
}

export function OutputTrendChart({ data }: Props) {
  const chartData = data.map((d) => ({
    week: d.weekStart,
    SP: d.storyPoints,
    Items: d.itemCount,
  }));

  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold text-slate-700 mb-3">Output Trend</h3>
      {chartData.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-8">No data yet</p>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="spGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0f4c5c" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0f4c5c" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="week" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Area type="monotone" dataKey="SP" stroke="#0f4c5c" fill="url(#spGradient)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
