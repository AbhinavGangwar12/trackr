import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { saveBodyStat } from '../../store/workoutsSlice';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// ─── BMI calculation ──────────────────────────────────────────────────────────
function calcBMI(weightKg, heightCm) {
  if (!weightKg || !heightCm || heightCm <= 0) return null;
  const heightM = heightCm / 100;
  return +(weightKg / (heightM * heightM)).toFixed(1);
}

function bmiCategory(bmi) {
  if (bmi === null) return null;
  if (bmi < 18.5) return { label: 'Underweight', color: '#60a5fa' };
  if (bmi < 25)   return { label: 'Normal',      color: '#4ade80' };
  if (bmi < 30)   return { label: 'Overweight',  color: '#fbbf24' };
  return           { label: 'Obese',            color: '#f87171' };
}

// BMI gauge bar — visual indicator
function BMIGauge({ bmi }) {
  if (!bmi) return null;
  // Scale: 14 (min display) to 40 (max display)
  const pct = Math.min(Math.max(((bmi - 14) / (40 - 14)) * 100, 0), 100);
  const cat = bmiCategory(bmi);

  return (
    <div style={{ marginTop: 8 }}>
      {/* Track */}
      <div style={{
        position: 'relative', height: 6, borderRadius: 3,
        background: 'linear-gradient(90deg, #60a5fa 0%, #4ade80 30%, #fbbf24 60%, #f87171 100%)',
        opacity: 0.5,
      }}>
        {/* Needle */}
        <div style={{
          position: 'absolute', top: '50%', left: `${pct}%`,
          transform: 'translate(-50%, -50%)',
          width: 12, height: 12, borderRadius: '50%',
          backgroundColor: cat.color,
          border: '2px solid var(--bg-surface)',
          boxShadow: `0 0 6px ${cat.color}88`,
          transition: 'left 0.4s ease',
        }} />
      </div>
      {/* Labels */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', marginTop: 4,
        fontFamily: "'DM Mono', monospace", fontSize: 8, color: 'var(--text-muted)',
      }}>
        <span>14</span>
        <span style={{ color: '#60a5fa' }}>18.5</span>
        <span style={{ color: '#fbbf24' }}>25</span>
        <span style={{ color: '#f87171' }}>30</span>
        <span>40</span>
      </div>
    </div>
  );
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const w = payload.find(p => p.dataKey === 'weight');
  const b = payload.find(p => p.dataKey === 'bmi');
  return (
    <div className="card px-3 py-2.5">
      <p className="font-mono text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
      {w && <p className="font-mono text-sm font-medium" style={{ color: 'var(--accent)' }}>{w.value} kg</p>}
      {b?.value && (
        <p className="font-mono text-xs mt-0.5" style={{ color: bmiCategory(b.value)?.color }}>
          BMI {b.value} · {bmiCategory(b.value)?.label}
        </p>
      )}
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function BodyStats() {
  const dispatch   = useDispatch();
  const bodyStats  = useSelector((s) => s.workouts.bodyStats);
  const todayStr   = new Date().toISOString().split('T')[0];
  const todayStat  = bodyStats.find((s) => s.date === todayStr);

  // Pre-fill height from most recent entry that has it
  const lastHeight = [...bodyStats].reverse().find(s => s.height)?.height;

  const [weight,  setWeight]  = useState(todayStat?.weight?.toString()  || '');
  const [height,  setHeight]  = useState(todayStat?.height?.toString()  || lastHeight?.toString() || '');
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(!!todayStat);

  // Update height pre-fill when bodyStats loads
  useEffect(() => {
    if (!height && lastHeight) setHeight(lastHeight.toString());
  }, [lastHeight]);

  const liveBMI = calcBMI(parseFloat(weight), parseFloat(height));
  const liveCat = bmiCategory(liveBMI);

  const handleLog = async () => {
    if (!weight || !height) return;
    setSaving(true);
    await dispatch(saveBodyStat({
      date: todayStr,
      weight: parseFloat(weight),
      height: parseFloat(height),
    }));
    setSaving(false);
    setSaved(true);
  };

  // Chart data — last 14 entries with BMI computed per entry
  const chartData = bodyStats.slice(-14).map((s) => ({
    date:   new Date(s.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    weight: s.weight,
    bmi:    s.height ? calcBMI(s.weight, s.height) : null,
  }));

  const latest = bodyStats[bodyStats.length - 1];
  const prev   = bodyStats[bodyStats.length - 2];
  const delta  = latest && prev ? (latest.weight - prev.weight).toFixed(1) : null;
  const latestBMI = latest ? calcBMI(latest.weight, latest.height) : null;
  const latestCat = bmiCategory(latestBMI);
  const deltaColor = delta > 0 ? '#f87171' : delta < 0 ? '#4ade80' : 'var(--text-muted)';

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Body Stats</span>
        {latestBMI && (
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-medium" style={{ color: latestCat.color }}>
              BMI {latestBMI}
            </span>
            <span className="font-mono text-xs px-1.5 py-0.5 rounded"
              style={{ backgroundColor: `${latestCat.color}18`, color: latestCat.color }}>
              {latestCat.label}
            </span>
          </div>
        )}
      </div>

      {/* Log inputs */}
      <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <p className="font-mono text-xs uppercase tracking-wider mb-2.5" style={{ color: 'var(--text-muted)' }}>
          Log Today
        </p>
        <div className="flex gap-2 items-end">
          {/* Weight */}
          <div className="flex-1">
            <label className="block font-mono text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>WEIGHT (kg)</label>
            <input type="number" step="0.1" value={weight}
              onChange={(e) => { setWeight(e.target.value); setSaved(false); }}
              placeholder="75.5" className="input-field text-sm" />
          </div>
          {/* Height */}
          <div className="flex-1">
            <label className="block font-mono text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>HEIGHT (cm)</label>
            <input type="number" step="0.5" value={height}
              onChange={(e) => { setHeight(e.target.value); setSaved(false); }}
              placeholder="175" className="input-field text-sm" />
          </div>
          <button onClick={handleLog} disabled={!weight || !height || saved || saving}
            className="py-2 px-3 rounded-lg font-mono text-xs transition-all disabled:opacity-50"
            style={{
              backgroundColor: saved ? 'var(--bg-surface-3)' : 'var(--accent)',
              color: saved ? 'var(--text-muted)' : 'var(--accent-fg)',
            }}>
            {saving ? '...' : saved ? '✓' : 'Log'}
          </button>
        </div>

        {/* Live BMI preview while typing */}
        {liveBMI && (
          <div className="mt-3 p-2.5 rounded-lg border" style={{ backgroundColor: 'var(--bg-surface-2)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>BMI</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg font-medium" style={{ color: liveCat.color }}>
                  {liveBMI}
                </span>
                <span className="font-mono text-xs px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: `${liveCat.color}18`, color: liveCat.color }}>
                  {liveCat.label}
                </span>
              </div>
            </div>
            <BMIGauge bmi={liveBMI} />
          </div>
        )}
      </div>

      {/* Stats summary row */}
      {latest && (
        <div className="grid grid-cols-3 gap-2 px-4 py-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <div>
            <p className="font-mono text-[9px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Weight</p>
            <p className="font-mono text-base font-medium" style={{ color: 'var(--text-primary)' }}>
              {latest.weight}<span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}> kg</span>
            </p>
            {delta !== null && (
              <p className="font-mono text-[10px]" style={{ color: deltaColor }}>
                {delta > 0 ? '+' : ''}{delta} kg
              </p>
            )}
          </div>
          <div>
            <p className="font-mono text-[9px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Height</p>
            <p className="font-mono text-base font-medium" style={{ color: 'var(--text-primary)' }}>
              {latest.height}<span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}> cm</span>
            </p>
          </div>
          {latestBMI && (
            <div>
              <p className="font-mono text-[9px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>BMI</p>
              <p className="font-mono text-base font-medium" style={{ color: latestCat.color }}>{latestBMI}</p>
              <p className="font-mono text-[10px]" style={{ color: latestCat.color }}>{latestCat.label}</p>
            </div>
          )}
        </div>
      )}

      {/* Weight trend chart */}
      <div className="px-4 pt-3 pb-4">
        {chartData.filter(d => d.weight).length < 2 ? (
          <div className="flex flex-col items-center justify-center h-20 rounded-lg border gap-1"
            style={{ backgroundColor: 'var(--bg-surface-2)', borderColor: 'var(--border-color)' }}>
            <p className="font-body text-sm" style={{ color: 'var(--text-muted)' }}>Log on 2+ days to see trend.</p>
            <p className="font-mono text-xs" style={{ color: 'var(--accent)' }}>Weight + height unlock BMI history.</p>
          </div>
        ) : (
          <>
            <p className="font-mono text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
              Weight trend (last 14 days)
            </p>
            <ResponsiveContainer width="100%" height={100}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--accent)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false}/>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9 }}/>
                <YAxis hide domain={['dataMin - 1', 'dataMax + 1']}/>
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--accent)', strokeOpacity: 0.3, strokeWidth: 1 }}/>
                <Area type="monotone" dataKey="weight" stroke="var(--accent)" strokeWidth={2}
                  fill="url(#weightGrad)"
                  dot={{ fill: 'var(--accent)', r: 3, strokeWidth: 0 }}
                  activeDot={{ fill: 'var(--accent)', r: 5, strokeWidth: 2, stroke: 'var(--bg-base)' }}/>
              </AreaChart>
            </ResponsiveContainer>
          </>
        )}
      </div>
    </div>
  );
}
