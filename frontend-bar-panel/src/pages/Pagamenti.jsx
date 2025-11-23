import React, { useMemo, useState, useEffect } from 'react'
import orderService from '../services/orderService'
import { useBranch } from '../context/BranchContext'

const badge = (s)=>{
  const map = { 'paid':'bg-success', 'pending':'bg-warning', 'failed':'bg-danger' }
  const labels = { 'paid':'Pagato', 'pending':'In Attesa', 'failed':'Fallito' }
  return <span className={`badge ${map[s]||'bg-secondary'}`}>{labels[s] || s}</span>
}

export default function Pagamenti(){
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
      // Filter only paid orders
      const paidOrders = (response.data || []).filter(o => o.payment_status === 'paid');
      setOrders(paidOrders);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(()=>{
    return orders.filter(p=>{
      const qok = (p.customer_name || '').toLowerCase().includes(q.toLowerCase()) || (''+p.id).includes(q) || (p.stripe_payment_intent_id || '').includes(q);
      const dok1 = !d1 || p.created_at >= d1;
      const dok2 = !d2 || p.created_at <= d2 + ' 23:59';
      const sok = stato==='Tutti' || p.payment_status===stato;
      return qok && dok1 && dok2 && sok;
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
        <input className="form-control" style={{maxWidth:340}} placeholder="Cerca cliente, ordine, transazione" value={q} onChange={e=>setQ(e.target.value)} />
        <input type="date" className="form-control" value={d1} onChange={e=>setD1(e.target.value)} />
        <input type="date" className="form-control" value={d2} onChange={e=>setD2(e.target.value)} />
        <div className="dropdown">
          <button className="btn btn-light dropdown-toggle" data-bs-toggle="dropdown">{stato}</button>
          <div className="dropdown-menu">
            {['Tutti','Completato','In attesa','Fallito'].map(s=> <button key={s} className="dropdown-item" onClick={()=>setStato(s)}>{s}</button>)}
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {!selectedBranch && (
        <div className="alert alert-warning">
          <i className="bi bi-info-circle me-2"></i>
          Seleziona una filiale per vedere i pagamenti
        </div>
      )}

      <div className="table-responsive bg-white rounded-4 border">
        <table className="table align-middle mb-0">
          <thead><tr><th>Cliente</th><th>Ordine</th><th>Data</th><th>ID Transazione Stripe</th><th>Somma</th><th>Commissione</th><th>Stato</th><th></th></tr></thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center py-4">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Caricamento...</span>
                  </div>
                </td>
              </tr>
            ) : list.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-4 text-muted">
                  {orders.length === 0 ? 'Nessun pagamento trovato' : 'Nessun pagamento corrisponde ai filtri'}
                </td>
              </tr>
            ) : (
              list.map((p)=> (
                <tr key={p.id}>
                  <td>{p.customer_name || 'N/A'}</td>
                  <td>#{p.order_number || p.id}</td>
                  <td>{new Date(p.created_at).toLocaleDateString('it-IT')}</td>
                  <td><small>{p.stripe_payment_intent_id || 'N/A'}</small></td>
                  <td>€{parseFloat(p.total_amount || 0).toFixed(2)}</td>
                  <td>€{parseFloat(p.commission_amount || 0).toFixed(2)}</td>
                  <td>{badge(p.payment_status)}</td>
                  <td className="text-end"><button className="btn btn-outline-primary btn-sm" onClick={()=>setSel(p)}>Dettagli</button></td>
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

      {sel && (
        <div className="modal fade show" style={{display:'block'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header"><h5 className="modal-title">Pagamento ordine #{sel.order_number || sel.id}</h5><button className="btn-close" onClick={()=>setSel(null)}></button></div>
              <div className="modal-body">
                <ul className="list-group">
                  <li className="list-group-item d-flex justify-content-between"><span>Cliente</span><span>{sel.customer_name || 'N/A'}</span></li>
                  <li className="list-group-item d-flex justify-content-between"><span>Email</span><span>{sel.customer_email || 'N/A'}</span></li>
                  <li className="list-group-item d-flex justify-content-between"><span>Telefono</span><span>{sel.customer_phone || 'N/A'}</span></li>
                  <li className="list-group-item d-flex justify-content-between"><span>Data</span><span>{new Date(sel.created_at).toLocaleString('it-IT')}</span></li>
                  <li className="list-group-item d-flex justify-content-between"><span>Transazione Stripe</span><span><small>{sel.stripe_payment_intent_id || 'N/A'}</small></span></li>
                  <li className="list-group-item d-flex justify-content-between"><span>Totale Ordine</span><span>€{parseFloat(sel.total_amount || 0).toFixed(2)}</span></li>
                  <li className="list-group-item d-flex justify-content-between"><span>Commissione QoffeRun</span><span>€{parseFloat(sel.commission_amount || 0).toFixed(2)}</span></li>
                  <li className="list-group-item d-flex justify-content-between"><span>Incasso Filiale</span><span>€{parseFloat(sel.branch_amount || 0).toFixed(2)}</span></li>
                  <li className="list-group-item d-flex justify-content-between"><span>Stato Pagamento</span><span>{badge(sel.payment_status)}</span></li>
                  {sel.payment_confirmed_at && (
                    <li className="list-group-item d-flex justify-content-between"><span>Confermato il</span><span>{new Date(sel.payment_confirmed_at).toLocaleString('it-IT')}</span></li>
                  )}
                </ul>
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
