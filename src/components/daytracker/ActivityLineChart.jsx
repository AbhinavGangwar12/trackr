import { useSelector } from 'react-redux';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="card px-4 py-3">
        <p className="font-mono text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
        <p className="font-mono text-2xl font-medium" style={{ color: 'var(--accent)' }}>{payload[0]?.value}</p>
        <p className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>productivity score</p>
      </div>
    );
  }
  return null;
};

export default function ActivityLineChart() {
  const data = useSelector((s) => s.tasks.productivityTrend);
  const avg  = data.length
    ? Math.round(data.reduce((a, d) => a + d.score, 0) / data.length)
    : 0;

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Productivity Trend</span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>AVG</span>
          <span className="font-mono text-sm font-medium" style={{ color: 'var(--accent)' }}>{avg}</span>
        </div>
      </div>
      <div className="px-3 sm:px-4 pt-4 pb-3">
        <ResponsiveContainer width="100%" height={130}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="var(--accent)" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false}/>
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10 }}/>
            <YAxis hide domain={[0,100]}/>
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--accent)', strokeOpacity: 0.3, strokeWidth: 1 }}/>
            <ReferenceLine y={avg} stroke="var(--accent)" strokeOpacity={0.25} strokeDasharray="4 4"/>
            <Area type="monotone" dataKey="score"
              stroke="var(--accent)" strokeWidth={2} fill="url(#scoreGrad)"
              dot={{ fill: 'var(--accent)', r: 3, strokeWidth: 0 }}
              activeDot={{ fill: 'var(--accent)', r: 5, strokeWidth: 2, stroke: 'var(--bg-base)' }}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
