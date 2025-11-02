import React, { useState } from 'react';
import logo from '../assets/logo.png';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    // Dummy auth logic
    if (!email || !password) {
      setError('Inserisci email e password');
      return;
    }
    setError('');
    // TODO: real auth logic
  if (onLogin) onLogin();
  }

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="p-4 bg-white rounded-4 border shadow-sm" style={{minWidth:340, maxWidth:380}}>
        <div className="text-center mb-4">
          <img src={logo} alt="QoffeRun logo" style={{height:49, width:34, objectFit:'contain'}} />
          <div className="fw-bold fs-3 mt-2 mb-1" style={{color:'#f58220'}}>QoffeRun</div>
          <div className="text-muted mb-2">Accedi al tuo account</div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" value={email} onChange={e=>setEmail(e.target.value)} autoFocus />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" value={password} onChange={e=>setPassword(e.target.value)} />
          </div>
          {error && <div className="alert alert-danger py-1 small mb-2">{error}</div>}
          <button className="btn w-100" style={{background:'#f58220',color:'#fff'}} type="submit">Accedi</button>
        </form>
      </div>
    </div>
  );
}
