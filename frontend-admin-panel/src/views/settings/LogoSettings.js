import React, { useState, useRef } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CButton,
  CAlert,
  CSpinner,
  CForm,
  CFormInput,
  CFormLabel
} from '@coreui/react';
import Logo from '../../components/Logo';

const LogoSettings = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [logoKey, setLogoKey] = useState(Date.now()); // Per forzare il refresh del logo
  const fileInputRef = useRef(null);

  const handleLogoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validazione file
    if (!file.type.startsWith('image/')) {
      setError('Seleziona solo file immagine (JPG, PNG, SVG)');
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB max
      setError('Il file deve essere massimo 2MB');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('logo', file);

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/system/logo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_auth_token')}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        setMessage('Logo aggiornato con successo!');
        setLogoKey(Date.now()); // Forza il refresh del logo
        
        // Reset del file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Errore durante l\'upload del logo');
      }
    } catch (err) {
      setError('Errore di connessione durante l\'upload');
      console.error('Logo upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetToDefault = async () => {
    if (!window.confirm('Sei sicuro di voler ripristinare il logo predefinito?')) {
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/system-settings/system_logo_path`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_auth_token')}`
        },
        body: JSON.stringify({
          value: '/assets/logos/qofferun-logo.png',
          description: 'Logo predefinito di sistema'
        })
      });

      if (response.ok) {
        setMessage('Logo ripristinato al predefinito!');
        setLogoKey(Date.now()); // Forza il refresh del logo
      } else {
        setError('Errore durante il ripristino del logo');
      }
    } catch (err) {
      setError('Errore di connessione');
      console.error('Logo reset error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CRow>
      <CCol xs={12}>
        <CCard>
          <CCardHeader>
            <strong>Gestione Logo di Sistema</strong>
          </CCardHeader>
          <CCardBody>
            {error && (
              <CAlert color="danger" dismissible onClose={() => setError('')}>
                {error}
              </CAlert>
            )}
            
            {message && (
              <CAlert color="success" dismissible onClose={() => setMessage('')}>
                {message}
              </CAlert>
            )}

            <CRow className="mb-4">
              <CCol md={6}>
                <div className="text-center">
                  <h6 className="mb-3">Logo Attuale</h6>
                  <div className="border rounded p-3 bg-light">
                    <Logo key={logoKey} width="200" className="img-fluid" />
                  </div>
                </div>
              </CCol>
              
              <CCol md={6}>
                <h6 className="mb-3">Aggiorna Logo</h6>
                <CForm>
                  <div className="mb-3">
                    <CFormLabel htmlFor="logoFile">
                      Seleziona nuovo logo (JPG, PNG, SVG - max 2MB)
                    </CFormLabel>
                    <CFormInput
                      type="file"
                      id="logoFile"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="d-grid gap-2">
                    <CButton 
                      color="danger" 
                      variant="outline"
                      onClick={resetToDefault}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <CSpinner size="sm" className="me-2" />
                          Ripristinando...
                        </>
                      ) : (
                        'Ripristina Logo Predefinito'
                      )}
                    </CButton>
                  </div>
                </CForm>
              </CCol>
            </CRow>

            <hr />
            
            <div className="mt-4">
              <h6>Informazioni</h6>
              <ul className="text-muted small">
                <li>Il logo verrà utilizzato in tutti i frontend dell'applicazione</li>
                <li>Formati supportati: JPG, PNG, SVG</li>
                <li>Dimensione massima: 2MB</li>
                <li>Dimensioni consigliate: 300x100px (rapporto 3:1)</li>
                <li>Dopo l'upload, il logo apparirà automaticamente su tutte le pagine</li>
              </ul>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default LogoSettings;