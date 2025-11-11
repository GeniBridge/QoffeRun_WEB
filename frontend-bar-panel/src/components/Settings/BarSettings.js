// src/components/Settings/BarSettings.js
import React, { useState, useEffect } from 'react';
import { useSettings, useSystemSettings } from '../../hooks/useSettings';
import './BarSettings.css';

const BarSettings = ({ barId }) => {
  const {
    settings,
    loading,
    error,
    updateBarSetting,
    createBarSetting,
    deleteBarSetting,
    batchUpdateSettings,
    getSetting,
    getSettingsByCategory,
    clearError
  } = useSettings(barId);

  const [activeCategory, setActiveCategory] = useState('general');
  const [editingKey, setEditingKey] = useState(null);
  const [newSettingForm, setNewSettingForm] = useState({
    key: '',
    value: '',
    description: '',
    category: 'general'
  });
  const [unsavedChanges, setUnsavedChanges] = useState({});

  // Get all unique categories
  const categories = [...new Set([
    ...settings.system.map(s => s.category),
    ...settings.bar.map(s => s.category)
  ])].sort();

  const currentSettings = getSettingsByCategory(activeCategory);

  // Handle setting value change
  const handleSettingChange = (key, value) => {
    setUnsavedChanges(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Save individual setting
  const handleSaveSetting = async (key) => {
    try {
      const value = unsavedChanges[key];
      await updateBarSetting(key, value);
      
      setUnsavedChanges(prev => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });
      
      setEditingKey(null);
    } catch (error) {
      alert(`Errore nel salvare l'impostazione: ${error.message}`);
    }
  };

  // Save all unsaved changes
  const handleBatchSave = async () => {
    if (Object.keys(unsavedChanges).length === 0) return;
    
    try {
      await batchUpdateSettings(unsavedChanges);
      setUnsavedChanges({});
      setEditingKey(null);
      alert('Impostazioni salvate con successo!');
    } catch (error) {
      alert(`Errore nel salvare le impostazioni: ${error.message}`);
    }
  };

  // Create new setting
  const handleCreateSetting = async (e) => {
    e.preventDefault();
    
    if (!newSettingForm.key || !newSettingForm.value) {
      alert('Chiave e valore sono obbligatori');
      return;
    }

    try {
      await createBarSetting(
        newSettingForm.key,
        newSettingForm.value,
        newSettingForm.category,
        newSettingForm.description
      );
      
      setNewSettingForm({
        key: '',
        value: '',
        description: '',
        category: 'general'
      });
      
      alert('Nuova impostazione creata!');
    } catch (error) {
      alert(`Errore nella creazione: ${error.message}`);
    }
  };

  // Delete setting
  const handleDeleteSetting = async (key) => {
    if (!confirm(`Sei sicuro di voler eliminare l'impostazione "${key}"?`)) {
      return;
    }

    try {
      await deleteBarSetting(key);
      alert('Impostazione eliminata!');
    } catch (error) {
      alert(`Errore nell'eliminazione: ${error.message}`);
    }
  };

  // Cancel editing
  const handleCancelEdit = (key) => {
    setUnsavedChanges(prev => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
    setEditingKey(null);
  };

  if (loading) {
    return (
      <div className="bar-settings">
        <div className="loading">Caricamento impostazioni...</div>
      </div>
    );
  }

  return (
    <div className="bar-settings">
      <div className="bar-settings__header">
        <h2>Impostazioni Bar</h2>
        {Object.keys(unsavedChanges).length > 0 && (
          <div className="bar-settings__actions">
            <button 
              className="btn btn--primary"
              onClick={handleBatchSave}
            >
              Salva tutte le modifiche ({Object.keys(unsavedChanges).length})
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="alert alert--error">
          <p>{error}</p>
          <button onClick={clearError}>✕</button>
        </div>
      )}

      {/* Category Tabs */}
      <div className="bar-settings__categories">
        {categories.map(category => (
          <button
            key={category}
            className={`category-tab ${activeCategory === category ? 'category-tab--active' : ''}`}
            onClick={() => setActiveCategory(category)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Settings List */}
      <div className="bar-settings__content">
        {/* System Settings (Read Only) */}
        {currentSettings.system.length > 0 && (
          <div className="settings-section">
            <h3>Impostazioni di Sistema (Solo lettura)</h3>
            <div className="settings-list">
              {currentSettings.system.map(setting => (
                <div key={setting.key} className="setting-item setting-item--readonly">
                  <div className="setting-item__header">
                    <span className="setting-key">{setting.key}</span>
                    <span className="setting-badge">Sistema</span>
                  </div>
                  <div className="setting-value">
                    {typeof setting.value === 'object' 
                      ? JSON.stringify(setting.value, null, 2)
                      : String(setting.value)
                    }
                  </div>
                  {setting.description && (
                    <div className="setting-description">{setting.description}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bar Settings (Editable) */}
        <div className="settings-section">
          <h3>Impostazioni Bar</h3>
          <div className="settings-list">
            {currentSettings.bar.map(setting => (
              <div key={setting.key} className="setting-item">
                <div className="setting-item__header">
                  <span className="setting-key">{setting.key}</span>
                  <div className="setting-actions">
                    {editingKey === setting.key ? (
                      <>
                        <button
                          className="btn btn--small btn--primary"
                          onClick={() => handleSaveSetting(setting.key)}
                        >
                          Salva
                        </button>
                        <button
                          className="btn btn--small btn--secondary"
                          onClick={() => handleCancelEdit(setting.key)}
                        >
                          Annulla
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="btn btn--small btn--secondary"
                          onClick={() => setEditingKey(setting.key)}
                        >
                          Modifica
                        </button>
                        <button
                          className="btn btn--small btn--danger"
                          onClick={() => handleDeleteSetting(setting.key)}
                        >
                          Elimina
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="setting-value">
                  {editingKey === setting.key ? (
                    <textarea
                      value={unsavedChanges[setting.key] || setting.value}
                      onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                      className="setting-input"
                      rows="3"
                    />
                  ) : (
                    <div className="setting-display">
                      {typeof setting.value === 'object' 
                        ? JSON.stringify(setting.value, null, 2)
                        : String(setting.value)
                      }
                    </div>
                  )}
                </div>
                
                {setting.description && (
                  <div className="setting-description">{setting.description}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* New Setting Form */}
        <div className="settings-section">
          <h3>Aggiungi Nuova Impostazione</h3>
          <form onSubmit={handleCreateSetting} className="new-setting-form">
            <div className="form-row">
              <div className="form-group">
                <label>Chiave</label>
                <input
                  type="text"
                  value={newSettingForm.key}
                  onChange={(e) => setNewSettingForm(prev => ({
                    ...prev,
                    key: e.target.value
                  }))}
                  placeholder="es: opening_hours"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Categoria</label>
                <select
                  value={newSettingForm.category}
                  onChange={(e) => setNewSettingForm(prev => ({
                    ...prev,
                    category: e.target.value
                  }))}
                >
                  <option value="general">General</option>
                  <option value="ui">UI</option>
                  <option value="operations">Operations</option>
                  <option value="integration">Integration</option>
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label>Valore</label>
              <textarea
                value={newSettingForm.value}
                onChange={(e) => setNewSettingForm(prev => ({
                  ...prev,
                  value: e.target.value
                }))}
                placeholder="Inserisci il valore..."
                rows="3"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Descrizione (opzionale)</label>
              <input
                type="text"
                value={newSettingForm.description}
                onChange={(e) => setNewSettingForm(prev => ({
                  ...prev,
                  description: e.target.value
                }))}
                placeholder="Descrizione dell'impostazione..."
              />
            </div>
            
            <button type="submit" className="btn btn--primary">
              Crea Impostazione
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BarSettings;