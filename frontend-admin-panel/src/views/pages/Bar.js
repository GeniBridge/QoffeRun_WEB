// src/views/pages/Bar.js
import React, { useState } from 'react'
import {
  CTable,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CTableBody,
  CTableDataCell,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormInput,
  CSpinner,
  CAlert,
  CBadge
} from '@coreui/react'
import { cilInfo, cilReload } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { useBars } from '../../hooks/useBars'

const Bar = () => {
  const { bars, loading, error, loadBars, clearError } = useBars()
  const [visible, setVisible] = useState(false)
  const [selectedBar, setSelectedBar] = useState(null)
  const [filter, setFilter] = useState('')

  // Filter data based on search input - adapt to real bar data structure
  const filteredData = bars.filter((bar) => {
    if (!bar) return false;
    const searchFields = [
      bar.name,
      bar.address,
      bar.citta,
      bar.gestore_telefono,
      bar.gestore_email,
      bar.gestore_nome,
      bar.gestore_cognome,
      bar.indirizzo_completo
    ];
    return searchFields.some(field => 
      field?.toString().toLowerCase().includes(filter.toLowerCase())
    );
  })

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>🏪 Gestione Bar</h2>
        <CButton 
          color="primary"
          onClick={loadBars}
          disabled={loading}
        >
          <CIcon icon={cilReload} className={loading ? 'spin' : ''} />
          {loading ? ' Caricamento...' : ' Ricarica'}
        </CButton>
      </div>

      {/* Error Alert */}
      {error && (
        <CAlert color="danger" dismissible onClose={clearError}>
          <strong>Errore:</strong> {error}
        </CAlert>
      )}

      {/* Search Input */}
      <div className="mb-3" style={{ maxWidth: '300px' }}>
        <CFormInput
          type="text"
          placeholder="Cerca per nome, indirizzo, email..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center p-4">
          <CSpinner color="primary" />
          <div className="mt-2">Caricamento bar...</div>
        </div>
      )}

      {/* Table */}
      {!loading && (
        <div className="table-responsive">
          <CTable hover bordered>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Nome Bar</CTableHeaderCell>
                <CTableHeaderCell>Proprietario</CTableHeaderCell>
                <CTableHeaderCell>Indirizzo</CTableHeaderCell>
                <CTableHeaderCell>Città</CTableHeaderCell>
                <CTableHeaderCell>Telefono</CTableHeaderCell>
                <CTableHeaderCell>Email</CTableHeaderCell>
                <CTableHeaderCell>Status</CTableHeaderCell>
                <CTableHeaderCell>Azioni</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {filteredData.length > 0 ? (
                filteredData.map((bar) => (
                  <CTableRow key={bar.id}>
                    <CTableDataCell>
                      <strong>{bar.name || 'N/A'}</strong>
                    </CTableDataCell>
                    <CTableDataCell>
                      {bar.gestore_completo || (bar.user ? bar.user.name : 'N/A')}
                    </CTableDataCell>
                    <CTableDataCell>{bar.indirizzo_completo || bar.full_address || 'N/A'}</CTableDataCell>
                    <CTableDataCell>{bar.citta || 'N/A'}</CTableDataCell>
                    <CTableDataCell>{bar.gestore_telefono || bar.telefono || 'N/A'}</CTableDataCell>
                    <CTableDataCell>{bar.gestore_email || bar.email || (bar.user ? bar.user.email : 'N/A')}</CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={bar.status === 'active' ? 'success' : 'secondary'}>
                        {bar.status || 'unknown'}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CButton
                        size="sm"
                        color="primary"
                        onClick={() => {
                          setSelectedBar(bar)
                          setVisible(true)
                        }}
                      >
                        <CIcon icon={cilInfo} /> Dettagli
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))
              ) : (
                <CTableRow>
                  <CTableDataCell colSpan="8" className="text-center">
                    {bars.length === 0 && !loading ? 'Nessun bar trovato nel database' : 'Nessun risultato corrisponde ai criteri di ricerca'}
                  </CTableDataCell>
                </CTableRow>
              )}
            </CTableBody>
          </CTable>
        </div>
      )}

      {/* Modal: Dettagli Bar */}
      <CModal visible={visible} onClose={() => setVisible(false)} size="lg">
        <CModalHeader>
          <CModalTitle>Dettagli Bar: {selectedBar?.name}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedBar && (
            <div className="row">
              <div className="col-md-6">
                <h6>Informazioni Generali</h6>
                <ul className="list-unstyled">
                  <li><strong>ID:</strong> {selectedBar.id}</li>
                  <li><strong>Nome Bar:</strong> {selectedBar.name || 'N/A'}</li>
                  <li><strong>Ragione Sociale:</strong> {selectedBar.ragione_sociale || 'N/A'}</li>
                  <li><strong>Proprietario:</strong> {selectedBar.gestore_completo || (selectedBar.user ? selectedBar.user.name : 'N/A')}</li>
                  <li><strong>Status:</strong> 
                    <CBadge color={selectedBar.status === 'active' ? 'success' : 'secondary'} className="ms-2">
                      {selectedBar.status || 'unknown'}
                    </CBadge>
                  </li>
                  <li><strong>Registrazione:</strong> 
                    <CBadge color={selectedBar.registration_status === 'approved' ? 'success' : 'warning'} className="ms-2">
                      {selectedBar.registration_status || 'pending'}
                    </CBadge>
                  </li>
                </ul>
              </div>
              <div className="col-md-6">
                <h6>Contatti e Indirizzo</h6>
                <ul className="list-unstyled">
                  <li><strong>Indirizzo:</strong> {selectedBar.indirizzo_completo || selectedBar.full_address || 'N/A'}</li>
                  <li><strong>Città:</strong> {selectedBar.citta || 'N/A'}</li>
                  <li><strong>CAP:</strong> {selectedBar.cap || 'N/A'}</li>
                  <li><strong>Telefono:</strong> {selectedBar.gestore_telefono || selectedBar.telefono || 'N/A'}</li>
                  <li><strong>Email:</strong> {selectedBar.gestore_email || selectedBar.email || (selectedBar.user ? selectedBar.user.email : 'N/A')}</li>
                </ul>
              </div>
              <div className="col-md-6">
                <h6>Orari di Apertura</h6>
                <ul className="list-unstyled">
                  <li><strong>Lun-Ven:</strong> {selectedBar.weekdays_open && selectedBar.weekdays_close ? `${selectedBar.weekdays_open} - ${selectedBar.weekdays_close}` : 'N/A'}</li>
                  <li><strong>Weekend:</strong> {selectedBar.weekend_open && selectedBar.weekend_close ? `${selectedBar.weekend_open} - ${selectedBar.weekend_close}` : 'N/A'}</li>
                </ul>
              </div>
              <div className="col-md-6">
                <h6>Coordinate GPS</h6>
                <ul className="list-unstyled">
                  <li><strong>Latitudine:</strong> {selectedBar.latitude || 'N/A'}</li>
                  <li><strong>Longitudine:</strong> {selectedBar.longitude || 'N/A'}</li>
                </ul>
              </div>
              {selectedBar.description && (
                <div className="col-12 mt-3">
                  <h6>Descrizione</h6>
                  <p>{selectedBar.description}</p>
                </div>
              )}
              {selectedBar.registration_notes && (
                <div className="col-12 mt-2">
                  <h6>Note di Registrazione</h6>
                  <p><small>{selectedBar.registration_notes}</small></p>
                </div>
              )}
              <div className="col-12 mt-3">
                <small className="text-muted">
                  <strong>Creato:</strong> {selectedBar.created_at ? new Date(selectedBar.created_at).toLocaleDateString('it-IT') : 'N/A'} |
                  <strong> Aggiornato:</strong> {selectedBar.updated_at ? new Date(selectedBar.updated_at).toLocaleDateString('it-IT') : 'N/A'}
                  {selectedBar.registration_date && (
                    <> | <strong> Registrato:</strong> {new Date(selectedBar.registration_date).toLocaleDateString('it-IT')}</>
                  )}
                </small>
              </div>
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>
            Chiudi
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default Bar
