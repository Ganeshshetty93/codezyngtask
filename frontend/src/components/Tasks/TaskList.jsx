import React, { useState } from 'react';
import TaskCard from './TaskCard';

function TaskList({ tasks, onStatusToggle, onDelete }) {
  const [catFilter, setCatFilter] = useState('All');
  const [priFilter, setPriFilter] = useState('All');

  const uniqueCategories = ['All', ...new Set(tasks.map(t => t.category || 'General'))];
  
  const filteredTasks = tasks.filter(t => {
    const matchCat = catFilter === 'All' || t.category === catFilter;
    const matchPri = priFilter === 'All' || t.priority?.toLowerCase() === priFilter.toLowerCase();
    return matchCat && matchPri;
  });

  return (
    <div>
      {/* Filtering Control Bar Subheader Toolbar */}
      <div className="flex flex-wrap gap-4 bg-[#131c2e] border border-slate-800 rounded-xl p-4 mb-6 items-center">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <span>Scope Category:</span>
          <select 
            value={catFilter} 
            onChange={e => setCatFilter(e.target.value)}
            className="bg-[#070a12] border border-slate-800 text-white rounded p-1.5 outline-none text-xs"
          >
            {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <span>Priority Scope:</span>
          <select 
            value={priFilter} 
            onChange={e => setPriFilter(e.target.value)}
            className="bg-[#070a12] border border-slate-800 text-white rounded p-1.5 outline-none text-xs"
          >
            <option value="All">All Priorities Mapping</option>
            <option value="high">High System Nodes</option>
            <option value="medium">Medium System Nodes</option>
            <option value="low">Low System Nodes</option>
          </select>
        </div>
      </div>

      {/* Map Active Streams Target Array Container Grid */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-2xl text-sm">
            No telemetry records match active dashboard query parameters.
          </div>
        ) : (
          filteredTasks.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onStatusToggle={onStatusToggle} 
              onDelete={onDelete} 
            />
          ))
        )}
      </div>
    </div>
  );
}

export default TaskList;