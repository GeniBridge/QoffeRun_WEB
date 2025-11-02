import React, { useState } from "react";

// Demo payments data
const DEMO_PAYMENTS = [
  {
    id: 1,
    cliente: "Mario Rossi",
    ordine: 1001,
    data: "2025-10-26 10:25",
    idTransazione: "pi_1Hh1a2b3c4d5e6f7g8h9i0",
    somma: 17.38,
    commissione: 0.49,
    stato: "Completato",
    dettagli: {
      metodo: "Carta di credito",
      email: "mario.rossi@email.com",
      note: "Pagamento ricevuto con successo."
    }
  },
  {
    id: 2,
    cliente: "Anna Bianchi",
    ordine: 1002,
    data: "2025-10-26 12:10",
    idTransazione: "pi_2Jj2k3l4m5n6o7p8q9r0s1",
    somma: 9.70,
    commissione: 0.39,
    stato: "Completato",
    dettagli: {
      metodo: "Apple Pay",
      email: "anna.bianchi@email.com",
      note: "Pagamento ricevuto con successo."
    }
  },
  {
    id: 3,
    cliente: "John Doe",
    ordine: 1003,
    data: "2025-10-27 09:15",
    idTransazione: "pi_3Kk3l4m5n6o7p8q9r0s1t2",
    somma: 23.49,
    commissione: 0.69,
    stato: "In attesa",
    dettagli: {
      metodo: "Google Pay",
      email: "john.doe@email.com",
      note: "In attesa di conferma."
    }
  },
  {
    id: 4,
    cliente: "Giulia Verdi",
    ordine: 1004,
    data: "2025-10-27 11:05",
    idTransazione: "pi_4Ll4m5n6o7p8q9r0s1t2u3",
    somma: 8.50,
    commissione: 0.29,
    stato: "Fallito",
    dettagli: {
      metodo: "Carta di credito",
      email: "giulia.verdi@email.com",
      note: "Pagamento rifiutato dalla banca."
    }
  },
  {
    id: 5,
    cliente: "Luca Neri",
    ordine: 1005,
    data: "2025-10-27 12:35",
    idTransazione: "pi_5Mm5n6o7p8q9r0s1t2u3v4",
    somma: 15.00,
    commissione: 0.45,
    stato: "Completato",
    dettagli: {
      metodo: "Carta di credito",
      email: "luca.neri@email.com",
      note: "Pagamento ricevuto con successo."
    }
  }
];

const statusOptions = [
  { value: '', label: 'Tutti' },
  { value: 'Completato', label: 'Completato' },
  { value: 'In attesa', label: 'In attesa' },
  { value: 'Fallito', label: 'Fallito' },
];

export default function Pagamenti() {
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const filtered = DEMO_PAYMENTS.filter(p => {
    if (status && p.stato !== status) return false;
    if (search && !(
      p.cliente.toLowerCase().includes(search.toLowerCase()) ||
      p.ordine.toString().includes(search) ||
      p.idTransazione.toLowerCase().includes(search.toLowerCase())
    )) return false;
    if (dateFrom && p.data < dateFrom) return false;
    if (dateTo && p.data > dateTo) return false;
    return true;
  });
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="container py-4">
      <div style={{height: '1.5rem'}}></div>
      <div className="d-flex flex-wrap align-items-center gap-3 mb-3" style={{paddingTop: '1.5rem'}}>
        <input className="form-control" style={{ maxWidth: 200 }} placeholder="Cerca cliente, ordine, transazione" value={search} onChange={e => setSearch(e.target.value)} />
        <input type="date" className="form-control" style={{ maxWidth: 140 }} value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        <input type="date" className="form-control" style={{ maxWidth: 140 }} value={dateTo} onChange={e => setDateTo(e.target.value)} />
        <select className="form-select" style={{ maxWidth: 140 }} value={status} onChange={e => setStatus(e.target.value)}>
          {statusOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div className="table-responsive" style={{ maxHeight: 340, overflowY: 'auto' }}>
        <table className="table table-bordered align-middle">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Ordine</th>
              <th>Data</th>
              <th>ID Transazione Stripe</th>
              <th>Somma</th>
              <th>Commissione</th>
              <th>Stato</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="text-center text-muted">Nessun pagamento trovato.</td></tr>
            ) : paginated.map(p => (
              <tr key={p.id}>
                <td>{p.cliente}</td>
                <td>{p.ordine}</td>
                <td>{p.data}</td>
                <td>{p.idTransazione}</td>
                <td>€{p.somma.toFixed(2)}</td>
                <td>€{p.commissione.toFixed(2)}</td>
                <td><span className={`badge bg-${p.stato === "Completato" ? "success" : p.stato === "In attesa" ? "warning" : "danger"}`}>{p.stato}</span></td>
                <td><button className="btn btn-sm btn-outline-primary" onClick={() => setSelected(p)}>Dettagli</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="d-flex justify-content-center mt-2">
          <ul className="pagination pagination-sm mb-0">
            <li className={`page-item${page === 1 ? ' disabled' : ''}`}><button className="page-link" onClick={() => setPage(page - 1)} disabled={page === 1}>&laquo;</button></li>
            {Array.from({ length: totalPages }, (_, i) => (
              <li key={i+1} className={`page-item${page === i+1 ? ' active' : ''}`}><button className="page-link" onClick={() => setPage(i+1)}>{i+1}</button></li>
            ))}
            <li className={`page-item${page === totalPages ? ' disabled' : ''}`}><button className="page-link" onClick={() => setPage(page + 1)} disabled={page === totalPages}>&raquo;</button></li>
          </ul>
        </nav>
      )}
      {selected && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(44,44,44,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 8px 32px rgba(44,44,44,0.22)', maxWidth: 420, width: '100%', padding: 0, overflow: 'hidden' }}>
            <div className="modal-header" style={{ padding: '1rem 1.5rem', background: '#fafbff', borderBottom: '1px solid #f0f0f0' }}>
              <h5 className="modal-title" style={{ fontWeight: 600 }}>Dettagli Pagamento</h5>
              <button type="button" className="btn-close" style={{ fontSize: '1.25rem', opacity: 0.7 }} onClick={() => setSelected(null)}></button>
            </div>
            <div className="modal-body" style={{ padding: '1.5rem 1.5rem 1rem 1.5rem' }}>
              <div className="mb-2"><span className="text-muted">Cliente:</span> <span className="fw-semibold">{selected.cliente}</span></div>
              <div className="mb-2"><span className="text-muted">Ordine:</span> <span className="fw-semibold">{selected.ordine}</span></div>
              <div className="mb-2"><span className="text-muted">Data:</span> <span className="fw-semibold">{selected.data}</span></div>
              <div className="mb-2"><span className="text-muted">ID Transazione:</span> <span className="fw-semibold">{selected.idTransazione}</span></div>
              <div className="mb-2"><span className="text-muted">Somma:</span> <span className="fw-semibold">€{selected.somma.toFixed(2)}</span></div>
              <div className="mb-2"><span className="text-muted">Commissione:</span> <span className="fw-semibold">€{selected.commissione.toFixed(2)}</span></div>
              <div className="mb-2"><span className="text-muted">Stato:</span> <span className={`badge bg-${selected.stato === "Completato" ? "success" : selected.stato === "In attesa" ? "warning" : "danger"}`}>{selected.stato}</span></div>
              <div className="border-bottom mb-2 pb-1 text-uppercase small text-muted" style={{ letterSpacing: "0.05em" }}>Dettagli</div>
              <div className="mb-2"><span className="text-muted">Metodo:</span> <span className="fw-semibold">{selected.dettagli.metodo}</span></div>
              <div className="mb-2"><span className="text-muted">Email:</span> <span className="fw-semibold">{selected.dettagli.email}</span></div>
              <div className="mb-2"><span className="text-muted">Note:</span> <span className="fw-semibold">{selected.dettagli.note}</span></div>
            </div>
            <div className="modal-footer" style={{ background: '#fafbff', padding: '1rem 1.5rem', display: 'flex', gap: '.5rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setSelected(null)}>Chiudi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
