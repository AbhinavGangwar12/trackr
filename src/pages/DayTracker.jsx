import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import TodoList from '../components/daytracker/TodoList';
import WeekBarGraph from '../components/daytracker/WeekBarGraph';
import ActivityLineChart from '../components/daytracker/ActivityLineChart';
import CalendarHeatmap from '../components/daytracker/CalendarHeatmap';
import DailyNotes from '../components/daytracker/DailyNotes';
import { DayTrackerSkeleton } from '../components/SkeletonLoader';

function StatCard({ label, value, sub, accent = false }) {
  return (
    <div className="card px-3 py-2.5 sm:px-4 sm:py-3">
      <p className="font-mono text-[9px] sm:text-xs uppercase tracking-wider mb-1"
        style={{ color: 'var(--text-muted)' }}>{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="font-display font-bold text-xl sm:text-2xl"
          style={{ color: accent ? 'var(--accent)' : 'var(--text-primary)' }}>
          {value}
        </span>
        {sub && <span className="font-mono text-[9px] sm:text-xs" style={{ color: 'var(--text-muted)' }}>{sub}</span>}
      </div>
    </div>
  );
}

export default function DayTracker() {
  useEffect(() => { document.title = 'Day Tracker | TRACKR'; }, []);
  const { tasks, completedIds, priorityMap, productivityTrend, weeklyData, loading, analyticsLoading } = useSelector((s) => s.tasks);
  const { initialized } = useSelector((s) => s.auth);
  const user = useSelector((s) => s.auth.user);

  // Only show skeleton on true first load — before auth is confirmed and tasks arrive
  if (!initialized || (loading && tasks.length === 0 && !analyticsLoading)) return <DayTrackerSkeleton />;

  const completed  = completedIds.length;
  const total      = tasks.length;
  const todayScore = productivityTrend[productivityTrend.length - 1]?.score ?? 0;
  const weekAvg    = weeklyData.length
    ? Math.round(weeklyData.reduce((a, d) => a + d.score, 0) / weeklyData.length)
    : 0;
  const highPriDone = tasks.filter(
    (t) => priorityMap[t.task_id] === 'high' && completedIds.includes(t.task_id)
  ).length;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div className="min-h-screen px-3 sm:px-5 lg:px-8 py-4 sm:py-6 animate-fade-in">

      {/* Page header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="teal-dot" />
          <span className="font-mono text-[10px] sm:text-xs uppercase tracking-widest"
            style={{ color: 'var(--text-muted)' }}>
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            })}
          </span>
        </div>
        <h1 className="font-serif font-bold text-2xl sm:text-3xl tracking-tight"
          style={{ color: 'var(--text-primary)' }}>
          {greeting}{user?.username ? `, ${user.username}` : ''}.
        </h1>
        <p className="font-body text-xs sm:text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Task management · Productivity analytics · Daily notes
        </p>
      </div>

      {/* Stats — 2-col on mobile, 4-col on sm+ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
        <StatCard label="Today"         value={`${completed}/${total}`} sub="done" accent />
        <StatCard label="Score"         value={todayScore}              sub="/ 100" />
        <StatCard label="Week Avg"      value={`${weekAvg}%`} />
        <StatCard label="High Priority" value={highPriDone}             sub="cleared" />
      </div>

      {/* ── Mobile layout: single column stack ── */}
      <div className="flex flex-col gap-4 lg:hidden">
        <TodoList />
        <WeekBarGraph />
        <ActivityLineChart />
        <CalendarHeatmap />
        <DailyNotes />
      </div>

      {/* ── Desktop layout: 3-column grid ── */}
      <div className="hidden lg:grid grid-cols-3 gap-4 items-start">
        {/* Left */}
        <div className="flex flex-col gap-4">
          <div style={{ minHeight: '420px' }}><TodoList /></div>
          <DailyNotes />
        </div>
        {/* Center */}
        <div className="flex flex-col gap-4">
          <WeekBarGraph />
          <ActivityLineChart />
        </div>
        {/* Right */}
        <div style={{ minHeight: '520px' }}><CalendarHeatmap /></div>
      </div>

    </div>
  );
}
