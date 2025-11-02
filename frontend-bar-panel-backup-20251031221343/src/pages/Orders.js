// src/pages/Orders.jsx
import { useState } from "react";
import {
  IonModal,
  IonButton,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol
} from "@ionic/react";
import { close } from "ionicons/icons";

const Orders = () => {
  const [orders] = useState([
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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ORDERS_PER_PAGE = 8;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tutti");

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === "Tutti" || order.status === statusFilter;
    const matchesSearch =
      order.customer.toLowerCase().includes(search.toLowerCase()) ||
      order.id.toString().includes(search);
    return matchesStatus && matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE
  );

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
    <div className="pos-main">
      <IonCard style={{ width: '100%', maxWidth: 900, boxShadow: '0 4px 24px rgba(0,0,0,0.07)', borderRadius: 20, marginTop: 40 }}>
        <IonCardHeader style={{ background: 'var(--bg-tertiary)', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 36, paddingBottom: 16 }}>
          {/* <IonCardTitle style={{ textAlign: 'center', fontSize: 28, fontWeight: 700, color: 'var(--primary-color)', letterSpacing: '-0.02em', margin: 0, padding: 0 }}>Ordini</IonCardTitle> */}
          {/* <p style={{ textAlign: 'center', color: 'var(--text-secondary)', margin: 0, marginTop: 4, fontSize: 16 }}>Gestisci gli ordini completati e annullati.</p> */}
        </IonCardHeader>
        <IonCardContent style={{ padding: 0 }}>
          <div style={{ display: 'flex', gap: 12, margin: '32px 0 16px 0', width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Cerca per cliente o #ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #ececec', minWidth: 220, fontSize: 15, background: '#fafbfc' }}
            />
            <button
              className={`btn btn-outline-secondary${statusFilter === "Tutti" ? " active" : ""}`}
              style={{ borderRadius: 10, padding: '10px 18px', border: '1px solid #ececec', background: statusFilter === "Tutti" ? '#ffefe6' : '#fff', color: statusFilter === "Tutti" ? '#ff6b35' : '#222', cursor: 'pointer', fontWeight: 600, fontSize: 15 }}
              onClick={() => setStatusFilter("Tutti")}
            >Tutti</button>
            <button
              className={`btn btn-outline-success${statusFilter === "Ritirato" ? " active" : ""}`}
              style={{ borderRadius: 10, padding: '10px 18px', border: '1px solid #ececec', background: statusFilter === "Ritirato" ? '#e6ffed' : '#fff', color: statusFilter === "Ritirato" ? '#4caf50' : '#222', cursor: 'pointer', fontWeight: 600, fontSize: 15 }}
              onClick={() => setStatusFilter("Ritirato")}
            >Ritirato</button>
            <button
              className={`btn btn-outline-danger${statusFilter === "Annullato" ? " active" : ""}`}
              style={{ borderRadius: 10, padding: '10px 18px', border: '1px solid #ececec', background: statusFilter === "Annullato" ? '#ffe6e6' : '#fff', color: statusFilter === "Annullato" ? '#f44336' : '#222', cursor: 'pointer', fontWeight: 600, fontSize: 15 }}
              onClick={() => setStatusFilter("Annullato")}
            >Annullato</button>
          </div>
          <IonGrid style={{ width: '100%', minWidth: 600, margin: 0, padding: 0 }}>
            <IonRow style={{ fontWeight: 700, fontSize: 16, background: '#f8f9fa', borderBottom: '2px solid #ececec', position: 'sticky', top: 0, zIndex: 2 }}>
              <IonCol size="1" style={{ padding: '12px 6px' }}>#</IonCol>
              <IonCol size="3" style={{ padding: '12px 6px' }}>Cliente</IonCol>
              <IonCol size="3" style={{ padding: '12px 6px' }}>Data e ora</IonCol>
              <IonCol size="2" style={{ padding: '12px 6px' }}>Totale</IonCol>
              <IonCol size="3" style={{ padding: '12px 6px' }}>Stato</IonCol>
            </IonRow>
            {paginatedOrders.length === 0 ? (
              <IonRow>
                <IonCol size="12" style={{ textAlign: 'center', color: '#aaa', padding: 24 }}>
                  Nessun ordine trovato.
                </IonCol>
              </IonRow>
            ) : (
              paginatedOrders.map((order, idx) => (
                <IonRow
                  key={order.id}
                  className="cursor-pointer"
                  style={{ cursor: 'pointer', background: idx % 2 === 0 ? '#fff' : '#fafbfc', borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}
                  onClick={() => handleOpenModal(order)}
                >
                  <IonCol size="1" style={{ padding: '12px 6px', fontWeight: 600, color: '#888' }}>#{order.id}</IonCol>
                  <IonCol size="3" style={{ padding: '12px 6px', fontWeight: 500 }}>{order.customer}</IonCol>
                  <IonCol size="3" style={{ padding: '12px 6px', color: '#666' }}>{order.date}</IonCol>
                  <IonCol size="2" style={{ padding: '12px 6px', fontWeight: 700, color: 'var(--primary-color)' }}>€{order.total.toFixed(2)}</IonCol>
                  <IonCol size="3" style={{ padding: '12px 6px' }}>
                    <span
                      className={`badge ${
                        order.status === "Ritirato"
                          ? "bg-success"
                          : order.status === "Annullato"
                          ? "bg-danger"
                          : "bg-warning"
                      }`}
                      style={{ fontSize: 14, padding: '6px 16px', borderRadius: 12, fontWeight: 600, letterSpacing: 0.5 }}
                    >
                      {order.status}
                    </span>
                  </IonCol>
                </IonRow>
              ))
            )}
          </IonGrid>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '24px 0 8px 0', gap: 8 }}>
              <IonButton
                size="small"
                fill="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                style={{ minWidth: 36 }}
              >
                &lt;
              </IonButton>
              {[...Array(totalPages)].map((_, i) => (
                <IonButton
                  key={i}
                  size="small"
                  fill={currentPage === i + 1 ? 'solid' : 'clear'}
                  color={currentPage === i + 1 ? 'primary' : 'medium'}
                  onClick={() => setCurrentPage(i + 1)}
                  style={{ minWidth: 36 }}
                >
                  {i + 1}
                </IonButton>
              ))}
              <IonButton
                size="small"
                fill="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                style={{ minWidth: 36 }}
              >
                &gt;
              </IonButton>
            </div>
          )}
        </IonCardContent>
      </IonCard>

      <IonModal isOpen={showModal} onDidDismiss={handleCloseModal}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Dettagli Ordine #{selectedOrder?.id}</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={handleCloseModal}>
                <IonIcon icon={close} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent className="ion-padding">
          {selectedOrder && (
            <div>
              <p>
                <strong>Cliente:</strong> {selectedOrder.customer}
              </p>
              <p>
                <strong>Data e ora:</strong> {selectedOrder.date}
              </p>
              <p>
                <strong>Totale:</strong> €{selectedOrder.total.toFixed(2)}
              </p>
              <p>
                <strong>Prodotti:</strong>
              </p>
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

              <div style={{ marginTop: "24px" }}>
                <IonButton expand="block" fill="outline" onClick={handleCloseModal}>
                  Chiudi
                </IonButton>
              </div>
            </div>
          )}
        </IonContent>
      </IonModal>
    </div>
  );
};

export default Orders;
