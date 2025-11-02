import { useState } from "react";
import { 
  IonCard, 
  IonCardContent, 
  IonCardHeader, 
  IonCardTitle,
  IonButton,
  IonBadge,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonText,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons
} from '@ionic/react';
import { 
  receipt, 
  person, 
  basket, 
  calculator, 
  checkmarkCircle, 
  print, 
  close,
  time,
  call
} from 'ionicons/icons';

export default function SidebarRight({ selectedOrder, handleConfirmPickup }) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  if (!selectedOrder) {
    return (
      <div className="sidebar-right">
        <div className="sidebar-section" style={{ textAlign: "center" }}>
          <IonIcon icon={receipt} size="large" color="medium" />
          <IonText>
            <h2>Seleziona un Ordine</h2>
            <p>Clicca su un ordine dalla lista per visualizzare i dettagli e gestire lo stato.</p>
          </IonText>
        </div>
      </div>
    );
  }

  // Apri modal
  const handleConfirmClick = () => setShowConfirmModal(true);

  // Conferma ritiro → chiudi modal + rimuove ordine
  const handleConfirm = () => {
    handleConfirmPickup(selectedOrder.id);
    setShowConfirmModal(false);
  };

  const getStatusBadge = (status = "In Attesa") => {
    const statusMap = {
      "In Attesa": { color: "warning", text: "In Attesa" },
      "Pronto": { color: "success", text: "Pronto" },
      "Ritirato": { color: "primary", text: "Ritirato" },
      "Annullato": { color: "danger", text: "Annullato" }
    };
    
    const statusInfo = statusMap[status] || statusMap["In Attesa"];
    
    return (
      <IonBadge color={statusInfo.color}>
        {statusInfo.text}
      </IonBadge>
    );
  };


  return (
    <div className="sidebar-right">
      {/* Order Header */}
      <div className="sidebar-section" style={{ borderBottom: '1px solid #ececec', marginBottom: 18, paddingBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <IonIcon icon={receipt} style={{ color: '#ff6b35', fontSize: 22 }} />
              <span style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.01em' }}>Ordine #{selectedOrder.id}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', color: '#888', fontSize: 13 }}>
              <IonIcon icon={time} />
              <span style={{ marginLeft: 6 }}>
                {new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
          <div>{getStatusBadge(selectedOrder.status)}</div>
        </div>
      </div>

      {/* Customer Info */}
      <div className="sidebar-section" style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <IonIcon icon={person} style={{ color: '#ff6b35', fontSize: 20 }} />
          <span style={{ fontWeight: 600, fontSize: 15 }}>Cliente</span>
        </div>
        <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 4 }}>{selectedOrder.customer}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#888', fontSize: 14 }}>
          <IonIcon icon={call} />
          <span>+39 123 456 7890</span>
        </div>
      </div>

      {/* Order Items */}
      <div className="sidebar-section" style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <IonIcon icon={basket} style={{ color: '#ff6b35', fontSize: 20 }} />
          <span style={{ fontWeight: 600, fontSize: 15 }}>Prodotti Ordinati</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 2 }}>
          {selectedOrder.items.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#faf7f3', borderRadius: 8, padding: '8px 12px', marginTop: i === 0 ? 0 : undefined }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{item.name}</div>
                <div style={{ color: '#888', fontSize: 13 }}>Quantità: {item.qty} • Prezzo: €{item.price.toFixed(2)}</div>
              </div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>€{(item.qty * item.price).toFixed(2)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="sidebar-section" style={{ marginBottom: 18, background: '#fff7f0', borderRadius: 12, border: '1px solid #ffe0c2', padding: '18px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <IonIcon icon={calculator} style={{ color: '#ff6b35', fontSize: 20 }} />
          <span style={{ fontWeight: 600, fontSize: 15 }}>Riepilogo</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
            <span>Subtotale</span>
            <span>€{selectedOrder.total.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
            <span>Tasse</span>
            <span>€0.00</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16, marginTop: 6 }}>
            <span>Totale</span>
            <span>€{selectedOrder.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="sidebar-section" style={{ marginBottom: 0, paddingBottom: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <IonButton 
            expand="block"
            color="success"
            size="large"
            onClick={handleConfirmClick}
            disabled={selectedOrder.status === "Ritirato"}
            style={{ fontWeight: 600, fontSize: 15 }}
          >
            <IonIcon icon={checkmarkCircle} slot="start" />
            {selectedOrder.status === "Ritirato" ? "Già Ritirato" : "Conferma Ritiro"}
          </IonButton>
          <IonButton expand="block" fill="outline" color="medium" style={{ fontWeight: 600, fontSize: 15 }}>
            <IonIcon icon={print} slot="start" />
            Stampa Ricevuta
          </IonButton>
          <IonButton expand="block" fill="outline" color="danger" style={{ fontWeight: 600, fontSize: 15 }}>
            <IonIcon icon={close} slot="start" />
            Annulla Ordine
          </IonButton>
        </div>
      </div>

      {/* Confirmation Modal */}
      <IonModal isOpen={showConfirmModal} onDidDismiss={() => setShowConfirmModal(false)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Conferma Ritiro Ordine</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setShowConfirmModal(false)}>
                <IonIcon icon={close} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <div className="ion-text-center">
            <IonIcon icon={checkmarkCircle} size="large" color="success" />
            <IonText>
              <h2>Confermare il ritiro?</h2>
              <p>
                L'ordine #{selectedOrder.id} di <strong>{selectedOrder.customer}</strong> 
                verrà contrassegnato come ritirato.
              </p>
            </IonText>
            <div style={{ marginTop: '24px', display: 'grid', gap: '12px' }}>
              <IonButton 
                expand="block" 
                color="success" 
                onClick={handleConfirm}
              >
                <IonIcon icon={checkmarkCircle} slot="start" />
                Conferma Ritiro
              </IonButton>
              <IonButton 
                expand="block" 
                fill="outline" 
                onClick={() => setShowConfirmModal(false)}
              >
                Annulla
              </IonButton>
            </div>
          </div>
        </IonContent>
      </IonModal>
    </div>
  );
}
