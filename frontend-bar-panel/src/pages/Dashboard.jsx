import React, { useMemo, useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { useBranch } from '../context/BranchContext'
import orderService from '../services/orderService'
import OrderDetailModal from '../components/OrderDetailModal'

const statusBadge = (s) => {
  const map = {
    'pending': 'bg-warning-subtle text-warning',
    'confirmed': 'bg-info-subtle text-info',
    'ready': 'bg-success-subtle text-success',
    'completed': 'bg-primary-subtle text-primary',
    'cancelled': 'bg-danger-subtle text-danger'
  }
  const labels = {
    'pending': 'In Attesa',
    'confirmed': 'Confermato',
    'ready': 'Pronto',
    'completed': 'Completato',
    'cancelled': 'Annullato'
  }
  const label = labels[s] || s
  return <span className={`badge ${map[s]||'bg-secondary-subtle text-secondary'}`}>{label}</span>
}

export default function Dashboard(){
  const { cart } = useCart()
  const { selectedBranch } = useBranch()
  const [selected, setSelected] = useState(null)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('Tutti')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [orderModalLoading, setOrderModalLoading] = useState(false)

  // Load orders when branch changes
  useEffect(() => {
    if (selectedBranch) {
      loadOrders()
      // Set up polling for new orders every 30 seconds
      const interval = setInterval(loadOrders, 30000)
      return () => clearInterval(interval)
    }
  }, [selectedBranch])

  const loadOrders = async () => {
    if (!selectedBranch) return
    
    try {
      setLoading(true)
      setError('')
      const response = await orderService.getBranchOrders(selectedBranch.id)
      setOrders(response.data || [])
    } catch (err) {
      setError(`Errore nel caricamento ordini: ${err.message}`)
      console.error('Failed to load orders:', err)
    } finally {
      setLoading(false)
    }
  }

  const list = useMemo(()=>{
    return orders.filter(o => {
      // Hide completed and cancelled orders from dashboard
      if (['completed', 'cancelled'].includes(o.status)) {
        return false
      }
      
      // Filter by status
      if (status !== 'Tutti' && o.status !== status) {
        return false
      }
      
      // Filter by search query (if provided)
      if (query.trim() !== '') {
        const searchTerm = query.toLowerCase().trim()
        return (
          (''+o.id).includes(searchTerm) || 
          (o.customer_name || '').toLowerCase().includes(searchTerm) ||
          (o.order_number || '').includes(searchTerm)
        )
      }
      
      return true
    })
  }, [orders, query, status])

  function loadOrder(o){
    cart.clear()
    // Load order items into cart for display
    if (o.items && o.items.length > 0) {
      o.items.forEach(item => {
        const product = {
          id: item.menu_item?.id || item.menu_item_id,
          name: item.menu_item?.name || 'Menu Item',
          price: parseFloat(item.price_at_time || item.menu_item?.price || 0),
          meta: {
            img: item.menu_item?.image_url || null
          }
        }
        cart.add(product, item.quantity || 1)
      })
    }
  }

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(selectedBranch.id, orderId, newStatus)
      loadOrders() // Reload orders to get updated status
      
      // Update the selected order in modal if it's the same order
      if (selectedOrder && selectedOrder.id === orderId) {
        const updatedOrder = { ...selectedOrder, status: newStatus };
        setSelectedOrder(updatedOrder);
      }
    } catch (err) {
      setError(`Errore nell'aggiornamento: ${err.message}`)
    }
  }

  const handleOrderSelect = async (order) => {
    setSelected(order.id)
    setSelectedOrder(order)
    setShowOrderModal(true)
    loadOrder(order)
    
    // Load full order details if needed
    try {
      setOrderModalLoading(true)
      const fullOrder = await orderService.getOrder(selectedBranch.id, order.id)
      setSelectedOrder(fullOrder.data || order)
    } catch (err) {
      console.error('Failed to load full order details:', err)
      setSelectedOrder(order) // Use basic order data as fallback
    } finally {
      setOrderModalLoading(false)
    }
  }

  if (!selectedBranch) {
    return (
      <section>
        <div className="alert alert-warning">
          <i className="bi bi-info-circle me-2"></i>
          Seleziona una filiale per vedere gli ordini
        </div>
      </section>
    )
  }

  return (
    <section>
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setError('')}
          ></button>
        </div>
      )}

      <div className="d-flex align-items-center gap-3 mb-3">
        <div className="input-group" style={{maxWidth:520}}>
          <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
          <input className="form-control" placeholder="Cerca ordine, cliente o #ordine..." value={query} onChange={e=>setQuery(e.target.value)} />
        </div>
        <div className="dropdown">
          <button className="btn btn-light dropdown-toggle" data-bs-toggle="dropdown">{status}</button>
          <div className="dropdown-menu">
            {['Tutti','pending','confirmed','ready'].map(s => (
              <button className="dropdown-item" key={s} onClick={()=> setStatus(s)}>
                {s === 'Tutti' ? 'Tutti' : statusBadge(s)}
              </button>
            ))}
          </div>
        </div>
        <button 
          className="btn btn-outline-primary" 
          onClick={loadOrders}
          disabled={loading}
        >
          <i className="bi bi-arrow-clockwise me-1"></i>
          {loading ? 'Caricando...' : 'Aggiorna'}
        </button>
      </div>

      <div className="content-scroll">
        <div className="row g-3">
          {loading && orders.length === 0 ? (
            <div className="col-12 text-center py-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Caricamento ordini...</span>
              </div>
            </div>
          ) : list.length === 0 ? (
            <div className="col-12 text-center py-5 text-muted">
              <i className="bi bi-receipt display-1"></i>
              <p className="mt-3">
                {orders.length === 0 ? 'Nessun ordine trovato' : 'Nessun ordine corrisponde ai filtri'}
              </p>
            </div>
          ) : (
            list.map(o => (
              <div className="col-md-6 col-lg-4" key={o.id}>
                <div 
                  className={`card ${selected===o.id ? "border-primary" : ""}`}
                  role="button" 
                  onClick={()=> handleOrderSelect(o)}
                >
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="card-title mb-0">#{o.order_number || o.id}</h6>
                      {statusBadge(o.status)}
                    </div>
                    <p className="card-text mb-1 small">
                      <i className="bi bi-person me-1"></i>
                      <strong>{o.customer_name || 'Cliente'}</strong>
                    </p>
                    <p className="card-text mb-1 small">
                      <i className="bi bi-clock me-1"></i>
                      {new Date(o.created_at).toLocaleTimeString('it-IT', {hour: '2-digit', minute: '2-digit'})}
                    </p>
                    <p className="card-text mb-1 small">
                      <i className="bi bi-key me-1"></i>
                      Codice: <strong>{o.code_4digit}</strong>
                    </p>
                    {o.items && o.items.length > 0 && (
                      <p className="card-text mb-2 small text-muted">
                        <i className="bi bi-basket me-1"></i>
                        {o.items.length} {o.items.length === 1 ? 'articolo' : 'articoli'}
                      </p>
                    )}
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <span className="h6 mb-0 text-success">
                        €{parseFloat(o.total_amount || o.total || 0).toFixed(2)}
                      </span>
                      <button className="btn btn-sm btn-primary">
                        Gestisci
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        show={showOrderModal}
        onHide={() => {
          setShowOrderModal(false)
          setSelectedOrder(null)
          setSelected(null)
        }}
        onStatusUpdate={handleStatusUpdate}
        loading={orderModalLoading}
      />
    </section>
  )
}
