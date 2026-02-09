import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSchoolFeatures } from '../../hooks/useSchoolFeatures';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { features } = useSchoolFeatures();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'bi-speedometer2', show: true },
    { path: '/news', label: 'News Feed', icon: 'bi-newspaper', show: features.news },
    { path: '/events', label: 'Events', icon: 'bi-calendar-event', show: features.events },
    { path: '/gallery', label: 'Gallery', icon: 'bi-images', show: features.gallery },
    { path: '/settings', label: 'Settings', icon: 'bi-gear', show: true },
  ];

  return (
    <div className="dashboard-sidebar d-flex flex-column flex-shrink-0 p-3 h-100">
      <div className="mb-3 mb-md-0 me-md-auto text-decoration-none">
        <span className="fs-4 fw-bold text-primary">{user?.schoolName || 'School Panel'}</span>
      </div>
      <hr />
      <ul className="nav nav-pills flex-column mb-auto">
        {navItems.filter(item => item.show).map((item) => (
          <li key={item.path} className="nav-item">
            <NavLink
              to={item.path}
              className={({ isActive }) => `nav-link text-white ${isActive ? 'active' : ''}`}
            >
              <i className={`bi ${item.icon} me-2 fs-5`}></i>
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
      <hr />
      <div className="dropdown">
        <button
          className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2"
          onClick={handleLogout}
        >
          <i className="bi bi-box-arrow-right"></i>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
