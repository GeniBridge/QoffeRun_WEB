import React, { useMemo, useState, useEffect } from 'react'
import orderService from '../services/orderService'
import { useBranch } from '../context/BranchContext'

const badge = (s)=>{
  const map = { 
    'pending':'bg-warning', 
    'confirmed':'bg-info', 
    'ready':'bg-primary', 
    'completed':'bg-success', 
    'cancelled':'bg-danger' 
  }
  const labels = {
    'pending': 'In Attesa',
    'confirmed': 'Confermato',
    'ready': 'Pronto',
    'completed': 'Completato',
    'cancelled': 'Annullato'
  }
  const cls = map[s] || 'bg-secondary'
  const label = labels[s] || s
  return <span className={`badge ${cls}`}>{label}</span>
}

export default function StoricoOrdini(){
  const { selectedBranch } = useBranch();
  const [q,setQ] = useState('');
  const [d1,setD1] = useState('');
  const [d2,setD2] = useState('');
  const [stato,setStato] = useState('Tutti');
  const [sel,setSel] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Load orders from API
  useEffect(() => {
    if (selectedBranch) {
      loadOrders();
    }
  }, [selectedBranch]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await orderService.getBranchOrders(selectedBranch.id);
      setOrders(response.data || []);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(selectedBranch.id, orderId, newStatus);
      // Reload orders to get updated data
      loadOrders();
    } catch (err) {
      setError(`Errore nell'aggiornamento ordine: ${err.message}`);
    }
  };

  const filtered = useMemo(()=>{
    return orders.filter(o=>{
      // Only show completed and cancelled orders in history
      const statusOk = ['completed', 'cancelled'].includes(o.status);
      const qok = (''+o.id).includes(q) || o.customer_name?.toLowerCase().includes(q.toLowerCase());
      const dok1 = !d1 || o.created_at >= d1;
      const dok2 = !d2 || o.created_at <= d2 + ' 23:59';
      const sok = stato==='Tutti' || o.status===stato;
      return statusOk && qok && dok1 && dok2 && sok;
    })
  },[orders,q,d1,d2,stato]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const list = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  }, [filtered, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [q, d1, d2, stato]);

  return (
    <section>
      <div className="d-flex align-items-center gap-3 mb-3">
        <input className="form-control" style={{maxWidth:340}} placeholder="Cerca cliente o #ordine" value={q} onChange={e=>setQ(e.target.value)} />
        <input type="date" className="form-control" value={d1} onChange={e=>setD1(e.target.value)} />
        <input type="date" className="form-control" value={d2} onChange={e=>setD2(e.target.value)} />
        <div className="dropdown">
          <button className="btn btn-light dropdown-toggle" data-bs-toggle="dropdown">{stato}</button>
          <div className="dropdown-menu">
            {['Tutti','completed','cancelled'].map(s=> <button key={s} className="dropdown-item" onClick={()=>setStato(s)}>{s}</button>)}
          </div>
        </div>
        <button className="btn btn-primary" onClick={loadOrders} disabled={loading}>
          <i className="bi bi-arrow-clockwise me-2"></i>
          {loading ? 'Caricando...' : 'Aggiorna'}
        </button>
      </div>

      {error && (
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Errore nel caricamento ordini: {error}
        </div>
      )}

      {!selectedBranch && (
        <div className="alert alert-warning">
          <i className="bi bi-info-circle me-2"></i>
          Seleziona una filiale per vedere gli ordini
        </div>
      )}

      <div className="table-responsive bg-white rounded-4 border">
        <table className="table align-middle mb-0">
          <thead><tr><th>#Ordine</th><th>Cliente</th><th>Data</th><th>Totale</th><th>Stato</th><th>Codice Ritiro</th><th></th></tr></thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center py-4">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Caricamento...</span>
                  </div>
                </td>
              </tr>
            ) : list.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-4 text-muted">
                  {orders.length === 0 ? 'Nessun ordine trovato' : 'Nessun ordine corrisponde ai filtri'}
                </td>
              </tr>
            ) : (
              list.map(o=> (
                <tr key={o.id}>
                  <td>#{o.order_number || o.id}</td>
                  <td>{o.customer_name || 'N/A'}</td>
                  <td>{new Date(o.created_at).toLocaleDateString('it-IT')}</td>
                  <td>€{parseFloat(o.total_amount || o.total || 0).toFixed(2)}</td>
                  <td>{badge(o.status)}</td>
                  <td><strong>{o.code_4digit}</strong></td>
                  <td className="text-end">
                    <button className="btn btn-outline-primary btn-sm" onClick={()=>setSel(o)}>
                      Dettagli
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <div className="text-muted">
            Pagina {currentPage} di {totalPages} ({filtered.length} risultati totali)
          </div>
          <nav>
            <ul className="pagination mb-0">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
                  <i className="bi bi-chevron-double-left"></i>
                </button>
              </li>
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
                  <i className="bi bi-chevron-left"></i>
                </button>
              </li>
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                if (page === 1 || page === totalPages || (page >= currentPage - 2 && page <= currentPage + 2)) {
                  return (
                    <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                      <button className="page-link" onClick={() => setCurrentPage(page)}>
                        {page}
                      </button>
                    </li>
                  );
                } else if (page === currentPage - 3 || page === currentPage + 3) {
                  return <li key={page} className="page-item disabled"><span className="page-link">...</span></li>;
                }
                return null;
              })}
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
                  <i className="bi bi-chevron-right"></i>
                </button>
              </li>
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
                  <i className="bi bi-chevron-double-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* Modal Dettagli */}
      {sel && (
        <div className="modal fade show" style={{display:'block'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header"><h5 className="modal-title">Ordine #{sel.order_number || sel.id}</h5><button className="btn-close" onClick={()=>setSel(null)}></button></div>
              <div className="modal-body">
                <div className="mb-3">
                  <p className="mb-1"><strong>Cliente:</strong> {sel.customer_name || 'N/A'}</p>
                  <p className="mb-1"><strong>Email:</strong> {sel.customer_email || 'N/A'}</p>
                  <p className="mb-1"><strong>Telefono:</strong> {sel.customer_phone || 'N/A'}</p>
                  <p className="mb-1"><strong>Data:</strong> {new Date(sel.created_at).toLocaleString('it-IT')}</p>
                  <p className="mb-1"><strong>Codice Ritiro:</strong> <span className="badge bg-primary">{sel.code_4digit}</span></p>
                  <p className="mb-1"><strong>Stato:</strong> {badge(sel.status)}</p>
                </div>
                <h6>Articoli Ordinati:</h6>
                <ul className="list-group">
                  {sel.items && sel.items.length > 0 ? (
                    sel.items.map((item, idx) => (
                      <li key={idx} className="list-group-item d-flex justify-content-between">
                        <span>
                          <strong>{item.menu_item?.name || item.name || 'Prodotto'}</strong>
                          {item.menu_item?.description && (
                            <small className="d-block text-muted">{item.menu_item.description}</small>
                          )}
                          <span className="text-muted"> × {item.quantity}</span>
                        </span>
                        <span>€{(parseFloat(item.price_at_time || item.price || 0) * item.quantity).toFixed(2)}</span>
                      </li>
                    ))
                  ) : (
                    <li className="list-group-item text-muted">Nessun articolo trovato</li>
                  )}
                </ul>
                <div className="mt-3 text-end">
                  <h5>Totale: <span className="text-success">€{parseFloat(sel.total_amount || sel.total || 0).toFixed(2)}</span></h5>
                </div>
              </div>
              <div className="modal-footer"><button className="btn btn-dark" onClick={()=>setSel(null)}>Chiudi</button></div>
            </div>
          </div>
        </div>
      )}
      {sel && <div className="modal-backdrop fade show" onClick={()=>setSel(null)}></div>}
    </section>
  )
}
