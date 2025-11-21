// src/components/BranchSelector.jsx
import React, { useState } from 'react';
import { useBranch } from '../context/BranchContext';
import { useAuth } from '../context/AuthContext';

const BranchSelector = () => {
  const { availableBranches, selectBranch } = useBranch();
  const { user } = useAuth();
  const [selectedBranchId, setSelectedBranchId] = useState('');

  const handleBranchSelect = () => {
    if (!selectedBranchId) return;
    
    const branch = availableBranches.find(b => b.id.toString() === selectedBranchId);
    if (branch) {
      selectBranch(branch);
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'barista': return 'Barista';
      case 'branch_manager': return 'Gestore Filiale';
      case 'chain_owner': return 'Proprietario Catena';
      default: return role;
    }
  };

  return (
    <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <img
                    src="/qofferun_logo.png"
                    alt="QoffeRun"
                    style={{ height: 60, width: 42, objectFit: 'contain' }}
                    className="mb-3"
                  />
                  <h3 className="fw-bold text-primary">Seleziona Filiale</h3>
                  <p className="text-muted">
                    Benvenuto, <strong>{user?.name || user?.email}</strong>
                    <br />
                    <small className="badge bg-info text-dark">
                      {getRoleLabel(user?.role)}
                    </small>
                  </p>
                </div>

                <div className="mb-4">
                  <label htmlFor="branchSelect" className="form-label fw-semibold">
                    Scegli la filiale da gestire:
                  </label>
                  <select 
                    id="branchSelect"
                    className="form-select form-select-lg"
                    value={selectedBranchId}
                    onChange={(e) => setSelectedBranchId(e.target.value)}
                  >
                    <option value="">-- Seleziona una filiale --</option>
                    {availableBranches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                        {branch.address && (
                          <span> - {branch.address}</span>
                        )}
                        {branch.chain_name && (
                          <span> ({branch.chain_name})</span>
                        )}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="d-grid">
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={handleBranchSelect}
                    disabled={!selectedBranchId}
                  >
                    <i className="bi bi-arrow-right-circle me-2"></i>
                    Accedi alla Filiale
                  </button>
                </div>

                <div className="mt-4">
                  <div className="text-center">
                    <small className="text-muted">
                      Hai accesso a {availableBranches.length} filiale{availableBranches.length !== 1 ? 'i' : ''}
                    </small>
                  </div>
                  
                  {availableBranches.length > 0 && (
                    <div className="mt-3">
                      <div className="border rounded p-3 bg-light">
                        <h6 className="mb-2">Filiali disponibili:</h6>
                        <ul className="list-unstyled mb-0 small">
                          {availableBranches.map((branch) => (
                            <li key={branch.id} className="d-flex align-items-center mb-1">
                              <i className="bi bi-shop text-primary me-2"></i>
                              <strong>{branch.name}</strong>
                              {branch.address && (
                                <span className="text-muted ms-2">- {branch.address}</span>
                              )}
                              {branch.chain_name && (
                                <span className="badge bg-secondary ms-auto">{branch.chain_name}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BranchSelector;