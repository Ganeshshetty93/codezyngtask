import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          TaskMaster AI
        </Link>
        <div className="flex space-x-6 items-center">
          <Link to="/" className="hover:text-blue-200 transition">
            Home
          </Link>
          {token && (
            <Link to="/dashboard" className="hover:text-blue-200 transition">
              Dashboard
            </Link>
          )}
          {token ? (
            <>
              <span className="text-sm">Welcome, {user.name || 'user'}!</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-blue-200 transition">
                Login
              </Link>
              <Link to="/register" className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded transition">
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
