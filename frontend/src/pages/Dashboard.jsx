import { useState, useEffect } from 'react';
import api from '../services/api.jsx';

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [useAI, setUseAI] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'general',
    dueDate: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [successTimeout, setSuccessTimeout] = useState(null);

  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, [filter]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      let response;
      
      if (filter === 'all') {
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
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/tasks/stats/dashboard');
      setStats(response.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

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
      setSuccess(`Task broken into ${response.data.subtasks?.length || 0} subtasks!`);
      fetchTasks();
    } catch (err) {
      setError('Failed to break down task');
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

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['all', 'todo', 'in_progress', 'done', 'upcoming', 'overdue'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
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
