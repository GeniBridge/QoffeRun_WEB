import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import GoogleAddressAutocomplete from '../components/GoogleAddressAutocomplete'

const Field = ({label, children, required}) => (
  <label className='block text-sm font-medium text-neutral-700'>
    {label} {required && <span className='text-red-500'>*</span>}
    <div className='mt-1'>{children}</div>
  </label>
)

const FileUpload = ({label, accept, onChange, value, required}) => (
  <Field label={label} required={required}>
    <div className='border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center hover:border-qorange-400 transition-colors'>
      <input 
        type="file" 
        accept={accept}
        onChange={(e) => onChange(e.target.files[0])}
        className='hidden'
        id={`file-${label.replace(/\s+/g, '-').toLowerCase()}`}
      />
      <label 
        htmlFor={`file-${label.replace(/\s+/g, '-').toLowerCase()}`}
        className='cursor-pointer'
      >
        {value ? (
          <div className='text-qorange-600 font-medium'>{value.name}</div>
        ) : (
          <div>
            <div className='text-2xl mb-2'>📁</div>
            <div className='text-neutral-600'>Clicca per caricare {label.toLowerCase()}</div>
          </div>
        )}
      </label>
    </div>
  </Field>
)

const StepIndicator = ({currentStep, totalSteps}) => (
  <div className='flex items-center justify-center mb-8'>
    {Array.from({length: totalSteps}, (_, i) => (
      <div key={i} className='flex items-center'>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
          i + 1 <= currentStep ? 'bg-qorange-600 text-white' : 'bg-neutral-200 text-neutral-500'
        }`}>
          {i + 1}
        </div>
        {i < totalSteps - 1 && (
          <div className={`w-12 h-0.5 ${i + 1 < currentStep ? 'bg-qorange-600' : 'bg-neutral-200'}`} />
        )}
      </div>
    ))}
  </div>
)

function useForm(initial){
  const [data, setData] = useState(initial)
  const set = (k) => (value) => {
    const newValue = value?.target ? value.target.value : value
    setData(v => ({...v, [k]: newValue}))
  }
  return { data, set, setData }
}

export default function Registrazione(){
  const nav = useNavigate()
  const location = useLocation()
  const [currentStep, setCurrentStep] = useState(1)
  
  const dettagliBar = useForm({ 
    nome: '', 
    descrizione: '', 
    // Indirizzo strutturato con Google Maps
    indirizzo: {
      formatted_address: '',
      via: '',
      numero_civico: '',
      citta: '',
      provincia: '',
      regione: '',
      cap: '',
      paese: 'Italia',
      lat: null,
      lng: null,
      place_name: ''
    }
  })
  
  const mediaBar = useForm({ 
    logo: null, 
    cover: null 
  })
  
  const gestore = useForm({ 
    nome: '', 
    cognome: '', 
    email: '', 
    telefono: '', 
    password: '', 
    conferma: '' 
  })

  const submit = async () => {
    const payload = {
      // Dettagli del bar
      nome: dettagliBar.data.nome,
      descrizione: dettagliBar.data.descrizione,
      
      // Indirizzo strutturato
      indirizzo_completo: dettagliBar.data.indirizzo.formatted_address,
      via: dettagliBar.data.indirizzo.via,
      numero_civico: dettagliBar.data.indirizzo.numero_civico,
      citta: dettagliBar.data.indirizzo.citta,
      provincia: dettagliBar.data.indirizzo.provincia,
      regione: dettagliBar.data.indirizzo.regione,
      cap: dettagliBar.data.indirizzo.cap,
      paese: dettagliBar.data.indirizzo.paese,
      latitudine: dettagliBar.data.indirizzo.lat,
      longitudine: dettagliBar.data.indirizzo.lng,
      
      // Dati del gestore
      gestore_nome: gestore.data.nome,
      gestore_cognome: gestore.data.cognome,
      gestore_email: gestore.data.email,
      gestore_telefono: gestore.data.telefono,
      gestore_password: gestore.data.password,
      
      // Media files (da convertire in FormData se necessario)
      logo: mediaBar.data.logo,
      cover: mediaBar.data.cover
    }

    try {
      // Invia i dati al backend Laravel
      const formData = new FormData()
      
      // Aggiungi tutti i campi testo
      Object.keys(payload).forEach(key => {
        if (key !== 'logo' && key !== 'cover' && payload[key] !== null && payload[key] !== undefined) {
          formData.append(key, payload[key])
        }
      })
      
      // Aggiungi i file se presenti
      if (payload.logo) formData.append('logo', payload.logo)
      if (payload.cover) formData.append('cover', payload.cover)

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/bar/registrazione`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        }
      })

      const result = await response.json()

      if (response.ok) {
        console.log('Registrazione completata:', result)
        nav('/successo', { state: { tipo: 'bar', data: result } })
      } else {
        console.error('Errore registrazione:', result)
        alert('Errore durante la registrazione: ' + (result.message || 'Errore sconosciuto'))
      }
    } catch (error) {
      console.error('Errore di rete:', error)
      alert('Errore di connessione. Riprova più tardi.')
    }
  }

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4))
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))

  const canProceedStep1 = dettagliBar.data.nome && dettagliBar.data.descrizione && dettagliBar.data.indirizzo.formatted_address
  const canProceedStep2 = mediaBar.data.logo && mediaBar.data.cover
  const canProceedStep3 = gestore.data.nome && gestore.data.cognome && gestore.data.email && gestore.data.password && gestore.data.password === gestore.data.conferma

  return (
    <section className='py-14 min-h-screen bg-neutral-50'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl fw-bold text-neutral-900' style={{fontFamily: 'var(--bs-body-font-family)'}}>Registrazione Bar</h1>
          <p className='text-neutral-600 mt-2'>Completa la registrazione del tuo bar in pochi semplici passi</p>
        </div>

        <StepIndicator currentStep={currentStep} totalSteps={4} />

        <div className='bg-white rounded-2xl shadow-soft p-8'>
          {/* Step 1: Dettagli del Bar */}
          {currentStep === 1 && (
            <div>
              <h2 className='text-2xl font-semibold mb-6 text-neutral-900'>Dettagli del Bar</h2>
              <div className='grid md:grid-cols-2 gap-6'>
                <Field label='Nome del bar' required>
                  <input 
                    className='w-full border border-neutral-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-qorange-500 focus:border-transparent' 
                    value={dettagliBar.data.nome} 
                    onChange={dettagliBar.set('nome')} 
                    placeholder='Es. Bar Central' 
                  />
                </Field>
                
                <Field label='Città'>
                  <input 
                    className='w-full border border-neutral-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-qorange-500 focus:border-transparent' 
                    value={dettagliBar.data.citta} 
                    onChange={dettagliBar.set('citta')} 
                    placeholder='Es. Roma' 
                  />
                </Field>

                <div className='md:col-span-2'>
                  <Field label='Descrizione' required>
                    <textarea 
                      className='w-full border border-neutral-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-qorange-500 focus:border-transparent' 
                      rows={3}
                      value={dettagliBar.data.descrizione} 
                      onChange={dettagliBar.set('descrizione')} 
                      placeholder='Racconta qualcosa sul tuo bar...'
                    />
                  </Field>
                </div>

                <div className='md:col-span-2'>
                  <Field label='Indirizzo completo' required>
                    <GoogleAddressAutocomplete
                      value={dettagliBar.data.indirizzo}
                      onChange={(addressData) => {
                        dettagliBar.setData(prev => ({
                          ...prev,
                          indirizzo: addressData
                        }))
                      }}
                      placeholder="Cerca e seleziona l'indirizzo del bar..."
                      required={true}
                      className='w-full border border-neutral-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-qorange-500 focus:border-transparent'
                    />
                  </Field>
                </div>

                {/* Campi indirizzo automatici (read-only) */}
                {dettagliBar.data.indirizzo.formatted_address && (
                  <div className='md:col-span-2 space-y-4 p-4 bg-neutral-50 rounded-lg'>
                    <h4 className='font-medium text-neutral-800 text-sm'>📍 Dettagli indirizzo selezionato:</h4>
                    <div className='grid md:grid-cols-2 gap-4 text-sm'>
                      <div>
                        <span className='font-medium text-neutral-600'>Via/Piazza:</span>
                        <div className='text-neutral-800'>{dettagliBar.data.indirizzo.via || 'N/A'}</div>
                      </div>
                      <div>
                        <span className='font-medium text-neutral-600'>Numero civico:</span>
                        <div className='text-neutral-800'>{dettagliBar.data.indirizzo.numero_civico || 'N/A'}</div>
                      </div>
                      <div>
                        <span className='font-medium text-neutral-600'>Città:</span>
                        <div className='text-neutral-800'>{dettagliBar.data.indirizzo.citta}</div>
                      </div>
                      <div>
                        <span className='font-medium text-neutral-600'>CAP:</span>
                        <div className='text-neutral-800'>{dettagliBar.data.indirizzo.cap}</div>
                      </div>
                      <div>
                        <span className='font-medium text-neutral-600'>Provincia:</span>
                        <div className='text-neutral-800'>{dettagliBar.data.indirizzo.provincia}</div>
                      </div>
                      <div>
                        <span className='font-medium text-neutral-600'>Regione:</span>
                        <div className='text-neutral-800'>{dettagliBar.data.indirizzo.regione}</div>
                      </div>
                    </div>
                    {dettagliBar.data.indirizzo.lat && dettagliBar.data.indirizzo.lng && (
                      <div className='text-xs text-neutral-500'>
                        📌 Coordinate: {dettagliBar.data.indirizzo.lat.toFixed(6)}, {dettagliBar.data.indirizzo.lng.toFixed(6)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Logo e Cover */}
          {currentStep === 2 && (
            <div>
              <h2 className='text-2xl font-semibold mb-6 text-neutral-900'>Logo e Cover</h2>
              <div className='grid md:grid-cols-2 gap-6'>
                <FileUpload 
                  label="Logo del bar" 
                  accept="image/*"
                  value={mediaBar.data.logo}
                  onChange={mediaBar.set('logo')}
                  required
                />
                <FileUpload 
                  label="Immagine di copertina" 
                  accept="image/*"
                  value={mediaBar.data.cover}
                  onChange={mediaBar.set('cover')}
                  required
                />
              </div>
              <p className='text-sm text-neutral-500 mt-4'>
                Il logo sarà visibile nell'app, mentre l'immagine di copertina sarà mostrata nella pagina del tuo bar.
              </p>
            </div>
          )}

          {/* Step 3: Gestore del Bar */}
          {currentStep === 3 && (
            <div>
              <h2 className='text-2xl font-semibold mb-6 text-neutral-900'>Gestore del Bar</h2>
              <div className='grid md:grid-cols-2 gap-6'>
                <Field label='Nome' required>
                  <input 
                    className='w-full border border-neutral-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-qorange-500 focus:border-transparent' 
                    value={gestore.data.nome} 
                    onChange={gestore.set('nome')} 
                    placeholder='Mario' 
                  />
                </Field>
                
                <Field label='Cognome' required>
                  <input 
                    className='w-full border border-neutral-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-qorange-500 focus:border-transparent' 
                    value={gestore.data.cognome} 
                    onChange={gestore.set('cognome')} 
                    placeholder='Rossi' 
                  />
                </Field>

                <Field label='Email' required>
                  <input 
                    type='email'
                    className='w-full border border-neutral-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-qorange-500 focus:border-transparent' 
                    value={gestore.data.email} 
                    onChange={gestore.set('email')} 
                    placeholder='mario@esempio.com' 
                  />
                </Field>

                <Field label='Telefono'>
                  <input 
                    type='tel'
                    className='w-full border border-neutral-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-qorange-500 focus:border-transparent' 
                    value={gestore.data.telefono} 
                    onChange={gestore.set('telefono')} 
                    placeholder='+39 xxx xxx xxxx' 
                  />
                </Field>

                <Field label='Password' required>
                  <input 
                    type='password'
                    className='w-full border border-neutral-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-qorange-500 focus:border-transparent' 
                    value={gestore.data.password} 
                    onChange={gestore.set('password')} 
                    placeholder='••••••••' 
                  />
                </Field>

                <Field label='Conferma password' required>
                  <input 
                    type='password'
                    className='w-full border border-neutral-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-qorange-500 focus:border-transparent' 
                    value={gestore.data.conferma} 
                    onChange={gestore.set('conferma')} 
                    placeholder='••••••••' 
                  />
                </Field>
              </div>
              {gestore.data.password && gestore.data.conferma && gestore.data.password !== gestore.data.conferma && (
                <p className='text-red-500 text-sm mt-2'>Le password non coincidono</p>
              )}
            </div>
          )}

          {/* Step 4: Riepilogo e Invio */}
          {currentStep === 4 && (
            <div>
              <h2 className='text-2xl font-semibold mb-6 text-neutral-900'>Riepilogo e Invio Richiesta</h2>
              
              <div className='space-y-6'>
                <div className='bg-neutral-50 rounded-lg p-4'>
                  <h3 className='font-semibold text-neutral-900 mb-2'>Dettagli del Bar</h3>
                  <p><strong>Nome:</strong> {dettagliBar.data.nome}</p>
                  <p><strong>Descrizione:</strong> {dettagliBar.data.descrizione}</p>
                  
                  <div className='mt-3'>
                    <strong>Indirizzo completo:</strong>
                    <div className='ml-4 mt-1 text-sm space-y-1'>
                      <p>{dettagliBar.data.indirizzo.formatted_address}</p>
                      {dettagliBar.data.indirizzo.via && (
                        <div className='text-neutral-600'>
                          <span>📍 {dettagliBar.data.indirizzo.via} {dettagliBar.data.indirizzo.numero_civico}</span><br/>
                          <span>{dettagliBar.data.indirizzo.cap} {dettagliBar.data.indirizzo.citta} ({dettagliBar.data.indirizzo.provincia})</span><br/>
                          <span>{dettagliBar.data.indirizzo.regione}, {dettagliBar.data.indirizzo.paese}</span>
                          {dettagliBar.data.indirizzo.lat && (
                            <div className='text-xs mt-1 text-neutral-500'>
                              Coordinate: {dettagliBar.data.indirizzo.lat.toFixed(6)}, {dettagliBar.data.indirizzo.lng.toFixed(6)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className='bg-neutral-50 rounded-lg p-4'>
                  <h3 className='font-semibold text-neutral-900 mb-2'>Media</h3>
                  <p><strong>Logo:</strong> {mediaBar.data.logo?.name || 'Non caricato'}</p>
                  <p><strong>Cover:</strong> {mediaBar.data.cover?.name || 'Non caricato'}</p>
                </div>

                <div className='bg-neutral-50 rounded-lg p-4'>
                  <h3 className='font-semibold text-neutral-900 mb-2'>Gestore</h3>
                  <p><strong>Nome:</strong> {gestore.data.nome} {gestore.data.cognome}</p>
                  <p><strong>Email:</strong> {gestore.data.email}</p>
                  <p><strong>Telefono:</strong> {gestore.data.telefono}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className='flex justify-between pt-6 border-t'>
            <button 
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-2 rounded-lg font-medium ${
                currentStep === 1 
                  ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed' 
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              Indietro
            </button>
            
            {currentStep < 4 ? (
              <button 
                onClick={nextStep}
                disabled={
                  (currentStep === 1 && !canProceedStep1) ||
                  (currentStep === 2 && !canProceedStep2) ||
                  (currentStep === 3 && !canProceedStep3)
                }
                className={`px-6 py-2 rounded-lg font-medium ${
                  (currentStep === 1 && !canProceedStep1) ||
                  (currentStep === 2 && !canProceedStep2) ||
                  (currentStep === 3 && !canProceedStep3)
                    ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                    : 'bg-qorange-600 text-white hover:bg-qorange-700'
                }`}
              >
                Avanti
              </button>
            ) : (
              <button 
                onClick={submit}
                className='px-8 py-2 rounded-lg font-medium bg-qorange-600 text-white hover:bg-qorange-700'
              >
                Invia Richiesta
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
