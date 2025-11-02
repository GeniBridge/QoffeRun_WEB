import React from "react";
import { Route, Switch, NavLink, useLocation } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import CartSidebar from "./components/CartSidebar";
import Products from "./pages/Products";
import Storico from "./pages/Storico";
import Impostazione from "./pages/Impostazione";
import Pagamenti from "./pages/Pagamenti";
import QrCode from "./pages/QrCode";
import AppHeader from "./components/AppHeader";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import { ORDERS } from "./pages/Dashboard";

function AppContent() {
  const [orders, setOrders] = React.useState(ORDERS);
  const [selectedOrder, setSelectedOrder] = React.useState(null);
  const location = useLocation();

  // Select order by id and keep reference in state
  const handleOrderSelect = (order) => {
    setSelectedOrder(order);
  };

  // Update order status in the orders list and sidebar, with code validation
  const updateOrderStatus = (orderId, status, code) => {
    // Only allow if code is valid 4 digits (CartSidebar already checks, but double check)
    if (!/^\d{4}$/.test(code)) return;
    setOrders((prevOrders) => prevOrders.map(o => o.id === orderId ? { ...o, status } : o));
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status });
    }
  };

  // Only show right sidebar on dashboard
  const isDashboard = location.pathname === "/";

  return (
    <>
      {/* Minimal fixed header always present */}
      <AppHeader fullWidth={false} />
      <div className={`app${isDashboard ? ' dashboard' : ' no-cart'}`}>
        {/* Always show left sidebar */}
        <aside className="sidebar p-3">
          <div className="d-flex align-items-center gap-2 mb-3">
            <img src="https://dummyimage.com/40x40/ff9800/ffffff&text=Q" className="rounded" alt="logo" width="40" height="40"/>
            <div>
              <div className="fw-semibold">QoffeRun POS</div>
              <div className="small text-muted">Premium POS</div>
            </div>
          </div>
          <nav className="nav flex-column gap-1" id="sideNav">
            <div className="text-uppercase text-muted small mt-2 mb-1">Navigazione</div>
            <NavLink className="nav-link" exact to="/">
              <i className="bi bi-house me-2"></i>Dashboard
            </NavLink>
            <NavLink className="nav-link" to="/storico">
              <i className="bi bi-clock-history me-2"></i>Storico
            </NavLink>
            <NavLink className="nav-link" to="/prodotti">
              <i className="bi bi-box-seam me-2"></i>Prodotti
            </NavLink>
            <NavLink className="nav-link" to="/pagamenti">
              <i className="bi bi-credit-card me-2"></i>Pagamenti
            </NavLink>
            <NavLink className="nav-link" to="/qrcode">
              <i className="bi bi-qr-code me-2"></i>QR Code
            </NavLink>
            <NavLink className="nav-link" to="/impostazione">
              <i className="bi bi-gear me-2"></i>Impostazione
            </NavLink>
          </nav>
        </aside>
        {/* Main content area, always visible below header */}
        <main className={`content${isDashboard ? ' dashboard-content' : ''}`}>
          <Switch>
            <Route exact path="/">
              <Dashboard onOrderSelect={handleOrderSelect} selectedOrder={selectedOrder} orders={orders} />
            </Route>
            <Route path="/prodotti" component={Products} />
            <Route path="/storico" component={Storico} />
            <Route path="/impostazione" component={Impostazione} />
            <Route path="/pagamenti" component={Pagamenti} />
            <Route path="/qrcode" component={QrCode} />
          </Switch>
        </main>
        {/* Only show right sidebar (cart/order details) on dashboard */}
        {isDashboard && (
          <CartSidebar
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onConfirmPickup={(code) => {
              if (!selectedOrder) return;
              updateOrderStatus(selectedOrder.id, "Ritirato", code);
            }}
            onCancelOrder={(code) => {
              if (!selectedOrder) return;
              updateOrderStatus(selectedOrder.id, "Annullato", code);
            }}
          />
        )}
      </div>
    </>
  );
}


function App() {
  return <AppContent />;
}

export default App;
