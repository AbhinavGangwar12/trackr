import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAllExercises, fetchMyExercises, addGlobalExercise, addMyExercise,
  removeMyExercise, fetchLogsForExercise, createLog, editLog, deleteLog,
  selectExercise,
} from '../../store/workoutsSlice';

const CATEGORIES = ['Push','Pull','Legs','Core','Cardio','Full Body','Other'];

/* ─── Log row ────────────────────────────────────────────────────────────── */
function LogRow({ log, userExerciseId }) {
  const dispatch = useDispatch();
  const [editing, setEditing] = useState(false);
  const [reps,    setReps]    = useState(log.reps ?? '');
  const [weight,  setWeight]  = useState(log.weight ?? '');

  const saveEdit = () => {
    dispatch(editLog({ logId: log.log_id, userExerciseId, data: { reps: Number(reps), weight: Number(weight) } }));
    setEditing(false);
  };

  const fmt = new Date(log.logged_at).toLocaleDateString('en-IN', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  if (editing) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg animate-slide-up"
        style={{ backgroundColor: 'var(--bg-surface-2)' }}>
        <input type="number" value={reps} onChange={(e) => setReps(e.target.value)}
          className="input-field w-16 text-xs text-center px-2 py-1" placeholder="Reps" />
        <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>×</span>
        <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)}
          className="input-field w-20 text-xs text-center px-2 py-1" placeholder="kg" />
        <button onClick={saveEdit} className="font-mono text-xs px-2 py-1 rounded"
          style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-fg)' }}>✓</button>
        <button onClick={() => setEditing(false)} className="font-mono text-xs px-2 py-1 rounded"
          style={{ backgroundColor: 'var(--bg-surface-3)', color: 'var(--text-muted)' }}>✕</button>
      </div>
    );
  }

  return (
    <div className="group flex items-center justify-between px-3 py-1.5 rounded-lg transition-all hover:bg-white/5">
      <div className="flex items-center gap-3">
        <span className="font-mono text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          {log.reps ?? '—'} <span style={{ color: 'var(--text-muted)' }}>×</span> {log.weight ?? '—'}kg
        </span>
        {log.reps && log.weight && (
          <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
            {(log.reps * log.weight).toFixed(0)}kg vol
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs hidden sm:block" style={{ color: 'var(--text-muted)' }}>{fmt}</span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => setEditing(true)} className="p-0.5"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M8.5 1.5l2 2-7 7H1.5v-2l7-7z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
          </button>
          <button onClick={() => dispatch(deleteLog({ logId: log.log_id, userExerciseId }))}
            className="p-0.5" style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#f87171'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Add Exercise Modal ─────────────────────────────────────────────────── */
function AddExerciseModal({ onClose }) {
  const dispatch     = useDispatch();
  const allExercises = useSelector((s) => s.workouts.allExercises);
  const myExercises  = useSelector((s) => s.workouts.myExercises);
  const myIds        = new Set(myExercises.map((e) => e.exercise_id));

  const [tab,      setTab]      = useState('browse');
  const [search,   setSearch]   = useState('');
  const [newName,  setNewName]  = useState('');
  const [newCat,   setNewCat]   = useState('Push');
  const [newMuscle,setNewMuscle]= useState('');
  const [creating, setCreating] = useState(false);
  const [error,    setError]    = useState('');

  const filtered = allExercises.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    if (!newName.trim()) { setError('Name is required.'); return; }
    setCreating(true); setError('');
    const res = await dispatch(addGlobalExercise({ name: newName.trim(), category: newCat, muscleGroup: newMuscle }));
    if (res.meta.requestStatus === 'fulfilled') {
      await dispatch(addMyExercise(res.payload.exercise_id));
      onClose();
    } else {
      setError(res.payload || 'Failed to create exercise.');
    }
    setCreating(false);
  };

  return (
    /* Full-screen on mobile, centered modal on sm+ */
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="card w-full sm:max-w-md animate-slide-up sm:animate-chat-pop"
        style={{ maxHeight: '85vh', display: 'flex', flexDirection: 'column',
          borderRadius: '16px 16px 0 0', /* bottom sheet on mobile */
        }}
        /* On sm+ override to normal rounded */
        >
        <div className="card-header">
          <span className="card-title">Add Exercise</span>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 pt-3">
          {['browse','create'].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className="px-3 py-1.5 rounded-lg font-mono text-xs transition-all border"
              style={tab === t
                ? { backgroundColor: 'var(--accent)', color: 'var(--accent-fg)', borderColor: 'var(--accent)' }
                : { backgroundColor: 'transparent', color: 'var(--text-muted)', borderColor: 'var(--border-color)' }}>
              {t === 'browse' ? 'Browse Library' : 'Create New'}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {tab === 'browse' ? (
            <>
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search exercises..." className="input-field mb-3" />
              {filtered.length === 0 ? (
                <p className="text-center text-sm py-4" style={{ color: 'var(--text-muted)' }}>
                  {allExercises.length === 0 ? 'No exercises yet. Create one!' : 'No matches.'}
                </p>
              ) : (
                <div className="space-y-1">
                  {filtered.map((ex) => {
                    const inMine = myIds.has(ex.exercise_id);
                    return (
                      <div key={ex.exercise_id}
                        className="flex items-center justify-between px-3 py-2.5 rounded-lg border"
                        style={{ backgroundColor: 'var(--bg-surface-2)', borderColor: 'var(--border-color)' }}>
                        <div>
                          <p className="font-body text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{ex.name}</p>
                          <p className="font-mono text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            {[ex.category, ex.muscle_group].filter(Boolean).join(' · ') || 'Uncategorised'}
                          </p>
                        </div>
                        <button
                          onClick={() => !inMine && dispatch(addMyExercise(ex.exercise_id))}
                          disabled={inMine}
                          className="font-mono text-xs px-2.5 py-1 rounded-lg border transition-all disabled:opacity-50"
                          style={inMine
                            ? { backgroundColor: 'var(--bg-surface-3)', color: 'var(--text-muted)', borderColor: 'var(--border-color)' }
                            : { backgroundColor: 'var(--accent-glow)', color: 'var(--accent)', borderColor: 'color-mix(in srgb, var(--accent) 30%, transparent)' }}>
                          {inMine ? '✓' : '+ Add'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block font-mono text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>NAME *</label>
                <input value={newName} onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Barbell Squat" className="input-field" />
              </div>
              <div>
                <label className="block font-mono text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>CATEGORY</label>
                <select value={newCat} onChange={(e) => setNewCat(e.target.value)} className="input-field">
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-mono text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>MUSCLE GROUP</label>
                <input value={newMuscle} onChange={(e) => setNewMuscle(e.target.value)}
                  placeholder="e.g. Quads, Glutes" className="input-field" />
              </div>
              {error && (
                <div className="px-3 py-2 rounded-lg text-xs font-mono"
                  style={{ backgroundColor: 'rgba(248,113,113,0.1)', color: '#f87171' }}>{error}</div>
              )}
              <button onClick={handleCreate} disabled={creating}
                className="w-full py-2.5 rounded-lg font-display font-semibold text-sm transition-all disabled:opacity-50"
                style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-fg)' }}>
                {creating ? 'Creating...' : 'Create & Add to My List'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Log Set Form ───────────────────────────────────────────────────────── */
function LogSetForm({ userExerciseId, onDone }) {
  const dispatch = useDispatch();
  const [sets,       setSets]       = useState('');
  const [reps,       setReps]       = useState('');
  const [weight,     setWeight]     = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reps && !weight) return;
    setSubmitting(true);
    const setCount = Number(sets) || 1;
    // Fire one log entry per set
    for (let i = 0; i < setCount; i++) {
      await dispatch(createLog({
        userExerciseId,
        logData: {
          sets: setCount,
          reps: Number(reps) || null,
          weight: Number(weight) || null,
        },
      }));
    }
    setSets(''); setReps(''); setWeight('');
    setSubmitting(false);
    onDone();
  };

  return (
    <div className="mx-2 mb-2 p-3 rounded-lg border animate-slide-up"
      style={{ backgroundColor: 'var(--bg-surface-2)', borderColor: 'color-mix(in srgb, var(--accent) 30%, transparent)' }}>
      <p className="font-mono text-xs mb-2" style={{ color: 'var(--accent)' }}>LOG SET</p>
      <div className="flex gap-2 items-center">
        <div style={{ width: 56, flexShrink: 0 }}>
          <label className="block font-mono text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>SETS</label>
          <input type="number" value={sets} onChange={(e) => setSets(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="4" className="input-field text-sm text-center px-1" />
        </div>
        <span className="font-mono text-base mt-4" style={{ color: 'var(--text-muted)' }}>×</span>
        <div className="flex-1">
          <label className="block font-mono text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>REPS</label>
          <input type="number" value={reps} onChange={(e) => setReps(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="8" className="input-field text-sm text-center" />
        </div>
        <span className="font-mono text-base mt-4" style={{ color: 'var(--text-muted)' }}>@</span>
        <div className="flex-1">
          <label className="block font-mono text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>kg</label>
          <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="80" className="input-field text-sm text-center" />
        </div>
        <button onClick={handleSubmit} disabled={submitting || (!reps && !weight)}
          className="mt-4 px-3 py-2 rounded-lg font-mono text-xs transition-all disabled:opacity-50"
          style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-fg)' }}>
          {submitting ? '...' : 'Log'}
        </button>
        <button onClick={onDone} className="mt-4 px-2 py-2 rounded-lg font-mono text-xs"
          style={{ color: 'var(--text-muted)' }}>✕</button>
      </div>
      {sets && reps && weight && (
        <p className="font-mono text-[10px] mt-2" style={{ color: 'var(--text-muted)' }}>
          {sets} sets × {reps} reps @ {weight}kg = {(Number(sets) * Number(reps) * Number(weight)).toLocaleString()}kg total volume
        </p>
      )}
    </div>
  );
}
    // </div>
// }

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function ExerciseList() {
  const dispatch = useDispatch();
  const { myExercises, logsMap, selectedUserExerciseId, loading } = useSelector((s) => s.workouts);
  const [showModal,   setShowModal]   = useState(false);
  const [loggingFor,  setLoggingFor]  = useState(null);

  const handleSelect = (userExerciseId) => {
    dispatch(selectExercise(userExerciseId));
    if (!logsMap[userExerciseId]) dispatch(fetchLogsForExercise(userExerciseId));
  };

  const selectedEx   = myExercises.find((e) => e.user_exercise_id === selectedUserExerciseId);
  const selectedLogs = logsMap[selectedUserExerciseId] || [];

  return (
    <>
      {showModal && (
        <AddExerciseModal onClose={() => { setShowModal(false); dispatch(fetchAllExercises()); }} />
      )}

      <div className="card h-full flex flex-col">
        <div className="card-header">
          <div className="flex items-center gap-2.5">
            <span className="card-title">My Exercises</span>
            <span className="badge">{myExercises.length}</span>
          </div>
          <button onClick={() => setShowModal(true)}
            className="w-7 h-7 rounded-lg flex items-center justify-center border transition-all"
            style={{ backgroundColor: 'var(--accent-glow)', borderColor: 'color-mix(in srgb, var(--accent) 25%, transparent)', color: 'var(--accent)' }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1.5v9M1.5 6h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Exercise list */}
        <div className="border-b overflow-y-auto" style={{ borderColor: 'var(--border-color)', maxHeight: 200 }}>
          {loading && myExercises.length === 0 ? (
            <div className="flex justify-center py-4 gap-1.5">
              {[0,1,2].map((i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
                  style={{ backgroundColor: 'var(--accent)', animationDelay: `${i*150}ms` }} />
              ))}
            </div>
          ) : myExercises.length === 0 ? (
            <div className="px-4 py-8 text-center flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center border"
                style={{ backgroundColor: 'var(--accent-glow)', borderColor: 'var(--border-color)' }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M3 9h2.5M12.5 9H15M5.5 6v6M12.5 6v6M7.5 9h3"
                    stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <p className="font-body text-sm font-medium" style={{ color: 'var(--text-primary)' }}>No exercises yet</p>
                <p className="font-body text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Add exercises you want to track — squats, bench, rows, anything.
                </p>
              </div>
              <button onClick={() => setShowModal(true)}
                className="font-mono text-xs px-3 py-1.5 rounded-lg border transition-all"
                style={{ backgroundColor: 'var(--accent-glow)', color: 'var(--accent)', borderColor: 'color-mix(in srgb, var(--accent) 30%, transparent)' }}>
                + Add your first exercise
              </button>
            </div>
          ) : (
            myExercises.map((ue) => {
              const isSelected = ue.user_exercise_id === selectedUserExerciseId;
              const ex = ue.exercise;
              return (
                <div key={ue.user_exercise_id}
                  onClick={() => handleSelect(ue.user_exercise_id)}
                  className="group flex items-center justify-between px-3 py-2.5 cursor-pointer transition-all border-l-2"
                  style={{
                    borderLeftColor:   isSelected ? 'var(--accent)' : 'transparent',
                    backgroundColor:   isSelected ? 'var(--accent-glow)' : 'transparent',
                  }}>
                  <div>
                    <p className="font-body text-sm font-medium"
                      style={{ color: isSelected ? 'var(--accent)' : 'var(--text-primary)' }}>
                      {ex?.name || 'Unknown'}
                    </p>
                    <p className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                      {[ex?.category, ex?.muscle_group].filter(Boolean).join(' · ') || 'Uncategorised'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                      {(logsMap[ue.user_exercise_id] || []).length} sets
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); dispatch(removeMyExercise(ue.user_exercise_id)); }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 transition-all"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#f87171'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                        <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected exercise log */}
        {selectedEx && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b"
              style={{ borderColor: 'var(--border-color)' }}>
              <div>
                <p className="font-display font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                  {selectedEx.exercise?.name}
                </p>
                <p className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                  {selectedLogs.length} sets logged
                </p>
              </div>
              <button
                onClick={() => setLoggingFor(loggingFor === selectedUserExerciseId ? null : selectedUserExerciseId)}
                className="font-mono text-xs px-3 py-1.5 rounded-lg border transition-all"
                style={{
                  backgroundColor: loggingFor === selectedUserExerciseId ? 'var(--accent)' : 'var(--accent-glow)',
                  color:           loggingFor === selectedUserExerciseId ? 'var(--accent-fg)' : 'var(--accent)',
                  borderColor:     'color-mix(in srgb, var(--accent) 30%, transparent)',
                }}>
                {loggingFor === selectedUserExerciseId ? '✕ Cancel' : '+ Log Set'}
              </button>
            </div>

            {loggingFor === selectedUserExerciseId && (
              <div className="pt-2 px-1">
                <LogSetForm userExerciseId={selectedUserExerciseId} onDone={() => setLoggingFor(null)} />
              </div>
            )}

            <div className="flex-1 overflow-y-auto py-1">
              {selectedLogs.length === 0 ? (
                <div className="flex items-center justify-center py-6 text-sm font-body"
                  style={{ color: 'var(--text-muted)' }}>
                  No sets logged yet.
                </div>
              ) : (
                selectedLogs.map((log) => (
                  <LogRow key={log.log_id} log={log} userExerciseId={selectedUserExerciseId} />
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
