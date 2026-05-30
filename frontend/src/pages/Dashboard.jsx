import { useState, useEffect, useCallback, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, getDay, parse, startOfWeek } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import api from '../services/api.jsx';
import { supabase, getAuthUserId, initSupabase } from '../services/supabaseClient.jsx';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const calendarLocalizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { 'en-US': enUS }
});

function Dashboard({ onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [useAI, setUseAI] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryDraft, setCategoryDraft] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [categoryFilterError, setCategoryFilterError] = useState('');
  const [selectedPriorities, setSelectedPriorities] = useState([]);
  const [priorityMenuOpen, setPriorityMenuOpen] = useState(false);
  const [assistantTaskId, setAssistantTaskId] = useState(null);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'general',
    dueDate: '',
    reminderAt: '',
    estimatedHours: ''
  });
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'general',
    status: 'todo',
    dueDate: '',
    reminderAt: ''
  });
  const [editingTask, setEditingTask] = useState(null);
  const [realtimeActive, setRealtimeActive] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [editFormErrors, setEditFormErrors] = useState({});
  const [dailySummary, setDailySummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [smartSearchLoading, setSmartSearchLoading] = useState(false);
  const [smartSearchMessage, setSmartSearchMessage] = useState('');

  const getTodayInputValue = () => {
    const today = new Date();
    const offset = today.getTimezoneOffset() * 60000;
    return new Date(today.getTime() - offset).toISOString().split('T')[0];
  };

  const validateTaskForm = (data, aiMode = false) => {
    const errors = {};
    const title = data.title.trim();
    const description = data.description?.trim() || '';
    const category = data.category?.trim() || '';
    const allowedPriorities = ['low', 'medium', 'high', 'critical'];
    const allowedStatuses = ['todo', 'in_progress', 'done'];

    if (aiMode) {
      if (!title) errors.title = 'Describe the task before creating it.';
      else if (title.length < 5) errors.title = 'Description must be at least 5 characters.';
      else if (title.length > 1000) errors.title = 'Description must be 1000 characters or fewer.';
      return errors;
    }

    if (!title) errors.title = 'Title is required.';
    else if (title.length < 3) errors.title = 'Title must be at least 3 characters.';
    else if (title.length > 120) errors.title = 'Title must be 120 characters or fewer.';

    if (!allowedPriorities.includes(data.priority)) {
      errors.priority = 'Choose a valid priority.';
    }

    if (data.status && !allowedStatuses.includes(data.status)) {
      errors.status = 'Choose a valid status.';
    }

    if (!category) {
      errors.category = 'Category is required.';
    } else if (category.length > 50) {
      errors.category = 'Category must be 50 characters or fewer.';
    }

    if (description.length > 1000) {
      errors.description = 'Description must be 1000 characters or fewer.';
    }

    if (data.dueDate && data.dueDate < getTodayInputValue()) {
      errors.dueDate = 'Due date must be today or later.';
    }

    if (data.reminderAt) {
      const reminderDate = new Date(data.reminderAt);
      if (Number.isNaN(reminderDate.getTime())) {
        errors.reminderAt = 'Reminder must be a valid date and time.';
      } else if (data.dueDate && data.reminderAt.slice(0, 10) > data.dueDate) {
        errors.reminderAt = 'Reminder must be on or before the due date.';
      }
    }

    return errors;
  };

  const inputClassName = (field, errors = formErrors) => (
    `w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
      errors[field] ? 'border-red-500 bg-red-50' : 'border-gray-300'
    }`
  );

  const textareaClassName = (field, errors = formErrors) => (
    `w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-blue-500 ${
      errors[field] ? 'border-red-500 bg-red-50' : 'border-gray-300'
    }`
  );

  const FieldError = ({ message }) => (
    message ? <p className="mt-1 text-sm text-red-600">{message}</p> : null
  );

  const availableCategories = useMemo(() => {
    const categories = new Set();

    [...tasks, ...selectedCategories.map((category) => ({ category }))].forEach((task) => {
      const category = task.category?.toString().trim();
      if (category) categories.add(category);
    });

    return Array.from(categories).sort((a, b) => a.localeCompare(b));
  }, [tasks, selectedCategories]);

  const priorityOptions = [
    { value: 'critical', label: 'Critical' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ];

  const visibleTasks = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    const normalizedCategories = selectedCategories.map((category) => category.toLowerCase());

    return tasks.filter((task) => {
      const searchText = [
        task.title,
        task.description,
        task.category,
        task.priority,
        task.status,
        ...(task.subtasks || []).map((subtask) => `${subtask.title || ''} ${subtask.description || ''}`)
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch = !normalizedSearch || searchText.includes(normalizedSearch);
      const matchesCategory = normalizedCategories.length === 0
        || normalizedCategories.includes((task.category || '').toLowerCase());
      const matchesPriority = selectedPriorities.length === 0
        || selectedPriorities.includes(task.priority || 'medium');

      return matchesSearch && matchesCategory && matchesPriority;
    });
  }, [tasks, searchQuery, selectedCategories, selectedPriorities]);

  const assistantTask = useMemo(() => (
    tasks.find((task) => task.id === assistantTaskId) || visibleTasks[0] || null
  ), [tasks, assistantTaskId, visibleTasks]);

  const assistantRecommendation = useMemo(() => {
    if (!assistantTask) return null;

    const estimatedHours = assistantTask.estimated_hours || Math.max(
      2,
      Math.min(
        40,
        4 + (assistantTask.subtasks?.length || 0) * 2 + (assistantTask.priority === 'high' ? 6 : 0)
      )
    );

    const deadline = assistantTask.due_date
      ? new Date(assistantTask.due_date).toLocaleDateString()
      : new Date(Date.now() + Math.max(3, Math.min(21, Math.ceil(estimatedHours / 4))) * 86400000).toLocaleDateString();

    const suggestedSubtasks = assistantTask.subtasks?.length
      ? assistantTask.subtasks.slice(0, 4).map((subtask) => subtask.title || subtask.description)
      : [
        'Clarify goal and success metrics',
        'Define milestones and owners',
        'Prepare required materials',
        'Review progress and next steps'
      ];

    return {
      title: assistantTask.title,
      suggestedSubtasks,
      estimatedHours,
      priority: assistantTask.priority || 'medium',
      deadline
    };
  }, [assistantTask]);

  const toggleCategoryDraft = (category) => {
    setCategoryDraft((current) => (
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category]
    ));
    setCategoryFilterError('');
  };

  const togglePriority = (priority) => {
    setSelectedPriorities((current) => (
      current.includes(priority)
        ? current.filter((item) => item !== priority)
        : [...current, priority]
    ));
  };

  const kanbanColumns = [
    { status: 'todo', title: 'Todo', accent: 'border-t-blue-500' },
    { status: 'in_progress', title: 'In Progress', accent: 'border-t-yellow-500' },
    { status: 'done', title: 'Done', accent: 'border-t-green-500' }
  ];

  const kanbanTasks = useMemo(() => (
    kanbanColumns.reduce((groups, column) => {
      groups[column.status] = visibleTasks.filter((task) => task.status === column.status);
      return groups;
    }, {})
  ), [visibleTasks]);

  const calendarEvents = useMemo(() => (
    visibleTasks
      .filter((task) => task.due_date)
      .map((task) => {
        const start = new Date(task.due_date);
        const end = new Date(start.getTime() + 60 * 60 * 1000);
        return {
          id: task.id,
          title: task.title,
          start,
          end,
          resource: task
        };
      })
  ), [visibleTasks]);

  const calendarEventStyleGetter = (event) => {
    const task = event.resource || {};
    const backgroundColor = task.status === 'done'
      ? '#16a34a'
      : task.priority === 'critical'
        ? '#7f1d1d'
        : task.priority === 'high'
        ? '#dc2626'
        : task.priority === 'medium'
          ? '#d97706'
          : '#2563eb';

    return {
      style: {
        backgroundColor,
        border: 'none',
        borderRadius: '6px',
        color: '#fff',
        fontWeight: 700
      }
    };
  };

  const renderTaskCard = (task, compact = false, dragHandleProps = null) => {
    const visibleSubtasks = compact ? (task.subtasks || []).slice(0, 3) : (task.subtasks || []);
    const remainingSubtasks = Math.max((task.subtasks?.length || 0) - visibleSubtasks.length, 0);

    return (
    <div
      key={task.id}
      className={`group rounded-lg border border-gray-200 bg-white shadow-sm hover:border-blue-200 hover:shadow-md transition ${compact ? 'p-4 cursor-grab active:cursor-grabbing' : 'p-6'}`}
      {...(dragHandleProps || {})}
    >
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <button
            type="button"
            className="mt-1 h-8 w-8 shrink-0 rounded-full border border-gray-300 bg-white text-gray-500 flex items-center justify-center hover:border-blue-400 hover:text-blue-600 transition"
            title="Drag task"
          >
            {task.status === 'done' ? '✓' : task.status === 'in_progress' ? '⟳' : '○'}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <h3 className={`${compact ? 'text-base' : 'text-xl'} font-bold leading-snug text-gray-900 break-words`}>{task.title}</h3>
              <span className={`shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                task.priority === 'critical' ? 'bg-red-900 text-white' :
                task.priority === 'high' ? 'bg-red-100 text-red-700' :
                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {task.priority?.toUpperCase()}
              </span>
            </div>
            {task.description && (
              <p className="text-gray-600 text-sm mt-2 leading-relaxed line-clamp-3">{task.description}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
          {task.category && <span className="rounded-full bg-gray-100 px-2.5 py-1">📁 {task.category}</span>}
          {task.due_date && <span className="rounded-full bg-gray-100 px-2.5 py-1">📅 {new Date(task.due_date).toLocaleDateString()}</span>}
          {task.reminder_at && <span className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-700">🔔 {new Date(task.reminder_at).toLocaleString()}</span>}
          {task.estimated_hours && <span className="rounded-full bg-gray-100 px-2.5 py-1">⏱️ {task.estimated_hours}h</span>}
        </div>

        {task.subtasks?.length > 0 && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-600">Subtasks</p>
              <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-gray-500">{task.subtasks.length}</span>
            </div>
            <ul className="space-y-1.5 text-gray-600 text-sm">
              {visibleSubtasks.map((subtask) => (
                <li key={subtask.id} className="flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gray-400" />
                  <span className="leading-snug">{subtask.title || subtask.description}</span>
                </li>
              ))}
            </ul>
            {remainingSubtasks > 0 && (
              <p className="mt-2 text-xs font-semibold text-gray-500">+{remainingSubtasks} more</p>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-3">
          {task.status === 'todo' && (
            <>
              <button
                onClick={() => handleStatusChange(task.id, 'in_progress')}
                className="rounded-md bg-yellow-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-yellow-600 transition"
              >
                Start
              </button>
              <button
                onClick={() => handleBreakdown(task.id)}
                className="rounded-md bg-purple-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-purple-700 transition"
              >
                Break Down
              </button>
            </>
          )}
          {task.status === 'in_progress' && (
            <button
              onClick={() => handleStatusChange(task.id, 'done')}
              className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-700 transition"
            >
              Complete
            </button>
          )}
          {task.status === 'done' && (
            <button
              onClick={() => handleStatusChange(task.id, 'todo')}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition"
            >
              Reopen
            </button>
          )}
          <button
            onClick={() => startEdit(task)}
            className="rounded-md bg-slate-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-700 transition"
          >
            Edit
          </button>
          <button
            onClick={() => {
              setAssistantTaskId(task.id);
              setAssistantOpen(true);
            }}
            className="rounded-md bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition"
          >
            AI
          </button>
          <button
            onClick={() => handleDelete(task.id)}
            className="rounded-md bg-red-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-600 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
  };

  const renderAssistantPanel = (layout = 'rail') => {
    const isRail = layout === 'rail';

    if (!assistantOpen) {
      return (
        <div className={`${isRail ? '2xl:sticky 2xl:top-4 flex justify-end' : 'flex justify-end'}`}>
          <button
            type="button"
            onClick={() => setAssistantOpen(true)}
            className="group flex h-12 w-12 items-center justify-center rounded-lg bg-slate-900 text-xl text-white shadow-sm ring-1 ring-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Open AI Assistant"
            aria-label="Open AI Assistant"
          >
            <span className="transition group-hover:scale-110">🤖</span>
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
                {assistantRecommendation?.title || 'Plan Product Launch'}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setAssistantOpen(false)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-xl transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-blue-300"
              title="Collapse AI Assistant"
              aria-label="Collapse AI Assistant"
            >
              🤖
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              setShowForm(true);
              setUseAI(true);
              setFormData((current) => ({
                ...current,
                title: assistantRecommendation
                  ? `Plan ${assistantRecommendation.title}`
                  : 'Plan my product launch for next month'
              }));
            }}
            className="mt-4 w-full rounded-md bg-blue-500 px-4 py-2 text-sm font-bold text-white hover:bg-blue-400 transition"
          >
            Plan Product Launch
          </button>
        </div>

        {assistantRecommendation ? (
          <div className={`${isRail ? 'space-y-4 p-5' : 'grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_280px]'}`}>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-slate-900">Suggested subtasks</p>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-500">
                  {assistantRecommendation.suggestedSubtasks.length}
                </span>
              </div>
              <ul className="space-y-2 text-sm text-slate-700">
                {assistantRecommendation.suggestedSubtasks.map((subtask) => (
                  <li key={subtask} className="flex gap-2 leading-snug">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">✓</span>
                    <span>{subtask}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={`${isRail ? 'space-y-3' : 'grid gap-3 sm:grid-cols-3 lg:grid-cols-1'}`}>
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Estimated</p>
                <p className="mt-1 text-xl font-bold text-slate-900">{assistantRecommendation.estimatedHours}h</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Priority</p>
                <p className="mt-1 text-xl font-bold text-slate-900">{assistantRecommendation.priority.toUpperCase()}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Deadline</p>
                <p className="mt-1 text-base font-bold text-slate-900">{assistantRecommendation.deadline}</p>
              </div>
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
  };

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      let response;

      if (filter === 'all' || filter === 'calendar') {
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
  }, [filter]);

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
      .channel('tasks')
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

    console.info('Subscribing to Supabase channel: tasks');
    channel.subscribe((status) => {
      setRealtimeActive(status === 'SUBSCRIBED');
      if (status === 'SUBSCRIBED') {
        fetchTasks();
        fetchStats();
      }
    });

    return () => {
      supabase.removeChannel(channel);
      setRealtimeActive(false);
    };
  }, [fetchTasks, fetchStats]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormErrors((current) => ({ ...current, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const validationErrors = validateTaskForm(formData, useAI);

    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      setError(Object.values(validationErrors)[0]);
      return;
    }

    setFormErrors({});

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
          dueDate: formData.dueDate,
          reminderAt: formData.reminderAt || null,
          estimatedHours: formData.estimatedHours || null
        });
        setSuccess('Task created successfully!');
      }
      
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        category: 'general',
        dueDate: '',
        reminderAt: '',
        estimatedHours: ''
      });
      setPrediction(null);
      setShowForm(false);
      setUseAI(false);
      setFormErrors({});
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

  const handleDragEnd = async (result) => {
    const { destination, draggableId, source } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;

    const task = tasks.find((item) => String(item.id) === draggableId);
    if (!task || task.status === destination.droppableId) return;

    const previousTasks = tasks;
    const nextTasks = tasks.map((item) => (
      String(item.id) === draggableId ? { ...item, status: destination.droppableId } : item
    ));

    setTasks(nextTasks);
    setError('');

    try {
      await api.put(`/tasks/${draggableId}`, { status: destination.droppableId });
      setSuccess('Task moved!');
      fetchTasks();
      fetchStats();
    } catch (err) {
      setTasks(previousTasks);
      setError(err.response?.data?.message || 'Failed to move task');
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

  const handleDailySummary = async () => {
    setSummaryLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/tasks/ai/daily-summary');
      setDailySummary(response.data);
      setSuccess('Daily summary generated!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate daily summary');
    } finally {
      setSummaryLoading(false);
    }
  };

  const handlePredictTask = async () => {
    const title = formData.title.trim();
    if (!title) {
      setFormErrors((current) => ({ ...current, title: 'Enter a title before using AI prediction.' }));
      return;
    }

    setPredictionLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/tasks/ai/predict-task', {
        title: formData.title,
        description: formData.description
      });
      const nextPrediction = response.data;
      setPrediction(nextPrediction);
      setFormData((current) => ({
        ...current,
        priority: nextPrediction.priority || current.priority,
        category: nextPrediction.category || current.category,
        estimatedHours: nextPrediction.estimatedHours || current.estimatedHours
      }));
      setSuccess('AI prediction applied!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to predict task details');
    } finally {
      setPredictionLoading(false);
    }
  };

  const handleSmartSearch = async () => {
    const query = searchQuery.trim();
    if (!query) {
      setError('Enter a smart search query first.');
      return;
    }

    setSmartSearchLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/tasks/ai/smart-search', { query });
      const filters = response.data || {};
      const nextStatus = filters.status || 'all';
      const nextPriorities = (filters.priorities || []).filter((priority) => (
        priorityOptions.some((option) => option.value === priority)
      ));
      const categoryMatches = (filters.categories || [])
        .map((category) => {
          const match = availableCategories.find((item) => item.toLowerCase() === category.toLowerCase());
          return match || category;
        })
        .filter(Boolean);

      setFilter(nextStatus);
      setSelectedPriorities(nextPriorities);
      setCategoryDraft(categoryMatches);
      setSelectedCategories(categoryMatches.filter((category) => (
        availableCategories.some((item) => item.toLowerCase() === category.toLowerCase())
      )));
      setSearchQuery(filters.search || query);
      setSmartSearchMessage(filters.explanation || 'Smart filters applied.');
      setSuccess('Smart search filters applied!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to apply smart search');
    } finally {
      setSmartSearchLoading(false);
    }
  };

  const handleEditInputChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    setEditFormErrors((current) => ({ ...current, [e.target.name]: '' }));
  };

  const startEdit = (task) => {
    setEditingTask(task);
    setShowForm(false);
    setUseAI(false);
    setFormErrors({});
    setEditFormErrors({});
    setEditFormData({
      title: task.title || '',
      description: task.description || '',
      priority: task.priority || 'medium',
      category: task.category || 'general',
      status: task.status || 'todo',
      dueDate: task.due_date ? task.due_date.split('T')[0] : '',
      reminderAt: task.reminder_at ? task.reminder_at.slice(0, 16) : ''
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingTask) return;
    setError('');
    setSuccess('');
    const validationErrors = validateTaskForm(editFormData);

    if (Object.keys(validationErrors).length > 0) {
      setEditFormErrors(validationErrors);
      setError(Object.values(validationErrors)[0]);
      return;
    }

    setEditFormErrors({});

    try {
      await api.put(`/tasks/${editingTask.id}`, {
        title: editFormData.title,
        description: editFormData.description,
        priority: editFormData.priority,
        category: editFormData.category,
        status: editFormData.status,
        dueDate: editFormData.dueDate || null,
        reminderAt: editFormData.reminderAt || null
      });

      setSuccess('Task updated successfully!');
      setEditingTask(null);
      setEditFormData({
        title: '',
        description: '',
        priority: 'medium',
        category: 'general',
        status: 'todo',
        dueDate: '',
        reminderAt: ''
      });
      setEditFormErrors({});
      fetchTasks();
      fetchStats();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1760px] flex-col gap-5 px-8 py-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-2xl text-blue-600">TM</div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-slate-950">Tasks</h1>
                <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${
                  realtimeActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  <span className={`h-2 w-2 rounded-full ${realtimeActive ? 'bg-green-500' : 'bg-red-500'}`} />
                  Realtime {realtimeActive ? 'Active' : 'Disabled'}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Manage task planning, AI assistance, due dates, reminders, and calendar work.
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
            >
              {showForm ? 'Cancel' : '+ New Task'}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1760px] px-8 py-8">
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
                    onChange={(e) => {
                      setUseAI(e.target.checked);
                      setError('');
                      setFormErrors({});
                    }}
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
                    className={textareaClassName('title')}
                    aria-invalid={!!formErrors.title}
                    rows="4"
                    placeholder="Be descriptive! The more details, the better AI suggestions..."
                    required
                  />
                  <FieldError message={formErrors.title} />
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
                        className={inputClassName('title')}
                        aria-invalid={!!formErrors.title}
                        required
                      />
                      <FieldError message={formErrors.title} />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-bold mb-2">Priority</label>
                      <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        className={inputClassName('priority')}
                        aria-invalid={!!formErrors.priority}
                      >
                        <option value="critical">Critical</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                      <FieldError message={formErrors.priority} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-gray-700 font-bold mb-2">Category *</label>
                      <input
                        type="text"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className={inputClassName('category')}
                        aria-invalid={!!formErrors.category}
                        placeholder="e.g., work, personal, health"
                      />
                      <FieldError message={formErrors.category} />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-bold mb-2">Due Date</label>
                      <input
                        type="date"
                        name="dueDate"
                        value={formData.dueDate}
                        onChange={handleInputChange}
                        className={inputClassName('dueDate')}
                        aria-invalid={!!formErrors.dueDate}
                        min={getTodayInputValue()}
                      />
                      <FieldError message={formErrors.dueDate} />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-bold mb-2">Reminder</label>
                      <input
                        type="datetime-local"
                        name="reminderAt"
                        value={formData.reminderAt}
                        onChange={handleInputChange}
                        className={inputClassName('reminderAt')}
                        aria-invalid={!!formErrors.reminderAt}
                      />
                      <FieldError message={formErrors.reminderAt} />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className={textareaClassName('description')}
                      aria-invalid={!!formErrors.description}
                      rows="3"
                      placeholder="Add more details..."
                    />
                    <FieldError message={formErrors.description} />
                  </div>

                  <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-bold text-gray-900">AI Priority Prediction</p>
                        <p className="text-sm text-gray-600">Suggest priority, estimated time, and category from the task text.</p>
                      </div>
                      <button
                        type="button"
                        onClick={handlePredictTask}
                        disabled={predictionLoading}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {predictionLoading ? 'Predicting...' : 'Predict with AI'}
                      </button>
                    </div>
                    {prediction && (
                      <div className="mt-4 grid gap-3 md:grid-cols-3">
                        <div className="rounded-lg bg-white p-3">
                          <p className="text-xs font-bold uppercase text-gray-500">Priority</p>
                          <p className="mt-1 text-lg font-bold text-gray-900">{prediction.priority?.toUpperCase()}</p>
                        </div>
                        <div className="rounded-lg bg-white p-3">
                          <p className="text-xs font-bold uppercase text-gray-500">Estimated Time</p>
                          <p className="mt-1 text-lg font-bold text-gray-900">{prediction.estimatedHours} hours</p>
                        </div>
                        <div className="rounded-lg bg-white p-3">
                          <p className="text-xs font-bold uppercase text-gray-500">Category</p>
                          <p className="mt-1 text-lg font-bold text-gray-900">{prediction.category}</p>
                        </div>
                      </div>
                    )}
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

        <section className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(280px,1.4fr)_minmax(220px,0.9fr)_minmax(180px,0.7fr)_auto_auto_auto] xl:items-end">
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Search tasks</label>
              <div className="flex gap-2">
                <input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setSmartSearchMessage(''); }} placeholder='Try "Show all overdue frontend tasks"' className="h-11 min-w-0 flex-1 rounded-lg border border-gray-300 px-4 focus:outline-none focus:border-blue-500" />
                <button type="button" onClick={handleSmartSearch} disabled={smartSearchLoading} className="h-11 shrink-0 rounded-lg bg-slate-900 px-4 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">{smartSearchLoading ? 'Applying...' : 'Smart'}</button>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Categories</label>
              <div className="relative">
                <button type="button" onClick={() => setCategoryMenuOpen((open) => !open)} className={categoryFilterError ? 'flex h-11 w-full items-center justify-between gap-3 rounded-lg border border-red-500 bg-red-50 px-4 text-left focus:outline-none focus:border-blue-500' : 'flex h-11 w-full items-center justify-between gap-3 rounded-lg border border-gray-300 bg-white px-4 text-left focus:outline-none focus:border-blue-500'} aria-expanded={categoryMenuOpen} aria-invalid={!!categoryFilterError}>
                  <span className={categoryDraft.length ? 'truncate text-gray-900' : 'truncate text-gray-400'}>{categoryDraft.length ? categoryDraft.length + ' selected' : 'Select categories'}</span>
                  <span className="shrink-0 text-gray-500">{categoryMenuOpen ? '▲' : '▼'}</span>
                </button>
                {categoryMenuOpen && (
                  <div className="absolute z-20 mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
                    <div className="max-h-56 overflow-y-auto p-2">
                      {availableCategories.length === 0 ? <p className="px-3 py-2 text-sm text-gray-500">No categories yet</p> : availableCategories.map((category) => (
                        <label key={category} className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-blue-50">
                          <input type="checkbox" checked={categoryDraft.includes(category)} onChange={() => toggleCategoryDraft(category)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                          <span>{category}</span>
                        </label>
                      ))}
                    </div>
                    {availableCategories.length > 0 && <div className="flex items-center justify-between border-t border-gray-100 px-3 py-2"><button type="button" onClick={() => { setCategoryDraft(availableCategories); setCategoryFilterError(''); }} className="text-sm font-semibold text-blue-600 hover:text-blue-700">Select all</button><button type="button" onClick={() => setCategoryDraft([])} className="text-sm font-semibold text-gray-600 hover:text-gray-800">Clear</button></div>}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Priority</label>
              <div className="relative">
                <button type="button" onClick={() => setPriorityMenuOpen((open) => !open)} className="flex h-11 w-full items-center justify-between gap-3 rounded-lg border border-gray-300 bg-white px-4 text-left focus:outline-none focus:border-blue-500" aria-expanded={priorityMenuOpen}>
                  <span className={selectedPriorities.length ? 'truncate text-gray-900' : 'truncate text-gray-400'}>{selectedPriorities.length ? selectedPriorities.length + ' selected' : 'Select priority'}</span>
                  <span className="shrink-0 text-gray-500">{priorityMenuOpen ? '▲' : '▼'}</span>
                </button>
                {priorityMenuOpen && <div className="absolute z-20 mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-lg"><div className="p-2">{priorityOptions.map((priority) => <label key={priority.value} className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-blue-50"><input type="checkbox" checked={selectedPriorities.includes(priority.value)} onChange={() => togglePriority(priority.value)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" /><span>{priority.label}</span></label>)}</div></div>}
              </div>
            </div>

            <button type="button" onClick={() => { if (categoryDraft.length === 0) { setCategoryFilterError('Select at least one category before applying.'); return; } setSelectedCategories(categoryDraft); setCategoryMenuOpen(false); setCategoryFilterError(''); }} className="h-11 rounded-lg bg-blue-600 px-5 text-sm font-bold text-white transition hover:bg-blue-700">Apply</button>
            <button type="button" onClick={() => { setSearchQuery(''); setSelectedCategories([]); setCategoryDraft([]); setCategoryMenuOpen(false); setSelectedPriorities([]); setPriorityMenuOpen(false); setCategoryFilterError(''); setSmartSearchMessage(''); }} className="h-11 rounded-lg bg-gray-200 px-5 text-sm font-semibold text-gray-700 transition hover:bg-gray-300">Clear</button>
            <button type="button" onClick={handleDailySummary} disabled={summaryLoading} className="h-11 rounded-lg bg-slate-900 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">{summaryLoading ? 'Generating...' : 'Daily Summary'}</button>
          </div>

          {(smartSearchMessage || selectedCategories.length > 0 || selectedPriorities.length > 0 || searchQuery.trim() || categoryFilterError) && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              {smartSearchMessage && <span className="text-blue-700">{smartSearchMessage}</span>}
              {categoryFilterError && <span className="text-red-600">{categoryFilterError}</span>}
              {(selectedCategories.length > 0 || selectedPriorities.length > 0 || searchQuery.trim()) && (
                <span className="text-gray-600">Showing {visibleTasks.length} of {tasks.length} tasks</span>
              )}
            </div>
          )}

          <div className="mt-4 flex gap-2 overflow-x-auto border-t border-slate-100 pt-4">
            {['all', 'calendar', 'todo', 'in_progress', 'done', 'upcoming', 'overdue'].map((f) => <button key={f} onClick={() => { setFilter(f); }} className={filter === f ? 'rounded-full px-5 py-2 text-sm font-semibold whitespace-nowrap transition bg-blue-600 text-white shadow' : 'rounded-full px-5 py-2 text-sm font-semibold whitespace-nowrap transition bg-white text-gray-700 border border-gray-300 hover:border-blue-500'}>{f === 'in_progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}</button>)}
          </div>
        </section>

        {dailySummary && (
          <section className="mb-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-slate-900 px-5 py-4 text-white">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-blue-200">AI Daily Summary</p>
                <h2 className="mt-1 text-xl font-bold">{dailySummary.heading || 'Today'}:</h2>
              </div>
              <button
                type="button"
                onClick={() => setDailySummary(null)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-lg font-bold text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-blue-300"
                title="Close daily summary"
                aria-label="Close daily summary"
              >
                ×
              </button>
            </div>
            <div className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_220px]">
              <div>
                <ul className="space-y-2 text-slate-700">
                  {(dailySummary.items || []).map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Estimated effort</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {dailySummary.estimatedHours || 0} hours
                </p>
              </div>
            </div>
          </section>
        )}

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
                    onChange={handleEditInputChange}
                    className={inputClassName('title', editFormErrors)}
                    aria-invalid={!!editFormErrors.title}
                    required
                  />
                  <FieldError message={editFormErrors.title} />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-2">Status</label>
                  <select
                    name="status"
                    value={editFormData.status}
                    onChange={handleEditInputChange}
                    className={inputClassName('status', editFormErrors)}
                    aria-invalid={!!editFormErrors.status}
                  >
                    <option value="todo">Todo</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                  <FieldError message={editFormErrors.status} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 font-bold mb-2">Priority</label>
                  <select
                    name="priority"
                    value={editFormData.priority}
                    onChange={handleEditInputChange}
                    className={inputClassName('priority', editFormErrors)}
                    aria-invalid={!!editFormErrors.priority}
                  >
                    <option value="critical">Critical</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                  <FieldError message={editFormErrors.priority} />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-2">Category *</label>
                  <input
                    type="text"
                    name="category"
                    value={editFormData.category}
                    onChange={handleEditInputChange}
                    className={inputClassName('category', editFormErrors)}
                    aria-invalid={!!editFormErrors.category}
                  />
                  <FieldError message={editFormErrors.category} />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-2">Due Date</label>
                  <input
                    type="date"
                    name="dueDate"
                    value={editFormData.dueDate}
                    onChange={handleEditInputChange}
                    className={inputClassName('dueDate', editFormErrors)}
                    aria-invalid={!!editFormErrors.dueDate}
                    min={getTodayInputValue()}
                  />
                  <FieldError message={editFormErrors.dueDate} />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-2">Reminder</label>
                  <input
                    type="datetime-local"
                    name="reminderAt"
                    value={editFormData.reminderAt}
                    onChange={handleEditInputChange}
                    className={inputClassName('reminderAt', editFormErrors)}
                    aria-invalid={!!editFormErrors.reminderAt}
                  />
                  <FieldError message={editFormErrors.reminderAt} />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">Description</label>
                <textarea
                  name="description"
                  value={editFormData.description}
                  onChange={handleEditInputChange}
                  className={textareaClassName('description', editFormErrors)}
                  aria-invalid={!!editFormErrors.description}
                  rows="4"
                />
                <FieldError message={editFormErrors.description} />
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
        ) : visibleTasks.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow text-center">
            <p className="text-gray-600 text-lg">No tasks match your search or category filters.</p>
          </div>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-4 flex flex-col gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {filter === 'all'
                        ? 'Kanban Board'
                        : filter === 'calendar'
                          ? 'Calendar View'
                          : `${filter === 'in_progress' ? 'In Progress' : filter.charAt(0).toUpperCase() + filter.slice(1)} Tasks`}
                    </h2>
                    <p className="text-sm text-slate-500">
                      {visibleTasks.length} task{visibleTasks.length === 1 ? '' : 's'} in view
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                      {filter === 'all'
                        ? 'Drag tasks between columns'
                        : filter === 'calendar'
                          ? `${calendarEvents.length} due date${calendarEvents.length === 1 ? '' : 's'}`
                          : 'Filtered task list'}
                    </span>
                    {!assistantOpen && (
                      <button
                        type="button"
                        onClick={() => setAssistantOpen(true)}
                        className="group flex h-11 w-11 items-center justify-center rounded-lg bg-slate-900 text-xl text-white shadow-sm ring-1 ring-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        title="Open AI Assistant"
                        aria-label="Open AI Assistant"
                      >
                        <span className="transition group-hover:scale-110">🤖</span>
                      </button>
                    )}
                  </div>
                </div>

                {assistantOpen && (
                  <div className="mb-5">
                    {renderAssistantPanel('strip')}
                  </div>
                )}

                {filter === 'calendar' ? (
                  <div className="h-[680px] rounded-lg border border-slate-200 bg-white p-3">
                    <Calendar
                      localizer={calendarLocalizer}
                      events={calendarEvents}
                      startAccessor="start"
                      endAccessor="end"
                      eventPropGetter={calendarEventStyleGetter}
                      onSelectEvent={(event) => {
                        setAssistantTaskId(event.resource.id);
                        setAssistantOpen(true);
                      }}
                      views={['month', 'week', 'day', 'agenda']}
                      popup
                    />
                  </div>
                ) : filter === 'all' ? (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
              {kanbanColumns.map((column) => (
                <Droppable droppableId={column.status} key={column.status}>
                  {(provided, snapshot) => (
                    <section
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`rounded-lg border border-gray-200 border-t-4 ${column.accent} bg-slate-50/80 min-h-[320px] overflow-hidden ${
                        snapshot.isDraggingOver ? 'ring-2 ring-blue-300 bg-blue-50/80' : ''
                      }`}
                    >
                      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur px-4 py-3 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-700">{column.title}</h2>
                          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-600">
                            {kanbanTasks[column.status]?.length || 0}
                          </span>
                        </div>
                      </div>
                      <div className="p-3 space-y-3">
                        {kanbanTasks[column.status]?.length ? (
                          kanbanTasks[column.status].map((task, index) => (
                            <Draggable draggableId={String(task.id)} index={index} key={task.id}>
                              {(dragProvided, dragSnapshot) => (
                                <div
                                  ref={dragProvided.innerRef}
                                  {...dragProvided.draggableProps}
                                  className={dragSnapshot.isDragging ? 'rotate-1 shadow-xl' : ''}
                                >
                                  {renderTaskCard(task, true, dragProvided.dragHandleProps)}
                                </div>
                              )}
                            </Draggable>
                          ))
                        ) : (
                          <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
                            No {column.title.toLowerCase()} tasks
                          </div>
                        )}
                        {provided.placeholder}
                      </div>
                    </section>
                  )}
                </Droppable>
              ))}
            </div>
          </DragDropContext>
        ) : (
          <div className="space-y-3">
            {visibleTasks.map((task) => renderTaskCard(task))}
          </div>
        )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
