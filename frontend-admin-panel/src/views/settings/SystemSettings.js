// src/views/settings/SystemSettings.js
import React, { useState } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CButton,
  CForm,
  CFormInput,
  CFormTextarea,
  CFormSelect,
  CAlert,
  CSpinner,
  CBadge,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButtonGroup
} from '@coreui/react';
import { useAdminSettings } from '../../hooks/useAdminSettings';

const SystemSettings = () => {
  const {
    systemSettings,
    loading,
    error,
    createSystemSetting,
    updateSystemSetting,
    deleteSystemSetting,
    batchUpdateSystemSettings,
    getSystemSettingsByCategory,
    clearError
  } = useAdminSettings();

  const [activeCategory, setActiveCategory] = useState('general');
  const [editingKey, setEditingKey] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState({});
  const [newSettingForm, setNewSettingForm] = useState({
    key: '',
    value: '',
    description: '',
    category: 'general'
  });

  // Get all unique categories with safe handling
  const safeSystemSettings = Array.isArray(systemSettings) ? systemSettings : [];
  const categories = [...new Set(safeSystemSettings.map(s => s?.category || 'general'))].sort();
  if (categories.length === 0) {
    categories.push('general');
  }

  const currentSettings = getSystemSettingsByCategory(activeCategory);

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
      await updateSystemSetting(key, value);
      
      setUnsavedChanges(prev => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });
      
      setEditingKey(null);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  // Save all unsaved changes
  const handleBatchSave = async () => {
    if (Object.keys(unsavedChanges).length === 0) return;
    
    try {
      await batchUpdateSystemSettings(unsavedChanges);
      setUnsavedChanges({});
      setEditingKey(null);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  // Create new setting
  const handleCreateSetting = async (e) => {
    e.preventDefault();
    
    if (!newSettingForm.key || !newSettingForm.value) {
      return;
    }

    try {
      await createSystemSetting(
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
      
      setShowCreateModal(false);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  // Delete setting
  const handleDeleteSetting = async (key) => {
    if (!window.confirm(`Sei sicuro di voler eliminare l'impostazione "${key}"?`)) {
      return;
    }

    try {
      await deleteSystemSetting(key);
    } catch (error) {
      // Error is handled by the hook
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
      <div className="text-center p-4">
        <CSpinner color="primary" />
        <div className="mt-2">Caricamento impostazioni di sistema...</div>
      </div>
    );
  }

  return (
    <>
      <CRow className="mb-4">
        <CCol>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0">Impostazioni di Sistema</h5>
              <small className="text-muted">Gestisci le impostazioni globali del sistema</small>
            </div>
            <div className="d-flex gap-2">
              {Object.keys(unsavedChanges).length > 0 && (
                <CButton 
                  color="success"
                  onClick={handleBatchSave}
                >
                  Salva tutte ({Object.keys(unsavedChanges).length})
                </CButton>
              )}
              <CButton 
                color="primary"
                onClick={() => setShowCreateModal(true)}
              >
                Nuova Impostazione
              </CButton>
            </div>
          </div>
        </CCol>
      </CRow>

      {error && (
        <CAlert color="danger" dismissible onClose={clearError}>
          {error}
        </CAlert>
      )}

      {/* Category Buttons */}
      <CRow className="mb-4">
        <CCol>
          <CButtonGroup>
            {categories.map(category => (
              <CButton
                key={category}
                color={activeCategory === category ? 'primary' : 'outline-primary'}
                onClick={() => setActiveCategory(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </CButton>
            ))}
          </CButtonGroup>
        </CCol>
      </CRow>

      {/* Settings List */}
      <CRow>
        <CCol>
          {currentSettings.length === 0 ? (
            <CCard>
              <CCardBody className="text-center text-muted py-5">
                Nessuna impostazione trovata per la categoria "{activeCategory}"
              </CCardBody>
            </CCard>
          ) : (
            currentSettings.map(setting => (
              <CCard key={setting.key} className="mb-3">
                <CCardHeader className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-2">
                    <code className="bg-light px-2 py-1 rounded">{setting.key}</code>
                    <CBadge color="info">{setting.category}</CBadge>
                  </div>
                  <div className="d-flex gap-2">
                    {editingKey === setting.key ? (
                      <>
                        <CButton
                          size="sm"
                          color="success"
                          onClick={() => handleSaveSetting(setting.key)}
                        >
                          Salva
                        </CButton>
                        <CButton
                          size="sm"
                          color="secondary"
                          onClick={() => handleCancelEdit(setting.key)}
                        >
                          Annulla
                        </CButton>
                      </>
                    ) : (
                      <>
                        <CButton
                          size="sm"
                          color="primary"
                          variant="outline"
                          onClick={() => setEditingKey(setting.key)}
                        >
                          Modifica
                        </CButton>
                        <CButton
                          size="sm"
                          color="danger"
                          variant="outline"
                          onClick={() => handleDeleteSetting(setting.key)}
                        >
                          Elimina
                        </CButton>
                      </>
                    )}
                  </div>
                </CCardHeader>
                <CCardBody>
                  {editingKey === setting.key ? (
                    <CFormTextarea
                      value={unsavedChanges[setting.key] || setting.value}
                      onChange={(e) => handleSettingChange(setting.key, e.target.value)}
                      rows="4"
                      style={{ fontFamily: 'monospace', fontSize: '14px' }}
                    />
                  ) : (
                    <pre className="mb-0 p-3 bg-light rounded" style={{ fontSize: '14px', whiteSpace: 'pre-wrap' }}>
                      {typeof setting.value === 'object' 
                        ? JSON.stringify(setting.value, null, 2)
                        : String(setting.value)
                      }
                    </pre>
                  )}
                  
                  {setting.description && (
                    <div className="mt-2 text-muted">
                      <small><em>{setting.description}</em></small>
                    </div>
                  )}
                </CCardBody>
              </CCard>
            ))
          )}
        </CCol>
      </CRow>

      {/* Create Setting Modal */}
      <CModal visible={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <CModalHeader>
          <CModalTitle>Crea Nuova Impostazione</CModalTitle>
        </CModalHeader>
        <CForm onSubmit={handleCreateSetting}>
          <CModalBody>
            <CRow className="mb-3">
              <CCol md={8}>
                <CFormInput
                  label="Chiave"
                  value={newSettingForm.key}
                  onChange={(e) => setNewSettingForm(prev => ({
                    ...prev,
                    key: e.target.value
                  }))}
                  placeholder="es: app_name"
                  required
                />
              </CCol>
              <CCol md={4}>
                <CFormSelect
                  label="Categoria"
                  value={newSettingForm.category}
                  onChange={(e) => setNewSettingForm(prev => ({
                    ...prev,
                    category: e.target.value
                  }))}
                >
                  <option value="general">General</option>
                  <option value="ui">UI</option>
                  <option value="email">Email</option>
                  <option value="security">Security</option>
                  <option value="integration">Integration</option>
                </CFormSelect>
              </CCol>
            </CRow>
            
            <div className="mb-3">
              <CFormTextarea
                label="Valore"
                value={newSettingForm.value}
                onChange={(e) => setNewSettingForm(prev => ({
                  ...prev,
                  value: e.target.value
                }))}
                placeholder="Inserisci il valore..."
                rows="4"
                style={{ fontFamily: 'monospace' }}
                required
              />
            </div>
            
            <div className="mb-3">
              <CFormInput
                label="Descrizione (opzionale)"
                value={newSettingForm.description}
                onChange={(e) => setNewSettingForm(prev => ({
                  ...prev,
                  description: e.target.value
                }))}
                placeholder="Descrizione dell'impostazione..."
              />
            </div>
          </CModalBody>
          <CModalFooter>
            <CButton 
              color="secondary" 
              onClick={() => setShowCreateModal(false)}
            >
              Annulla
            </CButton>
            <CButton 
              color="primary" 
              type="submit"
            >
              Crea Impostazione
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>
    </>
  );
};

export default SystemSettings;