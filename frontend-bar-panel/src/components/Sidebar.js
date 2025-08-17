import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <div>
      <h5 className="mb-4 text-blue fw-bold">QoffeRun</h5>
      <div className="nav-links">
        <NavLink to="/" className="nav-item">Dashboard</NavLink>
        <NavLink to="/categories" className="nav-item">Categorie</NavLink>
        <NavLink to="/products" className="nav-item">Prodotti</NavLink>
        <NavLink to="/orders" className="nav-item">Ordini</NavLink>
        <NavLink to="/settings" className="nav-item">Impostazioni</NavLink>
        <NavLink to="/staff" className="nav-item">Staff</NavLink>
      </div>
    </div>
  );
}
