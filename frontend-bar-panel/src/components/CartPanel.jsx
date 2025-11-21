import React, { useRef, useState } from 'react'
import { useCart } from '../context/CartContext'

export default function CartPanel(){
  const { cart } = useCart()
  const [pinAction, setPinAction] = useState(null)
  const pinInput = useRef(null)
  const modalRef = useRef(null)

  function openPin(action){
    setPinAction(action)
    const modal = new window.bootstrap.Modal(document.getElementById('pinModal'))
    modalRef.current = modal
    setTimeout(()=> pinInput.current?.focus(), 200)
    modal.show()
  }
  
  function submitPin(){
    const pin = pinInput.current?.value || ''
    if(!/^\d{4}$/.test(pin)) return alert('Inserisci un codice a 4 cifre.')
    modalRef.current?.hide()
    if(pinAction==='confirm'){
      alert('✅ Ordine confermato!')
      cart.clear()
    } else if(pinAction==='cancel'){
      alert('⛔️ Ordine annullato!')
      cart.clear()
    }
    pinInput.current.value=''
  }

  return (
    <>
      <aside className="cart">
        <div className="cart-header d-flex align-items-center justify-content-between">
          <div className="fw-semibold">Carrello</div>
          <div className="text-muted small">{cart.count} {cart.count===1?'item':'items'}</div>
        </div>
        <div className="cart-items">
          {[...cart.items.values()].map(it=> (
            <div className="cart-item" key={it.id}>
              <img src={it.meta?.img || 'https://dummyimage.com/56x56/eee/aaa&text=%20'} className="rounded" width="56" height="56" />
              <div>
                <div className="fw-semibold">{it.name}</div>
                <div className="text-muted small">{cart.fmt(it.price)} × {it.qty}</div>
              </div>
              <div className="text-end">
                <div className="fw-semibold">{cart.fmt(it.price*it.qty)}</div>
                <div className="btn-group btn-group-sm mt-1" role="group">
                  <button className="btn btn-outline-secondary" onClick={()=> cart.setQty(it.id, it.qty-1)}><i className="bi bi-dash"></i></button>
                  <button className="btn btn-outline-secondary" onClick={()=> cart.setQty(it.id, it.qty+1)}><i className="bi bi-plus"></i></button>
                  <button className="btn btn-outline-danger" onClick={()=> cart.remove(it.id)}><i className="bi bi-x"></i></button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="cart-footer">
          <div className="d-flex justify-content-between mb-2"><span className="text-muted">Subtotal</span><span className="fw-semibold">{cart.fmt(cart.subtotal)}</span></div>
          <div className="d-flex justify-content-between mb-2"><span className="text-muted">Tax ({cart.taxPct}%)</span><span className="fw-semibold">{cart.fmt(cart.tax)}</span></div>
          <div className="d-flex justify-content-between fs-5 mb-3"><span>Total</span><span className="fw-bold">{cart.fmt(cart.total)}</span></div>
          <div className="d-grid gap-2">
            <button className="btn btn-success" disabled={cart.count===0} onClick={()=>openPin('confirm')}><i className="bi bi-check2-circle me-2"></i>Conferma ordine</button>
            <button className="btn btn-outline-danger" disabled={cart.count===0} onClick={()=>openPin('cancel')}><i className="bi bi-x-circle me-2"></i>Annulla ordine</button>
            <button className="btn btn-outline-secondary" onClick={()=>cart.clear()}><i className="bi bi-trash me-2"></i>Svuota</button>
          </div>
        </div>
      </aside>

      {/* PIN Modal */}
      <div className="modal fade" id="pinModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Codice di conferma</h5>
              <button className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <p className="text-muted mb-2">Inserisci il codice a 4 cifre per {pinAction==='confirm' ? 'confermare' : 'annullare'} l'ordine.</p>
              <input ref={pinInput} className="form-control text-center fs-4" maxLength={4} placeholder="0000" inputMode="numeric" />
            </div>
            <div className="modal-footer">
              <button className="btn btn-light" data-bs-dismiss="modal">Chiudi</button>
              <button className="btn btn-dark" onClick={submitPin}>Conferma</button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
