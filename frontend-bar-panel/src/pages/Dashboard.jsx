import React, { useMemo, useState } from 'react'
import { ORDERS, PRODUCTS } from '../data/demo'
import { useCart } from '../context/CartContext'

const statusBadge = (s) => {
  const map = {
    'Pronto': 'bg-success-subtle text-success',
    'In Attesa': 'bg-warning-subtle text-warning'
  }
  return <span className={`badge ${map[s]||'bg-secondary-subtle text-secondary'}`}>{s}</span>
}

export default function Dashboard(){
  const { cart } = useCart()
  const [selected, setSelected] = useState(null)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('Tutti')

  const list = useMemo(()=>{
    return ORDERS.filter(o => (status==='Tutti' || o.status===status) && (
      (''+o.id).includes(query) || o.customer.toLowerCase().includes(query.toLowerCase())
    ))
  }, [query, status])

  function loadOrder(o){
    cart.clear()
    o.lines.forEach(line => {
      const p = PRODUCTS.find(pp=>pp.id === line.productId)
      if(p) cart.add({ ...p }, line.qty)
    })
  }

  return (
    <section>
      <div className="d-flex align-items-center gap-3 mb-3">
        <div className="input-group" style={{maxWidth:520}}>
          <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
          <input className="form-control" placeholder="Cerca ordine o cliente..." value={query} onChange={e=>setQuery(e.target.value)} />
        </div>
        <div className="dropdown">
          <button className="btn btn-light dropdown-toggle" data-bs-toggle="dropdown">{status}</button>
          <div className="dropdown-menu">
            {['Tutti','Pronto','In Attesa'].map(s => (
              <button className="dropdown-item" key={s} onClick={()=> setStatus(s)}>{s}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="content-scroll"><div className="row g-3">
        {list.map(o => (
          <div className="col-md-4" key={o.id}>
            <div className={`p-3 bg-white border rounded-4 product-card order-card ${selected===o.id? "selected":""}`} role="button" onClick={()=> { setSelected(o.id); loadOrder(o); }}>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="text-muted small">Ordine #{o.id}</div>
                </div>
                {statusBadge(o.status)}
              </div>
              <div className="text-muted small mt-1">{o.date}</div>
              <div className="fw-bold fs-5 mt-2">{o.customer}</div>
              <div className="text-warning fw-bold mt-2">Clicca per aprire</div>
            </div>
          </div>
        ))}
      </div></div>
    </section>
  )
}
