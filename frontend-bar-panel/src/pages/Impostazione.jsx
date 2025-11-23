import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useBranch } from '../context/BranchContext';
import SimpleSettings from './SimpleSettings';

export default function Impostazione() {
  const { user } = useAuth();
  const { selectedBranch } = useBranch();

  if (!selectedBranch) {
    return (
      <div className="page-container">
        <div className="alert alert-warning">
          <i className="bi bi-info-circle me-2"></i>
          Seleziona una filiale per gestire le impostazioni
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <SimpleSettings />
    </div>
  );
}
