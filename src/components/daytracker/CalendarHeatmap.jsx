import { useSelector } from 'react-redux';

// Mobile uses smaller cells + fewer weeks
const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAY_LABELS   = ['S','M','T','W','T','F','S'];

function getColor(count, isLight) {
  if (isLight) {
    if (count === 0) return '#e2e8f0';
    if (count <= 2)  return '#d4b483';
    if (count <= 4)  return '#b08040';
    if (count <= 6)  return '#8b6020';
    return '#6b4010';
  } else {
    if (count === 0) return '#261d14';
    if (count <= 2)  return '#4a3018';
    if (count <= 4)  return '#7a5028';
    if (count <= 6)  return '#a07038';
    return '#c8a050';
  }
}
function getBorder(count, isLight) {
  return count === 0 ? (isLight ? '#cbd5e1' : '#312618') : 'transparent';
}

function HeatmapGrid({ weeks, cell, gap, heatmapData, isLight }) {
  const DAYS = 7;
  const today = new Date();
  const startOffset = today.getDay();
  const gridEnd = new Date(today);
  gridEnd.setDate(gridEnd.getDate() + (6 - startOffset));

  const cells = [];
  for (let w = weeks - 1; w >= 0; w--) {
    const weekCells = [];
    for (let d = 0; d < DAYS; d++) {
      const date = new Date(gridEnd);
      date.setDate(gridEnd.getDate() - (w * 7 + (6 - d)));
      const key = date.toISOString().split('T')[0];
      weekCells.push({ date: key, count: heatmapData[key] ?? 0, day: d, week: weeks - 1 - w });
    }
    cells.push(weekCells);
  }

  const monthPositions = [];
  let lastMonth = -1;
  cells.forEach((week, wi) => {
    const mon = week[1];
    if (mon) {
      const d = new Date(mon.date);
      if (d.getDate() <= 7 && d.getMonth() !== lastMonth) {
        monthPositions.push({ month: d.getMonth(), week: wi });
        lastMonth = d.getMonth();
      }
    }
  });

  const mutedColor = isLight ? '#94a3b8' : '#7a6040';
  const svgW = weeks * (cell + gap) + 24;
  const svgH = DAYS  * (cell + gap) + 28;

  return (
    <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}>
      {DAY_LABELS.map((lbl, di) => (
        <text key={di} x={10} y={22 + di * (cell + gap) + cell / 2}
          fill={mutedColor} fontSize="9" fontFamily="DM Mono, monospace"
          textAnchor="middle" dominantBaseline="middle">
          {di % 2 === 1 ? lbl : ''}
        </text>
      ))}
      {cells.map((week, wi) =>
        week.map((c) => (
          <rect key={c.date}
            x={22 + wi * (cell + gap)} y={18 + c.day * (cell + gap)}
            width={cell} height={cell} rx={3}
            fill={getColor(c.count, isLight)}
            stroke={getBorder(c.count, isLight)} strokeWidth={1}>
            <title>{c.date}: {c.count} tasks</title>
          </rect>
        ))
      )}
      {monthPositions.slice(0, 5).map((mp, i) => (
        <text key={i} x={22 + mp.week * (cell + gap)} y={10}
          fill={mutedColor} fontSize="9" fontFamily="DM Mono, monospace">
          {MONTH_LABELS[mp.month]}
        </text>
      ))}
    </svg>
  );
}

export default function CalendarHeatmap() {
  const heatmapData = useSelector((s) => s.tasks.activityHeatmap);
  const themeMode   = useSelector((s) => s.theme.mode);
  const isLight     = themeMode === 'light';

  const totalCount = Object.values(heatmapData).filter((v) => v > 0).length;
  const maxCount   = Math.max(...Object.values(heatmapData), 1);

  const legendColors = isLight
    ? ['#e2e8f0','#d4b483','#b08040','#8b6020','#6b4010']
    : ['#261d14','#4a3018','#7a5028','#a07038','#c8a050'];

  return (
    <div className="card h-full flex flex-col">
      <div className="card-header">
        <span className="card-title">Activity Map</span>
        <span className="badge">{totalCount}d active</span>
      </div>

      <div className="flex-1 flex flex-col px-3 sm:px-4 pt-4 pb-3 overflow-hidden">

        {/* Mobile: 8 weeks, smaller cells; Desktop: 13 weeks full */}
        <div className="overflow-x-auto">
          {/* Show compact on mobile */}
          <div className="block sm:hidden">
            <HeatmapGrid weeks={8}  cell={13} gap={3} heatmapData={heatmapData} isLight={isLight} />
          </div>
          {/* Show full on sm+ */}
          <div className="hidden sm:block">
            <HeatmapGrid weeks={13} cell={14} gap={3} heatmapData={heatmapData} isLight={isLight} />
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 mt-3">
          <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>Less</span>
          {legendColors.map((c) => (
            <div key={c} className="w-3 h-3 rounded-sm border border-white/5" style={{ backgroundColor: c }} />
          ))}
          <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>More</span>
        </div>

        {/* Stats */}
        <div className="mt-auto pt-4 grid grid-cols-2 gap-3">
          {[
            { label: 'ACTIVE DAYS', value: totalCount, sub: 'last 90 days' },
            { label: 'PEAK TASKS',  value: maxCount,   sub: 'single day'   },
          ].map(({ label, value, sub }) => (
            <div key={label} className="rounded-lg p-3 border"
              style={{ backgroundColor: 'var(--bg-surface-2)', borderColor: 'var(--border-color)' }}>
              <p className="font-mono text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
              <p className="font-mono text-xl font-medium" style={{ color: 'var(--accent)' }}>{value}</p>
              <p className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
