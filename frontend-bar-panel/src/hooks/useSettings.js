// src/hooks/useSettings.js
import { useState, useEffect, useCallback } from 'react';
import settingsService from '../services/settingsService';

export const useSettings = (barId, category = null) => {
  const [settings, setSettings] = useState({
    system: [],
    bar: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load settings
  const loadSettings = useCallback(async () => {
    if (!barId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await settingsService.getAllSettings(barId, category);
      setSettings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [barId, category]);

  // Load settings on mount and when dependencies change
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Update a single bar setting
  const updateBarSetting = useCallback(async (key, value, description = null) => {
    try {
      const settingData = {
        key,
        value: typeof value === 'object' ? JSON.stringify(value) : String(value),
        ...(description && { description })
      };

      const updatedSetting = await settingsService.updateBarSetting(barId, key, settingData);
      
      // Update local state
      setSettings(prev => ({
        ...prev,
        bar: prev.bar.map(setting => 
          setting.key === key ? updatedSetting : setting
        )
      }));
      
      return updatedSetting;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [barId]);

  // Create a new bar setting
  const createBarSetting = useCallback(async (key, value, category = 'general', description = null) => {
    try {
      const settingData = {
        key,
        value: typeof value === 'object' ? JSON.stringify(value) : String(value),
        category,
        ...(description && { description })
      };

      const newSetting = await settingsService.createBarSetting(barId, settingData);
      
      // Update local state
      setSettings(prev => ({
        ...prev,
        bar: [...prev.bar, newSetting]
      }));
      
      return newSetting;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [barId]);

  // Delete a bar setting
  const deleteBarSetting = useCallback(async (key) => {
    try {
      await settingsService.deleteBarSetting(barId, key);
      
      // Update local state
      setSettings(prev => ({
        ...prev,
        bar: prev.bar.filter(setting => setting.key !== key)
      }));
      
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [barId]);

  // Batch update multiple settings
  const batchUpdateSettings = useCallback(async (settingsObject) => {
    try {
      const updatedSettings = await settingsService.updateBarSettingsObject(barId, settingsObject);
      
      // Reload all settings to ensure consistency
      await loadSettings();
      
      return updatedSettings;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [barId, loadSettings]);

  // Initialize default settings
  const initializeDefaults = useCallback(async () => {
    try {
      await settingsService.initializeBarDefaults(barId);
      await loadSettings();
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [barId, loadSettings]);

  // Get setting value by key (system or bar)
  const getSetting = useCallback((key, defaultValue = null) => {
    // First check bar settings
    const barSetting = settings.bar.find(setting => setting.key === key);
    if (barSetting) {
      try {
        return JSON.parse(barSetting.value);
      } catch {
        return barSetting.value;
      }
    }
    
    // Then check system settings
    const systemSetting = settings.system.find(setting => setting.key === key);
    if (systemSetting) {
      try {
        return JSON.parse(systemSetting.value);
      } catch {
        return systemSetting.value;
      }
    }
    
    return defaultValue;
  }, [settings]);

  // Get settings by category
  const getSettingsByCategory = useCallback((categoryFilter) => {
    const systemByCategory = settings.system.filter(setting => 
      setting.category === categoryFilter
    );
    const barByCategory = settings.bar.filter(setting => 
      setting.category === categoryFilter
    );
    
    return {
      system: systemByCategory,
      bar: barByCategory
    };
  }, [settings]);

  return {
    settings,
    loading,
    error,
    loadSettings,
    updateBarSetting,
    createBarSetting,
    deleteBarSetting,
    batchUpdateSettings,
    initializeDefaults,
    getSetting,
    getSettingsByCategory,
    refresh: loadSettings,
    clearError: () => setError(null)
  };
};

// Hook for system settings only (read-only for bar panel)
export const useSystemSettings = (category = null) => {
  const [systemSettings, setSystemSettings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadSystemSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await settingsService.getSystemSettings(category);
      setSystemSettings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    loadSystemSettings();
  }, [loadSystemSettings]);

  const getSystemSetting = useCallback((key, defaultValue = null) => {
    const setting = systemSettings.find(s => s.key === key);
    if (setting) {
      try {
        return JSON.parse(setting.value);
      } catch {
        return setting.value;
      }
    }
    return defaultValue;
  }, [systemSettings]);

  return {
    systemSettings,
    loading,
    error,
    loadSystemSettings,
    getSystemSetting,
    refresh: loadSystemSettings,
    clearError: () => setError(null)
  };
};