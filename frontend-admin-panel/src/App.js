import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <div className="min-vh-100 bg-secondary text-white d-flex align-items-center">
      <div className="container text-center">
        <h1 className="mb-4">🏛️ Admin Panel</h1>
        <p>Area riservata all'amministratore del sistema.</p>
        <button className="btn btn-warning">Gestisci Bar</button>
      </div>
    </div>
  );
}

export default App;