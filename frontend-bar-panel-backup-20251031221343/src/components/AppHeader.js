import React from "react";

export default function AppHeader({ fullWidth }) {
  return (
    <header className={`app-header${fullWidth ? ' full-width' : ''}`}>
      <div className="container-fluid py-2">
        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-light d-xl-none" id="toggleSidebar"><i className="bi bi-list"></i></button>
          <div className="d-flex align-items-center gap-3 ms-auto">
            <span className="badge-dot"> POS Online</span>
            <div className="dropdown">
              <button className="btn btn-light dropdown-toggle" data-bs-toggle="dropdown"><i className="bi bi-person-circle me-2"></i>John</button>
              <div className="dropdown-menu dropdown-menu-end">
                <a className="dropdown-item" href="#/profile">My Profile</a>
                <a className="dropdown-item" href="#/settings">Settings</a>
                <div className="dropdown-divider"></div>
                <a className="dropdown-item" href="#/logout">Logout</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
