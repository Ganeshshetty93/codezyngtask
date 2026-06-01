function AssistantMetric({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function AIAssistantPanel({
  open,
  layout = 'rail',
  recommendation,
  onOpen,
  onClose,
  onPlanProductLaunch
}) {
  const isRail = layout === 'rail';

  if (!open) {
    return (
      <div className={isRail ? 'flex justify-end 2xl:sticky 2xl:top-4' : 'flex justify-end'}>
        <button
          type="button"
          onClick={onOpen}
          className="group flex h-12 w-12 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white shadow-sm ring-1 ring-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          title="Open AI Assistant"
          aria-label="Open AI Assistant"
        >
          AI
        </button>
      </div>
    );
  }

  return (
    <aside className={`${isRail ? '2xl:sticky 2xl:top-4' : ''} overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm`}>
      <div className="border-b border-slate-200 bg-slate-900 px-5 py-4 text-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-blue-200">AI Assistant</p>
            <h2 className="mt-1 text-lg font-bold leading-tight">
              {recommendation?.title || 'Plan Product Launch'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-sm font-bold transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-blue-300"
            title="Collapse AI Assistant"
            aria-label="Collapse AI Assistant"
          >
            AI
          </button>
        </div>
        <button
          type="button"
          onClick={onPlanProductLaunch}
          className="mt-4 w-full rounded-md bg-blue-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-400"
        >
          Plan Product Launch
        </button>
      </div>

      {recommendation ? (
        <div className={isRail ? 'space-y-4 p-5' : 'grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_280px]'}>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-slate-900">Suggested subtasks</p>
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-500">
                {recommendation.suggestedSubtasks.length}
              </span>
            </div>
            <ul className="space-y-2 text-sm text-slate-700">
              {recommendation.suggestedSubtasks.map((subtask) => (
                <li key={subtask} className="flex gap-2 leading-snug">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">OK</span>
                  <span>{subtask}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={isRail ? 'space-y-3' : 'grid gap-3 sm:grid-cols-3 lg:grid-cols-1'}>
            <AssistantMetric label="Estimated" value={`${recommendation.estimatedHours}h`} />
            <AssistantMetric label="Priority" value={recommendation.priority.toUpperCase()} />
            <AssistantMetric label="Deadline" value={recommendation.deadline} />
          </div>
        </div>
      ) : (
        <div className="p-5">
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
            Select a task from the board to see subtasks, time, priority, and deadline suggestions.
          </div>
        </div>
      )}
    </aside>
  );
}

export default AIAssistantPanel;
