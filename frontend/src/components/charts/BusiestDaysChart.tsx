import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { DayActivity } from "../../types";

interface Props {
  data: DayActivity[];
}

export function BusiestDaysChart({ data }: Props) {
  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold text-slate-700 mb-3">Busiest Days</h3>
      {data.every((d) => d.count === 0) ? (
        <p className="text-sm text-slate-400 text-center py-8">No data yet</p>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="count" fill="#f57c00" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
