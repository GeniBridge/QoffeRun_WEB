// src/views/pages/Statistiche.js
import React, { useState, useEffect } from 'react'

// CoreUI React components
import { CCard, CCardBody, CCardHeader, CCol, CRow, CWidgetStatsA, CSpinner } from '@coreui/react'

// ✅ Correct import for CIcon
import CIcon from '@coreui/icons-react'

// Icons from @coreui/icons
import { cilMoney, cilBuilding, cilCreditCard, cilGraph, cilUser, cilChart } from '@coreui/icons'
import adminAuthService from '../../services/adminAuthService'

const Statistiche = () => {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total_sales: 0,
    total_chains: 0,
    total_customers: 0,
    total_commission: 0,
    total_transactions: 0,
    avg_commission_rate: 0,
  })

  useEffect(() => {
    const token = adminAuthService.getToken()
    fetch('https://api.qofferun.com/api/v1/admin/statistics', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setStats(data.data)
      }
      setLoading(false)
    })
    .catch(() => setLoading(false))
  }, [])

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount)

  if (loading) {
    return (
      <div className="text-center mt-5">
        <CSpinner color="primary" />
        <p className="mt-3">Caricamento statistiche...</p>
      </div>
    )
  }

  return (
    <CCard>
      <CCardHeader>
        <strong>📈 Statistiche Generali</strong>
      </CCardHeader>
      <CCardBody>
        {/* Key Metrics */}
        <CRow>
          <CCol sm={6} lg={3}>
            <CWidgetStatsA
              color="success"
              icon={<CIcon icon={cilMoney} height={36} />}
              value={formatCurrency(stats.total_sales)}
              title="Totale Vendite"
              className="mb-4"
            />
          </CCol>
          <CCol sm={6} lg={3}>
            <CWidgetStatsA
              color="info"
              icon={<CIcon icon={cilBuilding} height={36} />}
              value={stats.total_chains.toLocaleString()}
              title="Totale Catene"
              className="mb-4"
            />
          </CCol>
          <CCol sm={6} lg={3}>
            <CWidgetStatsA
              color="primary"
              icon={<CIcon icon={cilUser} height={36} />}
              value={stats.total_customers.toLocaleString()}
              title="Totale Clienti"
              className="mb-4"
            />
          </CCol>
          <CCol sm={6} lg={3}>
            <CWidgetStatsA
              color="warning"
              icon={<CIcon icon={cilChart} height={36} />}
              value={formatCurrency(stats.total_commission)}
              title="Totale Commissioni"
              className="mb-4"
            />
          </CCol>
        </CRow>

        {/* Additional Stats */}
        <CRow className="mt-3">
          <CCol sm={6} lg={6}>
            <CCard className="text-center">
              <CCardBody>
                <CIcon icon={cilCreditCard} height={48} className="text-info mb-3" />
                <h3 className="mb-2">{stats.total_transactions.toLocaleString()}</h3>
                <p className="text-muted mb-0">Transazioni Totali</p>
              </CCardBody>
            </CCard>
          </CCol>
          <CCol sm={6} lg={6}>
            <CCard className="text-center">
              <CCardBody>
                <CIcon icon={cilGraph} height={48} className="text-success mb-3" />
                <h3 className="mb-2">{stats.avg_commission_rate.toFixed(2)}%</h3>
                <p className="text-muted mb-0">Commissione Media</p>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>

        {/* Summary Section */}
        <CRow className="mt-4">
          <CCol lg={12}>
            <CCard>
              <CCardHeader>
                <strong>Riepilogo Finanziario</strong>
              </CCardHeader>
              <CCardBody>
                <div className="table-responsive">
                  <table className="table table-borderless">
                    <tbody>
                      <tr>
                        <td><strong>Vendite Totali:</strong></td>
                        <td className="text-end text-success h5">{formatCurrency(stats.total_sales)}</td>
                      </tr>
                      <tr>
                        <td><strong>Commissioni Platform:</strong></td>
                        <td className="text-end text-warning h5">{formatCurrency(stats.total_commission)}</td>
                      </tr>
                      <tr>
                        <td><strong>Importo Filiali:</strong></td>
                        <td className="text-end text-info h5">{formatCurrency(stats.total_sales - stats.total_commission)}</td>
                      </tr>
                      <tr className="border-top">
                        <td><strong>Numero Transazioni:</strong></td>
                        <td className="text-end h5">{stats.total_transactions.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td><strong>Valore Medio Ordine:</strong></td>
                        <td className="text-end h5">
                          {stats.total_transactions > 0 ? formatCurrency(stats.total_sales / stats.total_transactions) : '€0,00'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>
  )
}

export default Statistiche
