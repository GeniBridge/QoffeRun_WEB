import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!password || !passwordConfirmation) {
      setError('Inserisci entrambe le password');
      return;
    }

    if (password !== passwordConfirmation) {
      setError('Le password non corrispondono');
      return;
    }

    if (password.length < 6) {
      setError('La password deve essere di almeno 6 caratteri');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await resetPassword(token, password, passwordConfirmation);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('Reset password failed:', error);
      setError(error.message || 'Errore nel reset della password');
    } finally {
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
        <div className="p-4 bg-white rounded-4 border shadow-sm text-center" style={{minWidth:340, maxWidth:380}}>
          <div className="text-center mb-4">
            <img src={logo} alt="QoffeRun logo" style={{height:49, width:34, objectFit:'contain'}} />
            <div className="fw-bold fs-3 mt-2 mb-1" style={{color:'#f58220'}}>QoffeRun</div>
          </div>
          <div className="alert alert-success">
            <i className="bi bi-check-circle me-2"></i>
            Password aggiornata con successo!
          </div>
          <p className="text-muted">
            Verrai reindirizzato alla pagina di login tra pochi secondi...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="p-4 bg-white rounded-4 border shadow-sm" style={{minWidth:340, maxWidth:380}}>
        <div className="text-center mb-4">
          <img src={logo} alt="QoffeRun logo" style={{height:49, width:34, objectFit:'contain'}} />
          <div className="fw-bold fs-3 mt-2 mb-1" style={{color:'#f58220'}}>QoffeRun</div>
          <div className="text-muted mb-2">Imposta nuova password</div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Nuova Password</label>
            <input 
              type="password" 
              className="form-control" 
              value={password} 
              onChange={e=>setPassword(e.target.value)} 
              autoFocus
              disabled={isLoading}
              minLength="6"
              placeholder="Minimo 6 caratteri"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Conferma Password</label>
            <input 
              type="password" 
              className="form-control" 
              value={passwordConfirmation} 
              onChange={e=>setPasswordConfirmation(e.target.value)}
              disabled={isLoading}
              minLength="6"
              placeholder="Ripeti la password"
            />
          </div>
          {error && <div className="alert alert-danger py-1 small mb-2">{error}</div>}
          <button 
            className="btn w-100 mb-2" 
            style={{background:'#f58220',color:'#fff'}} 
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Aggiornamento...' : 'Aggiorna Password'}
          </button>
          <button 
            type="button"
            className="btn btn-link w-100 p-0 small text-decoration-none"
            onClick={() => navigate('/login')}
            disabled={isLoading}
          >
            Torna al Login
          </button>
        </form>
      </div>
    </div>
  );
}