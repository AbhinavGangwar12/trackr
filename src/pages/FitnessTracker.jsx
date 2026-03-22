import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import ExerciseList from '../components/fitnesstracker/ExerciseList';
import ExerciseProgressChart from '../components/fitnesstracker/ExerciseProgressChart';
import WorkoutHeatmap from '../components/fitnesstracker/WorkoutHeatmap';
import BodyStats from '../components/fitnesstracker/BodyStats';
import NextSession from '../components/fitnesstracker/NextSession';
import { FitnessTrackerSkeleton } from '../components/SkeletonLoader';

function StatCard({ label, value, sub, color = 'var(--text-primary)' }) {
  return (
    <div className="card px-3 py-2.5 sm:px-4 sm:py-3">
      <p className="font-mono text-[9px] sm:text-xs uppercase tracking-wider mb-1"
        style={{ color: 'var(--text-muted)' }}>{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="font-display font-bold text-xl sm:text-2xl" style={{ color }}>{value}</span>
        {sub && <span className="font-mono text-[9px] sm:text-xs" style={{ color: 'var(--text-muted)' }}>{sub}</span>}
      </div>
    </div>
  );
}

export default function FitnessTracker() {
  useEffect(() => { document.title = 'Fitness Tracker | TRACKR'; }, []);
  const { myExercises, logsMap, workoutHeatmap, bodyStats, loading } = useSelector((s) => s.workouts);
  const { initialized } = useSelector((s) => s.auth);
  const user = useSelector((s) => s.auth.user);

  if (!initialized || (loading && myExercises.length === 0)) return <FitnessTrackerSkeleton />;

  const totalSets  = Object.values(logsMap).reduce((a, logs) => a + logs.length, 0);
  const activeDays = Object.values(workoutHeatmap).filter((v) => v > 0).length;
  const latestWeight = bodyStats.length > 0 ? bodyStats[bodyStats.length - 1].weight : null;

  let streak = 0;
  const today = new Date();
  for (let i = 0; i <= 90; i++) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    if ((workoutHeatmap[key] ?? 0) > 0) streak++;
    else if (i > 0) break;
  }

  return (
    <div className="min-h-screen px-3 sm:px-5 lg:px-8 py-4 sm:py-6 animate-fade-in">

      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ backgroundColor: 'var(--accent)' }} />
          <span className="font-mono text-[10px] sm:text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>
        <h1 className="font-serif font-bold text-2xl sm:text-3xl tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Fitness{user?.username ? `, ${user.username}` : ''}.
        </h1>
        <p className="font-body text-xs sm:text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Exercise log · Progress · Body stats · Workout history
        </p>
      </div>

      {/* Stats — 2×2 on mobile, 4-col on sm+ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
        <StatCard label="Exercises"   value={myExercises.length} sub="tracked"   color="var(--accent)" />
        <StatCard label="Total Sets"  value={totalSets}          sub="logged" />
        <StatCard label="Streak"      value={`${streak}d`}       sub="active"    color="var(--accent)" />
        <StatCard label="Bodyweight"  value={latestWeight ? `${latestWeight}kg` : '—'} sub={latestWeight ? 'today' : 'not logged'} />
      </div>

      {/* ── Mobile layout: single column ── */}
      <div className="flex flex-col gap-4 lg:hidden">
        <ExerciseList />
        <ExerciseProgressChart />
        <BodyStats />
        <WorkoutHeatmap />
        <NextSession />
      </div>

      {/* ── Desktop layout: 3-column ── */}
      <div className="hidden lg:grid grid-cols-3 gap-4 items-start">
        <div style={{ minHeight: '540px' }}><ExerciseList /></div>
        <div className="flex flex-col gap-4">
          <ExerciseProgressChart />
          <BodyStats />
        </div>
        <div className="flex flex-col gap-4">
          <WorkoutHeatmap />
          <NextSession />
        </div>
      </div>

    </div>
  );
}