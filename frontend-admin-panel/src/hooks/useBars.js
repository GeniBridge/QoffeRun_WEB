// src/hooks/useBars.js
import { useState, useEffect, useCallback } from 'react';
import barService from '../services/barService';

export const useBars = () => {
  const [bars, setBars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load all bars
  const loadBars = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await barService.getBars();
      setBars(data || []);
    } catch (err) {
      setError(err.message);
      setBars([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load bars on mount
  useEffect(() => {
    loadBars();
  }, [loadBars]);

  // Create a new bar
  const createBar = useCallback(async (barData) => {
    try {
      const newBar = await barService.createBar(barData);
      setBars(prev => [...prev, newBar]);
      return newBar;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Update a bar
  const updateBar = useCallback(async (id, barData) => {
    try {
      const updatedBar = await barService.updateBar(id, barData);
      setBars(prev => prev.map(bar => bar.id === id ? updatedBar : bar));
      return updatedBar;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Delete a bar
  const deleteBar = useCallback(async (id) => {
    try {
      await barService.deleteBar(id);
      setBars(prev => prev.filter(bar => bar.id !== id));
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    bars,
    loading,
    error,
    loadBars,
    createBar,
    updateBar,
    deleteBar,
    clearError: () => setError(null)
  };
};