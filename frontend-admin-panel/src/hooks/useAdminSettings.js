// src/hooks/useAdminSettings.js
import { useState, useEffect, useCallback } from 'react';
import adminSettingsService from '../services/adminSettingsService';

export const useAdminSettings = (category = null) => {
  const [systemSettings, setSystemSettings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load system settings
  const loadSystemSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await adminSettingsService.getSystemSettings(category);
      setSystemSettings(data || []);
    } catch (err) {
      setError(err.message);
      setSystemSettings([]);
    } finally {
      setLoading(false);
    }
  }, [category]);

  // Load settings on mount and when dependencies change
  useEffect(() => {
    loadSystemSettings();
  }, [loadSystemSettings]);

  // Create a new system setting
  const createSystemSetting = useCallback(async (key, value, category = 'general', description = null) => {
    try {
      const settingData = {
        key,
        value: typeof value === 'object' ? JSON.stringify(value) : String(value),
        category,
        ...(description && { description })
      };

      const newSetting = await adminSettingsService.createSystemSetting(settingData);
      
      // Update local state
      setSystemSettings(prev => [...prev, newSetting]);
      
      return newSetting;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Update a system setting
  const updateSystemSetting = useCallback(async (key, value, description = null) => {
    try {
      const settingData = {
        key,
        value: typeof value === 'object' ? JSON.stringify(value) : String(value),
        ...(description && { description })
      };

      const updatedSetting = await adminSettingsService.updateSystemSetting(key, settingData);
      
      // Update local state
      setSystemSettings(prev => 
        prev.map(setting => setting.key === key ? updatedSetting : setting)
      );
      
      return updatedSetting;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Delete a system setting
  const deleteSystemSetting = useCallback(async (key) => {
    try {
      await adminSettingsService.deleteSystemSetting(key);
      
      // Update local state
      setSystemSettings(prev => prev.filter(setting => setting.key !== key));
      
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Batch update multiple system settings
  const batchUpdateSystemSettings = useCallback(async (settingsObject) => {
    try {
      const updatedSettings = await adminSettingsService.updateSystemSettingsObject(settingsObject);
      
      // Reload all settings to ensure consistency
      await loadSystemSettings();
      
      return updatedSettings;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [loadSystemSettings]);

  // Get setting value by key
  const getSystemSetting = useCallback((key, defaultValue = null) => {
    if (!Array.isArray(systemSettings)) return defaultValue;
    const setting = systemSettings.find(setting => setting?.key === key);
    if (setting) {
      try {
        return JSON.parse(setting.value);
      } catch {
        return setting.value;
      }
    }
    return defaultValue;
  }, [systemSettings]);

  // Get settings by category
  const getSystemSettingsByCategory = useCallback((categoryFilter) => {
    if (!Array.isArray(systemSettings)) return [];
    return systemSettings.filter(setting => setting?.category === categoryFilter);
  }, [systemSettings]);

  return {
    systemSettings,
    loading,
    error,
    loadSystemSettings,
    createSystemSetting,
    updateSystemSetting,
    deleteSystemSetting,
    batchUpdateSystemSettings,
    getSystemSetting,
    getSystemSettingsByCategory,
    refresh: loadSystemSettings,
    clearError: () => setError(null)
  };
};

// Hook for managing bar settings (admin can manage any bar)
export const useBarSettings = (barId, category = null) => {
  const [barSettings, setBarSettings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load bar settings
  const loadBarSettings = useCallback(async () => {
    if (!barId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await adminSettingsService.getBarSettings(barId, category);
      setBarSettings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [barId, category]);

  // Load settings on mount and when dependencies change
  useEffect(() => {
    loadBarSettings();
  }, [loadBarSettings]);

  // Create a new bar setting
  const createBarSetting = useCallback(async (key, value, category = 'general', description = null) => {
    try {
      const settingData = {
        key,
        value: typeof value === 'object' ? JSON.stringify(value) : String(value),
        category,
        ...(description && { description })
      };

      const newSetting = await adminSettingsService.createBarSetting(barId, settingData);
      
      // Update local state
      setBarSettings(prev => [...prev, newSetting]);
      
      return newSetting;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [barId]);

  // Update a bar setting
  const updateBarSetting = useCallback(async (key, value, description = null) => {
    try {
      const settingData = {
        key,
        value: typeof value === 'object' ? JSON.stringify(value) : String(value),
        ...(description && { description })
      };

      const updatedSetting = await adminSettingsService.updateBarSetting(barId, key, settingData);
      
      // Update local state
      setBarSettings(prev => 
        prev.map(setting => setting.key === key ? updatedSetting : setting)
      );
      
      return updatedSetting;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [barId]);

  // Delete a bar setting
  const deleteBarSetting = useCallback(async (key) => {
    try {
      await adminSettingsService.deleteBarSetting(barId, key);
      
      // Update local state
      setBarSettings(prev => prev.filter(setting => setting.key !== key));
      
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [barId]);

  // Batch update multiple bar settings
  const batchUpdateBarSettings = useCallback(async (settingsObject) => {
    try {
      const updatedSettings = await adminSettingsService.updateBarSettingsObject(barId, settingsObject);
      
      // Reload all settings to ensure consistency
      await loadBarSettings();
      
      return updatedSettings;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [barId, loadBarSettings]);

  // Initialize default bar settings
  const initializeBarDefaults = useCallback(async () => {
    try {
      await adminSettingsService.initializeBarDefaults(barId);
      await loadBarSettings();
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [barId, loadBarSettings]);

  // Get setting value by key
  const getBarSetting = useCallback((key, defaultValue = null) => {
    const setting = barSettings.find(setting => setting.key === key);
    if (setting) {
      try {
        return JSON.parse(setting.value);
      } catch {
        return setting.value;
      }
    }
    return defaultValue;
  }, [barSettings]);

  // Get settings by category
  const getBarSettingsByCategory = useCallback((categoryFilter) => {
    return barSettings.filter(setting => setting.category === categoryFilter);
  }, [barSettings]);

  return {
    barSettings,
    loading,
    error,
    loadBarSettings,
    createBarSetting,
    updateBarSetting,
    deleteBarSetting,
    batchUpdateBarSettings,
    initializeBarDefaults,
    getBarSetting,
    getBarSettingsByCategory,
    refresh: loadBarSettings,
    clearError: () => setError(null)
  };
};

