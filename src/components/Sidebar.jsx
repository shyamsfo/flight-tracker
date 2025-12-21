import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const applications = [
    {
      id: 'flights',
      name: 'Flight Tracker',
      path: '/flights',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
        </svg>
      ),
      description: 'Search and track flights worldwide'
    },
    {
      id: 'mindmap',
      name: 'DeepStore Explorer',
      path: '/mindmap',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <circle cx="6" cy="6" r="2" />
          <circle cx="18" cy="6" r="2" />
          <circle cx="6" cy="18" r="2" />
          <circle cx="18" cy="18" r="2" />
          <line x1="8" y1="6" x2="10" y2="10" />
          <line x1="16" y1="6" x2="14" y2="10" />
          <line x1="8" y1="18" x2="10" y2="14" />
          <line x1="16" y1="18" x2="14" y2="14" />
        </svg>
      ),
      description: 'Non-linear chat with question/answer nodes'
    },
    {
      id: 'bmi',
      name: 'BMI Calculator',
      path: '/bmi',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="9" y1="21" x2="9" y2="9" />
        </svg>
      ),
      description: 'Calculate your Body Mass Index (BMI)'
    },
    {
      id: 'heartrate',
      name: 'Heart Rate Zones',
      path: '/heartrate',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      ),
      description: 'Calculate your heart rate training zones'
    },
    {
      id: 'csv',
      name: 'CSV Viewer',
      path: '/csv',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="8" y1="13" x2="16" y2="13" />
          <line x1="8" y1="17" x2="16" y2="17" />
        </svg>
      ),
      description: 'View and analyze CSV files with AG Grid'
    },
    {
      id: 'coinflip',
      name: 'Coin Flipper',
      path: '/coinflip',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a10 10 0 0 1 0 20" />
        </svg>
      ),
      description: 'Flip coins and visualize probability distribution'
    },
    {
      id: 'kanban',
      name: 'Kanban Board',
      path: '/kanban',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      ),
      description: 'Manage tasks with drag-and-drop columns'
    }
  ];

  const handleLinkClick = () => {
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && <div className="sidebar-backdrop" onClick={onClose}></div>}

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Applications</h2>
          <p className="sidebar-subtitle">Choose an app to get started</p>
        </div>

        <nav className="sidebar-nav">
          {applications.map((app) => (
            <Link
              key={app.id}
              to={app.path}
              className={`sidebar-nav-item ${location.pathname === app.path ? 'active' : ''}`}
              onClick={handleLinkClick}
            >
              <div className="sidebar-nav-icon">{app.icon}</div>
              <div className="sidebar-nav-content">
                <div className="sidebar-nav-title">{app.name}</div>
                <div className="sidebar-nav-description">{app.description}</div>
              </div>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-text">
            More applications coming soon!
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
