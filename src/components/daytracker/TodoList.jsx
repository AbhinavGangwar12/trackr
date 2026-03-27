import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchTasks, createTask, updateTask, removeTask,
  toggleTask, markTaskComplete, setPriority,
} from '../../store/tasksSlice';

// Local date string — avoids UTC/IST midnight mismatch
function localDateStr(d) {
  const date = d ? new Date(d) : new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

const priorityConfig = {
  high:   { label: 'HIGH', color: '#f87171', bg: 'rgba(248,113,113,0.1)',  border: 'rgba(248,113,113,0.25)' },
  medium: { label: 'MED',  color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',   border: 'rgba(251,191,36,0.25)'  },
  low:    { label: 'LOW',  color: 'var(--text-muted)', bg: 'var(--bg-surface-2)', border: 'var(--border-color)' },
};

function TaskItem({ task, isCompleted, priority, onToggle, onDelete, onEdit }) {
  const [editing, setEditing]       = useState(false);
  const [editTitle, setEditTitle]   = useState(task.title);
  const [editDesc, setEditDesc]     = useState(task.description || '');
  const [editPri, setEditPri]       = useState(priority || 'medium');
  const dispatch = useDispatch();
  const p = priorityConfig[priority] || priorityConfig.low;

  const saveEdit = () => {
    if (!editTitle.trim()) return;
    onEdit(task.task_id, editTitle.trim(), editDesc.trim(), editPri);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="mx-2 my-1 p-3 rounded-lg border animate-slide-up"
        style={{ backgroundColor: 'var(--bg-surface-2)', borderColor: 'var(--accent)' }}>
        <input autoFocus value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
          className="input-field mb-2 text-sm" placeholder="Task title" />
        <input value={editDesc} onChange={(e) => setEditDesc(e.target.value)}
          className="input-field mb-2 text-xs" placeholder="Description (optional)" />
        <div className="flex gap-2">
          <select value={editPri} onChange={(e) => setEditPri(e.target.value)} className="input-field flex-1 text-xs">
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <button onClick={saveEdit} className="btn-primary px-3 text-xs">Save</button>
          <button onClick={() => setEditing(false)} className="btn-ghost px-2 text-xs">✕</button>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex items-start gap-3 px-3 py-2.5 rounded-lg mx-1 transition-all duration-150 hover:bg-white/5"
      style={{ opacity: isCompleted ? 0.5 : 1 }}>
      {/* Checkbox */}
      <button onClick={() => onToggle(task.task_id)}
        className="mt-0.5 flex-shrink-0 w-[18px] h-[18px] rounded border transition-all duration-150 flex items-center justify-center"
        style={{
          backgroundColor: isCompleted ? 'var(--accent)' : 'transparent',
          borderColor:     isCompleted ? 'var(--accent)' : 'var(--border-color)',
        }}>
        {isCompleted && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1.5 5L4 7.5L8.5 2.5" stroke="var(--accent-fg)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <span className="text-sm font-body leading-snug block"
          style={{
            textDecoration: isCompleted ? 'line-through' : 'none',
            color:          isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
          }}>
          {task.title}
        </span>
        {task.description && (
          <span className="text-xs font-body block mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
            {task.description}
          </span>
        )}
        {/* Carry-forward badge — shown when task is from a previous day */}
        {task.created_at && localDateStr(task.created_at) !== localDateStr() && (
          <span className="font-mono text-[9px] mt-0.5 block" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>
            ↩ from {new Date(task.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </span>
        )}
      </div>

      {/* Priority badge */}
      <span className="flex-shrink-0 font-mono text-[10px] px-1.5 py-0.5 rounded border"
        style={{ color: p.color, backgroundColor: p.bg, borderColor: p.border }}>
        {p.label}
      </span>

      {/* Actions */}
      <div className="flex-shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <button onClick={() => setEditing(true)} className="p-0.5 transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M8.5 1.5l2 2-7 7H1.5v-2l7-7z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button onClick={() => onDelete(task.task_id)} className="p-0.5 transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#f87171')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function TodoList() {
  const dispatch = useDispatch();
  const { tasks, loading, completedIds, allTimeCompletedIds, priorityMap } = useSelector((s) => s.tasks);

  const [adding,      setAdding]      = useState(false);
  const [newTitle,    setNewTitle]    = useState('');
  const [newDesc,     setNewDesc]     = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [search,      setSearch]      = useState('');

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    dispatch(createTask({ title: newTitle.trim(), description: newDesc.trim(), priority: newPriority }));
    setNewTitle(''); setNewDesc(''); setNewPriority('medium'); setAdding(false);
  };

  const handleToggle = (taskId) => {
    const isNowCompleting = !completedIds.includes(taskId);
    dispatch(toggleTask(taskId));
    if (isNowCompleting) dispatch(markTaskComplete(taskId));
  };

  const handleEdit = (taskId, title, description, priority) => {
    dispatch(updateTask({ taskId, title, description, priority }));
    dispatch(setPriority({ taskId, priority }));
  };

  const todayStr = localDateStr();
  // Visible: today's tasks + incomplete carried-forward tasks
  const visibleTasks = tasks.filter((t) => {
    const taskDate = t.created_at ? localDateStr(t.created_at) : todayStr;
    const isToday = taskDate === todayStr;
    // Use allTimeCompletedIds to check if task was ever completed on ANY day
    const everCompleted = allTimeCompletedIds.includes(t.task_id);
    return isToday || !everCompleted;
  });
  const completed = visibleTasks.filter((t) => completedIds.includes(t.task_id)).length;
  const total     = visibleTasks.length;
  const pct       = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="card flex flex-col" style={{ minHeight: 320 }}>
      {/* Header */}
      <div className="card-header">
        <div className="flex items-center gap-2.5">
          <span className="card-title">To-Do</span>
          <span className="badge">{completed}/{total}</span>
        </div>
        <button onClick={() => setAdding((a) => !a)}
          className="w-7 h-7 rounded-lg flex items-center justify-center border transition-all"
          style={{ backgroundColor: 'var(--accent-glow)', borderColor: 'color-mix(in srgb, var(--accent) 25%, transparent)', color: 'var(--accent)' }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1.5v9M1.5 6h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Progress bar */}
      <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex justify-between items-center mb-1.5">
          <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>COMPLETION</span>
          <span className="font-mono text-xs" style={{ color: 'var(--accent)' }}>{pct}%</span>
        </div>
        <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-surface-2)' }}>
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: 'linear-gradient(90deg, var(--accent-dark), var(--accent))' }} />
        </div>
      </div>

      {/* Search */}
      {tasks.length > 4 && (
        <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <div className="relative">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2" width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="5" cy="5" r="3.5" stroke="var(--text-muted)" strokeWidth="1.3"/>
              <line x1="8" y1="8" x2="11" y2="11" stroke="var(--text-muted)" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..." className="input-field pl-7 text-xs py-1.5"
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 font-mono text-xs"
                style={{ color: 'var(--text-muted)' }}>✕</button>
            )}
          </div>
        </div>
      )}

      {/* Add form */}
      {adding && (
        <div className="px-3 py-2.5 border-b animate-slide-up"
          style={{ backgroundColor: 'var(--bg-surface-2)', borderColor: 'var(--border-color)' }}>
          <input autoFocus type="text" value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Task title..." className="input-field mb-2" />
          <input type="text" value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Description (optional)" className="input-field mb-2 text-xs" />
          <div className="flex gap-2">
            <select value={newPriority} onChange={(e) => setNewPriority(e.target.value)} className="input-field flex-1 text-xs">
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <button onClick={handleAdd} className="btn-primary px-3 text-xs">Add</button>
            <button onClick={() => setAdding(false)} className="btn-ghost px-2 text-xs">✕</button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mx-3 mt-2 px-3 py-2 rounded-lg text-xs font-mono"
          style={{ backgroundColor: 'rgba(248,113,113,0.1)', color: '#f87171' }}>{error}</div>
      )}

      {/* Task list */}
      <div className="flex-1 overflow-y-auto py-1">
        {loading && tasks.length === 0 ? (
          <div className="flex items-center justify-center h-24 gap-2">
            {[0,1,2].map((i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
                style={{ backgroundColor: 'var(--accent)', animationDelay: `${i*150}ms` }} />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          /* Empty state for new users */
          <div className="flex flex-col items-center justify-center h-32 px-4 text-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center border"
              style={{ backgroundColor: 'var(--accent-glow)', borderColor: 'var(--border-color)' }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 3v12M3 9h12" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <p className="font-body text-sm font-medium" style={{ color: 'var(--text-primary)' }}>No tasks yet</p>
              <p className="font-body text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Hit <span className="font-mono" style={{ color: 'var(--accent)' }}>+</span> above to add your first task
              </p>
            </div>
          </div>
        ) : (() => {
          const visibleFiltered = search.trim()
            ? visibleTasks.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
            : visibleTasks;
          return visibleFiltered.length === 0 && visibleTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-24 px-4 text-center gap-2">
              <p className="font-body text-sm font-medium" style={{ color: 'var(--text-primary)' }}>All done for today!</p>
              <p className="font-body text-xs" style={{ color: 'var(--text-muted)' }}>
                No pending tasks. Add new ones with <span className="font-mono" style={{ color: 'var(--accent)' }}>+</span>
              </p>
            </div>
          ) : visibleFiltered.length === 0 ? (
            <div className="flex items-center justify-center h-20 text-sm font-body" style={{ color: 'var(--text-muted)' }}>
              No tasks match "{search}"
            </div>
          ) : visibleFiltered.map((task) => (
            <TaskItem key={task.task_id} task={task}
              isCompleted={completedIds.includes(task.task_id)}
              priority={priorityMap[task.task_id] || 'medium'}
              onToggle={handleToggle}
              onDelete={(id) => dispatch(removeTask(id))}
              onEdit={handleEdit} />
          ));
        })()}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t flex justify-between" style={{ borderColor: 'var(--border-color)' }}>
        <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
          {visibleTasks.filter((t) => !completedIds.includes(t.task_id)).length} remaining
        </span>
        <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
          {visibleTasks.filter((t) => priorityMap[t.task_id] === 'high' && !completedIds.includes(t.task_id)).length} high-pri left
        </span>
      </div>
    </div>
  );
}