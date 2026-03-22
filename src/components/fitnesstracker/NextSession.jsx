import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateSplitDay } from '../../store/workoutsSlice';

const SPLIT_OPTIONS = ['Push','Pull','Legs','Rest','Cardio','Full Body','Arms','Core','Upper','Lower'];
const COLORS = {
  Push:'#fb923c', Pull:'#818cf8', Legs:'var(--accent)', Rest:'var(--text-muted)',
  Cardio:'#34d399', 'Full Body':'#fbbf24', Arms:'#f472b6', Core:'#a78bfa',
  Upper:'#60a5fa', Lower:'var(--accent)',
};
const getColor = (label) => COLORS[label] || 'var(--accent)';

function getSuggestions(label, myExercises) {
  if (label === 'Rest') return [];
  const lc = label.toLowerCase();
  return myExercises.filter((ue) => {
    const cat = (ue.exercise?.category || '').toLowerCase();
    if (lc === 'full body') return true;
    return cat.includes(lc) || lc.includes(cat);
  }).slice(0, 6);
}

export default function NextSession() {
  const dispatch = useDispatch();
  const { split, myExercises } = useSelector((s) => s.workouts);
  const [editingIdx, setEditingIdx] = useState(null);

  const todayIdx    = new Date().getDay();
  const tomorrowIdx = (todayIdx + 1) % 7;
  const todaySlot   = split[todayIdx];
  const nextSlot    = split[tomorrowIdx];

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Session Planner</span>
        <div className="flex items-center gap-1.5">
          <div className="teal-dot" />
          <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>auto</span>
        </div>
      </div>

      <div className="px-3 sm:px-4 py-3">
        {/* Week grid */}
        <p className="font-mono text-xs uppercase tracking-wider mb-2.5" style={{ color: 'var(--text-muted)' }}>
          Weekly plan — tap to edit
        </p>
        <div className="grid grid-cols-7 gap-1 mb-4">
          {split.map((day, i) => {
            const isToday    = i === todayIdx;
            const isTomorrow = i === tomorrowIdx;
            const c = getColor(day.label);
            return (
              <div key={day.day} className="text-center">
                <div onClick={() => setEditingIdx(editingIdx === i ? null : i)}
                  className="w-full aspect-square rounded-lg flex items-center justify-center text-[9px] font-mono font-bold mb-1 border cursor-pointer transition-all select-none"
                  style={{
                    backgroundColor: isToday ? c : isTomorrow ? `${c}22` : 'var(--bg-surface-2)',
                    borderColor:     isToday || isTomorrow ? c : 'var(--border-color)',
                    color:           isToday ? '#0f1117' : isTomorrow ? c : 'var(--text-muted)',
                    boxShadow:       isToday ? `0 0 10px ${c}40` : 'none',
                  }}>
                  {day.day[0]}
                </div>
                <span className="font-mono text-[8px] leading-none block"
                  style={{ color: isToday || isTomorrow ? c : 'var(--text-muted)' }}>
                  {day.label.length > 4 ? day.label.slice(0,3) : day.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Inline day editor */}
        {editingIdx !== null && (
          <div className="mb-4 p-3 rounded-lg border animate-slide-up"
            style={{ backgroundColor: 'var(--bg-surface-2)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-center justify-between mb-2">
              <p className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>Edit {split[editingIdx]?.day}</p>
              <button onClick={() => setEditingIdx(null)} style={{ color: 'var(--text-muted)' }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SPLIT_OPTIONS.map((opt) => (
                <button key={opt}
                  onClick={() => { dispatch(updateSplitDay({ dayIndex: editingIdx, label: opt, active: opt !== 'Rest' })); setEditingIdx(null); }}
                  className="font-mono text-xs px-2.5 py-1 rounded-lg border transition-all"
                  style={split[editingIdx]?.label === opt
                    ? { backgroundColor: getColor(opt), color: '#0f1117', borderColor: getColor(opt) }
                    : { backgroundColor: 'transparent', color: 'var(--text-muted)', borderColor: 'var(--border-color)' }}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Today */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getColor(todaySlot?.label) }}/>
            <p className="font-mono text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Today — {todaySlot?.label}
            </p>
          </div>
          {todaySlot?.label === 'Rest' ? (
            <p className="font-body text-sm" style={{ color: 'var(--text-muted)' }}>Rest day. Recover well.</p>
          ) : getSuggestions(todaySlot?.label, myExercises).length === 0 ? (
            <p className="font-body text-sm" style={{ color: 'var(--text-muted)' }}>
              Add exercises tagged "{todaySlot?.label}" to your library.
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {getSuggestions(todaySlot?.label, myExercises).map((ue) => (
                <span key={ue.user_exercise_id} className="font-mono text-xs px-2.5 py-1 rounded-lg border"
                  style={{ backgroundColor: `${getColor(todaySlot?.label)}18`, color: getColor(todaySlot?.label), borderColor: `${getColor(todaySlot?.label)}35` }}>
                  {ue.exercise?.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Tomorrow */}
        <div className="pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full opacity-60" style={{ backgroundColor: getColor(nextSlot?.label) }}/>
            <p className="font-mono text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Tomorrow — {nextSlot?.label}
            </p>
          </div>
          {nextSlot?.label === 'Rest' ? (
            <p className="font-body text-sm" style={{ color: 'var(--text-muted)' }}>Rest day scheduled.</p>
          ) : getSuggestions(nextSlot?.label, myExercises).length === 0 ? (
            <p className="font-body text-sm" style={{ color: 'var(--text-muted)' }}>No matching exercises for "{nextSlot?.label}".</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {getSuggestions(nextSlot?.label, myExercises).map((ue) => (
                <span key={ue.user_exercise_id} className="font-mono text-xs px-2.5 py-1 rounded-lg border"
                  style={{ backgroundColor: 'var(--bg-surface-2)', color: 'var(--text-muted)', borderColor: 'var(--border-color)' }}>
                  {ue.exercise?.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
