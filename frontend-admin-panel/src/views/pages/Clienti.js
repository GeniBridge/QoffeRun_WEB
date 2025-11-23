// src/views/pages/Clienti.js
import React, { useState, useEffect } from 'react'
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
  CFormSelect,
  CRow,
  CCol,
  CPagination,
  CPaginationItem,
  CBadge,
  CCard,
  CCardBody,
  CCardHeader,
} from '@coreui/react'
import { cilInfo } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import adminAuthService from '../../services/adminAuthService'

const Clienti = () => {
  const [customers, setCustomers] = useState([])
  const [filteredCustomers, setFilteredCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(false)
  const [selectedCliente, setSelectedCliente] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    const token = adminAuthService.getToken()
    fetch('https://api.qofferun.com/api/v1/admin/customers', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setCustomers(data.data)
        setFilteredCustomers(data.data)
      }
      setLoading(false)
    })
    .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    let result = customers
    
    if (searchTerm) {
      result = result.filter(customer => 
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (statusFilter === 'verified') {
      result = result.filter(customer => customer.email_verified_at !== null)
    } else if (statusFilter === 'unverified') {
      result = result.filter(customer => customer.email_verified_at === null)
    }
    
    setFilteredCustomers(result)
    setCurrentPage(1)
  }, [searchTerm, statusFilter, customers])

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage)

  if (loading) return <div>Caricamento...</div>

  return (
    <CCard>
      <CCardHeader>
        <strong>👤 Gestione Clienti App ({filteredCustomers.length})</strong>
      </CCardHeader>
      <CCardBody>
        <CRow className="mb-3">
          <CCol md={6}>
            <CFormInput
              type="text"
              placeholder="Cerca per nome, email o telefono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </CCol>
          <CCol md={3}>
            <CFormSelect
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tutti gli stati</option>
              <option value="verified">Email verificata</option>
              <option value="unverified">Email non verificata</option>
            </CFormSelect>
          </CCol>
          <CCol md={3} className="text-end">
            <small className="text-muted">
              {filteredCustomers.length} clienti trovati
            </small>
          </CCol>
        </CRow>

        <div className="table-responsive">
          <CTable hover bordered>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Nome</CTableHeaderCell>
                <CTableHeaderCell>Email</CTableHeaderCell>
                <CTableHeaderCell>Telefono</CTableHeaderCell>
                <CTableHeaderCell>Stato</CTableHeaderCell>
                <CTableHeaderCell>Data Registrazione</CTableHeaderCell>
                <CTableHeaderCell>Azioni</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {paginatedCustomers.map((cliente) => (
                <CTableRow key={cliente.id}>
                  <CTableDataCell>{cliente.name || 'N/A'}</CTableDataCell>
                  <CTableDataCell>{cliente.email}</CTableDataCell>
                  <CTableDataCell>{cliente.phone || 'N/A'}</CTableDataCell>
                  <CTableDataCell>
                    {cliente.email_verified_at ? (
                      <CBadge color="success">Verificato</CBadge>
                    ) : (
                      <CBadge color="warning">Non verificato</CBadge>
                    )}
                  </CTableDataCell>
                  <CTableDataCell>
                    {new Date(cliente.created_at).toLocaleDateString('it-IT')}
                  </CTableDataCell>
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

        {totalPages > 1 && (
          <CPagination align="center" className="mt-3">
            <CPaginationItem 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Precedente
            </CPaginationItem>
            {[...Array(totalPages)].map((_, i) => (
              <CPaginationItem
                key={i + 1}
                active={currentPage === i + 1}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </CPaginationItem>
            ))}
            <CPaginationItem
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Successivo
            </CPaginationItem>
          </CPagination>
        )}

        {/* Modal: Dettagli Cliente */}
        <CModal visible={visible} onClose={() => setVisible(false)} size="lg">
          <CModalHeader>
            <CModalTitle>Dettagli Cliente: {selectedCliente?.name}</CModalTitle>
          </CModalHeader>
          <CModalBody>
            {selectedCliente && (
              <div className="row">
                <div className="col-md-6 mb-3">
                  <strong>ID:</strong>
                  <p>{selectedCliente.id}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <strong>Nome:</strong>
                  <p>{selectedCliente.name || 'N/A'}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <strong>Email:</strong>
                  <p>{selectedCliente.email}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <strong>Telefono:</strong>
                  <p>{selectedCliente.phone || 'N/A'}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <strong>Stato Email:</strong>
                  <p>
                    {selectedCliente.email_verified_at ? (
                      <CBadge color="success">Verificato il {new Date(selectedCliente.email_verified_at).toLocaleDateString('it-IT')}</CBadge>
                    ) : (
                      <CBadge color="warning">Non verificato</CBadge>
                    )}
                  </p>
                </div>
                <div className="col-md-6 mb-3">
                  <strong>Data Registrazione:</strong>
                  <p>{new Date(selectedCliente.created_at).toLocaleDateString('it-IT')} alle {new Date(selectedCliente.created_at).toLocaleTimeString('it-IT')}</p>
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
      </CCardBody>
    </CCard>
  )
}

export default Clienti
