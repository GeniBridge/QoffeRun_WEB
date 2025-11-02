import React, { useState } from "react";



export default function Impostazione() {
  const [tab, setTab] = useState('info');
  const [bar, setBar] = useState({
    nome: '', descrizione: '', indirizzo: '', civico: '', cap: '', regione: '', citta: '', provincia: '',
    telefono: '', email: '', conferma: '',
    logo: null, logoUrl: '', cover: null, coverUrl: ''
  });
  const [orari, setOrari] = useState([
    { giorno: 'Lunedì', apertura: '', chiusura: '' },
    { giorno: 'Martedì', apertura: '', chiusura: '' },
    { giorno: 'Mercoledì', apertura: '', chiusura: '' },
    { giorno: 'Giovedì', apertura: '', chiusura: '' },
    { giorno: 'Venerdì', apertura: '', chiusura: '' },
    { giorno: 'Sabato', apertura: '', chiusura: '' },
    { giorno: 'Domenica', apertura: '', chiusura: '' },
  ]);
  const [pagamenti, setPagamenti] = useState({
    stripeAccountId: '', stripeSecretKey: '', stripePublishableKey: '', fatturaApiKey: '', fatturaClientId: '', fatturaClientSecret: ''
  });

  // Save/cancel handlers (implement as needed)
  const handleSave = () => { alert('Dati salvati!'); };
  const handleCancel = () => { window.location.reload(); };

  // Responsive: show all fields without scroll on desktop, stack on mobile
  return (
    <div className="container-fluid px-2 px-md-4" style={{ paddingTop: '3.5rem', maxWidth: 900, height: 'calc(100vh - 3.5rem)', minHeight: 600 }}>
      <div className="row g-0 justify-content-center" style={{ height: '100%' }}>
        <div className="col-12 col-lg-3 mb-3 mb-lg-0" style={{height: '100%'}}>
          <div className="d-flex flex-lg-column gap-1 gap-lg-0 bg-white rounded-3 shadow-sm p-2 p-lg-0 border" style={{ minHeight: 400 }}>
            <button className={`btn btn-nav-tab text-start py-2 px-3 rounded-3 mb-1${tab === 'info' ? ' active' : ''}`} style={{ border: 'none', background: tab === 'info' ? '#f5f5f5' : 'transparent', color: '#222', fontWeight: tab === 'info' ? 600 : 400 }} onClick={() => setTab('info')}><i className="bi bi-shop me-2"></i>Info Bar</button>
            <button className={`btn btn-nav-tab text-start py-2 px-3 rounded-3 mb-1${tab === 'logo' ? ' active' : ''}`} style={{ border: 'none', background: tab === 'logo' ? '#f5f5f5' : 'transparent', color: '#222', fontWeight: tab === 'logo' ? 600 : 400 }} onClick={() => setTab('logo')}><i className="bi bi-image me-2"></i>Logo & Cover</button>
            <button className={`btn btn-nav-tab text-start py-2 px-3 rounded-3 mb-1${tab === 'orari' ? ' active' : ''}`} style={{ border: 'none', background: tab === 'orari' ? '#f5f5f5' : 'transparent', color: '#222', fontWeight: tab === 'orari' ? 600 : 400 }} onClick={() => setTab('orari')}><i className="bi bi-clock me-2"></i>Orari</button>
            <button className={`btn btn-nav-tab text-start py-2 px-3 rounded-3${tab === 'pagamenti' ? ' active' : ''}`} style={{ border: 'none', background: tab === 'pagamenti' ? '#f5f5f5' : 'transparent', color: '#222', fontWeight: tab === 'pagamenti' ? 600 : 400 }} onClick={() => setTab('pagamenti')}><i className="bi bi-credit-card me-2"></i>Pagamenti</button>
          </div>
        </div>
        <div className="col-12 col-lg-9 d-flex flex-column" style={{height: '100%'}}>
          <div className="bg-white rounded-3 shadow-sm p-4 border impostazione-tab-content flex-grow-1 d-flex flex-column" style={{height: '100%', minHeight: 0, position: 'relative'}}>
            {tab === 'info' && (
              <div className="d-flex flex-column impostazione-tab-content" style={{height:'100%'}}>
                <form className="d-flex flex-column" style={{height:'100%'}} onSubmit={e => e.preventDefault()}>
                  <div className="tab-scroll-area">
                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <input className="form-control" placeholder="Nome Bar" value={bar.nome} onChange={e => setBar(b => ({ ...b, nome: e.target.value }))} />
                      </div>
                      <div className="col-12 col-md-6">
                        <textarea className="form-control" rows={2} placeholder="Descrizione" value={bar.descrizione} onChange={e => setBar(b => ({ ...b, descrizione: e.target.value }))} />
                      </div>
                      <div className="col-12 col-md-8">
                        <input className="form-control" placeholder="Indirizzo" value={bar.indirizzo} onChange={e => setBar(b => ({ ...b, indirizzo: e.target.value }))} />
                      </div>
                      <div className="col-12 col-md-4">
                        <input className="form-control" placeholder="Civico" value={bar.civico} onChange={e => setBar(b => ({ ...b, civico: e.target.value }))} />
                      </div>
                      <div className="col-6 col-md-3">
                        <input className="form-control" placeholder="CAP" value={bar.cap} onChange={e => setBar(b => ({ ...b, cap: e.target.value }))} />
                      </div>
                      <div className="col-6 col-md-3">
                        <input className="form-control" placeholder="Regione" value={bar.regione} onChange={e => setBar(b => ({ ...b, regione: e.target.value }))} />
                      </div>
                      <div className="col-6 col-md-3">
                        <input className="form-control" placeholder="Città" value={bar.citta} onChange={e => setBar(b => ({ ...b, citta: e.target.value }))} />
                      </div>
                      <div className="col-6 col-md-3">
                        <input className="form-control" placeholder="Provincia" value={bar.provincia} onChange={e => setBar(b => ({ ...b, provincia: e.target.value }))} />
                      </div>
                      <div className="col-12 col-md-6">
                        <input className="form-control" placeholder="Telefono" value={bar.telefono} onChange={e => setBar(b => ({ ...b, telefono: e.target.value }))} />
                      </div>
                      <div className="col-12 col-md-6">
                        <input type="email" className="form-control" placeholder="Email" value={bar.email} onChange={e => setBar(b => ({ ...b, email: e.target.value }))} />
                      </div>
                      <div className="col-12 col-md-6">
                        <input type="text" maxLength={4} pattern="\d{4}" className="form-control" placeholder="Codice Conferma (4 cifre)" value={bar.conferma} onChange={e => setBar(b => ({ ...b, conferma: e.target.value.replace(/\D/g, '').slice(0,4) }))} />
                      </div>
                    </div>
                  </div>
                  <div className="tab-actions d-flex justify-content-end gap-2 mt-2">
                    <button type="button" className="btn btn-outline-secondary px-4 py-2" onClick={handleCancel}>Annulla</button>
                    <button type="button" className="btn btn-dark px-4 py-2" style={{ fontWeight: 500 }} onClick={handleSave}>Salva</button>
                  </div>
                </form>
              </div>
            )}
            {tab === 'logo' && (
              <div className="d-flex flex-column impostazione-tab-content" style={{height:'100%'}}>
                <div className="tab-scroll-area">
                  <div className="row g-3 align-items-stretch">
                    <div className="col-12">
                      {/* Only top header preview: cover, logo, bar name */}
                      <div style={{ width: '100%', maxWidth: 340, margin: '0 auto', marginBottom: 24 }}>
                        <div style={{ position: 'relative', width: '100%', height: 120, borderRadius: 18, background: '#eee', overflow: 'hidden', boxShadow: '0 2px 8px #0001' }}>
                          {bar.coverUrl ? (
                            <img src={bar.coverUrl} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div className="text-center text-muted pt-5">Cover</div>
                          )}
                          <div style={{ position: 'absolute', left: '50%', bottom: -40, transform: 'translateX(-50%)', background: '#fff', borderRadius: '50%', border: '2px solid #eee', width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px #0001' }}>
                            {bar.logoUrl ? (
                              <img src={bar.logoUrl} alt="Logo" style={{ width: 64, height: 64, objectFit: 'contain', borderRadius: '50%' }} />
                            ) : (
                              <span className="text-muted">Logo</span>
                            )}
                          </div>
                        </div>
                        <div style={{ height: 40 }}></div>
                        <div style={{ textAlign: 'center', color: '#222', fontWeight: 600, fontSize: 18, marginTop: 8 }}>
                          {bar.nome || 'Nome Bar'}
                        </div>
                      </div>
                    </div>
                    <div className="col-12 col-md-6 d-flex flex-column justify-content-between">
                      <div>
                        <label className="form-label fw-semibold">Logo</label>
                        <input type="file" className="form-control mb-3" accept="image/*"
                          onChange={e => {
                            const file = e.target.files[0];
                            if (file) {
                              setBar(b => ({ ...b, logo: file, logoUrl: URL.createObjectURL(file) }));
                            }
                          }}
                        />
                        <label className="form-label fw-semibold mt-3">Cover Image</label>
                        <input type="file" className="form-control" accept="image/*"
                          onChange={e => {
                            const file = e.target.files[0];
                            if (file) {
                              setBar(b => ({ ...b, cover: file, coverUrl: URL.createObjectURL(file) }));
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="tab-actions d-flex justify-content-end gap-2 mt-3">
                  <button type="button" className="btn btn-outline-secondary px-4 py-2" onClick={handleCancel}>Annulla</button>
                  <button type="button" className="btn btn-dark px-4 py-2" style={{ fontWeight: 500 }} onClick={handleSave}>Salva</button>
                </div>
              </div>
            )}
            {tab === 'orari' && (
              <div className="d-flex flex-column impostazione-tab-content" style={{height:'100%'}}>
                <form className="d-flex flex-column" style={{height:'100%'}} onSubmit={e => e.preventDefault()}>
                  <div className="tab-scroll-area">
                    <div className="row g-3 align-items-center">
                      {orari.map((o, idx) => (
                        <div className="col-12 col-md-6 d-flex align-items-center" key={o.giorno}>
                          <span className="me-2 text-muted small" style={{ minWidth: 70 }}>{o.giorno}</span>
                          <input type="time" className="form-control me-2" value={o.apertura} onChange={e => setOrari(arr => arr.map((v,i) => i===idx ? { ...v, apertura: e.target.value } : v))} />
                          <span className="mx-1">-</span>
                          <input type="time" className="form-control" value={o.chiusura} onChange={e => setOrari(arr => arr.map((v,i) => i===idx ? { ...v, chiusura: e.target.value } : v))} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="tab-actions d-flex justify-content-end gap-2 mt-2">
                    <button type="button" className="btn btn-outline-secondary px-4 py-2" onClick={handleCancel}>Annulla</button>
                    <button type="button" className="btn btn-dark px-4 py-2" style={{ fontWeight: 500 }} onClick={handleSave}>Salva</button>
                  </div>
                </form>
              </div>
            )}
            {tab === 'pagamenti' && (
              <div className="d-flex flex-column impostazione-tab-content" style={{height:'100%'}}>
                <form className="d-flex flex-column" style={{height:'100%'}} onSubmit={e => e.preventDefault()}>
                  <div className="tab-scroll-area">
                    <div className="row g-3 align-items-end">
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold">Stripe Account ID</label>
                        <input className="form-control" value={pagamenti.stripeAccountId} onChange={e => setPagamenti(p => ({ ...p, stripeAccountId: e.target.value }))} />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold">Stripe Secret Key</label>
                        <input className="form-control" value={pagamenti.stripeSecretKey} onChange={e => setPagamenti(p => ({ ...p, stripeSecretKey: e.target.value }))} />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold">Stripe Publishable Key</label>
                        <input className="form-control" value={pagamenti.stripePublishableKey} onChange={e => setPagamenti(p => ({ ...p, stripePublishableKey: e.target.value }))} />
                      </div>
                      <div className="col-12"><hr /></div>
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold">Fattura24 API Key</label>
                        <input className="form-control" value={pagamenti.fatturaApiKey} onChange={e => setPagamenti(p => ({ ...p, fatturaApiKey: e.target.value }))} />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold">Fattura24 Client ID</label>
                        <input className="form-control" value={pagamenti.fatturaClientId} onChange={e => setPagamenti(p => ({ ...p, fatturaClientId: e.target.value }))} />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label fw-semibold">Fattura24 Client Secret</label>
                        <input className="form-control" value={pagamenti.fatturaClientSecret} onChange={e => setPagamenti(p => ({ ...p, fatturaClientSecret: e.target.value }))} />
                      </div>
                    </div>
                  </div>
                  <div className="tab-actions d-flex justify-content-end gap-2 mt-2">
                    <button type="button" className="btn btn-outline-secondary px-4 py-2" onClick={handleCancel}>Annulla</button>
                    <button type="button" className="btn btn-dark px-4 py-2" style={{ fontWeight: 500 }} onClick={handleSave}>Salva</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
