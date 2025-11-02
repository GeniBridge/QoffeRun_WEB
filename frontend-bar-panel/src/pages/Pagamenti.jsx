import React, { useMemo, useState } from 'react'
import { PAYMENTS } from '../data/demo'

const badge = (s)=>{
  const map = { 'Completato':'bg-success', 'In attesa':'bg-warning', 'Fallito':'bg-danger' }
  return <span className={`badge ${map[s]||'bg-secondary'}`}>{s}</span>
}

export default function Pagamenti(){
  const [q,setQ] = useState('');
  const [d1,setD1] = useState('');
  const [d2,setD2] = useState('');
  const [stato,setStato] = useState('Tutti');
  const [sel,setSel] = useState(null);

  const list = useMemo(()=>{
    return PAYMENTS.filter(p=>{
      const qok = p.customer.toLowerCase().includes(q.toLowerCase()) || (''+p.orderId).includes(q) || p.txId.includes(q);
      const dok1 = !d1 || p.date >= d1;
      const dok2 = !d2 || p.date <= d2 + ' 23:59';
      const sok = stato==='Tutti' || p.status===stato;
      return qok && dok1 && dok2 && sok;
    })
  },[q,d1,d2,stato])

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

      <div className="table-responsive bg-white rounded-4 border">
        <table className="table align-middle mb-0">
          <thead><tr><th>Cliente</th><th>Ordine</th><th>Data</th><th>ID Transazione Stripe</th><th>Somma</th><th>Commissione</th><th>Stato</th><th></th></tr></thead>
          <tbody>
            {list.map((p,idx)=> (
              <tr key={idx}>
                <td>{p.customer}</td>
                <td>{p.orderId}</td>
                <td>{p.date}</td>
                <td>{p.txId}</td>
                <td>€{p.amount.toFixed(2)}</td>
                <td>€{p.fee.toFixed(2)}</td>
                <td>{badge(p.status)}</td>
                <td className="text-end"><button className="btn btn-outline-primary btn-sm" onClick={()=>setSel(p)}>Dettagli</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sel && (
        <div className="modal fade show" style={{display:'block'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header"><h5 className="modal-title">Pagamento ordine #{sel.orderId}</h5><button className="btn-close" onClick={()=>setSel(null)}></button></div>
              <div className="modal-body">
                <ul className="list-group">
                  <li className="list-group-item d-flex justify-content-between"><span>Cliente</span><span>{sel.customer}</span></li>
                  <li className="list-group-item d-flex justify-content-between"><span>Data</span><span>{sel.date}</span></li>
                  <li className="list-group-item d-flex justify-content-between"><span>Transazione</span><span>{sel.txId}</span></li>
                  <li className="list-group-item d-flex justify-content-between"><span>Somma</span><span>€{sel.amount.toFixed(2)}</span></li>
                  <li className="list-group-item d-flex justify-content-between"><span>Commissione</span><span>€{sel.fee.toFixed(2)}</span></li>
                  <li className="list-group-item d-flex justify-content-between"><span>Stato</span><span>{sel.status}</span></li>
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
