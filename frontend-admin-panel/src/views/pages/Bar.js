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
} from '@coreui/react'
import { cilInfo } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

// Sample data - replace with API call later
const barData = [
  {
    id: 1,
    barName: 'Caffè Centrale',
    indirizzo: 'Via Roma 123',
    regione: 'Lombardia',
    provincia: 'MI',
    telefono: '+39 02 1234567',
    email: 'centrale@qoffe.run',
  },
  {
    id: 2,
    barName: 'Bar del Corso',
    indirizzo: 'Corso Italia 45',
    regione: 'Lazio',
    provincia: 'RM',
    telefono: '+39 06 9876543',
    email: 'corso@qoffe.run',
  },
  {
    id: 3,
    barName: 'Espresso Nord',
    indirizzo: 'Piazza Verdi 7',
    regione: 'Veneto',
    provincia: 'PD',
    telefono: '+39 049 1122334',
    email: 'nord@qoffe.run',
  },
  {
    id: 4,
    barName: 'La Tazzina',
    indirizzo: 'Via Garibaldi 88',
    regione: 'Campania',
    provincia: 'NA',
    telefono: '+39 081 5556677',
    email: 'tazzina@qoffe.run',
  },
]

const Bar = () => {
  const [visible, setVisible] = useState(false)
  const [selectedBar, setSelectedBar] = useState(null)
  const [filter, setFilter] = useState('')

  // Filter data based on search input
  const filteredData = barData.filter((bar) =>
    Object.values(bar).some((value) =>
      value.toString().toLowerCase().includes(filter.toLowerCase()),
    ),
  )

  return (
    <div>
      <h2>🏪 Gestione Bar</h2>

      {/* Search Input */}
      <div className="mb-3" style={{ maxWidth: '300px' }}>
        <CFormInput
          type="text"
          placeholder="Cerca..."
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
              <CTableHeaderCell>Indirizzo</CTableHeaderCell>
              <CTableHeaderCell>Regione</CTableHeaderCell>
              <CTableHeaderCell>Provincia</CTableHeaderCell>
              <CTableHeaderCell>Telefono</CTableHeaderCell>
              <CTableHeaderCell>Email</CTableHeaderCell>
              <CTableHeaderCell>Azioni</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {filteredData.length > 0 ? (
              filteredData.map((bar) => (
                <CTableRow key={bar.id}>
                  <CTableDataCell>{bar.barName}</CTableDataCell>
                  <CTableDataCell>{bar.indirizzo}</CTableDataCell>
                  <CTableDataCell>{bar.regione}</CTableDataCell>
                  <CTableDataCell>{bar.provincia}</CTableDataCell>
                  <CTableDataCell>{bar.telefono}</CTableDataCell>
                  <CTableDataCell>{bar.email}</CTableDataCell>
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
                <CTableDataCell colSpan="7" className="text-center">
                  Nessun risultato trovato
                </CTableDataCell>
              </CTableRow>
            )}
          </CTableBody>
        </CTable>
      </div>

      {/* Modal: Dettagli Bar */}
      <CModal visible={visible} onClose={() => setVisible(false)}>
        <CModalHeader>
          <CModalTitle>Dettagli Bar: {selectedBar?.barName}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedBar && (
            <ul>
              <li>
                <strong>Indirizzo:</strong> {selectedBar.indirizzo}
              </li>
              <li>
                <strong>Regione:</strong> {selectedBar.regione}
              </li>
              <li>
                <strong>Provincia:</strong> {selectedBar.provincia}
              </li>
              <li>
                <strong>Telefono:</strong> {selectedBar.telefono}
              </li>
              <li>
                <strong>Email:</strong> {selectedBar.email}
              </li>
            </ul>
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
