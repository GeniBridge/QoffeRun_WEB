import React, { useState, useEffect } from 'react';
import { Modal, Button, Badge, Spinner } from 'react-bootstrap';
import PinModal from './PinModal';
import settingsService from '../services/settingsService';
import { useBranch } from '../context/BranchContext';

const OrderDetailModal = ({ order, show, onHide, onStatusUpdate, loading = false }) => {
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [pinRequired, setPinRequired] = useState(false);
  const [pinError, setPinError] = useState('');
  const [pinValue, setPinValue] = useState('');
  const { selectedBranch } = useBranch();

  useEffect(() => {
    if (selectedBranch) {
      checkPinRequired();
    }
  }, [selectedBranch]);

  const checkPinRequired = async () => {
    try {
      const settings = await settingsService.getBranchSettings(selectedBranch.id);
      const pinSetting = (settings || []).find(s => s.key === 'status_change_pin');
      const value = pinSetting?.value || '';
      setPinRequired(!!value);
      setPinValue(value);
    } catch (err) {
      setPinRequired(false);
      setPinValue('');
    }
  };

  if (!order) return null;

  const statusBadge = (status) => {
    const map = {
      'pending': 'bg-warning text-dark',
      'confirmed': 'bg-info text-white',
      'ready': 'bg-success text-white',
      'completed': 'bg-primary text-white',
      'cancelled': 'bg-danger text-white'
    };
    const labels = {
      'pending': 'In Attesa',
      'confirmed': 'Confermato',
      'ready': 'Pronto',
      'completed': 'Completato',
      'cancelled': 'Annullato'
    };
    return (
      <Badge className={map[status] || 'bg-secondary'}>
        {labels[status] || status}
      </Badge>
    );
  };

  const paymentStatusBadge = (paymentStatus) => {
    const map = {
      'pending': 'bg-warning text-dark',
      'paid': 'bg-success text-white',
      'failed': 'bg-danger text-white',
      'refunded': 'bg-secondary text-white'
    };
    const labels = {
      'pending': 'In Attesa',
      'paid': 'Pagato',
      'failed': 'Fallito',
      'refunded': 'Rimborsato'
    };
    return (
      <Badge className={map[paymentStatus] || 'bg-secondary'}>
        {labels[paymentStatus] || paymentStatus}
      </Badge>
    );
  };

  // Determine next status based on current status
  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case 'pending': return 'confirmed';
      case 'confirmed': return 'ready';
      case 'ready': return 'completed';
      default: return null;
    }
  };

  const getNextStatusLabel = (currentStatus) => {
    const nextStatus = getNextStatus(currentStatus);
    const labels = {
      'confirmed': 'Conferma Ordine',
      'ready': 'Segna come Pronto',
      'completed': 'Completa Ordine'
    };
    return labels[nextStatus];
  };

  const handleStatusUpdate = async (newStatus) => {
    if (pinRequired) {
      // Show PIN modal
      setPendingStatus(newStatus);
      setShowPinModal(true);
      setPinError('');
    } else {
      // No PIN required, proceed directly
      await executeStatusUpdate(newStatus);
    }
  };

  const handlePinConfirm = async (pin) => {
    setUpdatingStatus(true);
    setPinError('');
    
    try {
      if (!pinValue || pin !== String(pinValue)) {
        throw new Error('Invalid PIN');
      }
      // PIN correct, proceed with status update
      await executeStatusUpdate(pendingStatus);
      
      // Close PIN modal
      setShowPinModal(false);
      setPendingStatus(null);
    } catch (error) {
      setPinError('PIN non corretto. Riprova.');
      setUpdatingStatus(false);
    }
  };

  const executeStatusUpdate = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      await onStatusUpdate(order.id, newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const nextStatus = getNextStatus(order.status);
  const nextStatusLabel = getNextStatusLabel(order.status);
  const canUpdateStatus = nextStatus && ['pending', 'confirmed', 'ready'].includes(order.status);

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          Ordine #{order.order_number || order.id}
          <small className="text-muted ms-2">
            Codice: <strong>{order.code_4digit}</strong>
          </small>
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Caricamento...</span>
            </Spinner>
          </div>
        ) : (
          <>
            {/* Order Status and Info */}
            <div className="row mb-4">
              <div className="col-md-6">
                <div className="card h-100">
                  <div className="card-body">
                    <h6 className="card-title">
                      <i className="bi bi-info-circle me-2"></i>
                      Informazioni Ordine
                    </h6>
                    <div className="mb-2">
                      <strong>Cliente:</strong> {order.customer_name || 'N/A'}
                    </div>
                    <div className="mb-2">
                      <strong>Email:</strong> {order.customer_email || 'N/A'}
                    </div>
                    <div className="mb-2">
                      <strong>Telefono:</strong> {order.customer_phone || 'N/A'}
                    </div>
                    <div className="mb-2">
                      <strong>Data:</strong> {new Date(order.created_at).toLocaleDateString('it-IT')} alle {new Date(order.created_at).toLocaleTimeString('it-IT', {hour: '2-digit', minute: '2-digit'})}
                    </div>
                    <div className="mb-2">
                      <strong>Tipo:</strong> {order.order_type === 'takeaway' ? 'Asporto' : order.order_type}
                    </div>
                    {order.notes && (
                      <div className="mb-2">
                        <strong>Note:</strong> {order.notes}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="card h-100">
                  <div className="card-body">
                    <h6 className="card-title">
                      <i className="bi bi-receipt me-2"></i>
                      Stato e Pagamento
                    </h6>
                    <div className="mb-2">
                      <strong>Stato Ordine:</strong> {statusBadge(order.status)}
                    </div>
                    <div className="mb-2">
                      <strong>Pagamento:</strong> {paymentStatusBadge(order.payment_status)}
                    </div>
                    <div className="mb-2">
                      <strong>Totale:</strong> <span className="fw-bold text-success">€{parseFloat(order.total_amount || order.total || 0).toFixed(2)}</span>
                    </div>
                    <div className="mb-2">
                      <strong>Commissione QoffeRun:</strong> €{parseFloat(order.commission_amount || 0).toFixed(2)}
                    </div>
                    <div className="mb-2">
                      <strong>Incasso Filiale:</strong> €{parseFloat(order.branch_amount || 0).toFixed(2)}
                    </div>
                    {order.commission_status && (
                      <div className="mb-2">
                        <strong>Commissione:</strong> 
                        <Badge className={order.commission_status === 'transferred' ? 'bg-success ms-1' : 'bg-warning text-dark ms-1'}>
                          {order.commission_status === 'transferred' ? 'Trasferita' : 'In Attesa'}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            {order.items && order.items.length > 0 && (
              <div className="card mb-4">
                <div className="card-body">
                  <h6 className="card-title">
                    <i className="bi bi-basket me-2"></i>
                    Articoli Ordinati
                  </h6>
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Articolo</th>
                          <th className="text-center">Quantità</th>
                          <th className="text-end">Prezzo</th>
                          <th className="text-end">Totale</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map((item, index) => (
                          <tr key={index}>
                            <td>
                              <div className="fw-semibold">{item.menu_item?.name || item.name}</div>
                              {item.menu_item?.description && (
                                <small className="text-muted d-block">{item.menu_item.description}</small>
                              )}
                              {item.customizations && Object.keys(item.customizations).length > 0 && (
                                <div className="mt-1">
                                  {Object.entries(item.customizations).map(([key, value]) => (
                                    <small key={key} className="badge bg-light text-dark me-1">
                                      {key}: {value}
                                    </small>
                                  ))}
                                </div>
                              )}
                              {item.special_instructions && (
                                <small className="text-muted fst-italic d-block mt-1">
                                  <i className="bi bi-chat-left-text me-1"></i>
                                  {item.special_instructions}
                                </small>
                              )}
                            </td>
                            <td className="text-center">{item.quantity}</td>
                            <td className="text-end">€{parseFloat(item.price_at_time || item.price || 0).toFixed(2)}</td>
                            <td className="text-end fw-semibold">
                              €{(parseFloat(item.price_at_time || item.price || 0) * item.quantity).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Information (if completed) */}
            {order.status === 'completed' && order.payment_status === 'paid' && (
              <div className="card">
                <div className="card-body">
                  <h6 className="card-title">
                    <i className="bi bi-credit-card me-2"></i>
                    Informazioni Pagamento
                  </h6>
                  {order.payment_confirmed_at && (
                    <div className="mb-2">
                      <strong>Pagamento Confermato:</strong> {new Date(order.payment_confirmed_at).toLocaleDateString('it-IT')} alle {new Date(order.payment_confirmed_at).toLocaleTimeString('it-IT', {hour: '2-digit', minute: '2-digit'})}
                    </div>
                  )}
                  {order.commission_transferred_at && (
                    <div className="mb-2">
                      <strong>Commissione Trasferita:</strong> {new Date(order.commission_transferred_at).toLocaleDateString('it-IT')} alle {new Date(order.commission_transferred_at).toLocaleTimeString('it-IT', {hour: '2-digit', minute: '2-digit'})}
                    </div>
                  )}
                  {order.stripe_payment_intent_id && (
                    <div className="mb-2">
                      <strong>ID Pagamento Stripe:</strong> 
                      <code className="ms-1">{order.stripe_payment_intent_id}</code>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Chiudi
        </Button>
        
        {canUpdateStatus && (
          <Button 
            variant={nextStatus === 'completed' ? 'success' : 'primary'} 
            onClick={() => handleStatusUpdate(nextStatus)}
            disabled={updatingStatus}
          >
            {updatingStatus ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Aggiornando...
              </>
            ) : (
              <>
                <i className={`bi ${nextStatus === 'completed' ? 'bi-check-circle' : 'bi-arrow-right'} me-2`}></i>
                {nextStatusLabel}
              </>
            )}
          </Button>
        )}
        
        {order.status === 'pending' && (
          <Button 
            variant="outline-danger" 
            onClick={() => handleStatusUpdate('cancelled')}
            disabled={updatingStatus}
          >
            <i className="bi bi-x-circle me-2"></i>
            Annulla Ordine
          </Button>
        )}
      </Modal.Footer>

      {/* PIN Verification Modal */}
      <PinModal
        show={showPinModal}
        onHide={() => {
          setShowPinModal(false);
          setPendingStatus(null);
          setPinError('');
          setUpdatingStatus(false);
        }}
        onConfirm={handlePinConfirm}
        title="Conferma Cambio Stato"
        loading={updatingStatus}
      />
      
      {pinError && (
        <div className="position-fixed bottom-0 start-50 translate-middle-x mb-3">
          <div className="alert alert-danger" role="alert">
            {pinError}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default OrderDetailModal;