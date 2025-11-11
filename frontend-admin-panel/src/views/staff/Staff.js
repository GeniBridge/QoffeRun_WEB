import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CAlert,
  CBadge,
  CInputGroup,
  CInputGroupText,
  CPagination,
  CPaginationItem,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch, cilPlus, cilPencil, cilTrash, cilUserX } from '@coreui/icons'

const Staff = () => {
  const [staff, setStaff] = useState([])
  const [chains, setChains] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingStaff, setEditingStaff] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedChain, setSelectedChain] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    chain_id: '',
    employee_code: '',
    hire_date: '',
    emergency_contact: {
      name: '',
      phone: '',
      relationship: ''
    }
  })

  // API Base URL
  const API_URL = process.env.REACT_APP_API_URL || 'https://api.qofferun.com'

  // Auth token
  const getAuthToken = () => localStorage.getItem('admin_auth_token')

  const authHeaders = () => ({
    'Authorization': `Bearer ${getAuthToken()}`,
    'Content-Type': 'application/json'
  })

  // Load staff list
  const loadStaff = async (page = 1) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: '10'
      })
      
      if (searchTerm) params.append('search', searchTerm)
      if (selectedChain) params.append('chain_id', selectedChain)

      const response = await fetch(`${API_URL}/api/v1/admin/staff?${params}`, {
        headers: authHeaders()
      })

      if (!response.ok) throw new Error('Errore nel caricamento staff')

      const result = await response.json()
      if (result.success) {
        setStaff(result.data.data || [])
        setCurrentPage(result.data.current_page || 1)
        setTotalPages(result.data.last_page || 1)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Load chains for dropdown
  const loadChains = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/admin/chains`, {
        headers: authHeaders()
      })

      if (!response.ok) throw new Error('Errore nel caricamento catene')

      const result = await response.json()
      if (result.success) {
        setChains(result.data.data || [])
      }
    } catch (err) {
      console.error('Errore caricamento catene:', err)
    }
  }

  useEffect(() => {
    loadStaff()
    loadChains()
  }, [])

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchTerm !== '' || selectedChain !== '') {
        loadStaff(1)
      }
    }, 500)

    return () => clearTimeout(delayedSearch)
  }, [searchTerm, selectedChain])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const url = editingStaff 
        ? `${API_URL}/api/v1/admin/staff/${editingStaff.id}`
        : `${API_URL}/api/v1/admin/staff`
      
      const method = editingStaff ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Errore nella richiesta')
      }

      if (result.success) {
        setSuccess(editingStaff ? 'Staff aggiornato con successo' : 'Staff creato con successo')
        setShowModal(false)
        setEditingStaff(null)
        resetForm()
        loadStaff(currentPage)
      }
    } catch (err) {
      setError(err.message)
    }
  }

  const handleEdit = (staffMember) => {
    setEditingStaff(staffMember)
    setFormData({
      name: staffMember.name || '',
      email: staffMember.email || '',
      password: '',
      phone: staffMember.phone || '',
      chain_id: staffMember.chain_id || '',
      employee_code: staffMember.employee_code || '',
      hire_date: staffMember.hire_date || '',
      emergency_contact: staffMember.emergency_contact || {
        name: '',
        phone: '',
        relationship: ''
      }
    })
    setShowModal(true)
  }

  const handleTerminate = async (staffId) => {
    if (!window.confirm('Sei sicuro di voler terminare il rapporto di lavoro?')) return

    try {
      const terminationDate = new Date().toISOString().split('T')[0]
      
      const response = await fetch(`${API_URL}/api/v1/admin/staff/${staffId}/terminate`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          termination_date: terminationDate,
          reason: 'Terminazione da pannello admin'
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Errore nella terminazione')
      }

      if (result.success) {
        setSuccess('Rapporto di lavoro terminato')
        loadStaff(currentPage)
      }
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDelete = async (staffId) => {
    if (!window.confirm('Sei sicuro di voler eliminare definitivamente questo staff? Questa azione non può essere annullata.')) return

    try {
      const response = await fetch(`${API_URL}/api/v1/admin/staff/${staffId}`, {
        method: 'DELETE',
        headers: authHeaders()
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Errore nell\'eliminazione')
      }

      if (result.success) {
        setSuccess('Staff eliminato definitivamente')
        loadStaff(currentPage)
      }
    } catch (err) {
      setError(err.message)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      chain_id: '',
      employee_code: '',
      hire_date: '',
      emergency_contact: {
        name: '',
        phone: '',
        relationship: ''
      }
    })
  }

  const handleModalClose = () => {
    setShowModal(false)
    setEditingStaff(null)
    resetForm()
    setError('')
  }

  const handleNewStaff = () => {
    setEditingStaff(null)
    resetForm()
    setShowModal(true)
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">👥 Gestione Staff</h4>
            <CButton color="primary" onClick={handleNewStaff}>
              <CIcon icon={cilPlus} className="me-1" />
              Nuovo Staff
            </CButton>
          </CCardHeader>
          <CCardBody>
            {error && <CAlert color="danger" dismissible onClose={() => setError('')}>{error}</CAlert>}
            {success && <CAlert color="success" dismissible onClose={() => setSuccess('')}>{success}</CAlert>}

            {/* Filtri di ricerca */}
            <CRow className="mb-3">
              <CCol md={6}>
                <CInputGroup>
                  <CInputGroupText>
                    <CIcon icon={cilSearch} />
                  </CInputGroupText>
                  <CFormInput
                    placeholder="Cerca staff per nome, email o codice dipendente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </CInputGroup>
              </CCol>
              <CCol md={4}>
                <CFormSelect
                  value={selectedChain}
                  onChange={(e) => setSelectedChain(e.target.value)}
                >
                  <option value="">Tutte le catene</option>
                  {chains.map((chain) => (
                    <option key={chain.id} value={chain.id}>{chain.name}</option>
                  ))}
                </CFormSelect>
              </CCol>
            </CRow>

            {/* Tabella staff */}
            <CTable responsive striped hover>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Nome</CTableHeaderCell>
                  <CTableHeaderCell>Email</CTableHeaderCell>
                  <CTableHeaderCell>Codice</CTableHeaderCell>
                  <CTableHeaderCell>Catena</CTableHeaderCell>
                  <CTableHeaderCell>Data Assunzione</CTableHeaderCell>
                  <CTableHeaderCell>Stato</CTableHeaderCell>
                  <CTableHeaderCell>Azioni</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {loading ? (
                  <CTableRow>
                    <CTableDataCell colSpan={7} className="text-center">Caricamento...</CTableDataCell>
                  </CTableRow>
                ) : staff.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan={7} className="text-center">Nessun staff trovato</CTableDataCell>
                  </CTableRow>
                ) : (
                  staff.map((member) => (
                    <CTableRow key={member.id}>
                      <CTableDataCell>{member.name}</CTableDataCell>
                      <CTableDataCell>{member.email}</CTableDataCell>
                      <CTableDataCell>
                        <code>{member.employee_code || 'N/A'}</code>
                      </CTableDataCell>
                      <CTableDataCell>{member.chain?.name || 'N/A'}</CTableDataCell>
                      <CTableDataCell>
                        {member.hire_date ? new Date(member.hire_date).toLocaleDateString('it-IT') : 'N/A'}
                      </CTableDataCell>
                      <CTableDataCell>
                        {member.termination_date ? (
                          <CBadge color="danger">Terminato</CBadge>
                        ) : (
                          <CBadge color="success">Attivo</CBadge>
                        )}
                      </CTableDataCell>
                      <CTableDataCell>
                        <div className="d-flex gap-1">
                          <CButton
                            color="info"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(member)}
                          >
                            <CIcon icon={cilPencil} />
                          </CButton>
                          {!member.termination_date && (
                            <CButton
                              color="warning"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleTerminate(member.id)}
                            >
                              <CIcon icon={cilUserX} />
                            </CButton>
                          )}
                          <CButton
                            color="danger"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(member.id)}
                          >
                            <CIcon icon={cilTrash} />
                          </CButton>
                        </div>
                      </CTableDataCell>
                    </CTableRow>
                  ))
                )}
              </CTableBody>
            </CTable>

            {/* Paginazione */}
            {totalPages > 1 && (
              <CPagination className="justify-content-center">
                <CPaginationItem 
                  disabled={currentPage === 1}
                  onClick={() => currentPage > 1 && loadStaff(currentPage - 1)}
                >
                  Precedente
                </CPaginationItem>
                {[...Array(totalPages)].map((_, i) => (
                  <CPaginationItem
                    key={i + 1}
                    active={currentPage === i + 1}
                    onClick={() => loadStaff(i + 1)}
                  >
                    {i + 1}
                  </CPaginationItem>
                ))}
                <CPaginationItem
                  disabled={currentPage === totalPages}
                  onClick={() => currentPage < totalPages && loadStaff(currentPage + 1)}
                >
                  Successivo
                </CPaginationItem>
              </CPagination>
            )}
          </CCardBody>
        </CCard>
      </CCol>

      {/* Modal per creazione/modifica staff */}
      <CModal visible={showModal} onClose={handleModalClose} size="lg">
        <CModalHeader>
          <CModalTitle>{editingStaff ? 'Modifica Staff' : 'Nuovo Staff'}</CModalTitle>
        </CModalHeader>
        <CForm onSubmit={handleSubmit}>
          <CModalBody>
            {error && <CAlert color="danger">{error}</CAlert>}
            
            <CRow>
              <CCol md={6} className="mb-3">
                <CFormLabel htmlFor="name">Nome*</CFormLabel>
                <CFormInput
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </CCol>
              <CCol md={6} className="mb-3">
                <CFormLabel htmlFor="email">Email*</CFormLabel>
                <CFormInput
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </CCol>
            </CRow>

            <CRow>
              <CCol md={6} className="mb-3">
                <CFormLabel htmlFor="password">
                  Password{editingStaff ? ' (lascia vuoto per non modificare)' : '*'}
                </CFormLabel>
                <CFormInput
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required={!editingStaff}
                />
              </CCol>
              <CCol md={6} className="mb-3">
                <CFormLabel htmlFor="phone">Telefono</CFormLabel>
                <CFormInput
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </CCol>
            </CRow>

            <CRow>
              <CCol md={6} className="mb-3">
                <CFormLabel htmlFor="chain_id">Catena*</CFormLabel>
                <CFormSelect
                  id="chain_id"
                  value={formData.chain_id}
                  onChange={(e) => setFormData({...formData, chain_id: e.target.value})}
                  required
                >
                  <option value="">Seleziona catena</option>
                  {chains.map((chain) => (
                    <option key={chain.id} value={chain.id}>{chain.name}</option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={6} className="mb-3">
                <CFormLabel htmlFor="employee_code">Codice Dipendente</CFormLabel>
                <CFormInput
                  type="text"
                  id="employee_code"
                  value={formData.employee_code}
                  onChange={(e) => setFormData({...formData, employee_code: e.target.value})}
                  placeholder="Generato automaticamente se vuoto"
                />
              </CCol>
            </CRow>

            <CRow>
              <CCol md={6} className="mb-3">
                <CFormLabel htmlFor="hire_date">Data Assunzione*</CFormLabel>
                <CFormInput
                  type="date"
                  id="hire_date"
                  value={formData.hire_date}
                  onChange={(e) => setFormData({...formData, hire_date: e.target.value})}
                  required
                />
              </CCol>
            </CRow>

            <h6 className="mt-3 mb-2">Contatto di Emergenza</h6>
            <CRow>
              <CCol md={4} className="mb-3">
                <CFormLabel htmlFor="emergency_name">Nome</CFormLabel>
                <CFormInput
                  type="text"
                  id="emergency_name"
                  value={formData.emergency_contact.name}
                  onChange={(e) => setFormData({
                    ...formData,
                    emergency_contact: {...formData.emergency_contact, name: e.target.value}
                  })}
                />
              </CCol>
              <CCol md={4} className="mb-3">
                <CFormLabel htmlFor="emergency_phone">Telefono</CFormLabel>
                <CFormInput
                  type="tel"
                  id="emergency_phone"
                  value={formData.emergency_contact.phone}
                  onChange={(e) => setFormData({
                    ...formData,
                    emergency_contact: {...formData.emergency_contact, phone: e.target.value}
                  })}
                />
              </CCol>
              <CCol md={4} className="mb-3">
                <CFormLabel htmlFor="emergency_relationship">Parentela</CFormLabel>
                <CFormInput
                  type="text"
                  id="emergency_relationship"
                  value={formData.emergency_contact.relationship}
                  onChange={(e) => setFormData({
                    ...formData,
                    emergency_contact: {...formData.emergency_contact, relationship: e.target.value}
                  })}
                  placeholder="es. Padre, Moglie, ..."
                />
              </CCol>
            </CRow>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={handleModalClose}>
              Annulla
            </CButton>
            <CButton color="primary" type="submit">
              {editingStaff ? 'Aggiorna' : 'Crea'} Staff
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>
    </CRow>
  )
}

export default Staff