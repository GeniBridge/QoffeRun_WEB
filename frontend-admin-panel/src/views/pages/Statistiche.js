// src/views/pages/Statistiche.js
import React, { useState, useEffect, useMemo } from 'react'

// CoreUI React components
import { CCard, CCardBody, CCardHeader, CCol, CRow, CWidgetStatsA } from '@coreui/react'

// Chart components
import { CChartLine, CChartBar, CChartPie } from '@coreui/react-chartjs'

// ✅ Correct import for CIcon
import CIcon from '@coreui/icons-react'

// Icons from @coreui/icons
import { cilMoney, cilBuilding, cilCreditCard, cilGraph } from '@coreui/icons'

const Statistiche = () => {
  // Default: last 30 days
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  })

  const [loading, setLoading] = useState(false)
  const [data, setData] = useState({
    totalSales: 0,
    totalBars: 4,
    totalTransactions: 0,
    avgCommission: '2.6%',
    dailySales: [],
    paymentMethods: [],
    regionalSales: [],
  })

  // Simulate API call
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 800))

      const days =
        (new Date(dateRange.endDate) - new Date(dateRange.startDate)) / (1000 * 60 * 60 * 24) + 1

      const dailySales = Array.from({ length: days }, (_, i) => {
        const date = new Date(dateRange.startDate)
        date.setDate(date.getDate() + i)
        return {
          date: date.toISOString().split('T')[0],
          amount: 300 + Math.random() * 500,
        }
      })

      setData({
        totalSales: dailySales.reduce((sum, d) => sum + d.amount, 0).toFixed(2),
        totalBars: 4,
        totalTransactions: dailySales.length * 12,
        avgCommission: '2.7%',
        dailySales,
        paymentMethods: [
          { label: 'Stripe', value: 65 },
          { label: 'PayPal', value: 20 },
          { label: 'Bonifico', value: 15 },
        ],
        regionalSales: [
          { regione: 'Lombardia', value: 40 },
          { regione: 'Lazio', value: 25 },
          { regione: 'Campania', value: 20 },
          { regione: 'Veneto', value: 15 },
        ],
      })
      setLoading(false)
    }

    fetchData()
  }, [dateRange])

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount)

  const chartData = useMemo(() => {
    return {
      line: {
        labels: data.dailySales.map((d) => d.date),
        datasets: [
          {
            label: 'Vendite Giornaliere (€)',
            backgroundColor: 'rgba(76, 175, 80, 0.2)',
            borderColor: 'rgba(76, 175, 80, 1)',
            pointBackgroundColor: 'rgba(76, 175, 80, 1)',
            data: data.dailySales.map((d) => d.amount),
          },
        ],
      },
      bar: {
        labels: data.regionalSales.map((r) => r.regione),
        datasets: [
          {
            label: 'Fatturato per Regione (€)',
            backgroundColor: '#4CAF50',
            data: data.regionalSales.map((r) => r.value * 1000),
          },
        ],
      },
      pie: {
        labels: data.paymentMethods.map((p) => p.label),
        datasets: [
          {
            backgroundColor: ['#4CAF50', '#2196F3', '#FF9800'],
            data: data.paymentMethods.map((p) => p.value),
          },
        ],
      },
    }
  }, [data])

  return (
    <div>
      <h2>📈 Statistiche</h2>

      {/* Date Range Filter (Free version) */}
      <CCard className="mb-4">
        <CCardBody>
          <CRow className="align-items-end">
            <CCol md={5}>
              <div className="mb-2">Data Inizio</div>
              <input
                type="date"
                className="form-control"
                value={dateRange.startDate}
                onChange={(e) => setDateRange((prev) => ({ ...prev, startDate: e.target.value }))}
              />
            </CCol>
            <CCol md={5}>
              <div className="mb-2">Data Fine</div>
              <input
                type="date"
                className="form-control"
                value={dateRange.endDate}
                onChange={(e) => setDateRange((prev) => ({ ...prev, endDate: e.target.value }))}
              />
            </CCol>
            <CCol md={2} className="text-end">
              <small className="text-muted d-block">Aggiorna</small>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>

      {/* Key Metrics */}
      <CRow>
        <CCol sm={6} lg={3}>
          <CWidgetStatsA
            color="success"
            icon={<CIcon icon={cilMoney} height={24} />}
            value={`€${Number(data.totalSales).toLocaleString()}`}
            title="Totale Vendite"
            className="mb-3"
          />
        </CCol>
        <CCol sm={6} lg={3}>
          <CWidgetStatsA
            color="info"
            icon={<CIcon icon={cilBuilding} height={24} />}
            value={data.totalBars}
            title="Numero di Bar"
            className="mb-3"
          />
        </CCol>
        <CCol sm={6} lg={3}>
          <CWidgetStatsA
            color="warning"
            icon={<CIcon icon={cilCreditCard} height={24} />}
            value={data.totalTransactions.toLocaleString()}
            title="Transazioni"
            className="mb-3"
          />
        </CCol>
        <CCol sm={6} lg={3}>
          <CWidgetStatsA
            color="primary"
            icon={<CIcon icon={cilGraph} height={24} />}
            value={data.avgCommission}
            title="Commissione Media"
            className="mb-3"
          />
        </CCol>
      </CRow>

      {/* Charts */}
      <CRow>
        <CCol lg={8}>
          <CCard>
            <CCardHeader>Vendite Giornaliere</CCardHeader>
            <CCardBody>
              <CChartLine
                data={chartData.line}
                className="mt-3"
                style={{ height: '300px' }}
                loading={loading}
              />
            </CCardBody>
          </CCard>
        </CCol>

        <CCol lg={4}>
          <CCard>
            <CCardHeader>Metodi di Pagamento</CCardHeader>
            <CCardBody>
              <CChartPie
                data={chartData.pie}
                className="mt-3"
                style={{ height: '300px' }}
                loading={loading}
              />
            </CCardBody>
          </CCard>
        </CCol>

        <CCol lg={12} className="mt-4">
          <CCard>
            <CCardHeader>Fatturato per Regione</CCardHeader>
            <CCardBody>
              <CChartBar
                data={chartData.bar}
                className="mt-3"
                style={{ height: '300px' }}
                loading={loading}
              />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  )
}

export default Statistiche
