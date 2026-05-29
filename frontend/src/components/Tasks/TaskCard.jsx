import React from 'react';

function TaskCard({ task, onStatusToggle, onDelete }) {
  return (
    <div className="bg-[#131c2e]/60 backdrop-blur-md border border-slate-800 hover:border-slate-700 rounded-2xl p-5 mb-4 shadow-lg transition-all">
      <div className="flex justify-between items-start gap-4">
        <div className="flex gap-3 items-start">
          <input 
            type="checkbox" 
            checked={task.status === 'completed'} 
            onChange={() => onStatusToggle(task.id, task.status)}
            className="w-5 h-5 rounded border-slate-800 bg-[#070a12] text-cyan-500 focus:ring-0 cursor-pointer mt-0.5 accent-cyan-500"
          />
          <div>
            <h4 className={`text-md font-bold text-white transition-all ${task.status === 'completed' ? 'line-through opacity-40' : ''}`}>
              {task.title}
            </h4>
            {task.description && (
              <p className="text-sm text-slate-400 mt-1 leading-relaxed">{task.description}</p>
            )}
          </div>
        </div>
        <button 
          onClick={() => onDelete(task.id)} 
          className="text-xs font-semibold text-red-400 hover:text-red-300 bg-none border-none cursor-pointer transition-colors"
        >
          Remove
        </button>
      </div>

      {/* Context Metric Badges Alignment Area Grid Row */}
      <div className="flex flex-wrap gap-2 mt-4 items-center">
        <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
          {task.category || 'General'}
        </span>
        
        <span className={`text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded border ${
          task.priority === 'high' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
          task.priority === 'low' ? 'bg-blue-500/10 text-0-400 border-blue-500/20' :
          'bg-amber-500/10 text-amber-400 border-amber-500/20'
        }`}>
          ✨ {task.priority || 'medium'} Suggestion
        </span>
        
        <span className="text-[11px] font-bold px-2.5 py-1 rounded bg-[#0f172a] text-cyan-400 border border-cyan-500/20 flex items-center gap-1">
          ⏱️ {task.estimated_hours || 1} hrs AI Est.
        </span>
      </div>

      {/* AI Subtask Tree Matrix Checklist Drop-in Area */}
      {task.subtasks && task.subtasks.length > 0 && (
        <div className="mt-4 bg-[#070a12] border border-slate-800 rounded-xl p-4">
          <h5 className="text-[11px] font-bold text-cyan-400 tracking-wider uppercase mb-2">
            ⚡ AI Action Blueprint Steps Matrix
          </h5>
          <div className="space-y-2">
            {task.subtasks.map(sub => (
              <label key={sub.id} className="flex items-center gap-3 text-xs text-slate-300 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={sub.status === 'completed'} 
                  readOnly 
                  className="w-4 h-4 rounded border-slate-800 bg-[#070a12] text-cyan-500 focus:ring-0 accent-cyan-400"
                />
                <span className={sub.status === 'completed' ? 'line-through opacity-40' : ''}>
                  {sub.title}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskCard;