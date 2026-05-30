import { useState, useEffect, useCallback } from 'react';
import api from '../services/api.jsx';
import { supabase, getAuthUserId, initSupabase } from '../services/supabaseClient.jsx';

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [useAI, setUseAI] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [categoryInput, setCategoryInput] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stats, setStats] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'general',
    dueDate: ''
  });
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'general',
    status: 'todo',
    dueDate: ''
  });
  const [editingTask, setEditingTask] = useState(null);
  const [realtimeActive, setRealtimeActive] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      let response;

      if (categoryFilter) {
        response = await api.get(`/tasks/category/${encodeURIComponent(categoryFilter)}`);
      } else if (filter === 'all') {
        response = await api.get('/tasks');
      } else if (filter === 'upcoming') {
        response = await api.get('/tasks/upcoming/all');
      } else if (filter === 'overdue') {
        response = await api.get('/tasks/overdue/all');
      } else {
        response = await api.get(`/tasks/status/${filter}`);
      }

      setTasks(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tasks');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [filter, categoryFilter]);

useEffect(() => {
  const channel = supabase
    .channel('tasks')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tasks',
      },
      () => {
        fetchTasks();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get('/tasks/stats/dashboard');
      setStats(response.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, [fetchTasks, fetchStats]);

  useEffect(() => {
    // Ensure supabase client is initialized at runtime (uses VITE env or window globals)
    try {
      // lazy init in case user provided window.__SUPABASE_URL keys at runtime
      if (!supabase) initSupabase();
    } catch (e) {
      console.warn('Supabase init failed', e);
    }

    if (!supabase) return undefined;

    const userId = getAuthUserId();
    const channel = supabase
      .channel('task-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        (payload) => {
            console.debug('Supabase tasks payload received', payload);
            const record = payload.record || payload.new;
            const oldRecord = payload.old || payload.record;

            if (!userId) return;
            if (record?.user_id !== userId && oldRecord?.user_id !== userId) return;

            fetchTasks();
            fetchStats();
          }
      );
    // Also listen for subtask changes so UI updates when subtasks are added/modified
    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'subtasks' },
      async (payload) => {
        console.debug('Supabase subtasks payload received', payload);
        const record = payload.record || payload.new;
        const oldRecord = payload.old || payload.record;

        if (!userId) return;

        // Subtasks don't have user_id; resolve the parent task to verify ownership
        const taskId = record?.task_id || oldRecord?.task_id;
        if (!taskId) {
          fetchTasks();
          fetchStats();
          return;
        }

        try {
          const resp = await api.get(`/tasks/${taskId}`);
          const task = resp.data;
          console.debug('Resolved parent task for subtask event', { taskId, task });
          if (task?.user_id === userId) {
            fetchTasks();
            fetchStats();
          }
        } catch (err) {
          // If we can't verify, fall back to refreshing to keep UI consistent
          console.warn('Failed to resolve parent task for subtask event', err);
          fetchTasks();
          fetchStats();
        }
      }
    );

    console.info('Subscribing to Supabase channel: task-updates');
    console.debug('Channel object (before subscribe):', channel);
    const sub = channel.subscribe();
    console.debug('Subscribe returned:', sub);
    // Inspect channel state shortly after subscribing
    setTimeout(() => {
      try {
        console.debug('Channel state after subscribe:', channel);
      } catch (e) {
        console.debug('Unable to inspect channel state', e);
      }
    }, 500);
    setRealtimeActive(true);

    return () => {
      supabase.removeChannel(channel);
      setRealtimeActive(false);
    };
  }, [fetchTasks, fetchStats]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (useAI) {
        // Use natural language creation
        await api.post('/tasks/natural-language/create', {
          input: formData.title
        });
        setSuccess('Task created with AI assistance!');
      } else {
        // Regular task creation
        await api.post('/tasks', {
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          category: formData.category,
          dueDate: formData.dueDate
        });
        setSuccess('Task created successfully!');
      }
      
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        category: 'general',
        dueDate: ''
      });
      setShowForm(false);
      setUseAI(false);
      fetchTasks();
      fetchStats();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/tasks/${id}`);
        setSuccess('Task deleted successfully!');
        fetchTasks();
        fetchStats();
      } catch (err) {
        setError('Failed to delete task');
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/tasks/${id}`, { status: newStatus });
      setSuccess('Task updated!');
      fetchTasks();
      fetchStats();
    } catch (err) {
      setError('Failed to update task');
    }
  };

  const handleBreakdown = async (id) => {
    try {
      const response = await api.post(`/tasks/${id}/breakdown`);
      setSuccess(`Task broken into ${response.data.subtasks?.length || 0} subtasks! ${response.data.message || ''}`.trim());
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to break down task');
    }
  };

  const startEdit = (task) => {
    setEditingTask(task);
    setShowForm(false);
    setUseAI(false);
    setEditFormData({
      title: task.title || '',
      description: task.description || '',
      priority: task.priority || 'medium',
      category: task.category || 'general',
      status: task.status || 'todo',
      dueDate: task.due_date ? task.due_date.split('T')[0] : ''
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingTask) return;
    setError('');
    setSuccess('');

    try {
      await api.put(`/tasks/${editingTask.id}`, {
        title: editFormData.title,
        description: editFormData.description,
        priority: editFormData.priority,
        category: editFormData.category,
        status: editFormData.status,
        dueDate: editFormData.dueDate || null
      });

      setSuccess('Task updated successfully!');
      setEditingTask(null);
      setEditFormData({
        title: '',
        description: '',
        priority: 'medium',
        category: 'general',
        status: 'todo',
        dueDate: ''
      });
      fetchTasks();
      fetchStats();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🎯 TaskMaster AI</h1>
            <p className="text-gray-600 text-sm">Intelligent Task Management</p>
            <p className="text-xs mt-1 text-gray-500">
              Realtime updates: <span className={realtimeActive ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{realtimeActive ? 'Active' : 'Disabled'}</span>
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-blue-700 transition shadow"
            >
              {showForm ? '✕ Cancel' : '+ New Task'}
            </button>
            <button
              onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }}
              className="bg-gray-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-gray-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
              <p className="text-gray-600 text-sm font-semibold uppercase">Total Tasks</p>
              <p className="text-4xl font-bold text-blue-600 mt-2">{stats.total || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
              <p className="text-gray-600 text-sm font-semibold uppercase">In Progress</p>
              <p className="text-4xl font-bold text-yellow-600 mt-2">{stats.in_progress || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
              <p className="text-gray-600 text-sm font-semibold uppercase">Completed</p>
              <p className="text-4xl font-bold text-green-600 mt-2">{stats.completed || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
              <p className="text-gray-600 text-sm font-semibold uppercase">High Priority</p>
              <p className="text-4xl font-bold text-red-600 mt-2">{stats.high_priority || 0}</p>
            </div>
          </div>
        )}

        {/* Messages */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        {/* Create Task Form */}
        {showForm && (
          <div className="bg-white p-8 rounded-lg shadow-lg mb-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Create New Task</h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useAI}
                    onChange={(e) => setUseAI(e.target.checked)}
                    className="w-5 h-5 mr-3 cursor-pointer"
                  />
                  <span className="text-lg font-semibold text-gray-700">🤖 Use AI to create task</span>
                </label>
                <p className="text-sm text-gray-500 mt-2 ml-8">
                  Example: "Plan my product launch for next month"
                </p>
              </div>

              {useAI ? (
                <div className="mb-6">
                  <label className="block text-gray-700 font-bold mb-2">Describe your task</label>
                  <textarea
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    rows="4"
                    placeholder="Be descriptive! The more details, the better AI suggestions..."
                    required
                  />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-gray-700 font-bold mb-2">Title *</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-bold mb-2">Priority</label>
                      <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-gray-700 font-bold mb-2">Category</label>
                      <input
                        type="text"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        placeholder="e.g., work, personal, health"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-bold mb-2">Due Date</label>
                      <input
                        type="date"
                        name="dueDate"
                        value={formData.dueDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      rows="3"
                      placeholder="Add more details..."
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                className="bg-blue-600 text-white font-bold px-8 py-3 rounded-lg hover:bg-blue-700 transition w-full md:w-auto"
              >
                {useAI ? '✨ Create with AI' : '✅ Create Task'}
              </button>
            </form>
          </div>
        )}

        <div className="flex flex-wrap gap-4 mb-6 items-center">
          <div className="flex gap-2 items-center flex-wrap">
            <input
              type="text"
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value)}
              placeholder="Filter by category"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={() => {
                const normalized = categoryInput.trim();
                if (normalized) {
                  setCategoryFilter(normalized);
                  setFilter('all');
                }
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Apply
            </button>
            <button
              onClick={() => {
                setCategoryFilter('');
                setCategoryInput('');
              }}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              Clear
            </button>
          </div>
          {categoryFilter && (
            <div className="text-sm text-gray-600">Showing tasks in category: <span className="font-semibold">{categoryFilter}</span></div>
          )}
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['all', 'todo', 'in_progress', 'done', 'upcoming', 'overdue'].map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f);
                if (categoryFilter) {
                  setCategoryFilter('');
                  setCategoryInput('');
                }
              }}
              className={`px-6 py-2 rounded-full font-semibold whitespace-nowrap transition ${
                filter === f
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-500'
              }`}
            >
              {f === 'in_progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {editingTask && (
          <div className="bg-white p-8 rounded-lg shadow-lg mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Edit Task</h2>
                <p className="text-sm text-gray-500">Update task details and category, then save your changes.</p>
              </div>
              <button
                onClick={() => setEditingTask(null)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
              >
                Cancel Edit
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 font-bold mb-2">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({ ...editFormData, [e.target.name]: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-2">Status</label>
                  <select
                    name="status"
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, [e.target.name]: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="todo">Todo</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 font-bold mb-2">Priority</label>
                  <select
                    name="priority"
                    value={editFormData.priority}
                    onChange={(e) => setEditFormData({ ...editFormData, [e.target.name]: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-2">Category</label>
                  <input
                    type="text"
                    name="category"
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, [e.target.name]: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-2">Due Date</label>
                  <input
                    type="date"
                    name="dueDate"
                    value={editFormData.dueDate}
                    onChange={(e) => setEditFormData({ ...editFormData, [e.target.name]: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">Description</label>
                <textarea
                  name="description"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, [e.target.name]: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  rows="4"
                />
              </div>
              <div className="flex flex-col md:flex-row items-center gap-3">
                <button
                  type="submit"
                  className="bg-green-600 text-white font-bold px-8 py-3 rounded-lg hover:bg-green-700 transition"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="bg-gray-200 text-gray-700 font-semibold px-8 py-3 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tasks List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow text-center">
            <p className="text-gray-600 text-lg">No tasks yet. Create one to get started! 🚀</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="text-2xl">
                        {task.status === 'done' ? '✓' : task.status === 'in_progress' ? '⟳' : '○'}
                      </span>
                      <h3 className="text-xl font-bold text-gray-900">{task.title}</h3>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                        task.priority === 'high' ? 'bg-red-100 text-red-800' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {task.priority?.toUpperCase()}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-gray-600 text-sm mb-2">{task.description}</p>
                    )}
                    <div className="flex gap-4 text-sm text-gray-500 flex-wrap">
                      {task.category && <span>📁 {task.category}</span>}
                      {task.due_date && <span>📅 {new Date(task.due_date).toLocaleDateString()}</span>}
                      {task.estimated_hours && <span>⏱️ {task.estimated_hours}h</span>}
                    </div>

                    {task.subtasks?.length > 0 && (
                      <div className="mt-4 rounded-lg bg-gray-50 border border-gray-200 p-4">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Subtasks ({task.subtasks.length})</p>
                        <ul className="space-y-2 text-gray-600 text-sm">
                          {task.subtasks.map((subtask) => (
                            <li key={subtask.id} className="flex items-center gap-2">
                              <span className="text-gray-400">•</span>
                              <span>{subtask.title || subtask.description}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 flex-wrap justify-end">
                    {task.status === 'todo' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(task.id, 'in_progress')}
                          className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600 transition"
                        >
                          Start
                        </button>
                        <button
                          onClick={() => handleBreakdown(task.id)}
                          className="bg-purple-500 text-white px-3 py-1 rounded text-sm hover:bg-purple-600 transition"
                        >
                          🤖 Break Down
                        </button>
                      </>
                    )}
                    {task.status === 'in_progress' && (
                      <button
                        onClick={() => handleStatusChange(task.id, 'done')}
                        className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition"
                      >
                        Complete
                      </button>
                    )}
                    {task.status === 'done' && (
                      <button
                        onClick={() => handleStatusChange(task.id, 'todo')}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition"
                      >
                        Reopen
                      </button>
                    )}
                    <button
                      onClick={() => startEdit(task)}
                      className="bg-slate-600 text-white px-3 py-1 rounded text-sm hover:bg-slate-700 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
