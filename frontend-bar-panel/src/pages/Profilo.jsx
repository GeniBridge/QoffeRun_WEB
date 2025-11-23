import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import authService from '../services/authService';

const Profilo = () => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Profile form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  // Password change form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setSaving(true);
      const response = await authService.apiRequest('/me/update', {
        method: 'PUT',
        body: JSON.stringify({
          name,
          email,
          phone
        })
      });

      // Update user in context
      if (response.user) {
        authService.setUser(response.user);
        setUser(response.user);
      }

      setSuccess('Profilo aggiornato con successo!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Errore nell\'aggiornamento del profilo: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!currentPassword) {
      setError('Inserisci la password corrente');
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setError('La nuova password deve essere di almeno 8 caratteri');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Le password non corrispondono');
      return;
    }

    try {
      setSaving(true);
      await authService.apiRequest('/me/change-password', {
        method: 'POST',
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          new_password_confirmation: confirmPassword
        })
      });

      setSuccess('Password cambiata con successo!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Errore nel cambio password: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="page-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="bi bi-person-circle me-2"></i>
          Il Mio Profilo
        </h2>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess('')}>
          <i className="bi bi-check-circle me-2"></i>
          {success}
        </Alert>
      )}

      <div className="row">
        <div className="col-md-6">
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">
                <i className="bi bi-person-badge me-2"></i>
                Informazioni Personali
              </h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleProfileUpdate}>
                <Form.Group className="mb-3">
                  <Form.Label>Nome Completo</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Il tuo nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={saving}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="La tua email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={saving}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Telefono</Form.Label>
                  <Form.Control
                    type="tel"
                    placeholder="Il tuo numero di telefono"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={saving}
                  />
                </Form.Group>

                <Button type="submit" variant="primary" disabled={saving}>
                  {saving ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Salvataggio...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-save me-2"></i>
                      Salva Modifiche
                    </>
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>

          {user && (
            <Card>
              <Card.Header>
                <h5 className="mb-0">
                  <i className="bi bi-info-circle me-2"></i>
                  Informazioni Account
                </h5>
              </Card.Header>
              <Card.Body>
                <p className="mb-2">
                  <strong>Ruolo:</strong>{' '}
                  <span className="badge bg-primary">
                    {user.role === 'barista' ? 'Barista' : 
                     user.role === 'chain_owner' ? 'Proprietario Catena' :
                     user.role === 'branch_manager' ? 'Manager Filiale' :
                     user.role === 'staff' ? 'Staff' : 
                     user.role || 'N/A'}
                  </span>
                </p>
                <p className="mb-2">
                  <strong>Account creato il:</strong>{' '}
                  {user.created_at ? new Date(user.created_at).toLocaleDateString('it-IT') : 'N/A'}
                </p>
              </Card.Body>
            </Card>
          )}
        </div>

        <div className="col-md-6">
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <i className="bi bi-shield-lock me-2"></i>
                Cambia Password
              </h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handlePasswordChange}>
                <Form.Group className="mb-3">
                  <Form.Label>Password Corrente</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Inserisci la password corrente"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    disabled={saving}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Nuova Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Almeno 8 caratteri"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={saving}
                  />
                  <Form.Text className="text-muted">
                    La password deve essere di almeno 8 caratteri
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Conferma Nuova Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Conferma la nuova password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={saving}
                    isInvalid={confirmPassword && newPassword !== confirmPassword}
                    isValid={confirmPassword && newPassword === confirmPassword && confirmPassword.length >= 8}
                  />
                  <Form.Control.Feedback type="invalid">
                    Le password non corrispondono
                  </Form.Control.Feedback>
                  <Form.Control.Feedback type="valid">
                    Le password corrispondono
                  </Form.Control.Feedback>
                </Form.Group>

                <Button 
                  type="submit" 
                  variant="warning" 
                  disabled={saving || !currentPassword || !newPassword || newPassword !== confirmPassword}
                >
                  {saving ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Aggiornamento...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-key me-2"></i>
                      Cambia Password
                    </>
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Profilo;
