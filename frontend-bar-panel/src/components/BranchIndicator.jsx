// src/components/BranchIndicator.jsx
import React from 'react';
import { useBranch } from '../context/BranchContext';

const BranchIndicator = () => {
  const { selectedBranch, availableBranches, switchBranch } = useBranch();

  if (!selectedBranch) return null;

  const canSwitch = availableBranches.length > 1;

  return (
    <div className="d-flex align-items-center gap-2">
      <div className="d-flex align-items-center gap-2 px-3 py-1 bg-primary-subtle border border-primary-subtle rounded">
        <i className="bi bi-shop text-primary"></i>
        <div className="d-flex flex-column">
          <span className="fw-semibold text-primary" style={{ fontSize: '0.875rem' }}>
            {selectedBranch.name}
          </span>
          {selectedBranch.chain_name && (
            <span className="text-muted" style={{ fontSize: '0.75rem' }}>
              {selectedBranch.chain_name}
            </span>
          )}
        </div>
      </div>
      
      {canSwitch && (
        <button 
          className="btn btn-outline-primary btn-sm"
          onClick={switchBranch}
          title="Cambia filiale"
        >
          <i className="bi bi-arrow-repeat"></i>
        </button>
      )}
    </div>
  );
};

export default BranchIndicator;