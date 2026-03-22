import { useSelector, useDispatch } from 'react-redux';
import { useState } from 'react';
import { updateSplitDay } from '../../store/workoutsSlice';

const MONTH_LABELS  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAY_LABELS    = ['S','M','T','W','T','F','S'];
const SPLIT_OPTIONS = ['Push','Pull','Legs','Rest','Cardio','Full Body','Arms','Core','Upper','Lower'];

function getColor(count, isLight) {
  if (isLight) {
    if (count === 0) return '#e2e8f0';
    if (count === 1) return '#d4b483';
    if (count === 2) return '#b08040';
    return '#8b4513';
  } else {
    if (count === 0) return '#261d14';
    if (count === 1) return '#4a3018';
    if (count === 2) return '#7a5028';
    return '#c8a050';
  }
}

function HeatGrid({ weeks, cell, gap, heatmapData, isLight }) {
  const DAYS = 7;
  const today = new Date();
  const gridEnd = new Date(today);
  gridEnd.setDate(gridEnd.getDate() + (6 - today.getDay()));

  const cells = [];
  for (let w = weeks - 1; w >= 0; w--) {
    const wk = [];
    for (let d = 0; d < DAYS; d++) {
      const date = new Date(gridEnd);
      date.setDate(gridEnd.getDate() - (w * 7 + (6 - d)));
      const key = date.toISOString().split('T')[0];
      wk.push({ date: key, count: heatmapData[key] ?? 0, day: d });
    }
    cells.push(wk);
  }

  const monthPositions = [];
  let lastMonth = -1;
  cells.forEach((wk, wi) => {
    const mon = wk[1];
    if (mon) {
      const d = new Date(mon.date);
      if (d.getDate() <= 7 && d.getMonth() !== lastMonth) {
        monthPositions.push({ month: d.getMonth(), week: wi });
        lastMonth = d.getMonth();
      }
    }
  });

  const muted  = isLight ? '#94a3b8' : '#7a6040';
  const svgW   = weeks * (cell + gap) + 24;
  const svgH   = DAYS  * (cell + gap) + 28;

  return (
    <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}>
      {DAY_LABELS.map((lbl, di) => (
        <text key={di} x={10} y={22 + di * (cell + gap) + cell / 2}
          fill={muted} fontSize="9" fontFamily="DM Mono,monospace"
          textAnchor="middle" dominantBaseline="middle">
          {di % 2 === 1 ? lbl : ''}
        </text>
      ))}
      {cells.map((wk, wi) =>
        wk.map((c) => (
          <rect key={c.date}
            x={22 + wi * (cell + gap)} y={18 + c.day * (cell + gap)}
            width={cell} height={cell} rx={3}
            fill={getColor(c.count, isLight)}
            stroke={c.count === 0 ? (isLight ? '#cbd5e1' : '#312618') : 'transparent'}
            strokeWidth={1}>
            <title>{c.date}: {c.count > 0 ? `${c.count} session(s)` : 'Rest'}</title>
          </rect>
        ))
      )}
      {monthPositions.slice(0, 5).map((mp, i) => (
        <text key={i} x={22 + mp.week * (cell + gap)} y={10}
          fill={muted} fontSize="9" fontFamily="DM Mono,monospace">
          {MONTH_LABELS[mp.month]}
        </text>
      ))}
    </svg>
  );
}

export default function WorkoutHeatmap() {
  const dispatch    = useDispatch();
  const { workoutHeatmap, split } = useSelector((s) => s.workouts);
  const themeMode   = useSelector((s) => s.theme.mode);
  const isLight     = themeMode === 'light';
  const [editingSplit, setEditingSplit] = useState(false);

  const today       = new Date();
  const activeDays  = Object.values(workoutHeatmap).filter((v) => v > 0).length;
  let streak = 0;
  for (let i = 0; i <= 90; i++) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    if ((workoutHeatmap[key] ?? 0) > 0) streak++;
    else if (i > 0) break;
  }

  const legendColors = isLight
    ? ['#e2e8f0','#d4b483','#b08040','#8b4513']
    : ['#261d14','#4a3018','#7a5028','#c8a050'];

  return (
    <div className="card flex flex-col">
      <div className="card-header">
        <span className="card-title">Workout Map</span>
        <div className="flex items-center gap-2">
          <span className="badge">{streak}d</span>
          <button onClick={() => setEditingSplit((e) => !e)}
            className="font-mono text-[10px] px-2 py-0.5 rounded border transition-all"
            style={editingSplit
              ? { backgroundColor: 'var(--accent)', color: 'var(--accent-fg)', borderColor: 'var(--accent)' }
              : { backgroundColor: 'transparent', color: 'var(--text-muted)', borderColor: 'var(--border-color)' }}>
            {editingSplit ? 'Done' : 'Edit Split'}
          </button>
        </div>
      </div>

      <div className="px-3 sm:px-4 pt-4 pb-3 flex flex-col gap-3">
        {/* Heatmap — compact on mobile */}
        <div className="overflow-x-auto">
          <div className="block sm:hidden">
            <HeatGrid weeks={8}  cell={13} gap={3} heatmapData={workoutHeatmap} isLight={isLight} />
          </div>
          <div className="hidden sm:block">
            <HeatGrid weeks={13} cell={14} gap={3} heatmapData={workoutHeatmap} isLight={isLight} />
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>Rest</span>
          {legendColors.map((c) => (
            <div key={c} className="w-3 h-3 rounded-sm" style={{ backgroundColor: c, border: '1px solid rgba(255,255,255,0.05)' }} />
          ))}
          <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>Active</span>
        </div>

        {/* Split grid */}
        <div className="rounded-lg p-3 border" style={{ backgroundColor: 'var(--bg-surface-2)', borderColor: 'var(--border-color)' }}>
          <p className="font-mono text-xs uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
            Weekly split {editingSplit && <span style={{ color: 'var(--accent)' }}>— editing</span>}
          </p>
          <div className="grid grid-cols-7 gap-1">
            {split.map((day, i) => (
              <div key={day.day} className="text-center">
                {editingSplit ? (
                  <select value={day.label}
                    onChange={(e) => dispatch(updateSplitDay({ dayIndex: i, label: e.target.value, active: e.target.value !== 'Rest' }))}
                    className="w-full text-center rounded text-[9px] font-mono py-1 outline-none border"
                    style={{
                      backgroundColor: day.active ? 'var(--accent-glow)' : 'var(--bg-surface)',
                      color:           day.active ? 'var(--accent)' : 'var(--text-muted)',
                      borderColor:     day.active ? 'color-mix(in srgb, var(--accent) 30%, transparent)' : 'var(--border-color)',
                    }}>
                    {SPLIT_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                  </select>
                ) : (
                  <div className="w-full aspect-square rounded-lg flex items-center justify-center text-[9px] font-mono mb-1 border"
                    style={{
                      backgroundColor: day.active ? 'var(--accent-glow)' : 'var(--bg-surface)',
                      color:           day.active ? 'var(--accent)'      : 'var(--text-muted)',
                      borderColor:     day.active ? 'color-mix(in srgb, var(--accent) 30%, transparent)' : 'var(--border-color)',
                    }}>
                    {day.day[0]}
                  </div>
                )}
                {!editingSplit && (
                  <span className="font-mono text-[8px] leading-none block" style={{ color: 'var(--text-muted)' }}>
                    {day.label.length > 4 ? day.label.slice(0,3) : day.label}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'ACTIVE', value: activeDays, sub: '90d' },
            { label: 'STREAK', value: streak,     sub: 'days' },
            { label: 'RATE',   value: `${Math.round((activeDays/90)*100)}%`, sub: '' },
          ].map(({ label, value, sub }) => (
            <div key={label} className="rounded-lg p-2.5 border text-center"
              style={{ backgroundColor: 'var(--bg-surface-2)', borderColor: 'var(--border-color)' }}>
              <p className="font-mono text-base font-medium" style={{ color: 'var(--accent)' }}>{value}</p>
              <p className="font-mono text-[9px]" style={{ color: 'var(--text-muted)' }}>{sub || label.toLowerCase()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
