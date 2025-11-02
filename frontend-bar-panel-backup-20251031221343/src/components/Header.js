import React, { useState, useEffect } from 'react';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonButton, 
  IonIcon,
  IonBadge,
  IonMenuButton
} from '@ionic/react';
import { 
  cafe, 
  notifications, 
  settings, 
  person,
  time
} from 'ionicons/icons';

export default function Header() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('it-IT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <IonHeader className="pos-header">
      <IonToolbar>
        <div className="header-content">
          <div className="logo">
            <IonMenuButton menu="main-menu" />
            <IonIcon icon={cafe} />
            <IonTitle>QoffeRun POS</IonTitle>
          </div>
          
          <div className="header-center">
            <div className="store-info">
              <div className="store-name">Bar Centrale</div>
              <IonBadge color="success">
                Online
              </IonBadge>
            </div>
          </div>

          <div className="user-info">
            <div className="datetime">
              <IonIcon icon={time} />
              <div className="time-info">
                <div className="time">{formatTime(currentTime)}</div>
                <div className="date">{formatDate(currentTime)}</div>
              </div>
            </div>
            
            <div className="user-profile">
              <div className="user-avatar">
                <IonIcon icon={person} />
              </div>
              <div className="user-details">
                <div className="user-name">Mario Rossi</div>
                <div className="user-role">Barista</div>
              </div>
            </div>
            
            <div className="quick-actions">
              <IonButton fill="outline" size="default">
                <IonIcon icon={notifications} />
              </IonButton>
              <IonButton fill="outline" size="default">
                <IonIcon icon={settings} />
              </IonButton>
            </div>
          </div>
        </div>
      </IonToolbar>
    </IonHeader>
  );
}