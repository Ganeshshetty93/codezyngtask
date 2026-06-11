const priorityClassNames = {
  critical: 'bg-red-900 text-white',
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-green-100 text-green-700'
};

function TaskCard({
  task,
  compact = false,
  dragHandleProps = null,
  onStatusChange,
  onBreakdown,
  onEdit,
  onDelete,
  onOpenAssistant
}) {
  const visibleSubtasks = task.subtasks || [];
  const priorityClassName = priorityClassNames[task.priority] || priorityClassNames.medium;

  return (
    <div
      className={`group rounded-lg border border-gray-200 bg-white shadow-sm transition hover:border-blue-200 hover:shadow-md ${compact ? 'cursor-grab p-4 active:cursor-grabbing' : 'p-6'}`}
      {...(dragHandleProps || {})}
    >
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <button
            type="button"
            className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-500 transition hover:border-blue-400 hover:text-blue-600"
            title="Drag task"
            aria-label="Drag task"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-current" />
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <h3 className={`${compact ? 'text-base' : 'text-xl'} break-words font-bold leading-snug text-gray-900`}>
                {task.title}
              </h3>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${priorityClassName}`}>
                {(task.priority || 'medium').toUpperCase()}
              </span>
            </div>
            {task.description && (
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-gray-600">{task.description}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
          {task.category && <span className="rounded-full bg-gray-100 px-2.5 py-1">Category: {task.category}</span>}
          {task.due_date && <span className="rounded-full bg-gray-100 px-2.5 py-1">Due: {new Date(task.due_date).toLocaleDateString()}</span>}
          {task.reminder_at && <span className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-700">Reminder: {new Date(task.reminder_at).toLocaleString()}</span>}
          {task.estimated_hours && <span className="rounded-full bg-gray-100 px-2.5 py-1">{task.estimated_hours}h</span>}
        </div>

        {task.subtasks?.length > 0 && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-600">Subtasks</p>
              <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-gray-500">{task.subtasks.length}</span>
            </div>
            <ul className="space-y-1.5 text-sm text-gray-600">
              {visibleSubtasks.map((subtask) => (
                <li key={subtask.id} className="flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gray-400" />
                  <span className="leading-snug">{subtask.title || subtask.description}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-3">
          {task.status === 'todo' && (
            <>
              <button
                type="button"
                onClick={() => onStatusChange(task.id, 'in_progress')}
                className="rounded-md bg-yellow-500 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-yellow-600"
              >
                Start
              </button>
              <button
                type="button"
                onClick={() => onBreakdown(task.id)}
                className="rounded-md bg-purple-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-purple-700"
              >
                Break Down
              </button>
            </>
          )}
          {task.status === 'in_progress' && (
            <button
              type="button"
              onClick={() => onStatusChange(task.id, 'done')}
              className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-green-700"
            >
              Complete
            </button>
          )}
          {task.status === 'done' && (
            <button
              type="button"
              onClick={() => onStatusChange(task.id, 'todo')}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-blue-700"
            >
              Reopen
            </button>
          )}
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="rounded-md bg-slate-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-slate-700"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onOpenAssistant(task.id)}
            className="rounded-md bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 transition hover:bg-blue-100"
          >
            AI
          </button>
          <button
            type="button"
            onClick={() => onDelete(task.id)}
            className="rounded-md bg-red-500 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default TaskCard;
