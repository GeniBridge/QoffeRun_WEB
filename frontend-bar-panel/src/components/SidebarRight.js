import { useState } from "react";
import { Modal, Button } from "react-bootstrap";

export default function SidebarRight({ selectedOrder, handleConfirmPickup }) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  if (!selectedOrder) {
    return (
      <div className="sidebar-right d-flex align-items-center justify-content-center text-muted">
        <p>Nessun ordine selezionato</p>
      </div>
    );
  }

  // Apri modal
  const handleConfirmClick = () => setShowConfirmModal(true);

  // Conferma ritiro → chiudi modal + rimuove ordine
  const handleConfirm = () => {
    handleConfirmPickup(selectedOrder.id);
    setShowConfirmModal(false);
  };

  return (
    <div className="sidebar-right">
      <div>
        <h5 className="mb-3">Ordine #{selectedOrder.id}</h5>
        <p>Cliente: {selectedOrder.customer}</p>
        <ul className="list-group mb-3">
          {selectedOrder.items.map((item, i) => (
            <li
              key={i}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              {item.name} x{item.qty}
              <span>€{(item.qty * item.price).toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <div className="d-flex justify-content-between mb-3">
          <strong>Totale</strong>
          <strong>€{selectedOrder.total.toFixed(2)}</strong>
        </div>
        <button className="btn btn-success w-100 mb-2" onClick={handleConfirmClick}>
          Conferma ritiro
        </button>
        <button
          className="btn btn-outline-danger w-100"
          onClick={() => handleConfirmPickup(selectedOrder.id)}
        >
          Annulla
        </button>
      </div>

      {/* Modal unico: conferma ritiro */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Conferma ritiro</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Sei sicuro di voler confermare il ritiro?</p>
          <p><strong>Ordine #{selectedOrder.id}</strong></p>
          <p><strong>Totale: €{selectedOrder.total.toFixed(2)}</strong></p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Chiudi
          </Button>
          <Button variant="success" onClick={handleConfirm}>
            Ritirato
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
