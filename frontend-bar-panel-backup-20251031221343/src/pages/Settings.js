// src/pages/Settings.jsx
import FieldStatusInput from "../components/FieldStatusInput";
import { useState } from "react";

const Settings = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  return (
    <div className="pos-main">
      <div style={{ width: '100%', maxWidth: 400 }}>
  {/* <h3>Impostazioni</h3> */}
        <p>Configura il sistema POS.</p>
        <FieldStatusInput
          label="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Enter username..."
          valid={username.length > 2}
          invalid={username.length > 0 && username.length <= 2}
        />
        <FieldStatusInput
          label="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Enter email..."
          valid={email.includes("@") && email.includes(".")}
          invalid={email.length > 0 && (!email.includes("@") || !email.includes("."))}
        />
        <div className="form-check mb-3">
          <input type="checkbox" className="form-check-input" id="tax" defaultChecked />
          <label className="form-check-label" htmlFor="tax">Applica IVA</label>
        </div>
        <div className="form-check">
          <input type="checkbox" className="form-check-input" id="sound" />
          <label className="form-check-label" htmlFor="sound">Notifiche sonore</label>
        </div>
      </div>
    </div>
  );
};

export default Settings;