
import React, { useState } from 'react'
import { useCart } from '../context/CartContext'

export default function Impostazione() {
  const { cart } = useCart()
  const [tab, setTab] = useState('info')
  // Info Bar
  const [barName, setBarName] = useState('')
  const [barDesc, setBarDesc] = useState('')
  const [barAddress, setBarAddress] = useState({
    via: '',
    civico: '',
    cap: '',
    citta: '',
    provincia: '',
    regione: ''
  })
  // Logo & Cover
  const [logo, setLogo] = useState(null)
  const [cover, setCover] = useState(null)
  // Orari: ready array for all days
  const giorniSettimana = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica']
  const [orari, setOrari] = useState(giorniSettimana.map(g => ({ giorno: g, apertura: '', chiusura: '', weekend: g==='Sabato'||g==='Domenica' })))
  // Impostazione
  const [tax, setTax] = useState(cart.taxPct)
  const [currency, setCurrency] = useState('€')
  const [stripe, setStripe] = useState({
    clientId: '',
    publishableKey: '',
    secretKey: '',
    webhookSecret: ''
  })
  const [fattura, setFattura] = useState({
    username: '',
    password: '',
    codiceCliente: '',
    apiKey: ''
  })
  const [orderPin, setOrderPin] = useState('')

  function handleLogo(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setLogo(ev.target.result);
    reader.readAsDataURL(file);
  }
  function handleCover(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setCover(ev.target.result);
    reader.readAsDataURL(file);
  }
  function handleOrariChange(i, field, value) {
    setOrari(orari => orari.map((o, idx) => idx === i ? { ...o, [field]: value } : o))
  }
  function addOrario() {
    setOrari([...orari, { giorno: '', apertura: '', chiusura: '', weekend: false }])
  }
  function removeOrario(i) {
    setOrari(orari => orari.filter((_, idx) => idx !== i))
  }

  return (
    <section>
      <h5 className="mb-3">Impostazione</h5>
      <ul className="nav nav-tabs mb-3" role="tablist">
        <li className="nav-item" role="presentation">
          <button className={`nav-link${tab==='info'?' active':''}`} onClick={()=>setTab('info')} type="button" role="tab">Info Bar</button>
        </li>
        <li className="nav-item" role="presentation">
          <button className={`nav-link${tab==='logo'?' active':''}`} onClick={()=>setTab('logo')} type="button" role="tab">Logo & Cover</button>
        </li>
        <li className="nav-item" role="presentation">
          <button className={`nav-link${tab==='orari'?' active':''}`} onClick={()=>setTab('orari')} type="button" role="tab">Orari</button>
        </li>
        <li className="nav-item" role="presentation">
          <button className={`nav-link${tab==='impostazione'?' active':''}`} onClick={()=>setTab('impostazione')} type="button" role="tab">Impostazione</button>
        </li>
      </ul>
      <div className="tab-content">
        {/* Info Bar */}
        <div className={`tab-pane fade${tab==='info'?' show active':''}`}>
          <form className="row g-3 bg-white rounded-4 border p-3">
            <div className="col-md-6"><label className="form-label">Nome del bar</label><input className="form-control" value={barName} onChange={e=>setBarName(e.target.value)} /></div>
            <div className="col-md-6">
              <label className="form-label">Indirizzo dettagliato</label>
              <div className="row g-2">
                <div className="col-md-6"><input className="form-control" placeholder="Via/Viale/Piazza" value={barAddress.via} onChange={e=>setBarAddress(a=>({...a, via:e.target.value}))} /></div>
                <div className="col-md-2"><input className="form-control" placeholder="Civico" value={barAddress.civico} onChange={e=>setBarAddress(a=>({...a, civico:e.target.value}))} /></div>
                <div className="col-md-2"><input className="form-control" placeholder="CAP" value={barAddress.cap} onChange={e=>setBarAddress(a=>({...a, cap:e.target.value}))} /></div>
                <div className="col-md-2"><input className="form-control" placeholder="Città" value={barAddress.citta} onChange={e=>setBarAddress(a=>({...a, citta:e.target.value}))} /></div>
                <div className="col-md-6"><input className="form-control" placeholder="Provincia" value={barAddress.provincia} onChange={e=>setBarAddress(a=>({...a, provincia:e.target.value}))} /></div>
                <div className="col-md-6"><input className="form-control" placeholder="Regione" value={barAddress.regione} onChange={e=>setBarAddress(a=>({...a, regione:e.target.value}))} /></div>
              </div>
            </div>
            <div className="col-12"><label className="form-label">Descrizione</label><textarea className="form-control" value={barDesc} onChange={e=>setBarDesc(e.target.value)} rows={2} /></div>
            <div className="col-12 d-flex justify-content-end"><button className="btn btn-dark" type="button">Salva</button></div>
          </form>
        </div>
        {/* Logo & Cover */}
        <div className={`tab-pane fade${tab==='logo'?' show active':''}`}>
          <form className="row g-3 bg-white rounded-4 border p-3">
            <div className="col-md-6">
              <label className="form-label">Logo del bar</label>
              <input type="file" accept="image/*" className="form-control mb-1" onChange={handleLogo} />
              {logo && <img src={logo} alt="logo" style={{maxWidth:'100%',maxHeight:120,marginTop:8}} />}
            </div>
            <div className="col-md-6">
              <label className="form-label">Cover profilo</label>
              <input type="file" accept="image/*" className="form-control mb-1" onChange={handleCover} />
              {cover && <img src={cover} alt="cover" style={{maxWidth:'100%',maxHeight:120,marginTop:8}} />}
            </div>
            <div className="col-12 d-flex justify-content-end"><button className="btn btn-dark" type="button">Salva</button></div>
          </form>
        </div>
        {/* Orari */}
        <div className={`tab-pane fade${tab==='orari'?' show active':''}`}>
          <form className="bg-white rounded-4 border p-3">
            <div className="row g-2">
              {orari.map((o, i) => (
                <div className="col-12 row g-2 align-items-end" key={i}>
                  <div className="col-md-3"><input className="form-control" value={o.giorno} disabled /></div>
                  <div className="col-md-3"><input className="form-control" placeholder="Apertura" value={o.apertura} onChange={e=>handleOrariChange(i, 'apertura', e.target.value)} /></div>
                  <div className="col-md-3"><input className="form-control" placeholder="Chiusura" value={o.chiusura} onChange={e=>handleOrariChange(i, 'chiusura', e.target.value)} /></div>
                  <div className="col-md-2 form-check d-flex align-items-center">
                    <input className="form-check-input me-1" type="checkbox" checked={o.weekend} onChange={e=>handleOrariChange(i, 'weekend', e.target.checked)} id={`weekend${i}`}/>
                    <label className="form-check-label" htmlFor={`weekend${i}`}>Weekend</label>
                  </div>
                </div>
              ))}
              <div className="col-12 d-flex justify-content-end"><button className="btn btn-dark" type="button">Salva</button></div>
            </div>
          </form>
        </div>
        {/* Impostazione */}
        <div className={`tab-pane fade${tab==='impostazione'?' show active':''}`}>
          <div className="row g-3">
            <div className="col-md-4">
              <div className="card h-100">
                <div className="card-body">
                  <h6 className="card-title mb-3">Stripe Connect API</h6>
                  <label className="form-label">Client ID</label>
                  <input className="form-control mb-2" placeholder="Client ID" value={stripe.clientId} onChange={e=>setStripe(s=>({...s, clientId:e.target.value}))} />
                  <label className="form-label">Publishable Key</label>
                  <input className="form-control mb-2" placeholder="Publishable Key" value={stripe.publishableKey} onChange={e=>setStripe(s=>({...s, publishableKey:e.target.value}))} />
                  <label className="form-label">Secret Key</label>
                  <input className="form-control mb-2" placeholder="Secret Key" value={stripe.secretKey} onChange={e=>setStripe(s=>({...s, secretKey:e.target.value}))} />
                  <label className="form-label">Webhook Secret <span className="text-muted">(opzionale)</span></label>
                  <input className="form-control mb-2" placeholder="Webhook Secret" value={stripe.webhookSecret} onChange={e=>setStripe(s=>({...s, webhookSecret:e.target.value}))} />
                  <button className="btn btn-dark w-100" type="button">Salva Stripe</button>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100">
                <div className="card-body">
                  <h6 className="card-title mb-3">Codice Conferma Ordini</h6>
                  <label className="form-label">Codice di conferma (4 cifre)</label>
                  <input
                    className="form-control mb-2"
                    type="text"
                    maxLength={4}
                    pattern="\\d{4}"
                    placeholder="Es: 1234"
                    value={orderPin}
                    onChange={e => {
                      // Only allow numbers, max 4 digits
                      const v = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                      setOrderPin(v);
                    }}
                  />
                  <button className="btn btn-dark w-100" type="button">Salva Codice</button>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100">
                <div className="card-body">
                  <h6 className="card-title mb-3">Fattura per Tutti API</h6>
                  <label className="form-label">Username</label>
                  <input className="form-control mb-2" placeholder="Username" value={fattura.username} onChange={e=>setFattura(f=>({...f, username:e.target.value}))} />
                  <label className="form-label">Password</label>
                  <input className="form-control mb-2" type="password" placeholder="Password" value={fattura.password} onChange={e=>setFattura(f=>({...f, password:e.target.value}))} />
                  <label className="form-label">Codice Cliente</label>
                  <input className="form-control mb-2" placeholder="Codice Cliente" value={fattura.codiceCliente} onChange={e=>setFattura(f=>({...f, codiceCliente:e.target.value}))} />
                  <label className="form-label">API Key <span className="text-muted">(opzionale)</span></label>
                  <input className="form-control mb-2" placeholder="API Key" value={fattura.apiKey} onChange={e=>setFattura(f=>({...f, apiKey:e.target.value}))} />
                  <button className="btn btn-dark w-100" type="button">Salva Fattura per Tutti</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
