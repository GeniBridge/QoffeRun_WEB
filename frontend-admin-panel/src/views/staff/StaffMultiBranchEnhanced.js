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
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CFormCheck,
  CSpinner
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch, cilPlus, cilPencil, cilTrash, cilUserX, cilPeople, cilBuilding } from '@coreui/icons'

const StaffMultiBranch = () => {
  const [activeTab, setActiveTab] = useState('all-staff')
  const [chainStaff, setChainStaff] = useState(null)
  const [allAssignedStaff, setAllAssignedStaff] = useState([])
  const [branches, setBranches] = useState([])
  const [selectedBranch, setSelectedBranch] = useState('')
  const [branchStaff, setBranchStaff] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [availableUsers, setAvailableUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  // API Base URL
  const API_URL = process.env.REACT_APP_API_URL || 'https://api.qofferun.com'

  // Auth token
  const getAuthToken = () => localStorage.getItem('admin_auth_token')

  const authHeaders = () => ({
    'Authorization': `Bearer ${getAuthToken()}`,
    'Content-Type': 'application/json'
  })

  // Assignment form data
  const [assignmentForm, setAssignmentForm] = useState({
    user_id: '',
    branch_id: '',
    role_at_branch: 'staff',
    is_primary_branch: false,
    permissions: {
      manage_inventory: false,
      view_reports: false,
      handle_cash: false,
      manage_schedule: false
    },
    work_schedule: {
      monday: { enabled: false, start: '09:00', end: '17:00' },
      tuesday: { enabled: false, start: '09:00', end: '17:00' },
      wednesday: { enabled: false, start: '09:00', end: '17:00' },
      thursday: { enabled: false, start: '09:00', end: '17:00' },
      friday: { enabled: false, start: '09:00', end: '17:00' },
      saturday: { enabled: false, start: '09:00', end: '17:00' },
      sunday: { enabled: false, start: '09:00', end: '17:00' }
    }
  })

  // Load chain staff data
  const loadChainStaff = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/api/v1/admin/staff-management/chain-staff`, {
        headers: authHeaders()
      })

      if (!response.ok) throw new Error('Errore nel caricamento staff')

      const result = await response.json()
      if (result.success) {
        setChainStaff(result.data)
        setBranches(Object.values(result.data.staff_by_branch).map(item => item.branch))
        setError('')
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Load all assigned staff
  const loadAllAssignedStaff = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/admin/staff-management/all-assigned`, {
        headers: authHeaders()
      })

      if (!response.ok) throw new Error('Errore nel caricamento staff assegnato')

      const result = await response.json()
      if (result.success) {
        setAllAssignedStaff(result.data.assigned_staff)
      }
    } catch (err) {
      console.error('Errore caricamento staff assegnato:', err)
    }
  }

  // Load branch-specific staff
  const loadBranchStaff = async (branchId) => {
    if (!branchId) return

    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/api/v1/admin/staff-management/branch/${branchId}`, {
        headers: authHeaders()
      })

      if (!response.ok) throw new Error('Errore nel caricamento staff filiale')

      const result = await response.json()
      if (result.success) {
        setBranchStaff(result.data)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Load available users for assignment
  const loadAvailableUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/admin/users`, {
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
  const assignUserToBranch = async (e) => {
    e.preventDefault()
    
    try {
      const response = await fetch(`${API_URL}/api/v1/admin/staff-management/assign`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(assignmentForm)
      })

      const result = await response.json()
      
      if (result.success) {
        setSuccess('Staff assegnato con successo alla filiale')
        setShowAssignModal(false)
        resetAssignmentForm()
        loadChainStaff()
        loadAllAssignedStaff()
        if (selectedBranch) {
          loadBranchStaff(selectedBranch)
        }
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError(err.message)
    }
  }

  // Remove user from branch
  const removeUserFromBranch = async (userId, branchId) => {
    if (!confirm('Sei sicuro di voler rimuovere questo staff dalla filiale?')) return

    try {
      const response = await fetch(`${API_URL}/api/v1/admin/staff-management/remove`, {
        method: 'DELETE',
        headers: authHeaders(),
        body: JSON.stringify({ user_id: userId, branch_id: branchId })
      })

      const result = await response.json()
      
      if (result.success) {
        setSuccess('Staff rimosso dalla filiale con successo')
        loadChainStaff()
        loadAllAssignedStaff()
        if (selectedBranch) {
          loadBranchStaff(selectedBranch)
        }
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError(err.message)
    }
  }

  // Reset assignment form
  const resetAssignmentForm = () => {
    setAssignmentForm({
      user_id: '',
      branch_id: '',
      role_at_branch: 'staff',
      is_primary_branch: false,
      permissions: {
        manage_inventory: false,
        view_reports: false,
        handle_cash: false,
        manage_schedule: false
      },
      work_schedule: {
        monday: { enabled: false, start: '09:00', end: '17:00' },
        tuesday: { enabled: false, start: '09:00', end: '17:00' },
        wednesday: { enabled: false, start: '09:00', end: '17:00' },
        thursday: { enabled: false, start: '09:00', end: '17:00' },
        friday: { enabled: false, start: '09:00', end: '17:00' },
        saturday: { enabled: false, start: '09:00', end: '17:00' },
        sunday: { enabled: false, start: '09:00', end: '17:00' }
      }
    })
  }

  // Get role badge color
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'branch_manager':
      case 'manager':
        return 'danger'
      case 'barista':
        return 'warning'
      case 'staff':
        return 'info'
      default:
        return 'secondary'
    }
  }

  // Filter staff by search term
  const filterStaff = (staffList) => {
    if (!searchTerm) return staffList
    return staffList.filter(staff => 
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.employee_code?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  // Load data on component mount
  useEffect(() => {
    loadChainStaff()
    loadAllAssignedStaff()
    loadAvailableUsers()
  }, [])

  // Load branch staff when branch is selected
  useEffect(() => {
    if (selectedBranch) {
      loadBranchStaff(selectedBranch)
    }
  }, [selectedBranch])

  if (loading && !chainStaff) {
    return (
      <CCard>
        <CCardBody className="text-center">
          <CSpinner />
          <p className="mt-2">Caricamento staff...</p>
        </CCardBody>
      </CCard>
    )
  }

  return (
    <>
      <CRow>
        <CCol xs={12}>
          <CCard>
            <CCardHeader>
              <strong>🏢 Gestione Staff Multi-Filiale</strong>
              <div className="float-end">
                <CButton 
                  color="primary" 
                  onClick={() => setShowAssignModal(true)}
                  className="me-2"
                >
                  <CIcon icon={cilPlus} className="me-1" />
                  Assegna Staff a Filiale
                </CButton>
              </div>
            </CCardHeader>
            <CCardBody>
              {/* Alerts */}
              {error && (
                <CAlert color="danger" dismissible onClose={() => setError('')}>
                  {error}
                </CAlert>
              )}
              {success && (
                <CAlert color="success" dismissible onClose={() => setSuccess('')}>
                  {success}
                </CAlert>
              )}

              {/* Summary Cards */}
              {chainStaff && (
                <CRow className="mb-4">
                  <CCol xs={12} sm={6} lg={3}>
                    <CCard className="text-center">
                      <CCardBody>
                        <div className="h4 mb-0">{chainStaff.summary?.total_branches || 0}</div>
                        <div className="text-medium-emphasis">Filiali</div>
                      </CCardBody>
                    </CCard>
                  </CCol>
                  <CCol xs={12} sm={6} lg={3}>
                    <CCard className="text-center">
                      <CCardBody>
                        <div className="h4 mb-0">{chainStaff.summary?.total_unique_staff || 0}</div>
                        <div className="text-medium-emphasis">Staff Totale</div>
                      </CCardBody>
                    </CCard>
                  </CCol>
                  <CCol xs={12} sm={6} lg={3}>
                    <CCard className="text-center">
                      <CCardBody>
                        <div className="h4 mb-0">{chainStaff.summary?.total_managers || 0}</div>
                        <div className="text-medium-emphasis">Manager</div>
                      </CCardBody>
                    </CCard>
                  </CCol>
                  <CCol xs={12} sm={6} lg={3}>
                    <CCard className="text-center">
                      <CCardBody>
                        <div className="h4 mb-0">{chainStaff.summary?.total_assignments || 0}</div>
                        <div className="text-medium-emphasis">Assegnazioni</div>
                      </CCardBody>
                    </CCard>
                  </CCol>
                </CRow>
              )}

              {/* Navigation Tabs */}
              <CNav variant="tabs" className="mb-3">
                <CNavItem>
                  <CNavLink 
                    active={activeTab === 'all-staff'} 
                    onClick={() => setActiveTab('all-staff')}
                    style={{ cursor: 'pointer' }}
                  >
                    <CIcon icon={cilPeople} className="me-1" />
                    Tutto lo Staff
                  </CNavLink>
                </CNavItem>
                <CNavItem>
                  <CNavLink 
                    active={activeTab === 'by-branch'} 
                    onClick={() => setActiveTab('by-branch')}
                    style={{ cursor: 'pointer' }}
                  >
                    <CIcon icon={cilBuilding} className="me-1" />
                    Per Filiale
                  </CNavLink>
                </CNavItem>
              </CNav>

              {/* Tab Content */}
              <CTabContent>
                {/* All Staff Tab */}
                <CTabPane visible={activeTab === 'all-staff'}>
                  <CRow className="mb-3">
                    <CCol md={6}>
                      <CInputGroup>
                        <CInputGroupText>
                          <CIcon icon={cilSearch} />
                        </CInputGroupText>
                        <CFormInput
                          placeholder="Cerca staff..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </CInputGroup>
                    </CCol>
                  </CRow>

                  <CTable hover responsive>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Nome</CTableHeaderCell>
                        <CTableHeaderCell>Email</CTableHeaderCell>
                        <CTableHeaderCell>Codice Dipendente</CTableHeaderCell>
                        <CTableHeaderCell>Assegnazioni</CTableHeaderCell>
                        <CTableHeaderCell>Ruoli</CTableHeaderCell>
                        <CTableHeaderCell>Filiale Primaria</CTableHeaderCell>
                        <CTableHeaderCell>Azioni</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {filterStaff(allAssignedStaff).map(staff => (
                        <CTableRow key={staff.id}>
                          <CTableDataCell>
                            <strong>{staff.name}</strong>
                          </CTableDataCell>
                          <CTableDataCell>{staff.email}</CTableDataCell>
                          <CTableDataCell>{staff.employee_code || '-'}</CTableDataCell>
                          <CTableDataCell>
                            {staff.branch_assignments?.map((assignment, index) => (
                              <CBadge 
                                key={index}
                                color="info" 
                                className="me-1 mb-1"
                                title={`${assignment.role_at_branch} presso ${assignment.branch_name}`}
                              >
                                {assignment.branch_name}
                                {assignment.is_primary_branch && ' (Primaria)'}
                              </CBadge>
                            ))}
                          </CTableDataCell>
                          <CTableDataCell>
                            {staff.branch_assignments?.map((assignment, index) => (
                              <CBadge 
                                key={index}
                                color={getRoleBadgeColor(assignment.role_at_branch)}
                                className="me-1 mb-1"
                              >
                                {assignment.role_at_branch}
                              </CBadge>
                            ))}
                          </CTableDataCell>
                          <CTableDataCell>
                            {staff.primary_branch ? (
                              <CBadge color="success">
                                {staff.primary_branch.name}
                              </CBadge>
                            ) : (
                              <span className="text-muted">Nessuna</span>
                            )}
                          </CTableDataCell>
                          <CTableDataCell>
                            {staff.branch_assignments?.map((assignment, index) => (
                              <CButton
                                key={index}
                                color="danger"
                                variant="outline"
                                size="sm"
                                className="me-1 mb-1"
                                onClick={() => removeUserFromBranch(staff.id, assignment.branch_id)}
                                title={`Rimuovi da ${assignment.branch_name}`}
                              >
                                <CIcon icon={cilUserX} />
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
                    <CCol md={6}>
                      <CFormSelect
                        value={selectedBranch}
                        onChange={(e) => setSelectedBranch(e.target.value)}
                      >
                        <option value="">Seleziona una filiale...</option>
                        {branches.map(branch => (
                          <option key={branch.id} value={branch.id}>
                            {branch.name} - {branch.address}
                          </option>
                        ))}
                      </CFormSelect>
                    </CCol>
                  </CRow>

                  {branchStaff && (
                    <>
                      <div className="mb-3">
                        <h5>📍 {branchStaff.branch.name}</h5>
                        <p className="text-muted">{branchStaff.branch.address}</p>
                        
                        <CRow>
                          <CCol xs={12} sm={4}>
                            <CCard className="text-center">
                              <CCardBody>
                                <div className="h5 mb-0">{branchStaff.summary?.managers_count || 0}</div>
                                <div className="text-medium-emphasis">Manager</div>
                              </CCardBody>
                            </CCard>
                          </CCol>
                          <CCol xs={12} sm={4}>
                            <CCard className="text-center">
                              <CCardBody>
                                <div className="h5 mb-0">{branchStaff.summary?.staff_count || 0}</div>
                                <div className="text-medium-emphasis">Staff</div>
                              </CCardBody>
                            </CCard>
                          </CCol>
                          <CCol xs={12} sm={4}>
                            <CCard className="text-center">
                              <CCardBody>
                                <div className="h5 mb-0">{branchStaff.summary?.total_assigned || 0}</div>
                                <div className="text-medium-emphasis">Totale</div>
                              </CCardBody>
                            </CCard>
                          </CCol>
                        </CRow>
                      </div>

                      {/* Managers Section */}
                      {branchStaff.managers && branchStaff.managers.length > 0 && (
                        <div className="mb-4">
                          <h6>👨‍💼 Manager</h6>
                          <CTable hover responsive>
                            <CTableHead>
                              <CTableRow>
                                <CTableHeaderCell>Nome</CTableHeaderCell>
                                <CTableHeaderCell>Email</CTableHeaderCell>
                                <CTableHeaderCell>Ruolo</CTableHeaderCell>
                                <CTableHeaderCell>Primaria</CTableHeaderCell>
                                <CTableHeaderCell>Assegnato</CTableHeaderCell>
                                <CTableHeaderCell>Azioni</CTableHeaderCell>
                              </CTableRow>
                            </CTableHead>
                            <CTableBody>
                              {branchStaff.managers.map(manager => (
                                <CTableRow key={manager.id}>
                                  <CTableDataCell><strong>{manager.name}</strong></CTableDataCell>
                                  <CTableDataCell>{manager.email}</CTableDataCell>
                                  <CTableDataCell>
                                    <CBadge color={getRoleBadgeColor(manager.role_at_branch)}>
                                      {manager.role_at_branch}
                                    </CBadge>
                                  </CTableDataCell>
                                  <CTableDataCell>
                                    {manager.is_primary_branch ? (
                                      <CBadge color="success">Sì</CBadge>
                                    ) : (
                                      <CBadge color="secondary">No</CBadge>
                                    )}
                                  </CTableDataCell>
                                  <CTableDataCell>
                                    {new Date(manager.assigned_at).toLocaleDateString()}
                                  </CTableDataCell>
                                  <CTableDataCell>
                                    <CButton
                                      color="danger"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => removeUserFromBranch(manager.id, branchStaff.branch.id)}
                                    >
                                      <CIcon icon={cilUserX} />
                                    </CButton>
                                  </CTableDataCell>
                                </CTableRow>
                              ))}
                            </CTableBody>
                          </CTable>
                        </div>
                      )}

                      {/* Staff Section */}
                      {branchStaff.staff && branchStaff.staff.length > 0 && (
                        <div>
                          <h6>👥 Staff</h6>
                          <CTable hover responsive>
                            <CTableHead>
                              <CTableRow>
                                <CTableHeaderCell>Nome</CTableHeaderCell>
                                <CTableHeaderCell>Email</CTableHeaderCell>
                                <CTableHeaderCell>Ruolo</CTableHeaderCell>
                                <CTableHeaderCell>Primaria</CTableHeaderCell>
                                <CTableHeaderCell>Assegnato</CTableHeaderCell>
                                <CTableHeaderCell>Azioni</CTableHeaderCell>
                              </CTableRow>
                            </CTableHead>
                            <CTableBody>
                              {branchStaff.staff.map(staff => (
                                <CTableRow key={staff.id}>
                                  <CTableDataCell><strong>{staff.name}</strong></CTableDataCell>
                                  <CTableDataCell>{staff.email}</CTableDataCell>
                                  <CTableDataCell>
                                    <CBadge color={getRoleBadgeColor(staff.role_at_branch)}>
                                      {staff.role_at_branch}
                                    </CBadge>
                                  </CTableDataCell>
                                  <CTableDataCell>
                                    {staff.is_primary_branch ? (
                                      <CBadge color="success">Sì</CBadge>
                                    ) : (
                                      <CBadge color="secondary">No</CBadge>
                                    )}
                                  </CTableDataCell>
                                  <CTableDataCell>
                                    {new Date(staff.assigned_at).toLocaleDateString()}
                                  </CTableDataCell>
                                  <CTableDataCell>
                                    <CButton
                                      color="danger"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => removeUserFromBranch(staff.id, branchStaff.branch.id)}
                                    >
                                      <CIcon icon={cilUserX} />
                                    </CButton>
                                  </CTableDataCell>
                                </CTableRow>
                              ))}
                            </CTableBody>
                          </CTable>
                        </div>
                      )}

                      {branchStaff.summary?.total_assigned === 0 && (
                        <div className="text-center text-muted py-4">
                          <p>Nessuno staff assegnato a questa filiale.</p>
                        </div>
                      )}
                    </>
                  )}

                  {!selectedBranch && (
                    <div className="text-center text-muted py-4">
                      <p>Seleziona una filiale per visualizzare il suo staff.</p>
                    </div>
                  )}
                </CTabPane>
              </CTabContent>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Assignment Modal */}
      <CModal visible={showAssignModal} onClose={() => setShowAssignModal(false)} size="lg">
        <CModalHeader>
          <CModalTitle>Assegna Staff a Filiale</CModalTitle>
        </CModalHeader>
        <CForm onSubmit={assignUserToBranch}>
          <CModalBody>
            <CRow>
              <CCol md={6}>
                <div className="mb-3">
                  <CFormLabel>Utente</CFormLabel>
                  <CFormSelect
                    value={assignmentForm.user_id}
                    onChange={(e) => setAssignmentForm({...assignmentForm, user_id: e.target.value})}
                    required
                  >
                    <option value="">Seleziona utente...</option>
                    {availableUsers.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} - {user.email}
                      </option>
                    ))}
                  </CFormSelect>
                </div>
              </CCol>
              <CCol md={6}>
                <div className="mb-3">
                  <CFormLabel>Filiale</CFormLabel>
                  <CFormSelect
                    value={assignmentForm.branch_id}
                    onChange={(e) => setAssignmentForm({...assignmentForm, branch_id: e.target.value})}
                    required
                  >
                    <option value="">Seleziona filiale...</option>
                    {branches.map(branch => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name} - {branch.address}
                      </option>
                    ))}
                  </CFormSelect>
                </div>
              </CCol>
            </CRow>

            <CRow>
              <CCol md={6}>
                <div className="mb-3">
                  <CFormLabel>Ruolo nella Filiale</CFormLabel>
                  <CFormSelect
                    value={assignmentForm.role_at_branch}
                    onChange={(e) => setAssignmentForm({...assignmentForm, role_at_branch: e.target.value})}
                  >
                    <option value="staff">Staff</option>
                    <option value="barista">Barista</option>
                    <option value="branch_manager">Manager Filiale</option>
                  </CFormSelect>
                </div>
              </CCol>
              <CCol md={6}>
                <div className="mb-3">
                  <CFormCheck
                    id="primary-branch"
                    label="Filiale Primaria"
                    checked={assignmentForm.is_primary_branch}
                    onChange={(e) => setAssignmentForm({...assignmentForm, is_primary_branch: e.target.checked})}
                  />
                </div>
              </CCol>
            </CRow>

            {/* Permissions */}
            <div className="mb-3">
              <CFormLabel>Permessi</CFormLabel>
              <CRow>
                <CCol md={6}>
                  <CFormCheck
                    id="manage_inventory"
                    label="Gestione Inventario"
                    checked={assignmentForm.permissions.manage_inventory}
                    onChange={(e) => setAssignmentForm({
                      ...assignmentForm, 
                      permissions: {...assignmentForm.permissions, manage_inventory: e.target.checked}
                    })}
                  />
                  <CFormCheck
                    id="view_reports"
                    label="Visualizzazione Report"
                    checked={assignmentForm.permissions.view_reports}
                    onChange={(e) => setAssignmentForm({
                      ...assignmentForm, 
                      permissions: {...assignmentForm.permissions, view_reports: e.target.checked}
                    })}
                  />
                </CCol>
                <CCol md={6}>
                  <CFormCheck
                    id="handle_cash"
                    label="Gestione Cassa"
                    checked={assignmentForm.permissions.handle_cash}
                    onChange={(e) => setAssignmentForm({
                      ...assignmentForm, 
                      permissions: {...assignmentForm.permissions, handle_cash: e.target.checked}
                    })}
                  />
                  <CFormCheck
                    id="manage_schedule"
                    label="Gestione Orari"
                    checked={assignmentForm.permissions.manage_schedule}
                    onChange={(e) => setAssignmentForm({
                      ...assignmentForm, 
                      permissions: {...assignmentForm.permissions, manage_schedule: e.target.checked}
                    })}
                  />
                </CCol>
              </CRow>
            </div>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setShowAssignModal(false)}>
              Annulla
            </CButton>
            <CButton color="primary" type="submit">
              Assegna Staff
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>
    </>
  )
}

export default StaffMultiBranch