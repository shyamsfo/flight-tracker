import { useState, useRef, useEffect } from 'react';
import { useAuth0 } from '../context/Auth0Context';
import './AuthButton.css';

const AuthButton = () => {
  const { isAuthenticated, user, isLoading, login, logout } = useAuth0();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleLogout = () => {
    setShowDropdown(false);
    logout();
  };

  if (isLoading) {
    return (
      <button className="auth-button" disabled>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" opacity="0.25" />
        </svg>
      </button>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="auth-button-container" ref={dropdownRef}>
        <button
          className="auth-button auth-button-authenticated"
          onClick={toggleDropdown}
          aria-label="User menu"
          title={`${user?.name || user?.email || 'User menu'}`}
        >
          {user?.picture ? (
            <img
              src={user.picture}
              alt={user.name || 'User'}
              className="user-avatar"
            />
          ) : (
            // User icon for authenticated state
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="none"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
          )}
        </button>

        {showDropdown && (
          <div className="auth-dropdown">
            <div className="auth-dropdown-header">
              <div className="user-info">
                {user?.picture && (
                  <img
                    src={user.picture}
                    alt={user.name || 'User'}
                    className="dropdown-user-avatar"
                  />
                )}
                <div className="user-details-dropdown">
                  {user?.name && <div className="user-name">{user.name}</div>}
                  {user?.email && <div className="user-email">{user.email}</div>}
                </div>
              </div>
            </div>
            <div className="auth-dropdown-divider"></div>
            <button className="auth-dropdown-item" onClick={handleLogout}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      className="auth-button"
      onClick={login}
      aria-label="Login"
      title="Login with Auth0"
    >
      {/* Login/User icon */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </button>
  );
};

export default AuthButton;
