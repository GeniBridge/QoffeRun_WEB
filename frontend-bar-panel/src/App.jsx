// src/App.jsx
import React, { useState, useEffect } from 'react';
import { NavLink, Routes, Route, useLocation, useNavigate } from 'react-router-dom';

import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import StoricoOrdini from './pages/StoricoOrdini';
import Pagamenti from './pages/Pagamenti';
import Menu from './pages/Menu';
import QRCodePage from './pages/QRCode';
import Impostazione from './pages/Impostazione';

import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import CartPanel from './components/CartPanel';

import logo from './assets/logo.png';
import NewsCarousel from './components/NewsCarousel';

// ----- UI PARTS -----
function Sidebar() {
  return (
    <aside className="sidebar p-3">
      <nav className="nav flex-column gap-1">
        <NavLink className="nav-link" to="/dashboard">
          <i className="bi bi-grid me-2"></i>Dashboard
        </NavLink>
        <NavLink className="nav-link" to="/menu">
          <i className="bi bi-list-ul me-2"></i>Menu
        </NavLink>
        <NavLink className="nav-link" to="/storico-ordini">
          <i className="bi bi-receipt me-2"></i>Storico ordini
        </NavLink>
        <NavLink className="nav-link" to="/pagamenti">
          <i className="bi bi-credit-card me-2"></i>Pagamenti
        </NavLink>
        <NavLink className="nav-link" to="/qrcode">
          <i className="bi bi-qr-code me-2"></i>QR Code
        </NavLink>
        <NavLink className="nav-link" to="/impostazione">
          <i className="bi bi-gear me-2"></i>Impostazione
        </NavLink>
      </nav>
    </aside>
  );
}

function Header({ onLogout, user }) {
  return (
    <header className="app-header">
      <div className="container-fluid py-2">
        <div className="d-flex align-items-center gap-3">
          <span className="brand d-inline-flex align-items-center gap-2">
            <img
              src={logo}
              alt="QoffeRun logo"
              style={{ height: 49, width: 34, objectFit: 'contain' }}
            />
            <span className="fw-bold fs-4">QoffeRun</span>
          </span>

          <div className="ms-auto me-auto" style={{ minWidth: 220, maxWidth: 320, flex: 1 }}>
            <NewsCarousel />
          </div>

          <div className="d-flex align-items-center gap-3">
            <span className="badge bg-success-subtle text-success">POS Online</span>
            <div className="dropdown">
              <button className="btn btn-light dropdown-toggle" data-bs-toggle="dropdown">
                <i className="bi bi-person-circle me-2"></i>{user?.name || user?.email || 'User'}
              </button>
              <div className="dropdown-menu dropdown-menu-end">
                <button className="dropdown-item" type="button">My Profile</button>
                <button className="dropdown-item" type="button">Settings</button>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item" type="button" onClick={onLogout}>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

// App Component with Authentication
function AppContent() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, isAuthenticated, logout, isLoading } = useAuth();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !isAuthenticated && pathname !== '/login') {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, pathname, navigate, isLoading]);

  const handleLogin = () => {
    navigate('/dashboard', { replace: true });
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  // Show loading spinner during auth check
  if (isLoading) {
    return (
      <div className="d-flex align-items-center justify-content-center vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <div>Caricamento...</div>
        </div>
      </div>
    );
  }

  const hideRightRoutes = ['/storico-ordini', '/pagamenti', '/menu', '/qrcode', '/impostazione'];
  const hideRight = hideRightRoutes.includes(pathname);

  return (
    <>
      {!isAuthenticated ? (
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<Login onLogin={handleLogin} />} />
        </Routes>
      ) : (
        <div className={`app ${hideRight ? 'hide-right' : ''}`}>
          <Header onLogout={handleLogout} user={user} />
          <Sidebar />
          <main className="content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/storico-ordini" element={<StoricoOrdini />} />
              <Route path="/pagamenti" element={<Pagamenti />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/qrcode" element={<QRCodePage />} />
              <Route path="/impostazione" element={<Impostazione />} />
              {/* fallback */}
              <Route path="*" element={<Dashboard />} />
            </Routes>
          </main>
          {!hideRight && <CartPanel />}
        </div>
      )}
    </>
  );
}

// ----- MAIN APP WITH PROVIDERS -----
export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}
