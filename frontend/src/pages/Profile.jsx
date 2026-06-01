import { useState } from 'react';
import { updateUser } from '../services/api.jsx';

function Profile({ user = {}, onUserUpdate }) {
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || ''
  });
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
    setStatus('');
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      setError('Name and email are required.');
      return;
    }

    if (!user.id) {
      setError('Profile cannot be updated because the user id is missing.');
      return;
    }

    try {
      setSaving(true);
      const response = await updateUser(user.id, {
        name: formData.name.trim(),
        email: formData.email.trim()
      });
      const nextUser = response.data.user || { ...user, ...formData };
      onUserUpdate(nextUser);
      setStatus('Profile updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1840px] px-4 py-7">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">Profile</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your TaskMaster account details.</p>
        </div>
      </div>

      <main className="mx-auto grid max-w-[1840px] gap-6 px-4 py-8 lg:grid-cols-[360px_minmax(0,1fr)]">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50 text-2xl font-bold text-blue-700">
            {(user.name || user.email || 'U').slice(0, 2).toUpperCase()}
          </div>
          <h2 className="mt-5 text-xl font-bold text-slate-950">{user.name || 'TaskMaster User'}</h2>
          <p className="mt-1 text-sm text-slate-500">{user.email || 'No email available'}</p>
          <div className="mt-5 rounded-lg bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Role</p>
            <p className="mt-1 font-semibold capitalize text-slate-900">{user.role || 'user'}</p>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">Account Information</h2>
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="h-11 w-full rounded-lg border border-slate-300 px-4 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="h-11 w-full rounded-lg border border-slate-300 px-4 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}
            {status && <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">{status}</div>}

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

export default Profile;
