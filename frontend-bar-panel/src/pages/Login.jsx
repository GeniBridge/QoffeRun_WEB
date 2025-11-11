import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

export default function Login({ onLogin }) {
  const { login, forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Inserisci email e password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await login(email, password);
      if (onLogin) onLogin();
    } catch (error) {
      console.error('Login failed:', error);
      setError(error.message || 'Credenziali non valide');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleForgotPassword(e) {
    e.preventDefault();
    
    if (!email) {
      setError('Inserisci la tua email per il reset password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await forgotPassword(email);
      setError(''); // Clear any previous errors
      alert('Email di reset password inviata! Controlla la tua casella di posta.');
      setShowForgotPassword(false);
    } catch (error) {
      console.error('Forgot password failed:', error);
      setError(error.message || 'Errore nell\'invio della email di reset');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="p-4 bg-white rounded-4 border shadow-sm" style={{minWidth:340, maxWidth:380}}>
        <div className="text-center mb-4">
          <img src={logo} alt="QoffeRun logo" style={{height:49, width:34, objectFit:'contain'}} />
          <div className="fw-bold fs-3 mt-2 mb-1" style={{color:'#f58220'}}>QoffeRun</div>
          <div className="text-muted mb-2">Accedi al tuo account</div>
        </div>
        {!showForgotPassword ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input 
                type="email" 
                className="form-control" 
                value={email} 
                onChange={e=>setEmail(e.target.value)} 
                autoFocus 
                disabled={isLoading}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input 
                type="password" 
                className="form-control" 
                value={password} 
                onChange={e=>setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            {error && <div className="alert alert-danger py-1 small mb-2">{error}</div>}
            <button 
              className="btn w-100 mb-2" 
              style={{background:'#f58220',color:'#fff'}} 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Accesso in corso...' : 'Accedi'}
            </button>
            <button 
              type="button"
              className="btn btn-link w-100 p-0 small text-decoration-none"
              onClick={() => setShowForgotPassword(true)}
              disabled={isLoading}
            >
              Password dimenticata?
            </button>
          </form>
        ) : (
          <form onSubmit={handleForgotPassword}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input 
                type="email" 
                className="form-control" 
                value={email} 
                onChange={e=>setEmail(e.target.value)} 
                autoFocus
                disabled={isLoading}
                placeholder="Inserisci la tua email"
              />
            </div>
            {error && <div className="alert alert-danger py-1 small mb-2">{error}</div>}
            <button 
              className="btn w-100 mb-2" 
              style={{background:'#f58220',color:'#fff'}} 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Invio in corso...' : 'Invia Reset Password'}
            </button>
            <button 
              type="button"
              className="btn btn-link w-100 p-0 small text-decoration-none"
              onClick={() => {setShowForgotPassword(false); setError('');}}
              disabled={isLoading}
            >
              Torna al Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
