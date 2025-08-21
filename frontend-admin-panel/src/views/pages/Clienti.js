// src/views/pages/Clienti.js
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
} from '@coreui/react'
import { cilInfo } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

const clientiData = [
  {
    id: 1,
    nomeCognome: 'Mario Rossi',
    email: 'mario.rossi@email.com',
    telefono: '+39 333 1234567',
    dataRegistrazione: '2024-01-15',
    regione: 'Lombardia',
    provincia: 'MI',
  },
  {
    id: 2,
    nomeCognome: 'Laura Bianchi',
    email: 'laura.bianchi@email.com',
    telefono: '+39 347 9876543',
    dataRegistrazione: '2024-02-20',
    regione: 'Lazio',
    provincia: 'RM',
  },
  {
    id: 3,
    nomeCognome: 'Giuseppe Verdi',
    email: 'g.verdi@email.com',
    telefono: '+39 338 5551234',
    dataRegistrazione: '2024-03-05',
    regione: 'Campania',
    provincia: 'NA',
  },
  {
    id: 4,
    nomeCognome: 'Anna Esposito',
    email: 'anna.espo@email.com',
    telefono: '+39 334 8765432',
    dataRegistrazione: '2024-03-12',
    regione: 'Campania',
    provincia: 'AV',
  },
]

const Clienti = () => {
  const [visible, setVisible] = useState(false)
  const [selectedCliente, setSelectedCliente] = useState(null)

  return (
    <div>
      <h2>👤 Gestione Clienti</h2>

      <div className="table-responsive">
        <CTable hover bordered>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>Nome e Cognome</CTableHeaderCell>
              <CTableHeaderCell>Email</CTableHeaderCell>
              <CTableHeaderCell>Telefono</CTableHeaderCell>
              <CTableHeaderCell>Data Registrazione</CTableHeaderCell>
              <CTableHeaderCell>Regione</CTableHeaderCell>
              <CTableHeaderCell>Provincia</CTableHeaderCell>
              <CTableHeaderCell>Azioni</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {clientiData.map((cliente) => (
              <CTableRow key={cliente.id}>
                <CTableDataCell>{cliente.nomeCognome}</CTableDataCell>
                <CTableDataCell>{cliente.email}</CTableDataCell>
                <CTableDataCell>{cliente.telefono}</CTableDataCell>
                <CTableDataCell>
                  {new Date(cliente.dataRegistrazione).toLocaleDateString('it-IT')}
                </CTableDataCell>
                <CTableDataCell>{cliente.regione}</CTableDataCell>
                <CTableDataCell>{cliente.provincia}</CTableDataCell>
                <CTableDataCell>
                  <CButton
                    size="sm"
                    color="primary"
                    onClick={() => {
                      setSelectedCliente(cliente)
                      setVisible(true)
                    }}
                  >
                    <CIcon icon={cilInfo} /> Dettagli
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </div>

      {/* Modal: Dettagli Cliente */}
      <CModal visible={visible} onClose={() => setVisible(false)} size="lg">
        <CModalHeader>
          <CModalTitle>Dettagli Cliente: {selectedCliente?.nomeCognome}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedCliente && (
            <div className="row">
              <div className="col-md-6 mb-3">
                <strong>Nome e Cognome:</strong>
                <p>{selectedCliente.nomeCognome}</p>
              </div>
              <div className="col-md-6 mb-3">
                <strong>Email:</strong>
                <p>{selectedCliente.email}</p>
              </div>
              <div className="col-md-6 mb-3">
                <strong>Telefono:</strong>
                <p>{selectedCliente.telefono}</p>
              </div>
              <div className="col-md-6 mb-3">
                <strong>Data Registrazione:</strong>
                <p>{new Date(selectedCliente.dataRegistrazione).toLocaleDateString('it-IT')}</p>
              </div>
              <div className="col-md-6 mb-3">
                <strong>Regione:</strong>
                <p>{selectedCliente.regione}</p>
              </div>
              <div className="col-md-6 mb-3">
                <strong>Provincia:</strong>
                <p>{selectedCliente.provincia}</p>
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

export default Clienti
