function TaskExportActions({ count, onExportCsv, onExportPdf }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-semibold text-gray-600">{count} in view</span>
      <button
        type="button"
        onClick={onExportCsv}
        disabled={count === 0}
        className="h-10 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-blue-500 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Export CSV
      </button>
      <button
        type="button"
        onClick={onExportPdf}
        disabled={count === 0}
        className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Export PDF
      </button>
    </div>
  );
}

export default TaskExportActions;
