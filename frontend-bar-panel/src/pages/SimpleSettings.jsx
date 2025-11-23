import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBranch } from '../context/BranchContext';
import { Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import settingsService from '../services/settingsService';
import '../styles/SimpleSettings.css';

const SimpleSettings = () => {
  const { user } = useAuth();
  const { selectedBranch } = useBranch();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [statusChangePin, setStatusChangePin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [canManage, setCanManage] = useState(true);
  
  const branchId = selectedBranch?.id;

  useEffect(() => {
    if (branchId) {
      loadSettings();
    }
  }, [branchId]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load permissions first to configure UI
      try {
        const perms = await settingsService.getBranchSettingsPermissions(branchId);
        setCanManage(!!perms.can_manage);
      } catch (permErr) {
        // Default to no-manage on explicit auth errors
        setCanManage(false);
      }

      const branchSettings = await settingsService.getBranchSettings(branchId);
      const pinSetting = (branchSettings || []).find(s => s.key === 'status_change_pin');
      setStatusChangePin(pinSetting?.value || '');
    } catch (err) {
      setError('Errore nel caricamento delle impostazioni: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!canManage) {
      setError('Non hai i permessi per modificare le impostazioni di questa filiale.');
      return;
    }

    // Validate PIN
    if (statusChangePin && !/^\d{4}$/.test(statusChangePin)) {
      setError('Il PIN deve essere di esattamente 4 cifre');
      return;
    }

    if (statusChangePin && statusChangePin !== confirmPin) {
      setError('I PIN non corrispondono');
      return;
    }

    try {
      setSaving(true);
      await settingsService.updateBranchSetting(branchId, 'status_change_pin', {
        value: statusChangePin,
        category: 'security',
        description: 'PIN richiesto per cambiare lo stato degli ordini'
      });

      setSuccess('Impostazioni salvate con successo!');
      setConfirmPin('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Errore nel salvataggio: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleClearPin = async () => {
    if (!confirm('Sei sicuro di voler rimuovere il PIN di sicurezza?')) {
      return;
    }

    try {
      setSaving(true);
      if (!canManage) {
        throw new Error('Non hai i permessi per modificare le impostazioni di questa filiale.');
      }
      // No explicit delete for branch setting; update to empty value
      await settingsService.updateBranchSetting(branchId, 'status_change_pin', {
        value: '',
        category: 'security',
        description: 'PIN richiesto per cambiare lo stato degli ordini'
      });
      setStatusChangePin('');
      setConfirmPin('');
      setSuccess('PIN di sicurezza rimosso con successo');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Errore nella rimozione del PIN: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!selectedBranch) {
    return (
      <div className="page-container">
        <Alert variant="warning">
          <i className="bi bi-info-circle me-2"></i>
          Seleziona una filiale per gestire le impostazioni
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page-container text-center py-5">
        <Spinner animation="border" />
        <p className="mt-3">Caricamento impostazioni...</p>
      </div>
    );
  }

  return (
    <div className="page-container simple-settings">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="bi bi-gear-fill me-2"></i>
          Impostazioni
        </h2>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {!canManage && (
        <Alert variant="warning">
          <i className="bi bi-shield-exclamation me-2"></i>
          Non hai i permessi per modificare queste impostazioni. Visualizzazione in sola lettura.
        </Alert>
      )}

      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess('')}>
          <i className="bi bi-check-circle me-2"></i>
          {success}
        </Alert>
      )}

      <Card>
        <Card.Header>
          <h5 className="mb-0">
            <i className="bi bi-shield-lock me-2"></i>
            Sicurezza Ordini
          </h5>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSave}>
            <Form.Group className="mb-3">
              <Form.Label>
                PIN per Cambio Stato Ordini (4 cifre)
              </Form.Label>
              <Form.Text className="d-block mb-2 text-muted">
                Imposta un PIN a 4 cifre che sarà richiesto ogni volta che cambi lo stato di un ordine.
                Questo aiuta a prevenire modifiche accidentali o non autorizzate.
              </Form.Text>
              <Form.Control
                type="text"
                inputMode="numeric"
                maxLength="4"
                placeholder="Inserisci 4 cifre"
                value={statusChangePin}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setStatusChangePin(value);
                }}
                disabled={saving}
              />
            </Form.Group>

            {statusChangePin && (
              <Form.Group className="mb-3">
                <Form.Label>Conferma PIN</Form.Label>
                <Form.Control
                  type="text"
                  inputMode="numeric"
                  maxLength="4"
                  placeholder="Conferma il PIN"
                  value={confirmPin}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setConfirmPin(value);
                  }}
                  disabled={saving}
                  isInvalid={confirmPin.length === 4 && confirmPin !== statusChangePin}
                  isValid={confirmPin.length === 4 && confirmPin === statusChangePin}
                />
                <Form.Control.Feedback type="invalid">
                  I PIN non corrispondono
                </Form.Control.Feedback>
                <Form.Control.Feedback type="valid">
                  I PIN corrispondono
                </Form.Control.Feedback>
              </Form.Group>
            )}

            <div className="d-flex gap-2">
              <Button 
                type="submit" 
                variant="primary" 
                disabled={saving || !canManage || (statusChangePin && statusChangePin !== confirmPin)}
              >
                {saving ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Salvataggio...
                  </>
                ) : (
                  <>
                    <i className="bi bi-save me-2"></i>
                    Salva Impostazioni
                  </>
                )}
              </Button>

              {statusChangePin && (
                <Button 
                  variant="outline-danger" 
                  onClick={handleClearPin}
                  disabled={saving || !canManage}
                >
                  <i className="bi bi-trash me-2"></i>
                  Rimuovi PIN
                </Button>
              )}
            </div>
          </Form>
        </Card.Body>
      </Card>

      <Card className="mt-4">
        <Card.Header>
          <h5 className="mb-0">
            <i className="bi bi-info-circle me-2"></i>
            Informazioni
          </h5>
        </Card.Header>
        <Card.Body>
          <p className="mb-2">
            <strong>Filiale:</strong> {selectedBranch.name}
          </p>
          <p className="mb-2">
            <strong>Codice Filiale:</strong> {selectedBranch.code || 'N/A'}
          </p>
          <p className="mb-0">
            <strong>Gestore:</strong> {user?.name || 'N/A'}
          </p>
        </Card.Body>
      </Card>
    </div>
  );
};

export default SimpleSettings;
