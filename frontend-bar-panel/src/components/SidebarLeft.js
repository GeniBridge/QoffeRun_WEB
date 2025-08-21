// src/components/SidebarLeft.js
import { NavLink } from "react-router-dom";

export default function SidebarLeft() {
  return (
    <div className="sidebar-left d-flex flex-column p-3">
      <h4 className="text-danger mb-4">QoffeRun</h4>
      <ul className="nav nav-pills flex-column mb-auto">
        <li className="nav-item">
          <NavLink to="/" className="nav-link">
            📊 Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/menu" className="nav-link">
            🍽 Menù
          </NavLink>
        </li>
        <li>
          <NavLink to="/orders" className="nav-link">
            🧾 Ordini
          </NavLink>
        </li>
        <li>
          <NavLink to="/qrcode" className="nav-link">
            🔳 QR Code
          </NavLink>
        </li>
        <li>
          <NavLink to="/profile" className="nav-link">
            🏪 Profilo
          </NavLink>
        </li>
        <li>
          <NavLink to="/settings" className="nav-link">
            ⚙ Impostazioni
          </NavLink>
        </li>
      </ul>
    </div>
  );
}
