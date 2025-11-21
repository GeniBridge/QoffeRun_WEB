// src/components/RoleGuard.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import branchService from '../services/branchService';

const RoleGuard = ({ children }) => {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Caricamento...</span>
          </div>
          <div>Verifica credenziali...</div>
        </div>
      </div>
    );
  }

  if (!branchService.hasValidRole(user)) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-5">
              <div className="card shadow border-danger">
                <div className="card-body p-5 text-center">
                  <div className="mb-4">
                    <i className="bi bi-shield-exclamation text-danger display-1"></i>
                  </div>
                  <h3 className="text-danger mb-3">Accesso Negato</h3>
                  <p className="text-muted mb-4">
                    Non hai i permessi necessari per accedere al pannello bar.
                  </p>
                  <div className="alert alert-danger text-start mb-4">
                    <h6 className="alert-heading">
                      <i className="bi bi-info-circle me-2"></i>
                      Ruoli autorizzati:
                    </h6>
                    <ul className="mb-0">
                      <li><strong>Barista</strong> - Gestione ordini e produzione</li>
                      <li><strong>Gestore Filiale</strong> - Gestione completa filiale</li>
                      <li><strong>Proprietario Catena</strong> - Accesso completo</li>
                    </ul>
                  </div>
                  <div className="bg-light p-3 rounded mb-4">
                    <small className="text-muted">
                      <strong>Il tuo ruolo attuale:</strong><br />
                      <span className="badge bg-secondary">{user.role || 'Non definito'}</span>
                    </small>
                  </div>
                  <div className="d-grid gap-2">
                    <button 
                      className="btn btn-outline-primary"
                      onClick={logout}
                    >
                      <i className="bi bi-box-arrow-left me-2"></i>
                      Torna al Login
                    </button>
                    <small className="text-muted">
                      Contatta l'amministratore del sistema per richiedere i permessi necessari
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default RoleGuard;