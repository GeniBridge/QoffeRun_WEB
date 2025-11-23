import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CCard, CCardBody, CCardHeader, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CFormInput, CFormSelect, CRow, CCol, CPagination, CPaginationItem, CButton } from '@coreui/react'
import adminAuthService from '../../services/adminAuthService'

const ChainDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [chain, setChain] = useState(null)
  const [branches, setBranches] = useState([])
  const [filteredBranches, setFilteredBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    const token = adminAuthService.getToken()
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
    
    Promise.all([
      fetch(`https://api.qofferun.com/api/v1/admin/chains/${id}`, { headers }).then(res => res.json()),
      fetch(`https://api.qofferun.com/api/v1/admin/branches?chain_id=${id}`, { headers }).then(res => res.json()),
    ]).then(([chainRes, branchesRes]) => {
      setChain(chainRes.data)
      const branchData = branchesRes.data || []
      setBranches(branchData)
      setFilteredBranches(branchData)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [id])

  useEffect(() => {
    let result = branches
    
    if (searchTerm) {
      result = result.filter(branch => 
        branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.city.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (statusFilter !== 'all') {
      result = result.filter(branch => branch.status === statusFilter)
    }
    
    setFilteredBranches(result)
    setCurrentPage(1)
  }, [searchTerm, statusFilter, branches])

  const totalPages = Math.ceil(filteredBranches.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedBranches = filteredBranches.slice(startIndex, startIndex + itemsPerPage)

  if (loading) return <div>Loading...</div>
  if (!chain) return <div>Catena non trovata</div>

  return (
    <>
      <CButton color="secondary" onClick={() => navigate('/catene')} className="mb-3">
        ← Torna alle Catene
      </CButton>
      
      <CCard className="mb-4">
        <CCardHeader>
          <strong>Dettagli Catena: {chain.name}</strong>
        </CCardHeader>
        <CCardBody>
          <CRow>
            <CCol md={6}>
              <div><b>Admin:</b> {chain.owner_name || chain.owner?.name}</div>
              <div><b>Email:</b> {chain.owner_email || chain.owner?.email}</div>
              <div><b>Telefono:</b> {chain.owner_phone || chain.owner?.phone}</div>
            </CCol>
            <CCol md={6}>
              <div><b>Ragione Sociale:</b> {chain.business_name || 'N/A'}</div>
              <div><b>P.IVA:</b> {chain.vat_number || 'N/A'}</div>
              <div><b>Filiali totali:</b> {chain.total_branches}</div>
              <div><b>Stato:</b> <span className={`badge bg-${chain.status === 'active' ? 'success' : chain.status === 'suspended' ? 'warning' : 'danger'}`}>{chain.status}</span></div>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>
      
      <CCard>
        <CCardHeader>
          <strong>Filiali ({filteredBranches.length})</strong>
        </CCardHeader>
        <CCardBody>
          <CRow className="mb-3">
            <CCol md={6}>
              <CFormInput
                type="text"
                placeholder="Cerca per nome o città..."
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
                <option value="active">Attivo</option>
                <option value="inactive">Inattivo</option>
                <option value="maintenance">Manutenzione</option>
                <option value="temporarily_closed">Temporaneamente chiuso</option>
              </CFormSelect>
            </CCol>
            <CCol md={3} className="text-end">
              <small className="text-muted">
                {filteredBranches.length} filiali trovate
              </small>
            </CCol>
          </CRow>
          
          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Nome</CTableHeaderCell>
                <CTableHeaderCell>Città</CTableHeaderCell>
                <CTableHeaderCell>Indirizzo</CTableHeaderCell>
                <CTableHeaderCell>Stato</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {paginatedBranches.map(branch => (
                <CTableRow key={branch.id}>
                  <CTableDataCell>{branch.name}</CTableDataCell>
                  <CTableDataCell>{branch.city}</CTableDataCell>
                  <CTableDataCell>{branch.address}</CTableDataCell>
                  <CTableDataCell>
                    <span className={`badge bg-${branch.status === 'active' ? 'success' : 'warning'}`}>
                      {branch.status}
                    </span>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
          
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
        </CCardBody>
      </CCard>
    </>
  )
}

export default ChainDetails
