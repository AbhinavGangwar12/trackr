import { useSelector } from 'react-redux';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    const d = payload[0]?.payload;
    return (
      <div className="card px-4 py-3">
        <p className="font-mono text-xs mb-1" style={{ color: 'var(--accent)' }}>{label}</p>
        <p className="font-mono text-sm" style={{ color: 'var(--text-primary)' }}>{d.completed}/{d.total} tasks</p>
        <p className="font-mono text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{d.score}% score</p>
      </div>
    );
  }
  return null;
};

export default function WeekBarGraph() {
  const data     = useSelector((s) => s.tasks.weeklyData);
  const today    = new Date().getDay();
  const dayMap   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const todayLbl = dayMap[today];

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Weekly Output</span>
        <span className="badge">THIS WEEK</span>
      </div>
      <div className="px-3 sm:px-4 pt-4 pb-3">
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={data} barCategoryGap="30%">
            <CartesianGrid vertical={false} />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--accent-glow)' }} />
            <Bar dataKey="completed" radius={[4,4,0,0]}>
              {data.map((entry) => (
                <Cell key={entry.day}
                  fill={
                    entry.day === todayLbl ? 'var(--accent)' :
                    entry.score >= 80     ? 'var(--accent-dark)' :
                    entry.score >= 50     ? 'var(--bg-surface-3)' : 'var(--bg-surface-2)'
                  } />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <div className="flex gap-3 sm:gap-4 mt-1 flex-wrap">
          {[
            { color: 'var(--accent)',      label: 'Today' },
            { color: 'var(--accent-dark)', label: '≥80%'  },
            { color: 'var(--bg-surface-3)',label: '<80%'  },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm border"
                style={{ backgroundColor: color, borderColor: 'var(--border-color)' }} />
              <span className="font-mono text-[10px] sm:text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
