import { Link, useLocation, useNavigate } from 'react-router-dom';

function Navbar({ token, user = {}, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    onLogout();
    navigate('/login', { replace: true });
  };

  const navLinkClass = (path) => (
    `rounded-md px-3 py-2 text-sm font-semibold transition ${
      location.pathname === path
        ? 'bg-white/15 text-white'
        : 'text-blue-50 hover:bg-white/10 hover:text-white'
    }`
  );

  return (
    <nav className="bg-blue-600 text-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link to={token ? '/dashboard' : '/login'} className="flex items-center gap-3 text-xl font-bold tracking-tight">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">TM</span>
          <span>TaskMaster AI</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link to={token ? '/dashboard' : '/login'} className={navLinkClass('/dashboard')}>
            Home
          </Link>
          {token && (
            <Link to="/tasks" className={navLinkClass('/tasks')}>
              Tasks
            </Link>
          )}
          {token ? (
            <>
              <span className="ml-2 hidden rounded-full bg-white/10 px-3 py-2 text-sm font-semibold text-blue-50 md:inline">
                Welcome, {user.name || 'user'}
              </span>
              <button
                onClick={handleLogout}
                className="ml-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-bold shadow-sm transition hover:bg-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={navLinkClass('/login')}>
                Login
              </Link>
              <Link to="/register" className="rounded-lg bg-green-500 px-4 py-2 text-sm font-bold shadow-sm transition hover:bg-green-600">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
