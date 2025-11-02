import { useState } from "react";
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonAvatar,
  IonImg,
  IonLabel,
  IonTextarea
} from "@ionic/react";
import FieldStatusInput from "../components/FieldStatusInput";

const Profile = () => {
  const [barData, setBarData] = useState({
    name: "Caffetteria Roma",
    address: {
      street: "Via Roma",
      number: "123",
      city: "Roma",
      province: "RM",
      region: "Lazio",
      postalCode: "00100",
    },
    description: "Bar storico nel centro di Roma.",
    hours: {
      weekdays: { open: "07:00", close: "20:00" },
      weekend: { open: "08:00", close: "18:00" },
    },
    photo: null,
    logo: null,
  });

  const daysOfWeek = [
    { key: 'monday', label: 'Lunedì' },
    { key: 'tuesday', label: 'Martedì' },
    { key: 'wednesday', label: 'Mercoledì' },
    { key: 'thursday', label: 'Giovedì' },
    { key: 'friday', label: 'Venerdì' },
    { key: 'saturday', label: 'Sabato' },
    { key: 'sunday', label: 'Domenica' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes("address.")) {
      const key = name.split(".")[1];
      setBarData((prev) => ({
        ...prev,
        address: { ...prev.address, [key]: value },
      }));
    } else if (name.includes("hours.")) {
      const [dayType, field] = name.split(".").slice(1);
      setBarData((prev) => ({
        ...prev,
        hours: {
          ...prev.hours,
          [dayType]: { ...prev.hours[dayType], [field]: value },
        },
      }));
    } else {
      setBarData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files.length > 0) {
      setBarData((prev) => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Profilo aggiornato ✅");
  };

  return (
    <div className="pos-main" style={{ background: 'linear-gradient(135deg, #f6f7fb 60%, #e9ecef 100%)', minHeight: '100vh', padding: '40px 0' }}>
      <IonCard
        style={{
          width: '100%',
          maxWidth: '100%',
          margin: '0',
          borderRadius: 24,
          boxShadow: '0 6px 32px rgba(0,0,0,0.09)',
          padding: '0',
        }}
        className="profile-main-card"
      >
        {/* <IonCardHeader style={{ textAlign: 'center', paddingTop: 28, paddingBottom: 10, background: 'var(--bg-tertiary)', borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Profilo Bar</h2>
        </IonCardHeader> */}
        <IonCardContent style={{ padding: 32 }}>
          <form onSubmit={handleSubmit} autoComplete="off">
            <IonGrid style={{ padding: 0 }}>
              <IonRow>
                <IonCol size="6">
                  <label style={{ fontWeight: 500, marginBottom: 6 }}>Logo</label>
                  <input type="file" accept="image/*" name="logo" onChange={handleFileChange} style={{ marginBottom: 18 }} />
                </IonCol>
                <IonCol size="6">
                  <label style={{ fontWeight: 500, marginBottom: 6 }}>Cover</label>
                  <input type="file" accept="image/*" name="photo" onChange={handleFileChange} style={{ marginBottom: 18 }} />
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol size="6">
                  <FieldStatusInput
                    label="Nome Bar"
                    value={barData.name}
                    onChange={e => handleChange({ target: { name: 'name', value: e.target.value } })}
                    placeholder="Inserisci nome bar..."
                    valid={!!barData.name}
                    invalid={!barData.name}
                  />
                </IonCol>
                <IonCol size="6">
                  <FieldStatusInput
                    label="Descrizione"
                    value={barData.description}
                    onChange={e => handleChange({ target: { name: 'description', value: e.target.value } })}
                    placeholder="Inserisci descrizione..."
                    valid={!!barData.description}
                    invalid={!barData.description}
                  />
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol size="6">
                  <FieldStatusInput
                    label="Via"
                    value={barData.address.street}
                    onChange={e => handleChange({ target: { name: 'address.street', value: e.target.value } })}
                    placeholder="Inserisci via..."
                    valid={!!barData.address.street}
                    invalid={!barData.address.street}
                  />
                </IonCol>
                <IonCol size="6">
                  <FieldStatusInput
                    label="Numero"
                    value={barData.address.number}
                    onChange={e => handleChange({ target: { name: 'address.number', value: e.target.value } })}
                    placeholder="Inserisci numero..."
                    valid={!!barData.address.number}
                    invalid={!barData.address.number}
                  />
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol size="6">
                  <FieldStatusInput
                    label="Città"
                    value={barData.address.city}
                    onChange={e => handleChange({ target: { name: 'address.city', value: e.target.value } })}
                    placeholder="Inserisci città..."
                    valid={!!barData.address.city}
                    invalid={!barData.address.city}
                  />
                </IonCol>
                <IonCol size="6">
                  <FieldStatusInput
                    label="Provincia"
                    value={barData.address.province}
                    onChange={e => handleChange({ target: { name: 'address.province', value: e.target.value } })}
                    placeholder="Inserisci provincia..."
                    valid={!!barData.address.province}
                    invalid={!barData.address.province}
                  />
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol size="6">
                  <FieldStatusInput
                    label="Regione"
                    value={barData.address.region}
                    onChange={e => handleChange({ target: { name: 'address.region', value: e.target.value } })}
                    placeholder="Inserisci regione..."
                    valid={!!barData.address.region}
                    invalid={!barData.address.region}
                  />
                </IonCol>
                <IonCol size="6">
                  <FieldStatusInput
                    label="CAP"
                    value={barData.address.postalCode}
                    onChange={e => handleChange({ target: { name: 'address.postalCode', value: e.target.value } })}
                    placeholder="Inserisci CAP..."
                    valid={!!barData.address.postalCode}
                    invalid={!barData.address.postalCode}
                  />
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol size="12">
                  <h4 style={{ fontWeight: 700, fontSize: 20, margin: '24px 0 12px 0', color: '#222' }}>Orari apertura e chiusura</h4>
                </IonCol>
              </IonRow>
              <IonRow>
                {daysOfWeek.map(day => (
                  <IonCol size="6" key={day.key} style={{ marginBottom: 18 }}>
                    <FieldStatusInput
                      label={`${day.label} apertura`}
                      type="time"
                      value={barData.hours?.[day.key]?.open || ''}
                      onChange={e => handleChange({ target: { name: `hours.${day.key}.open`, value: e.target.value } })}
                      valid={!!barData.hours?.[day.key]?.open}
                      invalid={!barData.hours?.[day.key]?.open}
                    />
                    <FieldStatusInput
                      label={`${day.label} chiusura`}
                      type="time"
                      value={barData.hours?.[day.key]?.close || ''}
                      onChange={e => handleChange({ target: { name: `hours.${day.key}.close`, value: e.target.value } })}
                      valid={!!barData.hours?.[day.key]?.close}
                      invalid={!barData.hours?.[day.key]?.close}
                    />
                  </IonCol>
                ))}
              </IonRow>
            </IonGrid>
            <IonButton type="submit" expand="block" color="primary" style={{ fontWeight: 700, fontSize: 18, borderRadius: 14, marginTop: 8, height: 48 }}>
              Salva Profilo
            </IonButton>
          </form>
        </IonCardContent>
      </IonCard>
    </div>
  );
};

export default Profile;
