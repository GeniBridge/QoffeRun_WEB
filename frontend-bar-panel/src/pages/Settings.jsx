// src/pages/Settings.js
import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useBranch } from '../context/BranchContext';
import BarSettings from '../components/Settings/BarSettings.jsx';

const Settings = () => {
  const { user } = useContext(AuthContext);
  const { selectedBranch } = useBranch();

  // Use the selected branch ID from context
  const barId = selectedBranch?.id || user?.bar_id || null;

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
      <BarSettings barId={barId} />
    </div>
  );
};

export default Settings;