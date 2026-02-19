import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useSchoolFeatures } from "../../hooks/useSchoolFeatures";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const { features } = useSchoolFeatures();

  const handleLogout = () => {
    logout();
  };

  const closeSidebar = () => setIsOpen(false);
  const toggleSidebar = () => setIsOpen((prev) => !prev);

  const navItems = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: "bi-speedometer2",
      show: true,
    },
    {
      path: "/news",
      label: "News Feed",
      icon: "bi-newspaper",
      show: features.news,
    },
    {
      path: "/events",
      label: "Events",
      icon: "bi-calendar-event",
      show: features.events,
    },
    {
      path: "/gallery",
      label: "Gallery",
      icon: "bi-images",
      show: features.gallery,
    },
    { path: "/settings", label: "Settings", icon: "bi-gear", show: true },
  ];

  return (
    <>
      <button
        type="button"
        className="sidebar-toggle-btn d-xl-none"
        onClick={toggleSidebar}
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        <i className={`bi ${isOpen ? "bi-x-lg" : "bi-list"}`}></i>
      </button>

      <div
        className={`sidebar-backdrop d-xl-none ${isOpen ? "show" : ""}`}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      <div
        className={`dashboard-sidebar d-flex flex-column flex-shrink-0 p-3 h-100 ${
          isOpen ? "is-open" : ""
        }`}
      >
        <div className="mb-3 mb-md-0 me-md-auto text-decoration-none">
          <span className="sidebar-title">
            {user?.schoolCode || "School Panel"}
          </span>
        </div>
        <hr />
        <ul className="nav nav-pills flex-column mb-auto">
          {navItems
            .filter((item) => item.show)
            .map((item) => (
              <li key={item.path} className="nav-item">
                <NavLink
                  to={item.path}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active" : ""}`
                  }
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
            onClick={() => {
              closeSidebar();
              handleLogout();
            }}
          >
            <i className="bi bi-box-arrow-right"></i>
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
