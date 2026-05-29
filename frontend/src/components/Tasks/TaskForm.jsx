import React, { useState } from 'react';
import api from '../../services/api';

function TaskForm({ onTaskCreated }) {
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    category: 'General',
    priority: 'medium',
    estimated_hours: 1
  });

  const handleAIGenerate = async (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      await api.post('/tasks/ai-generate', { prompt: aiPrompt });
      setAiPrompt('');
      onTaskCreated();
    } catch (err) {
      alert('AI Core Pipeline Timeout. Verify OpenAI API key bindings inside backend/.env');
    } finally {
      setAiLoading(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!taskData.title.trim()) return;
    try {
      await api.post('/tasks', taskData);
      setTaskData({ title: '', description: '', category: 'General', priority: 'medium', estimated_hours: 1 });
      onTaskCreated();
    } catch (err) {
      alert('Database reject anomaly. Verify manual request payload parameters.');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* AI Processing Prompt Input Component Block */}
      <div className="bg-gradient-to-br from-[#131c2e] to-[#0e243a] border border-cyan-500/30 rounded-2xl p-6 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
          <span>🔮</span> Natural Language Command Hub
        </h3>
        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          Describe goals. The transformer infrastructure maps categories, auto-assigns priorities, and structures nested blueprints.
        </p>
        <textarea
          rows="3"
          className="w-full bg-[#070a12] border border-slate-800 focus:border-cyan-500 text-white text-sm rounded-lg p-3 outline-none resize-none placeholder-slate-600 transition-colors"
          placeholder='e.g., "Plan my product launch next month with high priority and outline initial marketing objectives"'
          value={aiPrompt}
          onChange={e => setAiPrompt(e.target.value)}
        />
        <button 
          onClick={handleAIGenerate} 
          disabled={aiLoading || !aiPrompt.trim()} 
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-slate-800 disabled:to-slate-800 text-white text-sm font-semibold rounded-lg p-3 mt-3 cursor-pointer transition-all shadow-md shadow-cyan-900/20"
        >
          {aiLoading ? '⏳ AI Pipeline Parsing Blueprint Structure...' : '✨ Generate Automated Blueprint'}
        </button>
      </div>

      {/* Manual Task Standard Management Block */}
      <form onSubmit={handleManualSubmit} className="bg-[#131c2e] border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-md font-bold text-white mb-4 flex items-center gap-2">
          <span>📝</span> Manual Task Creation
        </h3>
        <div className="space-y-3">
          <input 
            type="text" 
            placeholder="Task Title" 
            required 
            className="w-full bg-[#070a12] border border-slate-800 focus:border-blue-500 text-white text-sm rounded-lg p-3 outline-none transition-colors"
            value={taskData.title} 
            onChange={e => setTaskData({...taskData, title: e.target.value})} 
          />
          <textarea 
            placeholder="Description Details (Optional)" 
            rows="2" 
            className="w-full bg-[#070a12] border border-slate-800 focus:border-blue-500 text-white text-sm rounded-lg p-3 outline-none resize-none transition-colors"
            value={taskData.description} 
            onChange={e => setTaskData({...taskData, description: e.target.value})} 
          />
          <div className="flex gap-3">
            <input 
              type="text" 
              placeholder="CategoryScope" 
              className="w-1/2 bg-[#070a12] border border-slate-800 focus:border-blue-500 text-white text-sm rounded-lg p-3 outline-none transition-colors"
              value={taskData.category} 
              onChange={e => setTaskData({...taskData, category: e.target.value})} 
            />
            <input 
              type="number" 
              placeholder="Est. Hours" 
              min="0.5" 
              step="0.5" 
              className="w-1/2 bg-[#070a12] border border-slate-800 focus:border-blue-500 text-white text-sm rounded-lg p-3 outline-none transition-colors"
              value={taskData.estimated_hours} 
              onChange={e => setTaskData({...taskData, estimated_hours: parseFloat(e.target.value) || 1})} 
            />
          </div>
          <div>
            <select 
              className="w-full bg-[#070a12] border border-slate-800 focus:border-blue-500 text-white text-sm rounded-lg p-3 outline-none transition-colors"
              value={taskData.priority} 
              onChange={e => setTaskData({...taskData, priority: e.target.value})}
            >
              <option value="low">Low Priority Scale</option>
              <option value="medium">Medium Priority Scale</option>
              <option value="high">High Priority Scale</option>
            </select>
          </div>
          <button 
            type="submit" 
            className="w-full bg-[#1e293b] hover:bg-slate-700 border border-slate-700 text-white text-sm font-semibold rounded-lg p-3 mt-2 cursor-pointer transition-colors"
          >
            Save Document Record
          </button>
        </div>
      </form>
    </div>
  );
}

export default TaskForm;