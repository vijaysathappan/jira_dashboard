import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="d-flex w-100" style={{ minHeight: '100vh' }}>
      <nav id="sidebar" style={{ minWidth: '240px' }}>
        <div className="sidebar-header d-flex align-items-center">
          <i className="bi bi-kanban me-2 fs-4" style={{ color: 'var(--jira-blue)' }}></i>
          <h4 className="mb-0">WorkTrack Pro</h4>
        </div>
        <ul className="list-unstyled components mt-3">
          <li className={location.pathname === '/' ? 'active-link' : ''}>
            <Link to="/" className="text-decoration-none d-block"><i className="bi bi-grid-1x2 me-2"></i> Dashboard</Link>
          </li>
          {user?.role === 'Manager' && (
            <li className={location.pathname === '/task/new' ? 'active-link' : ''}>
              <Link to="/task/new" className="text-decoration-none d-block"><i className="bi bi-plus-square me-2"></i> Create Task</Link>
            </li>
          )}
        </ul>
      </nav>

      <div id="content" className="w-100 bg-light">
        <nav className="top-navbar d-flex justify-content-end align-items-center mb-4">
          <div className="d-flex align-items-center">
            <div className="avatar-circle me-2">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <span className="me-4 fw-bold text-secondary" style={{ fontSize: '0.9rem' }}>{user?.name} ({user?.role})</span>
            <button onClick={logout} className="btn btn-sm btn-outline-secondary" style={{ borderRadius: '3px' }}>
              <i className="bi bi-box-arrow-right me-1"></i> Logout
            </button>
          </div>
        </nav>
        
        <div className="container-fluid px-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
