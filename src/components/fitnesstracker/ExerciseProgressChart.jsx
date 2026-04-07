import { useSelector } from 'react-redux';
import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';

// ─── Tooltip ──────────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const weight = payload.find(p => p.dataKey === 'weight');
  const volume = payload.find(p => p.dataKey === 'volume');
  return (
    <div className="card px-4 py-3">
      <p className="font-mono text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{label}</p>
      {weight?.value != null && (
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
          <span className="font-mono text-sm font-medium" style={{ color: 'var(--accent)' }}>
            {weight.value} kg
          </span>
          <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>peak weight</span>
        </div>
      )}
      {volume?.value != null && (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#818cf8' }} />
          <span className="font-mono text-sm font-medium" style={{ color: '#818cf8' }}>
            {volume.value.toLocaleString()} kg
          </span>
          <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>total volume</span>
        </div>
      )}
    </div>
  );
};

// ─── Custom Legend ─────────────────────────────────────────────────────────────
const CustomLegend = () => (
  <div className="flex items-center justify-center gap-6 mt-1">
    <div className="flex items-center gap-1.5">
      <div className="w-6 h-0.5 rounded" style={{ backgroundColor: 'var(--accent)' }} />
      <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>Peak Weight (kg)</span>
    </div>
    <div className="flex items-center gap-1.5">
      <div className="w-6 h-0.5 rounded" style={{ backgroundColor: '#818cf8', borderTop: '2px dashed #818cf8' }} />
      <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>Volume (kg)</span>
    </div>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
export default function ExerciseProgressChart() {
  const { myExercises, logsMap, selectedUserExerciseId, volumeTrend } = useSelector((s) => s.workouts);
  const selectedEx  = myExercises.find((e) => e.user_exercise_id === selectedUserExerciseId);
  const rawLogs     = logsMap[selectedUserExerciseId] || [];

  // Build per-session data: peak weight + total volume per date
  const sessionData = (() => {
    const byDate = {};
    [...rawLogs].reverse().forEach((log) => {
      const date = new Date(log.logged_at).toLocaleDateString('en-IN', {
        month: 'short', day: 'numeric',
      });
      if (!byDate[date]) byDate[date] = { date, weight: null, volume: 0 };
      // Peak weight for the session
      if (log.weight != null) {
        byDate[date].weight = Math.max(byDate[date].weight ?? 0, log.weight);
      }
      // Volume = sets × reps × weight
      const sets   = log.sets   || 1;
      const reps   = log.reps   || 0;
      const weight = log.weight || 0;
      byDate[date].volume += sets * reps * weight;
    });
    return Object.values(byDate)
      .map(d => ({ ...d, volume: Math.round(d.volume) }))
      .slice(-10); // last 10 sessions
  })();

  const hasData    = sessionData.length >= 2;
  const todaySets  = rawLogs.filter((l) =>
    l.logged_at?.startsWith(new Date().toISOString().split('T')[0])
  ).length;

  // Weight gain across sessions
  const weightData = sessionData.filter(d => d.weight != null);
  const gain = weightData.length > 1
    ? (weightData[weightData.length - 1].weight - weightData[0].weight).toFixed(1)
    : null;

  // Avg weight line for reference
  const avgWeight = weightData.length > 0
    ? Math.round(weightData.reduce((a, d) => a + d.weight, 0) / weightData.length)
    : null;

  return (
    <div className="card flex flex-col">
      {/* Header */}
      <div className="card-header">
        <span className="card-title">Progress Charts</span>
        {gain !== null && Number(gain) !== 0 && (
          <div className="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d={Number(gain) > 0 ? "M2 9L6 3L10 9" : "M2 3L6 9L10 3"}
                stroke={Number(gain) > 0 ? 'var(--accent)' : '#f87171'}
                strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
            <span className="font-mono text-xs" style={{ color: Number(gain) > 0 ? 'var(--accent)' : '#f87171' }}>
              {Number(gain) > 0 ? '+' : ''}{gain}kg
            </span>
          </div>
        )}
      </div>

      {/* Exercise info */}
      {selectedEx && (
        <div className="px-3 sm:px-4 py-2.5 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <p className="font-display font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
            {selectedEx.exercise?.name}
          </p>
          <p className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
            {todaySets} sets today · {rawLogs.length} total sets logged
          </p>
        </div>
      )}

      {/* Combined chart */}
      <div className="px-3 sm:px-4 pt-4 pb-2">
        <p className="font-mono text-xs uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
          Weight & Volume — last {sessionData.length} sessions
        </p>

        {!hasData ? (
          <div className="flex flex-col items-center justify-center h-40 rounded-lg border gap-2 text-center px-4"
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
                  Log <span style={{ color: 'var(--accent)' }}>{selectedEx?.exercise?.name}</span> again to see progress charts.
                </p>
              </>
            )}
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <ComposedChart data={sessionData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid vertical={false} />

                {/* Left Y-axis: weight */}
                <YAxis
                  yAxisId="weight"
                  orientation="left"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10 }}
                  domain={['dataMin - 5', 'dataMax + 5']}
                  width={36}
                  tickFormatter={(v) => `${v}kg`}
                />

                {/* Right Y-axis: volume */}
                <YAxis
                  yAxisId="volume"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10 }}
                  domain={[0, 'dataMax + 100']}
                  width={48}
                  tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v}
                />

                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10 }}
                />

                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--border-color)', strokeWidth: 1 }} />

                {/* Average weight reference line */}
                {avgWeight && (
                  <ReferenceLine
                    yAxisId="weight"
                    y={avgWeight}
                    stroke="var(--accent)"
                    strokeOpacity={0.2}
                    strokeDasharray="4 4"
                  />
                )}

                {/* Weight line — gold, solid */}
                <Line
                  yAxisId="weight"
                  type="monotone"
                  dataKey="weight"
                  stroke="var(--accent)"
                  strokeWidth={2.5}
                  dot={{ fill: 'var(--accent)', r: 4, strokeWidth: 0 }}
                  activeDot={{ fill: 'var(--accent)', r: 6, strokeWidth: 2, stroke: 'var(--bg-base)' }}
                  connectNulls
                  name="Weight"
                />

                {/* Volume line — indigo, dashed */}
                <Line
                  yAxisId="volume"
                  type="monotone"
                  dataKey="volume"
                  stroke="#818cf8"
                  strokeWidth={2}
                  strokeDasharray="5 3"
                  dot={{ fill: '#818cf8', r: 3, strokeWidth: 0 }}
                  activeDot={{ fill: '#818cf8', r: 5, strokeWidth: 2, stroke: 'var(--bg-base)' }}
                  name="Volume"
                />
              </ComposedChart>
            </ResponsiveContainer>

            <CustomLegend />
          </>
        )}
      </div>

      {/* Stats summary */}
      {sessionData.length > 0 && (
        <div className="grid grid-cols-3 gap-2 px-3 sm:px-4 pt-2 pb-4">
          {[
            {
              label: 'PEAK WEIGHT',
              value: weightData.length > 0
                ? `${Math.max(...weightData.map(d => d.weight))}kg`
                : '—',
            },
            {
              label: 'BEST VOLUME',
              value: sessionData.length > 0
                ? `${Math.max(...sessionData.map(d => d.volume)).toLocaleString()}kg`
                : '—',
            },
            {
              label: 'SESSIONS',
              value: sessionData.length,
              sub: 'charted',
            },
          ].map(({ label, value, sub }) => (
            <div key={label} className="rounded-lg p-2.5 border text-center"
              style={{ backgroundColor: 'var(--bg-surface-2)', borderColor: 'var(--border-color)' }}>
              <p className="font-mono text-[9px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                {label}
              </p>
              <p className="font-mono text-sm font-medium" style={{ color: 'var(--accent)' }}>{value}</p>
              {sub && <p className="font-mono text-[9px]" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}