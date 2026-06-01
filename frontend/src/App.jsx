import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import Navbar from './components/Navbar.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import DashboardHome from './pages/DashboardHome.jsx';
import Profile from './pages/Profile.jsx';
import './App.css';

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch (_) {
      return {};
    }
  });
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const handleAuthSuccess = useCallback((authData) => {
    localStorage.setItem('token', authData.token);
    localStorage.setItem('user', JSON.stringify(authData.user || {}));
    setToken(authData.token);
    setUser(authData.user || {});
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser({});
  }, []);

  const handleUserUpdate = useCallback((updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser || {}));
    setUser(updatedUser || {});
  }, []);

  return (
    <Router>
      <Navbar
        token={token}
        user={user}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((current) => !current)}
        onLogout={handleLogout}
      />
      <div className="min-h-screen bg-gray-50 transition-colors dark:bg-slate-950">
        <Routes>
          <Route path="/" element={token ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
          <Route path="/login" element={token ? <Navigate to="/dashboard" /> : <Login onAuthSuccess={handleAuthSuccess} />} />
          <Route path="/register" element={token ? <Navigate to="/dashboard" /> : <Register onAuthSuccess={handleAuthSuccess} />} />
          <Route path="/dashboard" element={token ? <DashboardHome /> : <Navigate to="/login" />} />
          <Route path="/tasks" element={token ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/profile" element={token ? <Profile user={user} onUserUpdate={handleUserUpdate} /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
