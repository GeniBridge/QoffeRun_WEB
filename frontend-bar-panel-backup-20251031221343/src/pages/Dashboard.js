import React, { useState } from "react";

// Demo orders data (move to context or props for real app)
export const ORDERS = [
  {
    id: 1001,
    date: '2025-10-26 10:21',
    customer: 'Mario Rossi',
    total: 17.38,
    status: 'Pronto',
    items: [
      { name: 'Caffè', qty: 2, price: 1.20 },
      { name: 'Cornetto', qty: 1, price: 1.50 },
      { name: 'Cappuccino', qty: 1, price: 1.80 }
    ]
  },
  {
    id: 1002,
    date: '2025-10-26 12:05',
    customer: 'Anna Bianchi',
    total: 9.70,
    status: 'In Attesa',
    items: [
      { name: 'Caffè', qty: 1, price: 1.20 },
      { name: 'Cornetto', qty: 2, price: 1.50 },
      { name: "Succo d'arancia", qty: 1, price: 2.50 }
    ]
  },
  {
    id: 1003,
    date: '2025-10-27 09:13',
    customer: 'John Doe',
    total: 23.49,
    status: 'Pronto',
    items: [
      { name: 'Cappuccino', qty: 2, price: 1.80 },
      { name: 'Cornetto', qty: 2, price: 1.50 },
      { name: 'Panino', qty: 1, price: 3.50 }
    ]
  },
  {
    id: 1004,
    date: '2025-10-27 11:00',
    customer: 'Giulia Verdi',
    total: 8.50,
    status: 'In Attesa',
    items: [
      { name: 'Tè', qty: 1, price: 1.50 },
      { name: 'Brioche', qty: 2, price: 2.00 },
      { name: 'Succo di mela', qty: 1, price: 3.00 }
    ]
  },
  {
    id: 1005,
    date: '2025-10-27 12:30',
    customer: 'Luca Neri',
    total: 15.00,
    status: 'Pronto',
    items: [
      { name: 'Caffè', qty: 3, price: 1.20 },
      { name: 'Panino', qty: 2, price: 3.50 },
      { name: 'Acqua', qty: 2, price: 1.30 }
    ]
  },
  {
    id: 1006,
    date: '2025-10-27 13:15',
    customer: 'Sara Blu',
    total: 12.80,
    status: 'Ritirato',
    items: [
      { name: 'Cappuccino', qty: 1, price: 1.80 },
      { name: 'Cornetto', qty: 3, price: 1.50 },
      { name: 'Torta', qty: 1, price: 6.50 }
    ]
  },
  {
    id: 1007,
    date: '2025-10-27 14:00',
    customer: 'Paolo Rosa',
    total: 7.20,
    status: 'Annullato',
    items: [
      { name: 'Caffè', qty: 2, price: 1.20 },
      { name: 'Biscotti', qty: 2, price: 2.40 }
    ]
  },
  {
    id: 1008,
    date: '2025-10-27 15:45',
    customer: 'Elena Gialli',
    total: 10.00,
    status: 'Pronto',
    items: [
      { name: 'Caffè', qty: 2, price: 1.20 },
      { name: 'Cornetto', qty: 2, price: 1.50 },
      { name: 'Latte', qty: 2, price: 2.30 }
    ]
  },
  {
    id: 1009,
    date: '2025-10-27 16:10',
    customer: 'Marco Viola',
    total: 6.80,
    status: 'In Attesa',
    items: [
      { name: 'Caffè', qty: 1, price: 1.20 },
      { name: 'Tè', qty: 2, price: 1.50 },
      { name: 'Brioche', qty: 1, price: 2.60 }
    ]
  },
  {
    id: 1010,
    date: '2025-10-27 17:00',
    customer: 'Francesca Marrone',
    total: 14.20,
    status: 'Ritirato',
    items: [
      { name: 'Cappuccino', qty: 2, price: 1.80 },
      { name: 'Panino', qty: 2, price: 3.50 },
      { name: 'Acqua', qty: 2, price: 1.30 }
    ]
  },
  {
    id: 1011,
    date: '2025-10-27 17:30',
    customer: 'Simone Celeste',
    total: 11.50,
    status: 'Pronto',
    items: [
      { name: 'Caffè', qty: 2, price: 1.20 },
      { name: 'Cornetto', qty: 2, price: 1.50 },
      { name: 'Torta', qty: 1, price: 6.10 }
    ]
  },
  {
    id: 1012,
    date: '2025-10-27 18:00',
    customer: 'Alessia Argento',
    total: 9.90,
    status: 'In Attesa',
    items: [
      { name: 'Caffè', qty: 1, price: 1.20 },
      { name: 'Cornetto', qty: 2, price: 1.50 },
      { name: 'Latte', qty: 2, price: 2.35 }
    ]
  },
  {
    id: 1013,
    date: '2025-10-27 18:30',
    customer: 'Davide Nero',
    total: 13.40,
    status: 'Annullato',
    items: [
      { name: 'Cappuccino', qty: 2, price: 1.80 },
      { name: 'Cornetto', qty: 2, price: 1.50 },
      { name: 'Panino', qty: 2, price: 3.80 }
    ]
  },
  {
    id: 1014,
    date: '2025-10-27 19:00',
    customer: 'Martina Turchese',
    total: 8.60,
    status: 'Pronto',
    items: [
      { name: 'Caffè', qty: 2, price: 1.20 },
      { name: 'Cornetto', qty: 2, price: 1.50 },
      { name: 'Brioche', qty: 1, price: 2.20 }
    ]
  }
];

function getOrderStatusBadge(status) {
  const map = {
    'Pronto': 'success',
    'In Attesa': 'warning',
    'Annullato': 'danger',
    'Ritirato': 'primary'
  };
  return <span className={`badge bg-${map[status] || 'secondary'}`}>{status}</span>;
}

export default function Dashboard({ onOrderSelect, selectedOrder, orders }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const statusOptions = [
    { value: '', label: 'Tutti' },
    { value: 'Pronto', label: 'Pronto' },
    { value: 'In Attesa', label: 'In Attesa' },
  ];

  // Only show Pronto or In Attesa
  const filteredOrders = orders.filter(
    (order) =>
      (["Pronto", "In Attesa"].includes(order.status)) &&
      (order.id.toString().includes(search.toLowerCase()) ||
      order.customer.toLowerCase().includes(search.toLowerCase())) &&
      (status === "" || order.status === status)
  );

  return (
    <div className="dashboard-root" style={{ height: '100vh', paddingTop: 72, paddingLeft: 0, paddingRight: 0, margin: 0, background: 'transparent' }}>
      <div className="row mb-3 align-items-center" style={{ maxWidth: "100%", padding: '0 1.5rem', paddingTop: '1.5rem' }}>
        <div className="d-flex flex-wrap align-items-center gap-3" style={{ width: "100%" }}>
          <div className="input-group" style={{ minWidth: 320, maxWidth: 420, flex: "1 1 320px" }}>
            <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
            <input className="form-control" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca ordine o cliente..." autoComplete="off" style={{ minWidth: 180 }} />
          </div>
          <select className="form-select" style={{ minWidth: 160, maxWidth: 220, flex: "0 0 180px" }} value={status} onChange={e => setStatus(e.target.value)}>
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="dashboard-orders-area" style={{ height: 'calc(100vh - 140px)', overflowY: 'auto', padding: '0 1.5rem' }}>
        <div className="row g-3" style={{ minHeight: '100%', margin: 0 }}>
          {filteredOrders.length === 0 ? (
            <div className="col-12 text-center text-muted">Nessun ordine trovato.</div>
          ) : (
            filteredOrders.map(order => {
              const isSelected = selectedOrder && selectedOrder.id === order.id;
              // Only apply h-100 if more than one order is shown
              const cardClass = `card shadow-sm border-0 order-card-selectable${filteredOrders.length > 1 ? ' h-100' : ''}${isSelected ? " selected" : ""}`;
              return (
                <div className="col-12 col-md-6 col-lg-4" key={order.id}>
                  <div
                    className={cardClass}
                    style={{
                      cursor: "pointer",
                      transition: 'border 0.2s, box-shadow 0.2s',
                    }}
                    onClick={() => onOrderSelect(order)}
                  >
                    <div className="card-body d-flex flex-column gap-2">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <div className="fw-semibold">Ordine #{order.id}</div>
                        {getOrderStatusBadge(order.status)}
                      </div>
                      <div className="text-muted small">{order.date}</div>
                      <div className="fw-bold fs-5">{order.customer}</div>
                      <div className="text-end fw-bold" style={{ color: "#e65100" }}>€{order.total.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
