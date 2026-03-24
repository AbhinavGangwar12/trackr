import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { saveNote } from '../../store/tasksSlice';
import api from '../../services/api';

const _td = new Date();
const today = `${_td.getFullYear()}-${String(_td.getMonth() + 1).padStart(2, '0')}-${String(_td.getDate()).padStart(2, '0')}`;
const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

export default function DailyNotes() {
  const dispatch = useDispatch();
  const notes    = useSelector((s) => s.tasks.notes);

  const [activeDate, setActiveDate] = useState(today);
  const [text,       setText]       = useState(notes[today] || '');
  const [saved,      setSaved]      = useState(true);
  const [saving,     setSaving]     = useState(false);

  useEffect(() => {
    setText(notes[activeDate] || '');
    setSaved(true);
  }, [activeDate, notes]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.upsertNote(activeDate, text);
      dispatch(saveNote({ date: activeDate, text }));
      setSaved(true);
    } catch { /* non-blocking */ }
    setSaving(false);
  };

  const recentDates = (() => {
    const dates = [today];
    for (let i = 1; i <= 6; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (notes[key]) dates.push(key);
    }
    return [...new Set(dates)].slice(0, 5);
  })();

  return (
    <div className="card flex flex-col">
      {/* Header */}
      <div className="card-header">
        <div className="flex items-center gap-2.5">
          <span className="card-title">Daily Notes</span>
          {!saved && (
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded"
              style={{ backgroundColor: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}>unsaved</span>
          )}
          {saved && text && (
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded"
              style={{ backgroundColor: 'var(--accent-glow)', color: 'var(--accent)' }}>saved</span>
          )}
        </div>
        <button onClick={handleSave} disabled={saved || saving}
          className="font-mono text-xs px-2.5 py-1 rounded-lg border transition-all disabled:opacity-40"
          style={{
            backgroundColor: saved ? 'var(--bg-surface-2)' : 'var(--accent-glow)',
            borderColor:     saved ? 'var(--border-color)' : 'color-mix(in srgb, var(--accent) 40%, transparent)',
            color:           saved ? 'var(--text-muted)'   : 'var(--accent)',
          }}>
          {saving ? '...' : 'Save'}
        </button>
      </div>

      {/* Date tabs */}
      <div className="flex gap-1.5 px-3 sm:px-4 pt-3 pb-2 overflow-x-auto">
        {recentDates.map((date) => (
          <button key={date} onClick={() => setActiveDate(date)}
            className="flex-shrink-0 font-mono text-[10px] px-2 py-1 rounded-lg border transition-all"
            style={activeDate === date
              ? { backgroundColor: 'var(--accent)', color: 'var(--accent-fg)', borderColor: 'var(--accent)' }
              : { backgroundColor: 'var(--bg-surface-2)', color: 'var(--text-muted)', borderColor: 'var(--border-color)' }}>
            {date === today ? 'Today' : fmtDate(date)}
          </button>
        ))}
      </div>

      {/* Textarea */}
      <div className="px-3 sm:px-4 pb-3 flex-1">
        <textarea value={text}
          onChange={(e) => { setText(e.target.value); setSaved(false); }}
          onBlur={() => { if (!saved) handleSave(); }}
          onKeyDown={(e) => { if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); handleSave(); } }}
          placeholder={`Notes for ${activeDate === today ? 'today' : fmtDate(activeDate)}...\n\nThoughts, blockers, wins...`}
          className="w-full resize-none outline-none text-sm font-body leading-relaxed bg-transparent"
          style={{ color: 'var(--text-primary)', minHeight: '100px' }}
          rows={5} />
        <div className="flex justify-between items-center mt-1 pt-2 border-t"
          style={{ borderColor: 'var(--border-color)' }}>
          <span className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
            {text.trim() ? text.trim().split(/\s+/).length : 0} words
          </span>
          <span className="font-mono text-[10px] hidden sm:block" style={{ color: 'var(--text-muted)' }}>
            Ctrl+S · auto-saves on blur
          </span>
        </div>
      </div>
    </div>
  );
}