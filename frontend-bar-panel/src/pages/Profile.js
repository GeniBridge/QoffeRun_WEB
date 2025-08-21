import { useState } from "react";

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
    console.log("Dati salvati:", barData);
    alert("Profilo aggiornato ✅");
  };

  return (
    <div>
      <h3>Profilo Negozio</h3>
      <form onSubmit={handleSubmit}>
        {/* Nome Bar */}
        <div className="mb-3">
          <label>Nome Bar</label>
          <input
            type="text"
            className="form-control"
            name="name"
            value={barData.name}
            onChange={handleChange}
          />
        </div>

        {/* Indirizzo completo */}
        <h5>Indirizzo</h5>
        <div className="row">
          <div className="col-md-4 mb-3">
            <label>Via</label>
            <input
              type="text"
              className="form-control"
              name="address.street"
              value={barData.address.street}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-2 mb-3">
            <label>Numero</label>
            <input
              type="text"
              className="form-control"
              name="address.number"
              value={barData.address.number}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-3 mb-3">
            <label>Città</label>
            <input
              type="text"
              className="form-control"
              name="address.city"
              value={barData.address.city}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-2 mb-3">
            <label>Provincia</label>
            <input
              type="text"
              className="form-control"
              name="address.province"
              value={barData.address.province}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-3 mb-3">
            <label>Regione</label>
            <input
              type="text"
              className="form-control"
              name="address.region"
              value={barData.address.region}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-2 mb-3">
            <label>CAP</label>
            <input
              type="text"
              className="form-control"
              name="address.postalCode"
              value={barData.address.postalCode}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Orari apertura/chiusura */}
        <h5>Orari apertura</h5>
        <div className="row mb-3">
          <div className="col-md-3">
            <label>Lun-Ven apertura</label>
            <input
              type="time"
              className="form-control"
              name="hours.weekdays.open"
              value={barData.hours.weekdays.open}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-3">
            <label>Lun-Ven chiusura</label>
            <input
              type="time"
              className="form-control"
              name="hours.weekdays.close"
              value={barData.hours.weekdays.close}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-3">
            <label>Sab-Dom apertura</label>
            <input
              type="time"
              className="form-control"
              name="hours.weekend.open"
              value={barData.hours.weekend.open}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-3">
            <label>Sab-Dom chiusura</label>
            <input
              type="time"
              className="form-control"
              name="hours.weekend.close"
              value={barData.hours.weekend.close}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Foto Bar */}
        <div className="mb-3">
          <label>Foto Bar</label>
          <input
            type="file"
            className="form-control"
            name="photo"
            onChange={handleFileChange}
            accept="image/*"
          />
          {barData.photo && (
            <img
              src={URL.createObjectURL(barData.photo)}
              alt="Foto Bar"
              className="mt-2"
              style={{ maxWidth: "200px" }}
            />
          )}
        </div>

        {/* Logo Bar */}
        <div className="mb-3">
          <label>Logo Bar</label>
          <input
            type="file"
            className="form-control"
            name="logo"
            onChange={handleFileChange}
            accept="image/*"
          />
          {barData.logo && (
            <img
              src={URL.createObjectURL(barData.logo)}
              alt="Logo Bar"
              className="mt-2"
              style={{ maxWidth: "150px" }}
            />
          )}
        </div>

        {/* Descrizione */}
        <div className="mb-3">
          <label>Descrizione</label>
          <textarea
            className="form-control"
            name="description"
            rows={4}
            value={barData.description}
            onChange={handleChange}
          ></textarea>
        </div>

        <button className="btn btn-primary">Salva</button>
      </form>
    </div>
  );
};

export default Profile;
