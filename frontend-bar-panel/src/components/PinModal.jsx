import React, { useState, useRef, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import '../styles/PinModal.css';

const PinModal = ({ show, onHide, onConfirm, title = "Inserisci PIN", loading = false }) => {
  const [pin, setPin] = useState(['', '', '', '']);
  const inputRefs = [useRef(), useRef(), useRef(), useRef()];

  useEffect(() => {
    if (show) {
      // Focus first input when modal opens
      setTimeout(() => inputRefs[0]?.current?.focus(), 100);
    } else {
      // Clear PIN when modal closes
      setPin(['', '', '', '']);
    }
  }, [show]);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value.slice(-1); // Take only last character
    setPin(newPin);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs[index + 1]?.current?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs[index - 1]?.current?.focus();
    }

    // Handle Enter
    if (e.key === 'Enter' && pin.every(digit => digit !== '')) {
      handleSubmit();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 4);
    if (/^\d+$/.test(pastedData)) {
      const newPin = pastedData.split('');
      while (newPin.length < 4) newPin.push('');
      setPin(newPin);
      inputRefs[Math.min(pastedData.length, 3)]?.current?.focus();
    }
  };

  const handleSubmit = () => {
    const pinValue = pin.join('');
    if (pinValue.length === 4) {
      onConfirm(pinValue);
    }
  };

  const isComplete = pin.every(digit => digit !== '');

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-shield-lock me-2"></i>
          {title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="text-center mb-4">
          <p className="text-muted">Inserisci il PIN a 4 cifre per confermare l'azione</p>
        </div>
        <div className="pin-input-container">
          {pin.map((digit, index) => (
            <input
              key={index}
              ref={inputRefs[index]}
              type="text"
              inputMode="numeric"
              maxLength="1"
              className="pin-input"
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              disabled={loading}
            />
          ))}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={loading}>
          Annulla
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit} 
          disabled={!isComplete || loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Verifica...
            </>
          ) : (
            <>
              <i className="bi bi-check-circle me-2"></i>
              Conferma
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PinModal;
