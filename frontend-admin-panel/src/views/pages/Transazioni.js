// src/views/pages/Transazioni.js
import React, { useState, useEffect } from 'react'
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
  CFormSelect,
  CRow,
  CCol,
  CPagination,
  CPaginationItem,
  CCard,
  CCardBody,
  CCardHeader,
} from '@coreui/react'
import { cilReload, cilInfo, cilMoney } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import adminAuthService from '../../services/adminAuthService'

const Transazioni = () => {
  const [transactions, setTransactions] = useState([])
  const [filteredTransactions, setFilteredTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(false)
  const [selected, setSelected] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all')
  const [commissionStatusFilter, setCommissionStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15

  useEffect(() => {
    const token = adminAuthService.getToken()
    fetch('https://api.qofferun.com/api/v1/admin/transactions', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setTransactions(data.data)
        setFilteredTransactions(data.data)
      }
      setLoading(false)
    })
    .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    let result = transactions
    
    if (searchTerm) {
      result = result.filter(transaction => 
        transaction.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.branch_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.chain_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (paymentStatusFilter !== 'all') {
      result = result.filter(transaction => transaction.payment_status === paymentStatusFilter)
    }
    
    if (commissionStatusFilter !== 'all') {
      result = result.filter(transaction => transaction.commission_status === commissionStatusFilter)
    }
    
    setFilteredTransactions(result)
    setCurrentPage(1)
  }, [searchTerm, paymentStatusFilter, commissionStatusFilter, transactions])

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage)

  if (loading) return <div>Caricamento...</div>

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

  return (
    <CCard>
      <CCardHeader>
        <strong>💳 Transazioni Ordini ({filteredTransactions.length})</strong>
      </CCardHeader>
      <CCardBody>
        <CRow className="mb-3">
          <CCol md={4}>
            <CFormInput
              type="text"
              placeholder="Cerca per cliente, filiale o catena..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </CCol>
          <CCol md={3}>
            <CFormSelect
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
            >
              <option value="all">Tutti i pagamenti</option>
              <option value="paid">Pagato</option>
              <option value="failed">Fallito</option>
            </CFormSelect>
          </CCol>
          <CCol md={3}>
            <CFormSelect
              value={commissionStatusFilter}
              onChange={(e) => setCommissionStatusFilter(e.target.value)}
            >
              <option value="all">Tutte le commissioni</option>
              <option value="pending">In attesa</option>
              <option value="transferred">Trasferito</option>
              <option value="failed">Fallito</option>
            </CFormSelect>
          </CCol>
          <CCol md={2} className="text-end">
            <small className="text-muted">
              {filteredTransactions.length} transazioni
            </small>
          </CCol>
        </CRow>

        <div className="table-responsive">
          <CTable hover bordered>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Cliente</CTableHeaderCell>
                <CTableHeaderCell>Filiale</CTableHeaderCell>
                <CTableHeaderCell>Totale</CTableHeaderCell>
                <CTableHeaderCell>Commissione</CTableHeaderCell>
                <CTableHeaderCell>Data</CTableHeaderCell>
                <CTableHeaderCell>Stato Pagamento</CTableHeaderCell>
                <CTableHeaderCell>Azioni</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {paginatedTransactions.length > 0 ? (
                paginatedTransactions.map((item) => (
                  <CTableRow key={item.id}>
                    <CTableDataCell>
                      <div><strong>{item.customer_name}</strong></div>
                      <small className="text-muted">{item.customer_email}</small>
                    </CTableDataCell>
                    <CTableDataCell>
                      <div>{item.branch_name}</div>
                      <small className="text-muted">{item.chain_name}</small>
                    </CTableDataCell>
                    <CTableDataCell><strong>{formatCurrency(item.total)}</strong></CTableDataCell>
                    <CTableDataCell>
                      <div>{formatCurrency(item.commission_amount)}</div>
                      <small className="text-muted">({item.commission_rate}%)</small>
                    </CTableDataCell>
                    <CTableDataCell>{formatDateTime(item.created_at)}</CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={item.payment_status === 'paid' ? 'success' : 'danger'}>
                        {item.payment_status === 'paid' ? 'Pagato' : 'Fallito'}
                      </CBadge>
                      <br />
                      <CBadge color={item.commission_status === 'transferred' ? 'success' : item.commission_status === 'pending' ? 'warning' : 'danger'} className="mt-1">
                        {item.commission_status === 'transferred' ? 'Trasferito' : item.commission_status === 'pending' ? 'In attesa' : 'Fallito'}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell className="text-center">
                      <CButton
                        size="sm"
                        color="primary"
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
                  <CTableDataCell colSpan="7" className="text-center">
                    Nessun risultato trovato
                  </CTableDataCell>
                </CTableRow>
              )}
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

        {/* Modal: Dettagli Transazione */}
        <CModal visible={visible} onClose={() => setVisible(false)} size="lg">
          <CModalHeader>
            <CModalTitle>
              <CIcon icon={cilMoney} /> Dettagli Transazione #{selected?.id}
            </CModalTitle>
          </CModalHeader>
          <CModalBody>
            {selected && (
              <div className="row">
                <div className="col-12 mb-4">
                  <h5>Informazioni Cliente</h5>
                  <hr />
                </div>
                <div className="col-md-6 mb-3">
                  <strong>Nome:</strong>
                  <p>{selected.customer_name}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <strong>Email:</strong>
                  <p>{selected.customer_email}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <strong>Telefono:</strong>
                  <p>{selected.customer_phone}</p>
                </div>
                
                <div className="col-12 mb-4 mt-3">
                  <h5>Informazioni Filiale</h5>
                  <hr />
                </div>
                <div className="col-md-6 mb-3">
                  <strong>Filiale:</strong>
                  <p>{selected.branch_name}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <strong>Catena:</strong>
                  <p>{selected.chain_name}</p>
                </div>
                
                <div className="col-12 mb-4 mt-3">
                  <h5>Dettagli Pagamento</h5>
                  <hr />
                </div>
                <div className="col-md-6 mb-3">
                  <strong>Totale Ordine:</strong>
                  <p className="h5 text-success">{formatCurrency(selected.total)}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <strong>Importo Filiale:</strong>
                  <p className="h5 text-primary">{formatCurrency(selected.branch_amount)}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <strong>Commissione ({selected.commission_rate}%):</strong>
                  <p className="h5 text-warning">{formatCurrency(selected.commission_amount)}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <strong>Stato Pagamento:</strong>
                  <p>
                    <CBadge color={selected.payment_status === 'paid' ? 'success' : 'danger'} style={{fontSize: '1rem'}}>
                      {selected.payment_status === 'paid' ? 'Pagato' : 'Fallito'}
                    </CBadge>
                  </p>
                </div>
                <div className="col-md-6 mb-3">
                  <strong>Stato Commissione:</strong>
                  <p>
                    <CBadge 
                      color={selected.commission_status === 'transferred' ? 'success' : selected.commission_status === 'pending' ? 'warning' : 'danger'}
                      style={{fontSize: '1rem'}}
                    >
                      {selected.commission_status === 'transferred' ? 'Trasferito' : selected.commission_status === 'pending' ? 'In attesa' : 'Fallito'}
                    </CBadge>
                  </p>
                </div>
                <div className="col-md-6 mb-3">
                  <strong>Data Creazione:</strong>
                  <p>{formatDateTime(selected.created_at)}</p>
                </div>
                
                {selected.stripe_payment_intent_id && (
                  <>
                    <div className="col-12 mb-4 mt-3">
                      <h5>Informazioni Stripe</h5>
                      <hr />
                    </div>
                    <div className="col-md-6 mb-3">
                      <strong>Payment Intent ID:</strong>
                      <p className="text-muted" style={{fontSize: '0.85rem', wordBreak: 'break-all'}}>{selected.stripe_payment_intent_id}</p>
                    </div>
                    {selected.stripe_transfer_id && (
                      <div className="col-md-6 mb-3">
                        <strong>Transfer ID:</strong>
                        <p className="text-muted" style={{fontSize: '0.85rem', wordBreak: 'break-all'}}>{selected.stripe_transfer_id}</p>
                      </div>
                    )}
                  </>
                )}
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

export default Transazioni
