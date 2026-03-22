import { useSelector } from 'react-redux';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const WeightTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    const d = payload[0]?.payload;
    return (
      <div className="card px-4 py-3">
        <p className="font-mono text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
        <div className="flex items-baseline gap-1">
          <span className="font-mono text-2xl font-medium" style={{ color: payload[0]?.stroke }}>{d.weight}</span>
          <span className="font-mono text-sm" style={{ color: 'var(--text-muted)' }}>kg</span>
        </div>
        <p className="font-mono text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{d.reps} reps</p>
      </div>
    );
  }
  return null;
};

const VolumeTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="card px-4 py-3">
        <p className="font-mono text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
        <p className="font-mono text-lg font-medium" style={{ color: 'var(--accent)' }}>
          {payload[0]?.value?.toLocaleString()} kg
        </p>
        <p className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>total volume</p>
      </div>
    );
  }
  return null;
};

export default function ExerciseProgressChart() {
  const { myExercises, logsMap, selectedUserExerciseId, volumeTrend } = useSelector((s) => s.workouts);
  const selectedEx  = myExercises.find((e) => e.user_exercise_id === selectedUserExerciseId);
  const rawLogs     = logsMap[selectedUserExerciseId] || [];

  const weightData = (() => {
    const byDate = {};
    [...rawLogs].reverse().forEach((log) => {
      if (!log.weight) return;
      const date = new Date(log.logged_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      if (!byDate[date] || log.weight > byDate[date].weight)
        byDate[date] = { date, weight: log.weight, reps: log.reps };
    });
    return Object.values(byDate).slice(-8);
  })();

  const gain     = weightData.length > 1 ? weightData[weightData.length-1].weight - weightData[0].weight : 0;
  const todaySets = rawLogs.filter((l) => l.logged_at?.startsWith(new Date().toISOString().split('T')[0])).length;

  return (
    <div className="card flex flex-col">
      <div className="card-header">
        <span className="card-title">Progress Charts</span>
        {gain > 0 && (
          <div className="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 9L6 3L10 9" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="font-mono text-xs" style={{ color: 'var(--accent)' }}>+{gain.toFixed(1)}kg</span>
          </div>
        )}
      </div>

      {selectedEx && (
        <div className="px-3 sm:px-4 py-2.5 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <p className="font-display font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
            {selectedEx.exercise?.name}
          </p>
          <p className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
            {todaySets} sets today · {rawLogs.length} total
          </p>
        </div>
      )}

      {/* Weight chart */}
      <div className="px-3 sm:px-4 pt-4">
        <p className="font-mono text-xs uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
          Peak weight per session
        </p>
        {weightData.length < 2 ? (
          <div className="flex flex-col items-center justify-center h-28 rounded-lg border gap-2 text-center px-4"
            style={{ backgroundColor: 'var(--bg-surface-2)', borderColor: 'var(--border-color)' }}>
            {rawLogs.length === 0 ? (
              <>
                <p className="font-body text-sm" style={{ color: 'var(--text-muted)' }}>No sets logged yet.</p>
                <p className="font-mono text-xs" style={{ color: 'var(--accent)' }}>Hit "+ Log Set" to start tracking.</p>
              </>
            ) : (
              <>
                <p className="font-body text-sm" style={{ color: 'var(--text-muted)' }}>1 session logged.</p>
                <p className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                  Log <span style={{ color: 'var(--accent)' }}>{selectedEx?.exercise?.name}</span> again after your next session to see progress.
                </p>
              </>
            )}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={130}>
            <LineChart data={weightData}>
              <CartesianGrid vertical={false}/>
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10 }}/>
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }}
                domain={['dataMin - 5','dataMax + 5']} width={32}/>
              <Tooltip content={<WeightTooltip />} cursor={{ stroke: 'var(--accent)', strokeOpacity: 0.3, strokeWidth: 1 }}/>
              <Line type="monotone" dataKey="weight" stroke="var(--accent)" strokeWidth={2.5}
                dot={{ fill: 'var(--accent)', r: 4, strokeWidth: 0 }}
                activeDot={{ fill: 'var(--accent)', r: 6, strokeWidth: 2, stroke: 'var(--bg-base)' }}/>
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Volume chart */}
      <div className="px-3 sm:px-4 pt-3 pb-4">
        <p className="font-mono text-xs uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
          Weekly training volume
        </p>
        <ResponsiveContainer width="100%" height={100}>
          <AreaChart data={volumeTrend}>
            <defs>
              <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="var(--accent)" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false}/>
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9 }}/>
            <YAxis hide/>
            <Tooltip content={<VolumeTooltip />} cursor={{ stroke: 'var(--accent)', strokeOpacity: 0.3, strokeWidth: 1 }}/>
            <Area type="monotone" dataKey="volume" stroke="var(--accent)" strokeWidth={2}
              fill="url(#volGrad)" dot={false}
              activeDot={{ fill: 'var(--accent)', r: 4, strokeWidth: 2, stroke: 'var(--bg-base)' }}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
