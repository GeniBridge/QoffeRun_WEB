// src/context/BranchContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import branchService from '../services/branchService';

const BranchContext = createContext();

export const useBranch = () => {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error('useBranch must be used within a BranchProvider');
  }
  return context;
};

export const BranchProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [availableBranches, setAvailableBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [needsBranchSelection, setNeedsBranchSelection] = useState(false);

  // Load available branches when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadAvailableBranches();
    } else {
      // Reset state when not authenticated
      setAvailableBranches([]);
      setSelectedBranch(null);
      setNeedsBranchSelection(false);
    }
  }, [isAuthenticated, user]);

  const loadAvailableBranches = async () => {
    try {
      setIsLoading(true);
      const branches = await branchService.getUserBranches();
      
      setAvailableBranches(branches);
      
      // Check if user needs to select a branch
      if (branches.length === 0) {
        throw new Error('Nessuna filiale assegnata. Contatta l\'amministratore.');
      } else if (branches.length === 1) {
        // Auto-select if only one branch
        setSelectedBranch(branches[0]);
        setNeedsBranchSelection(false);
        branchService.setSelectedBranch(branches[0]);
      } else {
        // Multiple branches - user needs to choose
        const savedBranch = branchService.getSelectedBranch();
        const validSavedBranch = savedBranch && branches.find(b => b.id === savedBranch.id);
        
        if (validSavedBranch) {
          setSelectedBranch(validSavedBranch);
          setNeedsBranchSelection(false);
        } else {
          setNeedsBranchSelection(true);
        }
      }
    } catch (error) {
      console.error('Error loading branches:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const selectBranch = (branch) => {
    setSelectedBranch(branch);
    setNeedsBranchSelection(false);
    branchService.setSelectedBranch(branch);
  };

  const switchBranch = () => {
    if (availableBranches.length > 1) {
      setNeedsBranchSelection(true);
    }
  };

  const value = {
    availableBranches,
    selectedBranch,
    isLoading,
    needsBranchSelection,
    selectBranch,
    switchBranch,
    refreshBranches: loadAvailableBranches,
  };

  return (
    <BranchContext.Provider value={value}>
      {children}
    </BranchContext.Provider>
  );
};