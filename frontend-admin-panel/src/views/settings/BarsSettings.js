// src/views/settings/BarsSettings.js
import React, { useState, useEffect } from 'react';
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
  CButtonGroup,
  CListGroup,
  CListGroupItem,
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody
} from '@coreui/react';
import { useBarSettings, useCompleteSettings } from '../../hooks/useAdminSettings';
import adminSettingsService from '../../services/adminSettingsService';

const BarsSettings = () => {
  const [selectedBarId, setSelectedBarId] = useState(null);
  const [bars, setBars] = useState([]);
  const [loadingBars, setLoadingBars] = useState(true);
  const [barsError, setBarsError] = useState(null);
  
  const {
    barSettings,
    loading: settingsLoading,
    error: settingsError,
    createBarSetting,
    updateBarSetting,
    deleteBarSetting,
    batchUpdateBarSettings,
    initializeBarDefaults,
    getBarSettingsByCategory,
    clearError
  } = useBarSettings(selectedBarId);

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

  // Load all bars
  useEffect(() => {
    const loadBars = async () => {
      try {
        setLoadingBars(true);
        const barsData = await adminSettingsService.getAllBars();
        setBars(barsData);
        if (barsData.length > 0 && !selectedBarId) {
          setSelectedBarId(barsData[0].id);
        }
      } catch (error) {
        setBarsError(error.message);
      } finally {
        setLoadingBars(false);
      }
    };

    loadBars();
  }, [selectedBarId]);

  // Get all unique categories for the selected bar
  const categories = selectedBarId ? [...new Set(barSettings.map(s => s.category))].sort() : [];
  if (categories.length === 0) {
    categories.push('general');
  }

  const currentSettings = selectedBarId ? getBarSettingsByCategory(activeCategory) : [];

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
      // Error is handled by the hook
    }
  };

  // Save all unsaved changes
  const handleBatchSave = async () => {
    if (Object.keys(unsavedChanges).length === 0) return;
    
    try {
      await batchUpdateBarSettings(unsavedChanges);
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
      await deleteBarSetting(key);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  // Initialize defaults for selected bar
  const handleInitializeDefaults = async () => {
    if (!selectedBarId) return;
    
    if (!window.confirm(`Sei sicuro di voler inizializzare le impostazioni predefinite per questo bar? Questo potrebbe sovrascrivere alcune impostazioni esistenti.`)) {
      return;
    }

    try {
      await initializeBarDefaults();
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

  // Clear unsaved changes when switching bars
  const handleBarChange = (barId) => {
    if (Object.keys(unsavedChanges).length > 0) {
      if (!window.confirm('Hai modifiche non salvate. Sei sicuro di voler cambiare bar?')) {
        return;
      }
    }
    setUnsavedChanges({});
    setEditingKey(null);
    setSelectedBarId(barId);
  };

  if (loadingBars) {
    return (
      <div className="text-center p-4">
        <CSpinner color="primary" />
        <div className="mt-2">Caricamento bar...</div>
      </div>
    );
  }

  if (barsError) {
    return (
      <CAlert color="danger">
        Errore nel caricamento dei bar: {barsError}
      </CAlert>
    );
  }

  if (bars.length === 0) {
    return (
      <CAlert color="info">
        Nessun bar trovato nel sistema.
      </CAlert>
    );
  }

  return (
    <>
      <CRow>
        {/* Bar Selection Sidebar */}
        <CCol md={3}>
          <CCard>
            <CCardHeader>
              <h6 className="mb-0">Seleziona Bar</h6>
            </CCardHeader>
            <CCardBody className="p-0">
              <CListGroup flush>
                {bars.map(bar => (
                  <CListGroupItem
                    key={bar.id}
                    active={selectedBarId === bar.id}
                    onClick={() => handleBarChange(bar.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-semibold">{bar.name}</div>
                        <small className="text-muted">ID: {bar.id}</small>
                      </div>
                      {selectedBarId === bar.id && (
                        <CBadge color="primary">Selezionato</CBadge>
                      )}
                    </div>
                  </CListGroupItem>
                ))}
              </CListGroup>
            </CCardBody>
          </CCard>
        </CCol>

        {/* Settings Management */}
        <CCol md={9}>
          {selectedBarId ? (
            <>
              <CRow className="mb-4">
                <CCol>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h5 className="mb-0">
                        Impostazioni per {bars.find(b => b.id === selectedBarId)?.name}
                      </h5>
                      <small className="text-muted">Bar ID: {selectedBarId}</small>
                    </div>
                    <div className="d-flex gap-2">
                      {Object.keys(unsavedChanges).length > 0 && (
                        <CButton 
                          color="success"
                          onClick={handleBatchSave}
                          disabled={settingsLoading}
                        >
                          Salva tutte ({Object.keys(unsavedChanges).length})
                        </CButton>
                      )}
                      <CButton 
                        color="warning"
                        variant="outline"
                        onClick={handleInitializeDefaults}
                        disabled={settingsLoading}
                      >
                        Inizializza Default
                      </CButton>
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

              {settingsError && (
                <CAlert color="danger" dismissible onClose={clearError}>
                  {settingsError}
                </CAlert>
              )}

              {settingsLoading ? (
                <div className="text-center p-4">
                  <CSpinner color="primary" />
                  <div className="mt-2">Caricamento impostazioni...</div>
                </div>
              ) : (
                <>
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
                </>
              )}
            </>
          ) : (
            <CAlert color="info">
              Seleziona un bar dalla lista per gestire le sue impostazioni.
            </CAlert>
          )}
        </CCol>
      </CRow>

      {/* Create Setting Modal */}
      <CModal visible={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <CModalHeader>
          <CModalTitle>
            Crea Nuova Impostazione - {bars.find(b => b.id === selectedBarId)?.name}
          </CModalTitle>
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
                  placeholder="es: opening_hours"
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
                  <option value="operations">Operations</option>
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

export default BarsSettings;