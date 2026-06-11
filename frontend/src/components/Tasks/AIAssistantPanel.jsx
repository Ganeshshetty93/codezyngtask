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
  extraSuggestions = [],
  moreLoading = false,
  taskSuggestions = [],
  suggestionsLoading = false,
  addingSuggestionTitle = '',
  hasSelectedTask = false,
  onOpen,
  onClose,
  onPlanCurrentTask,
  onMoreSuggestions,
  onLoadSuggestions,
  onAddSuggestionAsSubtask,
  onCreateTaskFromSuggestion
}) {
  const isRail = layout === 'rail';
  const hasGeneratedSuggestions = taskSuggestions.length > 0 || extraSuggestions.length > 0;

  const renderSuggestionList = (suggestions, { compact = false } = {}) => (
    <ul className="space-y-3 text-sm text-slate-700">
      {suggestions.map((suggestion, index) => {
        const title = suggestion.title || suggestion.name || suggestion.task || 'Suggested task';
        const taskKey = `task:${title}`;
        const subtaskKey = `subtask:${title}`;
        const acceptanceCriteria = Array.isArray(suggestion.acceptanceCriteria || suggestion.acceptance_criteria)
          ? (suggestion.acceptanceCriteria || suggestion.acceptance_criteria)
          : [];
        const estimatedHours = suggestion.estimatedHours || suggestion.estimated_hours;
        const notes = suggestion.notes || suggestion.implementationNotes || suggestion.implementation_notes;

        return (
          <li key={`${title}-${index}`} className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="flex flex-col gap-3">
              <div>
                <p className="font-semibold text-slate-900">{title}</p>
                {suggestion.description && <p className="mt-1 text-slate-600">{suggestion.description}</p>}
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                  {suggestion.category && <span className="rounded-full bg-slate-100 px-2 py-1">{suggestion.category}</span>}
                  {suggestion.priority && <span className="rounded-full bg-slate-100 px-2 py-1">Priority: {suggestion.priority}</span>}
                  {estimatedHours && <span className="rounded-full bg-slate-100 px-2 py-1">Estimate: {estimatedHours}h</span>}
                </div>
                {acceptanceCriteria.length > 0 && (
                  <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                    <p className="text-xs font-bold uppercase text-slate-500">Acceptance criteria</p>
                    <ul className="mt-1 space-y-1 text-xs text-slate-600">
                      {acceptanceCriteria.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {!compact && notes && <p className="mt-2 text-xs text-slate-500">{notes}</p>}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onCreateTaskFromSuggestion({ ...suggestion, title })}
                  disabled={addingSuggestionTitle === taskKey}
                  className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {addingSuggestionTitle === taskKey ? 'Creating...' : 'Create task'}
                </button>
                <button
                  type="button"
                  onClick={() => onAddSuggestionAsSubtask({ ...suggestion, title })}
                  disabled={!hasSelectedTask || addingSuggestionTitle === subtaskKey}
                  className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {addingSuggestionTitle === subtaskKey
                    ? 'Adding...'
                    : hasSelectedTask
                      ? 'Add as subtask'
                      : 'Select task first'}
                </button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );

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
              {recommendation?.title || 'AI task planning'}
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
          onClick={onPlanCurrentTask}
          className="mt-4 w-full rounded-md bg-blue-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-400"
        >
          {recommendation ? 'Plan this task' : 'Plan a task'}
        </button>
      </div>

      {recommendation ? (
        <div className={isRail ? 'space-y-4 p-5' : 'grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_280px]'}>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900">Current task subtasks</p>
                <p className="text-xs text-slate-500">Saved subtasks for the selected task. Generate more ideas from this same task.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-500">
                  {recommendation.suggestedSubtasks.length}
                </span>
                <button
                  type="button"
                  onClick={onMoreSuggestions}
                  disabled={moreLoading}
                  className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {moreLoading ? 'Thinking...' : 'More suggestions'}
                </button>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-slate-700">
              {recommendation.suggestedSubtasks.map((subtask, index) => {
                const title = typeof subtask === 'string' ? subtask : subtask.title;
                const description = typeof subtask === 'string' ? '' : subtask.description;
                return (
                <li key={subtask.id || `${title}-${index}`} className="flex gap-2 leading-snug">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">OK</span>
                  <span>
                    <span className="block">{title}</span>
                    {description && <span className="mt-0.5 block text-xs text-slate-500">{description}</span>}
                  </span>
                </li>
                );
              })}
            </ul>
          </div>

          {extraSuggestions.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-900">Suggestions for this task</p>
                  <p className="text-xs text-slate-500">Generated from the selected task and its existing subtasks.</p>
                </div>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-500">
                  {extraSuggestions.length}
                </span>
              </div>
              {renderSuggestionList(extraSuggestions, { compact: true })}
            </div>
          )}

          {taskSuggestions.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-900">{hasSelectedTask ? 'Suggestions for this task' : 'AI task suggestions'}</p>
                  <p className="text-xs text-slate-500">{hasSelectedTask ? 'Use these as new tasks or attach them to the selected task.' : 'Create these as new tasks.'}</p>
                </div>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-500">
                  {taskSuggestions.length}
                </span>
              </div>
              {renderSuggestionList(taskSuggestions)}
            </div>
          )}

          {!hasGeneratedSuggestions && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-900">{hasSelectedTask ? 'Suggestions for this task' : 'AI task suggestions'}</p>
                  <p className="text-xs text-slate-500">{hasSelectedTask ? 'Generate subtasks from the selected task.' : 'Generate smart task ideas from your current work history.'}</p>
                </div>
                <button
                  type="button"
                  onClick={onLoadSuggestions}
                  disabled={suggestionsLoading}
                  className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {suggestionsLoading ? 'Loading...' : 'Load suggestions'}
                </button>
              </div>
            </div>
          )}

          <div className={isRail ? 'space-y-3' : 'grid gap-3 sm:grid-cols-3 lg:grid-cols-1'}>
            <AssistantMetric label="Estimated" value={`${recommendation.estimatedHours}h`} />
            <AssistantMetric label="Priority" value={recommendation.priority.toUpperCase()} />
            <AssistantMetric label="Deadline" value={recommendation.deadline} />
          </div>
        </div>
      ) : (
        <div className="space-y-4 p-5">
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
            Select a task from the board to see subtasks, time, priority, and deadline suggestions.
          </div>

          {taskSuggestions.length > 0 ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-900">AI task suggestions</p>
                  <p className="text-xs text-slate-500">Create these as new tasks, or select a task to attach them as subtasks.</p>
                </div>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-500">
                  {taskSuggestions.length}
                </span>
              </div>
              {renderSuggestionList(taskSuggestions)}
            </div>
          ) : (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-900">AI task suggestions</p>
                  <p className="text-xs text-slate-500">Generate smart task ideas from your current work history.</p>
                </div>
                <button
                  type="button"
                  onClick={onLoadSuggestions}
                  disabled={suggestionsLoading}
                  className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {suggestionsLoading ? 'Loading...' : 'Load suggestions'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}

export default AIAssistantPanel;
