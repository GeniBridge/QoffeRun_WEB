import React from 'react';
import { useBranch } from '../context/BranchContext';

export default function Menu() {
  const { selectedBranch } = useBranch();

  return (
    <section>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestione Menu{selectedBranch ? ` - ${selectedBranch.name}` : ''}</h2>
      </div>

      {!selectedBranch ? (
        <div className="alert alert-warning">
          <i className="bi bi-info-circle me-2"></i>
          Seleziona una filiale per gestire i menu
        </div>
      ) : (
        <div className="bg-white rounded-4 border p-4">
          <div className="text-center py-5">
            <i className="bi bi-cup-hot display-1 text-muted"></i>
            <h4 className="mt-3">Menu Management</h4>
            <p className="text-muted">
              Menu management interface is under development.<br/>
              The backend APIs are fully functional and tested.<br/>
              You can test menu operations using the API directly.
            </p>
            <div className="mt-4">
              <h6>Available API Endpoints:</h6>
              <ul className="list-unstyled text-start" style={{maxWidth: '400px', margin: '0 auto'}}>
                <li><code>GET /api/bar-panel/branches/{'{branchId}'}/menus</code></li>
                <li><code>POST /api/bar-panel/branches/{'{branchId}'}/menus</code></li>
                <li><code>POST /api/bar-panel/branches/{'{branchId}'}/menus/{'{menuId}'}/items</code></li>
                <li><code>PUT /api/bar-panel/branches/{'{branchId}'}/menus/{'{menuId}'}/items/{'{itemId}'}</code></li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}