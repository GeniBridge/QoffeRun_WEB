// src/pages/Settings.jsx
const Settings = () => {
  return (
    <div>
      <h3>Impostazioni</h3>
      <p>Configura il sistema POS.</p>
      <div className="form-check mb-3">
        <input type="checkbox" className="form-check-input" id="tax" defaultChecked />
        <label className="form-check-label" htmlFor="tax">Applica IVA</label>
      </div>
      <div className="form-check">
        <input type="checkbox" className="form-check-input" id="sound" />
        <label className="form-check-label" htmlFor="sound">Notifiche sonore</label>
      </div>
    </div>
  );
};

export default Settings;