import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import SidebarLeft from "./components/SidebarLeft";

import Dashboard from "./pages/Dashboard";
import Menu from "./pages/Menu";
import Orders from "./pages/Orders";
import QRCode from "./pages/QRCode";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import SidebarRight from "./components/SidebarRight";

import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

function App() {
  const [orders, setOrders] = useState([
    {
      id: 1023,
      customer: "Mario Rossi",
      items: [
        { name: "Cappuccino", qty: 2, price: 4.5 },
        { name: "Latte", qty: 1, price: 5 },
      ],
      total: 14,
    },
    {
      id: 1024,
      customer: "Luigi Bianchi",
      items: [
        { name: "Espresso", qty: 3, price: 3 },
        { name: "Mocha", qty: 1, price: 5.5 },
      ],
      total: 14.5,
    },
  ]);

  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleConfirmPickup = (orderId) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    setSelectedOrder(null);
  };

  return (
    <div className="App d-flex">
      <SidebarLeft />
      <div className="content flex-grow-1">
        <Routes>
          <Route
            path="/"
            element={
              <div className="d-flex">
                <Dashboard
                  orders={orders}
                  selectedOrder={selectedOrder}
                  setSelectedOrder={setSelectedOrder}
                />
                <SidebarRight
                  selectedOrder={selectedOrder}
                  handleConfirmPickup={handleConfirmPickup}
                />
              </div>
            }
          />
          <Route path="/menu" element={<Menu />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/qrcode" element={<QRCode />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
