import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import api from '../services/api.jsx';
import StatCard from '../components/dashboard/StatCard.jsx';
import useTaskRealtime from '../hooks/useTaskRealtime.jsx';

const completionColors = ['#16a34a', '#f59e0b', '#2563eb'];
const categoryColors = ['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#7c3aed', '#0891b2'];

function DashboardHome() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [tasksResponse, statsResponse] = await Promise.all([
        api.get('/tasks'),
        api.get('/tasks/stats/dashboard')
      ]);

      setTasks(tasksResponse.data || []);
      setStats(statsResponse.data || null);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useTaskRealtime({
    channelName: 'dashboard-tasks',
    onRefresh: fetchDashboardData
  });

  const analytics = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const completed = tasks.filter((task) => task.status === 'done').length;
    const inProgress = tasks.filter((task) => task.status === 'in_progress').length;
    const pending = tasks.filter((task) => task.status !== 'done').length;
    const overdue = tasks.filter((task) => {
      if (!task.due_date || task.status === 'done') return false;
      const dueDate = new Date(task.due_date);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate < today;
    }).length;

    const completionData = [
      { name: 'Completed', value: completed },
      { name: 'Pending', value: Math.max(pending - inProgress, 0) },
      { name: 'In Progress', value: inProgress }
    ].filter((item) => item.value > 0);

    const categoryCounts = tasks.reduce((acc, task) => {
      const category = task.category || 'general';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    const categoryData = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([category, count]) => ({ category, count }));

    const weeklyData = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));
      const key = date.toISOString().slice(0, 10);

      return {
        key,
        day: date.toLocaleDateString(undefined, { weekday: 'short' }),
        created: tasks.filter((task) => (task.created_at || '').slice(0, 10) === key).length,
        completed: tasks.filter((task) => {
          const completedDate = (task.completed_at || task.updated_at || task.created_at || '').slice(0, 10);
          return task.status === 'done' && completedDate === key;
        }).length
      };
    });

    return {
      total: stats?.total ?? tasks.length,
      completed: stats?.completed ?? completed,
      pending,
      overdue,
      completionRate: tasks.length ? Math.round((completed / tasks.length) * 100) : 0,
      completionData: completionData.length ? completionData : [{ name: 'No tasks', value: 1 }],
      categoryData,
      weeklyData
    };
  }, [tasks, stats]);

  const highPriorityTasks = useMemo(() => (
    tasks.filter((task) => task.priority === 'high').slice(0, 5)
  ), [tasks]);

  const statCards = [
    { label: 'Total Tasks', value: analytics.total, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Completed Tasks', value: analytics.completed, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Pending Tasks', value: analytics.pending, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Overdue Tasks', value: analytics.overdue, color: 'text-red-600', bg: 'bg-red-50' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="mx-auto flex max-w-[1840px] flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 text-sm">Task analytics, completion trends, and workload overview</p>
          </div>
          <Link
            to="/tasks"
            className="bg-blue-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-blue-700 transition shadow text-center"
          >
            Open Tasks
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-[1840px] px-4 py-8">
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-600">Loading dashboard...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {statCards.map((card) => (
                <StatCard key={card.label} {...card} />
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[380px_minmax(0,1fr)] gap-6 mb-6">
              <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Task Completion Rate</h2>
                    <p className="text-sm text-gray-500">Completed versus open work</p>
                  </div>
                  <span className="rounded-full bg-green-50 px-3 py-1 text-sm font-bold text-green-700">
                    {analytics.completionRate}%
                  </span>
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={analytics.completionData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={100} paddingAngle={3}>
                        {analytics.completionData.map((entry, index) => (
                          <Cell key={entry.name} fill={completionColors[index % completionColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Tasks by Category</h2>
                    <p className="text-sm text-gray-500">Top categories by task volume</p>
                  </div>
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.categoryData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="category" tickLine={false} axisLine={false} />
                      <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {analytics.categoryData.map((entry, index) => (
                          <Cell key={entry.category} fill={categoryColors[index % categoryColors.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_380px] gap-6">
              <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Weekly Productivity</h2>
                    <p className="text-sm text-gray-500">Created and completed tasks over the last 7 days</p>
                  </div>
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.weeklyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="day" tickLine={false} axisLine={false} />
                      <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="created" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="completed" stroke="#16a34a" strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-bold text-gray-900">High Priority Focus</h2>
                  <Link to="/tasks" className="text-sm font-semibold text-blue-600 hover:text-blue-700">View all</Link>
                </div>
                {highPriorityTasks.length ? (
                  <div className="space-y-3">
                    {highPriorityTasks.map((task) => (
                      <div key={task.id} className="rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="font-bold text-gray-900">{task.title}</h3>
                          <span className="text-xs font-bold px-2 py-1 rounded-full bg-red-100 text-red-800">HIGH</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">{task.category || 'general'} - {task.status || 'todo'}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No high priority tasks right now.</p>
                )}
              </section>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default DashboardHome;
