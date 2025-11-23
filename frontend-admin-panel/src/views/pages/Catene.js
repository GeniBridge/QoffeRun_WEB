import React, { useEffect, useState } from 'react'
import { CCard, CCardBody, CCardHeader, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CButton, CFormInput, CFormSelect, CRow, CCol, CPagination, CPaginationItem } from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import adminAuthService from '../../services/adminAuthService'

const Catene = () => {
  const [chains, setChains] = useState([])
  const [filteredChains, setFilteredChains] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const navigate = useNavigate()

  useEffect(() => {
    const token = adminAuthService.getToken()
    
    fetch('https://api.qofferun.com/api/v1/admin/chains', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })
      .then(res => res.json())
      .then(data => {
        setChains(data.data || [])
        setFilteredChains(data.data || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    let result = chains
    
    // Filtro per ricerca
    if (searchTerm) {
      result = result.filter(chain => 
        chain.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chain.owner_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Filtro per status
    if (statusFilter !== 'all') {
      result = result.filter(chain => chain.status === statusFilter)
    }
    
    setFilteredChains(result)
    setCurrentPage(1)
  }, [searchTerm, statusFilter, chains])

  const totalPages = Math.ceil(filteredChains.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedChains = filteredChains.slice(startIndex, startIndex + itemsPerPage)

  return (
    <>
      <CCard className="mb-4">
        <CCardHeader>
          <strong>Catene</strong>
        </CCardHeader>
        <CCardBody>
          <CRow className="mb-3">
            <CCol md={6}>
              <CFormInput
                type="text"
                placeholder="Cerca per nome catena o admin..."
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
                <option value="suspended">Sospeso</option>
                <option value="closed">Chiuso</option>
              </CFormSelect>
            </CCol>
            <CCol md={3} className="text-end">
              <small className="text-muted">
                {filteredChains.length} catene trovate
              </small>
            </CCol>
          </CRow>
          
          {loading ? (
            <div>Loading...</div>
          ) : (
            <>
              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Nome</CTableHeaderCell>
                    <CTableHeaderCell>Admin</CTableHeaderCell>
                    <CTableHeaderCell>Contatto</CTableHeaderCell>
                    <CTableHeaderCell>Filiali</CTableHeaderCell>
                    <CTableHeaderCell>Stato</CTableHeaderCell>
                    <CTableHeaderCell>Azioni</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {paginatedChains.map(chain => (
                    <CTableRow key={chain.id}>
                      <CTableDataCell>{chain.name}</CTableDataCell>
                      <CTableDataCell>{chain.owner_name || chain.owner?.name}</CTableDataCell>
                      <CTableDataCell>{chain.owner_phone || chain.owner?.phone}</CTableDataCell>
                      <CTableDataCell>{chain.total_branches}</CTableDataCell>
                      <CTableDataCell>
                        <span className={`badge bg-${chain.status === 'active' ? 'success' : chain.status === 'suspended' ? 'warning' : 'danger'}`}>
                          {chain.status}
                        </span>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CButton color="primary" size="sm" onClick={() => navigate(`/catene/${chain.id}`)}>
                          Dettagli
                        </CButton>
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
            </>
          )}
        </CCardBody>
      </CCard>
    </>
  )
}

export default Catene
