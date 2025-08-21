import { useState } from "react";

export default function Dashboard({ orders, selectedOrder, setSelectedOrder }) {
  const [search, setSearch] = useState("");

  // Filtra gli ordini in base alla ricerca
  const filteredOrders = orders.filter((order) => {
    const searchLower = search.toLowerCase();
    return (
      order.id.toString().includes(searchLower) ||
      order.customer.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="p-3">
      <h3 className="mb-4">Ultimi ordini in attesa ritiro</h3>

      {/* Barra di ricerca */}
      <div className="mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Cerca per numero ordine o cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="row g-3">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <div key={order.id} className="col-md-4">
              <div
                className={`card p-3 cursor-pointer ${
                  selectedOrder && selectedOrder.id === order.id
                    ? "border border-success border-3"
                    : ""
                }`}
                onClick={() => setSelectedOrder(order)}
                style={{ cursor: "pointer" }}
              >
                <h5>Ordine #{order.id}</h5>
                <p>Cliente: {order.customer}</p>
                <p>Totale: €{order.total.toFixed(2)}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted">Nessun ordine trovato.</p>
        )}
      </div>
    </div>
  );
}
