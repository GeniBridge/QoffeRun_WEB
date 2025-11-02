// src/components/SidebarLeft.js
import { useLocation, useHistory } from "react-router-dom";
import { IonIcon } from '@ionic/react';
import { speedometer, receipt, grid, storefront, qrCode, settings } from 'ionicons/icons';

const navItems = [
  { icon: speedometer, route: "/", title: "Dashboard" },
  { icon: receipt, route: "/orders", title: "Storico Ordini" },
  { icon: grid, route: "/menu", title: "Menù Prodotti" },
  { icon: storefront, route: "/profile", title: "Profilo Bar" },
  { icon: qrCode, route: "/qrcode", title: "QR Code" },
  { icon: settings, route: "/settings", title: "Impostazioni" },
];

export default function SidebarLeft() {
  const location = useLocation();
  const history = useHistory();
  return (
    <div className="sidebar-left">
      {navItems.map((item) => (
        <div
          key={item.route}
          className={
            "sidebar-icon" + (location.pathname === item.route ? " active" : "")
          }
          title={item.title}
          onClick={() => history.push(item.route)}
        >
          <IonIcon icon={item.icon} />
        </div>
      ))}
    </div>
  );
}
