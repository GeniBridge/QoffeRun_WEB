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
  CFormTextarea,
  CAlert,
  CBadge,
  CInputGroup,
  CInputGroupText,
  CFormCheck,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch, cilPlus, cilPencil, cilTrash, cilUserX, cilBriefcase, cilLocationPin } from '@coreui/icons'

const StaffMultiBranch = () => {
  const [chainStaff, setChainStaff] = useState([])
  const [branchStaff, setBranchStaff] = useState([])
  const [branches, setBranches] = useState([])
  const [availableUsers, setAvailableUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedBranch, setSelectedBranch] = useState('')
  const [activeTab, setActiveTab] = useState('all-staff')

  const [assignmentForm, setAssignmentForm] = useState({
    userId: '',
    branchId: '',
    roleAtBranch: 'staff',
    permissions: [],
    workSchedule: '',
    isPrimary: false
  })

  // API Base URL
  const API_URL = process.env.REACT_APP_API_URL || 'https://api.qofferun.com'

  // Auth token
  const getAuthToken = () => localStorage.getItem('admin_auth_token')

  const authHeaders = () => ({
    'Authorization': `Bearer ${getAuthToken()}`,
    'Content-Type': 'application/json'
  })

  // Load chain staff (all staff across all branches)
  const loadChainStaff = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/api/v1/admin/staff-management/chain-staff`, {
        headers: authHeaders()
      })

      if (!response.ok) throw new Error('Errore nel caricamento staff della catena')

      const result = await response.json()
      if (result.success) {
        setChainStaff(result.data || [])
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Load staff for specific branch
  const loadBranchStaff = async (branchId) => {
    if (!branchId) return
    
    try {
      const response = await fetch(`${API_URL}/api/v1/admin/staff-management/branch/${branchId}`, {
        headers: authHeaders()
      })

      if (!response.ok) throw new Error('Errore nel caricamento staff della filiale')

      const result = await response.json()
      if (result.success) {
        setBranchStaff(result.data || [])
      }
    } catch (err) {
      setError(err.message)
    }
  }

  // Load branches for dropdown
  const loadBranches = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/admin/branches`, {
        headers: authHeaders()
      })

      if (!response.ok) throw new Error('Errore nel caricamento filiali')

      const result = await response.json()
      if (result.success) {
        setBranches(result.data.data || [])
      }
    } catch (err) {
      console.error('Errore caricamento filiali:', err)
    }
  }

  // Load available users (not yet assigned to current branch)
  const loadAvailableUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/admin/staff`, {
        headers: authHeaders()
      })

      if (!response.ok) throw new Error('Errore nel caricamento utenti')

      const result = await response.json()
      if (result.success) {
        setAvailableUsers(result.data.data || [])
      }
    } catch (err) {
      console.error('Errore caricamento utenti:', err)
    }
  }

  // Assign user to branch
  const assignUserToBranch = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/admin/staff-management/assign`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          user_id: assignmentForm.userId,
          branch_id: assignmentForm.branchId,
          role_at_branch: assignmentForm.roleAtBranch,
          permissions: assignmentForm.permissions.join(','),
          work_schedule: assignmentForm.workSchedule,
          is_primary_branch: assignmentForm.isPrimary
        })
      })

      if (!response.ok) throw new Error('Errore nell\'assegnazione utente')

      const result = await response.json()
      if (result.success) {
        setSuccess('Utente assegnato con successo alla filiale')
        setShowAssignModal(false)
        resetAssignmentForm()
        loadChainStaff()
        if (selectedBranch) loadBranchStaff(selectedBranch)
      }
    } catch (err) {
      setError(err.message)
    }
  }

  // Remove user from branch
  const removeUserFromBranch = async (userId, branchId) => {
    if (!window.confirm('Sei sicuro di voler rimuovere questo utente dalla filiale?')) return

    try {
      const response = await fetch(`${API_URL}/api/v1/admin/staff-management/remove`, {
        method: 'DELETE',
        headers: authHeaders(),
        body: JSON.stringify({
          user_id: userId,
          branch_id: branchId
        })
      })

      if (!response.ok) throw new Error('Errore nella rimozione utente')

      const result = await response.json()
      if (result.success) {
        setSuccess('Utente rimosso con successo dalla filiale')
        loadChainStaff()
        if (selectedBranch) loadBranchStaff(selectedBranch)
      }
    } catch (err) {
      setError(err.message)
    }
  }

  const resetAssignmentForm = () => {
    setAssignmentForm({
      userId: '',
      branchId: '',
      roleAtBranch: 'staff',
      permissions: [],
      workSchedule: '',
      isPrimary: false
    })
  }

  const handlePermissionChange = (permission, checked) => {
    if (checked) {
      setAssignmentForm(prev => ({
        ...prev,
        permissions: [...prev.permissions, permission]
      }))
    } else {
      setAssignmentForm(prev => ({
        ...prev,
        permissions: prev.permissions.filter(p => p !== permission)
      }))
    }
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'chain_owner': return 'danger'
      case 'branch_manager': return 'warning'
      case 'barista': return 'info'
      default: return 'secondary'
    }
  }

  const formatWorkSchedule = (schedule) => {
    if (!schedule) return 'Non specificato'
    return schedule.replace(/,/g, ', ')
  }

  useEffect(() => {
    loadChainStaff()
    loadBranches()
    loadAvailableUsers()
  }, [])

  useEffect(() => {
    if (selectedBranch) {
      loadBranchStaff(selectedBranch)
    }
  }, [selectedBranch])

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Gestione Staff Multi-Filiale</strong>
            <div className="d-flex justify-content-end">
              <CButton
                color="primary"
                onClick={() => setShowAssignModal(true)}
              >
                <CIcon icon={cilPlus} size="sm" className="me-2" />
                Assegna Staff a Filiale
              </CButton>
            </div>
          </CCardHeader>
          <CCardBody>
            {error && <CAlert color="danger" dismissible onClose={() => setError('')}>{error}</CAlert>}
            {success && <CAlert color="success" dismissible onClose={() => setSuccess('')}>{success}</CAlert>}

            {/* Navigation Tabs */}
            <CNav variant="tabs" className="mb-3">
              <CNavItem>
                <CNavLink
                  active={activeTab === 'all-staff'}
                  onClick={() => setActiveTab('all-staff')}
                  style={{ cursor: 'pointer' }}
                >
                  <CIcon icon={cilBriefcase} className="me-2" />
                  Tutto il Staff
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink
                  active={activeTab === 'by-branch'}
                  onClick={() => setActiveTab('by-branch')}
                  style={{ cursor: 'pointer' }}
                >
                  <CIcon icon={cilLocationPin} className="me-2" />
                  Per Filiale
                </CNavLink>
              </CNavItem>
            </CNav>

            <CTabContent>
              {/* All Staff Tab */}
              <CTabPane visible={activeTab === 'all-staff'}>
                <CTable striped hover responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Nome</CTableHeaderCell>
                      <CTableHeaderCell>Email</CTableHeaderCell>
                      <CTableHeaderCell>Filiali Assegnate</CTableHeaderCell>
                      <CTableHeaderCell>Ruolo Principale</CTableHeaderCell>
                      <CTableHeaderCell>Azioni</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {chainStaff.map((staff) => (
                      <CTableRow key={staff.id}>
                        <CTableDataCell>{staff.name}</CTableDataCell>
                        <CTableDataCell>{staff.email}</CTableDataCell>
                        <CTableDataCell>
                          {staff.assigned_branches?.map((assignment) => (
                            <div key={`${staff.id}-${assignment.branch.id}`} className="mb-1">
                              <CBadge color={assignment.is_primary_branch ? 'primary' : 'light'} className="me-2">
                                {assignment.branch.name}
                              </CBadge>
                              <CBadge color={getRoleBadgeColor(assignment.role_at_branch)}>
                                {assignment.role_at_branch}
                              </CBadge>
                            </div>
                          ))}
                        </CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={getRoleBadgeColor(staff.primary_role)}>
                            {staff.primary_role}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell>
                          {staff.assigned_branches?.map((assignment) => (
                            <CButton
                              key={`remove-${staff.id}-${assignment.branch.id}`}
                              color="danger"
                              variant="ghost"
                              size="sm"
                              className="me-2 mb-1"
                              onClick={() => removeUserFromBranch(staff.id, assignment.branch.id)}
                              title={`Rimuovi da ${assignment.branch.name}`}
                            >
                              <CIcon icon={cilUserX} size="sm" />
                            </CButton>
                          ))}
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              </CTabPane>

              {/* By Branch Tab */}
              <CTabPane visible={activeTab === 'by-branch'}>
                <CRow className="mb-3">
                  <CCol md={4}>
                    <CFormSelect
                      value={selectedBranch}
                      onChange={(e) => setSelectedBranch(e.target.value)}
                    >
                      <option value="">Seleziona una filiale</option>
                      {branches.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                          {branch.name} - {branch.address}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>
                </CRow>

                {selectedBranch && (
                  <CTable striped hover responsive>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Nome</CTableHeaderCell>
                        <CTableHeaderCell>Email</CTableHeaderCell>
                        <CTableHeaderCell>Ruolo</CTableHeaderCell>
                        <CTableHeaderCell>Permessi</CTableHeaderCell>
                        <CTableHeaderCell>Orario</CTableHeaderCell>
                        <CTableHeaderCell>Primaria</CTableHeaderCell>
                        <CTableHeaderCell>Azioni</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {branchStaff.map((staff) => (
                        <CTableRow key={staff.user_id}>
                          <CTableDataCell>{staff.user.name}</CTableDataCell>
                          <CTableDataCell>{staff.user.email}</CTableDataCell>
                          <CTableDataCell>
                            <CBadge color={getRoleBadgeColor(staff.role_at_branch)}>
                              {staff.role_at_branch}
                            </CBadge>
                          </CTableDataCell>
                          <CTableDataCell>
                            {staff.permissions ? (
                              staff.permissions.split(',').map((perm, idx) => (
                                <CBadge key={idx} color="info" className="me-1">
                                  {perm.trim()}
                                </CBadge>
                              ))
                            ) : (
                              <span className="text-muted">Nessuno</span>
                            )}
                          </CTableDataCell>
                          <CTableDataCell>
                            <small>{formatWorkSchedule(staff.work_schedule)}</small>
                          </CTableDataCell>
                          <CTableDataCell>
                            {staff.is_primary_branch ? (
                              <CBadge color="success">Sì</CBadge>
                            ) : (
                              <CBadge color="secondary">No</CBadge>
                            )}
                          </CTableDataCell>
                          <CTableDataCell>
                            <CButton
                              color="danger"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeUserFromBranch(staff.user_id, selectedBranch)}
                            >
                              <CIcon icon={cilUserX} size="sm" />
                            </CButton>
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                )}
              </CTabPane>
            </CTabContent>
          </CCardBody>
        </CCard>
      </CCol>

      {/* Assignment Modal */}
      <CModal visible={showAssignModal} onClose={() => setShowAssignModal(false)} size="lg">
        <CModalHeader>
          <CModalTitle>Assegna Staff a Filiale</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>Utente</CFormLabel>
                <CFormSelect
                  value={assignmentForm.userId}
                  onChange={(e) => setAssignmentForm(prev => ({ ...prev, userId: e.target.value }))}
                >
                  <option value="">Seleziona utente</option>
                  {availableUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} - {user.email}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={6}>
                <CFormLabel>Filiale</CFormLabel>
                <CFormSelect
                  value={assignmentForm.branchId}
                  onChange={(e) => setAssignmentForm(prev => ({ ...prev, branchId: e.target.value }))}
                >
                  <option value="">Seleziona filiale</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name} - {branch.address}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>Ruolo nella Filiale</CFormLabel>
                <CFormSelect
                  value={assignmentForm.roleAtBranch}
                  onChange={(e) => setAssignmentForm(prev => ({ ...prev, roleAtBranch: e.target.value }))}
                >
                  <option value="staff">Staff</option>
                  <option value="barista">Barista</option>
                  <option value="branch_manager">Manager Filiale</option>
                </CFormSelect>
              </CCol>
              <CCol md={6}>
                <CFormLabel>Filiale Principale</CFormLabel>
                <CFormCheck
                  checked={assignmentForm.isPrimary}
                  onChange={(e) => setAssignmentForm(prev => ({ ...prev, isPrimary: e.target.checked }))}
                  label="Questa è la filiale principale dell'utente"
                />
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol>
                <CFormLabel>Permessi Aggiuntivi</CFormLabel>
                <div>
                  {['manage_inventory', 'view_reports', 'handle_cash', 'manage_schedule'].map((permission) => (
                    <CFormCheck
                      key={permission}
                      inline
                      checked={assignmentForm.permissions.includes(permission)}
                      onChange={(e) => handlePermissionChange(permission, e.target.checked)}
                      label={permission.replace(/_/g, ' ').toUpperCase()}
                    />
                  ))}
                </div>
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol>
                <CFormLabel>Orario di Lavoro</CFormLabel>
                <CFormTextarea
                  placeholder="Es: Lun-Ven 9:00-17:00, Sab 9:00-13:00"
                  value={assignmentForm.workSchedule}
                  onChange={(e) => setAssignmentForm(prev => ({ ...prev, workSchedule: e.target.value }))}
                  rows={2}
                />
              </CCol>
            </CRow>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowAssignModal(false)}>
            Annulla
          </CButton>
          <CButton color="primary" onClick={assignUserToBranch}>
            Assegna
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default StaffMultiBranch