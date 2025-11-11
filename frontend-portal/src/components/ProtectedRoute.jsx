import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, requiredRole = null }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // User doesn't have required role
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Accesso Negato</h2>
          <p className="text-gray-600 mb-6">
            Non hai i permessi necessari per accedere a questa pagina.
          </p>
          <Navigate to="/dashboard" replace />
        </div>
      </div>
    );
  }

  return children;
}

export function ChainOwnerRoute({ children }) {
  return (
    <ProtectedRoute requiredRole="chain_owner">
      {children}
    </ProtectedRoute>
  );
}

export function BranchManagerRoute({ children }) {
  const { user } = useAuth();
  
  if (!user || !['branch_manager', 'chain_owner', 'admin'].includes(user.role)) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

export function AdminRoute({ children }) {
  return (
    <ProtectedRoute requiredRole="admin">
      {children}
    </ProtectedRoute>
  );
}