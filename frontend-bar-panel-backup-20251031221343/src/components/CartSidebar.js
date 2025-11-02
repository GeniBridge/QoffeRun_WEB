import React, { useState } from "react";
import ModalPortal from "./ModalPortal";

export default function CartSidebar({ order, onClose, onConfirmPickup, onCancelOrder }) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [code, setCode] = useState("");


  // Success modal close handler
  const closeSuccess = () => setSuccessModal("");

  // Modal confirm logic
  const handleConfirm = () => {
    if (!/^\d{4}$/.test(code)) {
      setError("Inserisci un codice valido di 4 cifre");
      return;
    }
    setError("");
    setShowConfirmModal(false);
    setSuccessModal("ritiro");
    if (onConfirmPickup) onConfirmPickup(code);
    setCode("");
  };

  const handleCancel = () => {
    if (!/^\d{4}$/.test(code)) {
      setError("Inserisci un codice valido di 4 cifre");
      return;
    }
    setError("");
    setShowCancelModal(false);
    setSuccessModal("annullato");
    if (onCancelOrder) onCancelOrder(code);
    setCode("");
  };
  const [error, setError] = useState("");
  const [successModal, setSuccessModal] = useState(""); // "ritiro" or "annullato"



  return (
    <aside className="cart" id="cartSidebar">
      <div className="cart-header d-flex align-items-center justify-content-between">
        <div className="fw-semibold">Order Details</div>
        <button className="btn btn-light btn-sm" onClick={onClose} title="Chiudi"><i className="bi bi-x-lg"></i></button>
      </div>
      {order ? (
        <>
          <div className="cart-items">
            <div className="mb-1"><span className="text-muted">Order #</span> <span className="fw-semibold">{order.id}</span></div>
            <div className="mb-1"><span className="text-muted">Customer</span> <span className="fw-semibold">{order.customer}</span></div>
            <div className="mb-1"><span className="text-muted">Date</span> <span className="fw-semibold">{order.date}</span></div>
            <div className="mb-2"><span className="text-muted">Status</span> <span className={`badge bg-${order.status === 'Pronto' ? 'success' : order.status === 'In Attesa' ? 'warning text-dark' : order.status === 'Annullato' ? 'danger' : order.status === 'Ritirato' ? 'primary' : 'secondary'}`}>{order.status}</span></div>
            <div className='border-bottom mb-2 pb-1 text-uppercase small text-muted' style={{ letterSpacing: "0.05em" }}>Items</div>
            {(order.items || []).map((item, idx) => (
              <div className='cart-item border-0' key={idx}>
                <div>
                  <div className='fw-semibold'>{item.name}</div>
                  <div className='text-muted small' style={{ display: "inline-flex", alignItems: "center", width: "max-content" }}>{item.price.toFixed(2)} € <span style={{ color: "#bbb", margin: "0 2px" }}>×</span> <span style={{ fontWeight: 600, color: "#e65100" }}>{item.qty}</span></div>
                </div>
                <div></div>
                <div className='fw-semibold text-end'>{(item.price * item.qty).toFixed(2)} €</div>
              </div>
            ))}
          </div>
          <div className="cart-footer">
            <div className="d-flex justify-content-between fs-5 mb-3">
              <span>Total</span>
              <span className="fw-bold">{order.total.toFixed(2)} €</span>
            </div>
            <div className="d-grid gap-2">
              <button className="btn btn-primary" onClick={() => { setShowConfirmModal(true); setCode(""); setError(""); }} type="button"><i className="bi bi-credit-card me-2"></i>Conferma ritiro</button>
              <button className="btn btn-danger" onClick={() => { setShowCancelModal(true); setCode(""); setError(""); }} type="button"><i className="bi bi-x-circle me-2"></i>Annulla ordine</button>
              <button className="btn btn-outline-danger mt-2" onClick={onClose}><i className="bi bi-trash me-2"></i>Svuota</button>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center text-muted mt-5">Nessun ordine selezionato.</div>
      )}

      {/* Conferma Ritiro Modal */}
      {showConfirmModal && (
        <ModalPortal>
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(44,44,44,0.45)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{
              background: '#fff',
              borderRadius: 14,
              boxShadow: '0 8px 32px rgba(44,44,44,0.22)',
              maxWidth: 420,
              width: '100%',
              padding: 0,
              overflow: 'hidden',
            }}>
              <div className="modal-header" style={{ padding: '1rem 1.5rem', background: '#fafbff', borderBottom: '1px solid #f0f0f0' }}>
                <h5 className="modal-title" style={{ fontWeight: 600 }}>Conferma Ritiro Ordine</h5>
                <button type="button" className="btn-close" style={{ fontSize: '1.25rem', opacity: 0.7 }} onClick={() => setShowConfirmModal(false)}></button>
              </div>
              <div className="modal-body" style={{ padding: '1.5rem 1.5rem 1rem 1.5rem' }}>
                <p>Per confermare il ritiro, inserisci il codice di 4 cifre:</p>
                <input type="text" maxLength={4} pattern="\\d{4}" className="form-control text-center fs-4" placeholder="0000" autoFocus value={code} onChange={e => setCode(e.target.value)} inputMode="numeric" />
                {error && <div className="invalid-feedback d-block text-center mt-2">{error}</div>}
              </div>
              <div className="modal-footer" style={{ background: '#fafbff', padding: '1rem 1.5rem', display: 'flex', gap: '.5rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowConfirmModal(false)}>Chiudi</button>
                <button type="button" className="btn btn-primary" onClick={handleConfirm}>Conferma</button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Annulla Ordine Modal */}
      {showCancelModal && (
        <ModalPortal>
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(44,44,44,0.45)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{
              background: '#fff',
              borderRadius: 14,
              boxShadow: '0 8px 32px rgba(44,44,44,0.22)',
              maxWidth: 420,
              width: '100%',
              padding: 0,
              overflow: 'hidden',
            }}>
              <div className="modal-header" style={{ padding: '1rem 1.5rem', background: '#fafbff', borderBottom: '1px solid #f0f0f0' }}>
                <h5 className="modal-title" style={{ fontWeight: 600 }}>Conferma Annullamento Ordine</h5>
                <button type="button" className="btn-close" style={{ fontSize: '1.25rem', opacity: 0.7 }} onClick={() => setShowCancelModal(false)}></button>
              </div>
              <div className="modal-body" style={{ padding: '1.5rem 1.5rem 1rem 1.5rem' }}>
                <p>Per annullare l'ordine, inserisci il codice di 4 cifre:</p>
                <input type="text" maxLength={4} pattern="\\d{4}" className="form-control text-center fs-4" placeholder="0000" autoFocus value={code} onChange={e => setCode(e.target.value)} inputMode="numeric" />
                {error && <div className="invalid-feedback d-block text-center mt-2">{error}</div>}
              </div>
              <div className="modal-footer" style={{ background: '#fafbff', padding: '1rem 1.5rem', display: 'flex', gap: '.5rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCancelModal(false)}>Chiudi</button>
                <button type="button" className="btn btn-danger" onClick={handleCancel}>Conferma</button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Success Modals */}
      {successModal === "ritiro" && (
        <ModalPortal>
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(44,44,44,0.45)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{
              background: '#fff',
              borderRadius: 14,
              boxShadow: '0 8px 32px rgba(44,44,44,0.22)',
              maxWidth: 420,
              width: '100%',
              padding: 0,
              overflow: 'hidden',
            }}>
              <div className="modal-header" style={{ padding: '1rem 1.5rem', background: '#fafbff', borderBottom: '1px solid #f0f0f0' }}>
                <h5 className="modal-title" style={{ fontWeight: 600 }}>Ritiro Confermato</h5>
                <button type="button" className="btn-close" style={{ fontSize: '1.25rem', opacity: 0.7 }} onClick={closeSuccess}></button>
              </div>
              <div className="modal-body text-center" style={{ padding: '1.5rem 1.5rem 1rem 1.5rem' }}>
                <i className="bi bi-check-circle text-success" style={{ fontSize: "3rem" }}></i>
                <p className="mt-3 mb-0">Il ritiro dell'ordine è stato confermato con successo.</p>
              </div>
              <div className="modal-footer" style={{ background: '#fafbff', padding: '1rem 1.5rem', display: 'flex', gap: '.5rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={closeSuccess}>Chiudi</button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
      {successModal === "annullato" && (
        <ModalPortal>
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(44,44,44,0.45)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{
              background: '#fff',
              borderRadius: 14,
              boxShadow: '0 8px 32px rgba(44,44,44,0.22)',
              maxWidth: 420,
              width: '100%',
              padding: 0,
              overflow: 'hidden',
            }}>
              <div className="modal-header" style={{ padding: '1rem 1.5rem', background: '#fafbff', borderBottom: '1px solid #f0f0f0' }}>
                <h5 className="modal-title" style={{ fontWeight: 600 }}>Ordine Annullato</h5>
                <button type="button" className="btn-close" style={{ fontSize: '1.25rem', opacity: 0.7 }} onClick={closeSuccess}></button>
              </div>
              <div className="modal-body text-center" style={{ padding: '1.5rem 1.5rem 1rem 1.5rem' }}>
                <i className="bi bi-x-circle text-danger" style={{ fontSize: "3rem" }}></i>
                <p className="mt-3 mb-0">L'ordine è stato annullato con successo.</p>
              </div>
              <div className="modal-footer" style={{ background: '#fafbff', padding: '1rem 1.5rem', display: 'flex', gap: '.5rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={closeSuccess}>Chiudi</button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </aside>
  );
}
