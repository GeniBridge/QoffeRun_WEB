import React, { useState } from "react";
import { ORDERS } from "./Dashboard";

export default function Storico() {
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [status, setStatus] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const statusOptions = [
    { value: '', label: 'Tutti' },
    { value: 'Ritirato', label: 'Ritirato' },
    { value: 'Annullato', label: 'Annullato' },
  ];

  const filteredOrders = ORDERS.filter(order => {
    if (!["Annullato", "Ritirato"].includes(order.status)) return false;
    if (status && order.status !== status) return false;
    if (search && !(
      order.customer.toLowerCase().includes(search.toLowerCase()) ||
      order.id.toString().includes(search)
    )) return false;
    if (dateFrom && order.date < dateFrom) return false;
    if (dateTo && order.date > dateTo) return false;
    return true;
  });

  return (
    <div className="container py-4">
      <div style={{height: '1.5rem'}}></div>
      <div className="d-flex flex-wrap align-items-center gap-3 mb-3" style={{paddingTop: '1.5rem'}}>
        <input className="form-control" style={{ maxWidth: 220 }} placeholder="Cerca cliente o #ordine" value={search} onChange={e => setSearch(e.target.value)} />
        <input type="date" className="form-control" style={{ maxWidth: 160 }} value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        <input type="date" className="form-control" style={{ maxWidth: 160 }} value={dateTo} onChange={e => setDateTo(e.target.value)} />
        <select className="form-select" style={{ maxWidth: 160 }} value={status} onChange={e => setStatus(e.target.value)}>
          {statusOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div className="table-responsive">
        <table className="table table-bordered align-middle">
          <thead>
            <tr>
              <th>#Ordine</th>
              <th>Cliente</th>
              <th>Data</th>
              <th>Totale</th>
              <th>Stato</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr><td colSpan={6} className="text-center text-muted">Nessun ordine trovato.</td></tr>
            ) : filteredOrders.map(order => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.customer}</td>
                <td>{order.date}</td>
                <td>€{order.total.toFixed(2)}</td>
                <td><span className={`badge bg-${order.status === "Annullato" ? "danger" : "primary"}`}>{order.status}</span></td>
                <td><button className="btn btn-sm btn-outline-primary" onClick={() => setSelectedOrder(order)}>Dettagli</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Dettagli Ordine */}
      {selectedOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(44,44,44,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 8px 32px rgba(44,44,44,0.22)', maxWidth: 420, width: '100%', padding: 0, overflow: 'hidden' }}>
            <div className="modal-header" style={{ padding: '1rem 1.5rem', background: '#fafbff', borderBottom: '1px solid #f0f0f0' }}>
              <h5 className="modal-title" style={{ fontWeight: 600 }}>Dettagli Ordine #{selectedOrder.id}</h5>
              <button type="button" className="btn-close" style={{ fontSize: '1.25rem', opacity: 0.7 }} onClick={() => setSelectedOrder(null)}></button>
            </div>
            <div className="modal-body" style={{ padding: '1.5rem 1.5rem 1rem 1.5rem' }}>
              <div className="mb-2"><span className="text-muted">Cliente:</span> <span className="fw-semibold">{selectedOrder.customer}</span></div>
              <div className="mb-2"><span className="text-muted">Data:</span> <span className="fw-semibold">{selectedOrder.date}</span></div>
              <div className="mb-2"><span className="text-muted">Totale:</span> <span className="fw-semibold">€{selectedOrder.total.toFixed(2)}</span></div>
              <div className="mb-2"><span className="text-muted">Stato:</span> <span className={`badge bg-${selectedOrder.status === "Annullato" ? "danger" : "primary"}`}>{selectedOrder.status}</span></div>
              <div className="border-bottom mb-2 pb-1 text-uppercase small text-muted" style={{ letterSpacing: "0.05em" }}>Items</div>
              {(selectedOrder.items || []).map((item, idx) => (
                <div className='d-flex justify-content-between mb-1' key={idx}>
                  <span>{item.name} <span className="text-muted">×{item.qty}</span></span>
                  <span className="fw-semibold">€{(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="modal-footer" style={{ background: '#fafbff', padding: '1rem 1.5rem', display: 'flex', gap: '.5rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setSelectedOrder(null)}>Chiudi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
