// src/views/pages/Transazioni.js
import React, { useState } from 'react'
import {
  CTable,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CTableBody,
  CTableDataCell,
  CButton,
  CBadge,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormInput,
} from '@coreui/react'
import { cilReload, cilInfo, cilMoney } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

// Sample data - replace with API later
const transazioniData = [
  {
    id: 1,
    nomeBar: 'Caffè Centrale',
    modalitaPagamento: 'Stripe',
    accountPrelievo: 'IT60X0542811101000000123456',
    commissione: '2.90%',
    sommaPrelievo: 485.5,
    dataOra: '2024-05-20T14:30:00',
    stato: 'success',
  },
  {
    id: 2,
    nomeBar: 'Bar del Corso',
    modalitaPagamento: 'PayPal',
    accountPrelievo: 'IT48Y3000402200000000789012',
    commissione: '3.50%',
    sommaPrelievo: 320.0,
    dataOra: '2024-05-19T09:15:00',
    stato: 'failed',
  },
  {
    id: 3,
    nomeBar: 'Espresso Nord',
    modalitaPagamento: 'Bank Transfer',
    accountPrelievo: 'IT22Z12345000009876543210',
    commissione: '1.50%',
    sommaPrelievo: 670.8,
    dataOra: '2024-05-18T17:45:00',
    stato: 'pending',
  },
  {
    id: 4,
    nomeBar: 'La Tazzina',
    modalitaPagamento: 'Stripe',
    accountPrelievo: 'IT87W11000023456789012345',
    commissione: '2.90%',
    sommaPrelievo: 290.25,
    dataOra: '2024-05-17T11:20:00',
    stato: 'success',
  },
]

const Transazioni = () => {
  const [visible, setVisible] = useState(false)
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('')

  // Format date and time
  const formatDateTime = (isoString) => {
    const date = new Date(isoString)
    return date.toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  // Filter data
  const filteredData = transazioniData.filter((item) =>
    Object.values(item).some((value) =>
      value.toString().toLowerCase().includes(filter.toLowerCase()),
    ),
  )

  return (
    <div>
      <h2>💳 Transazioni</h2>

      {/* Search Input */}
      <div className="mb-3" style={{ maxWidth: '300px' }}>
        <CFormInput
          type="text"
          placeholder="Cerca transazioni..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="table-responsive">
        <CTable hover bordered>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>Nome Bar</CTableHeaderCell>
              <CTableHeaderCell>Modalità di pagamento</CTableHeaderCell>
              <CTableHeaderCell>Account Prelievo</CTableHeaderCell>
              <CTableHeaderCell>Commissione</CTableHeaderCell>
              <CTableHeaderCell>Somma Prelievata</CTableHeaderCell>
              <CTableHeaderCell>Data e Ora</CTableHeaderCell>
              <CTableHeaderCell>Stato Prelievo</CTableHeaderCell>
              <CTableHeaderCell>Azioni</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <CTableRow key={item.id}>
                  <CTableDataCell>{item.nomeBar}</CTableDataCell>
                  <CTableDataCell>{item.modalitaPagamento}</CTableDataCell>
                  <CTableDataCell className="text-muted">{item.accountPrelievo}</CTableDataCell>
                  <CTableDataCell>{item.commissione}</CTableDataCell>
                  <CTableDataCell>{formatCurrency(item.sommaPrelievo)}</CTableDataCell>
                  <CTableDataCell>{formatDateTime(item.dataOra)}</CTableDataCell>
                  <CTableDataCell>
                    <CBadge
                      color={
                        item.stato === 'success'
                          ? 'success'
                          : item.stato === 'pending'
                            ? 'warning'
                            : 'danger'
                      }
                    >
                      {item.stato === 'success'
                        ? 'Completato'
                        : item.stato === 'pending'
                          ? 'In corso'
                          : 'Fallito'}
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell className="text-center">
                    <CButton
                      size="sm"
                      color="info"
                      variant="ghost"
                      className="me-2"
                      onClick={() => {
                        alert(`Re-invio richiesto per transazione ID: ${item.id}`)
                      }}
                      disabled={item.stato === 'success'}
                    >
                      <CIcon icon={cilReload} /> Re-invia
                    </CButton>
                    <CButton
                      size="sm"
                      color="primary"
                      variant="ghost"
                      onClick={() => {
                        setSelected(item)
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
                  Nessun risultato trovato
                </CTableDataCell>
              </CTableRow>
            )}
          </CTableBody>
        </CTable>
      </div>

      {/* Modal: Dettagli Transazione */}
      <CModal visible={visible} onClose={() => setVisible(false)} size="lg">
        <CModalHeader>
          <CModalTitle>
            <CIcon icon={cilMoney} /> Dettagli Transazione
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selected && (
            <div className="row">
              <div className="col-md-6 mb-3">
                <strong>Nome Bar:</strong>
                <p>{selected.nomeBar}</p>
              </div>
              <div className="col-md-6 mb-3">
                <strong>Modalità di pagamento:</strong>
                <p>{selected.modalitaPagamento}</p>
              </div>
              <div className="col-md-6 mb-3">
                <strong>Account Prelievo:</strong>
                <p className="text-muted">{selected.accountPrelievo}</p>
              </div>
              <div className="col-md-6 mb-3">
                <strong>Commissione:</strong>
                <p>{selected.commissione}</p>
              </div>
              <div className="col-md-6 mb-3">
                <strong>Somma Prelievata:</strong>
                <p className="h5">{formatCurrency(selected.sommaPrelievo)}</p>
              </div>
              <div className="col-md-6 mb-3">
                <strong>Data e Ora:</strong>
                <p>{formatDateTime(selected.dataOra)}</p>
              </div>
              <div className="col-md-6 mb-3">
                <strong>Stato:</strong>
                <p>
                  <CBadge
                    color={
                      selected.stato === 'success'
                        ? 'success'
                        : selected.stato === 'pending'
                          ? 'warning'
                          : 'danger'
                    }
                  >
                    {selected.stato === 'success'
                      ? 'Completato'
                      : selected.stato === 'pending'
                        ? 'In corso'
                        : 'Fallito'}
                  </CBadge>
                </p>
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

export default Transazioni
