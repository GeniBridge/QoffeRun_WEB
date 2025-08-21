// src/pages/Orders.jsx
import { useState } from "react";
import { Modal, Button } from "react-bootstrap";

const Orders = () => {
  const [orders, setOrders] = useState([
    {
      id: 1023,
      customer: "Mario Rossi",
      date: "2025-08-20 10:15",
      items: [
        { name: "Cappuccino", qty: 2, price: 4.5 },
        { name: "Espresso", qty: 3, price: 3 },
      ],
      total: 23.5,
      status: "Ritirato",
    },
    {
      id: 1024,
      customer: "Luigi Bianchi",
      date: "2025-08-20 11:00",
      items: [
        { name: "Latte", qty: 1, price: 5 },
        { name: "Mocha", qty: 1, price: 5.5 },
      ],
      total: 10.5,
      status: "Annullato",
    },
  ]);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
    setShowModal(false);
  };

  return (
    <div>
      <h3>Ordini</h3>
      <p>Gestisci gli ordini completati e annullati.</p>

      <div className="table-responsive">
        <table className="table table-bordered">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Cliente</th>
              <th>Data e ora</th>
              <th>Totale</th>
              <th>Stato</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="cursor-pointer"
                onClick={() => handleOpenModal(order)}
              >
                <td>#{order.id}</td>
                <td>{order.customer}</td>
                <td>{order.date}</td>
                <td>€{order.total.toFixed(2)}</td>
                <td>
                  <span
                    className={`badge ${
                      order.status === "Ritirato"
                        ? "bg-success"
                        : order.status === "Annullato"
                        ? "bg-danger"
                        : "bg-warning"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal dettagli ordine */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Dettagli Ordine #{selectedOrder?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              <p><strong>Cliente:</strong> {selectedOrder.customer}</p>
              <p><strong>Data e ora:</strong> {selectedOrder.date}</p>
              <p><strong>Totale:</strong> €{selectedOrder.total.toFixed(2)}</p>
              <p><strong>Prodotti:</strong></p>
              <ul>
                {selectedOrder.items.map((item, i) => (
                  <li key={i}>
                    {item.name} x{item.qty} - €{(item.qty * item.price).toFixed(2)}
                  </li>
                ))}
              </ul>
              <p>
                <strong>Stato:</strong>{" "}
                <span
                  className={`badge ${
                    selectedOrder.status === "Ritirato"
                      ? "bg-success"
                      : selectedOrder.status === "Annullato"
                      ? "bg-danger"
                      : "bg-warning"
                  }`}
                >
                  {selectedOrder.status}
                </span>
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Chiudi
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Orders;
