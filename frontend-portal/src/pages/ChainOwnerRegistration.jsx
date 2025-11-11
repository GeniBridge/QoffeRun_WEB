import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import GoogleAddressAutocompleteSimple from '../components/GoogleAddressAutocompleteSimple'
import AddressDisplay from '../components/AddressDisplay'

const Field = ({label, children, required}) => (
  <label className='block text-sm font-medium text-neutral-700'>
    {label} {required && <span className='text-red-500'>*</span>}
    <div className='mt-1'>{children}</div>
  </label>
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

export default function ChainOwnerRegistration() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form state
  const [ownerData, setOwnerData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })

  const [chainData, setChainData] = useState({
    name: '',
    description: ''
  })

  const [firstBranch, setFirstBranch] = useState({
    name: '',
    address: '',
    city: '',
    province: '',
    cap: '',
    phone: '',
    // New standardized address fields
    via: '',
    numero_civico: '',
    citta: '',
    provincia: '',
    regione: '',
    paese: 'Italia',
    lat: null,
    lng: null
  })

  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 3))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const validateCurrentStep = () => {
    setError('')
    
    if (currentStep === 1) {
      if (!ownerData.name || !ownerData.email || !ownerData.phone || !ownerData.password) {
        setError('Tutti i campi sono obbligatori')
        return false
      }
      if (ownerData.password !== ownerData.confirmPassword) {
        setError('Le password non corrispondono')
        return false
      }
      if (ownerData.password.length < 6) {
        setError('La password deve essere di almeno 6 caratteri')
        return false
      }
    }
    
    if (currentStep === 2) {
      if (!chainData.name) {
        setError('Il nome della catena è obbligatorio')
        return false
      }
    }
    
    if (currentStep === 3) {
      if (!firstBranch.name || !firstBranch.via || !firstBranch.citta || !firstBranch.provincia || !firstBranch.cap) {
        const missingFields = []
        if (!firstBranch.name) missingFields.push('nome')
        if (!firstBranch.via) missingFields.push('via') 
        if (!firstBranch.citta) missingFields.push('città')
        if (!firstBranch.provincia) missingFields.push('provincia')
        if (!firstBranch.cap) missingFields.push('CAP')
        
        setError(`Tutti i campi della prima filiale sono obbligatori. Campi mancanti: ${missingFields.join(', ')}`)
        return false
      }
    }
    
    return true
  }

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch('https://api.qofferun.com/api/v1/auth/register-chain-owner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Owner data
          name: ownerData.name,
          email: ownerData.email,
          phone: ownerData.phone,
          password: ownerData.password,
          
          // Chain data
          chain_name: chainData.name,
          chain_description: chainData.description,
          
          // First branch data - new standardized format
          branch_name: firstBranch.name,
          branch_via: firstBranch.via,
          branch_numero_civico: firstBranch.numero_civico,
          branch_citta: firstBranch.citta,
          branch_provincia: firstBranch.provincia,
          branch_regione: firstBranch.regione,
          branch_cap: firstBranch.cap,
          branch_paese: firstBranch.paese,
          branch_lat: firstBranch.lat,
          branch_lng: firstBranch.lng,
          branch_phone: firstBranch.phone,
          // Legacy fields for compatibility
          branch_address: firstBranch.address || (firstBranch.via ? `${firstBranch.via} ${firstBranch.numero_civico || ''}`.trim() : ''),
          branch_city: firstBranch.city || firstBranch.citta,
          branch_province: firstBranch.province || firstBranch.provincia
        })
      })

      const data = await response.json()

      if (response.ok) {
        // Success! Redirect to login or dashboard
        navigate('/login-chain-owner?registered=true')
      } else {
        setError(data.message || 'Errore durante la registrazione')
      }
    } catch (err) {
      setError('Errore di connessione. Riprova più tardi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-qorange-50 to-neutral-100 py-12'>
      <div className='max-w-2xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='bg-white rounded-xl shadow-lg p-8'>
          <div className='text-center mb-8'>
            <div className='mb-6'>
              <Logo width="200" className="mx-auto" />
            </div>
            <h1 className='text-3xl font-bold text-neutral-900'>
              Registrazione Chain Owner
            </h1>
            <p className='text-neutral-600 mt-2'>
              Gestisci multiple filiali con un unico account
            </p>
          </div>

          <StepIndicator currentStep={currentStep} totalSteps={3} />

          {error && (
            <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700'>
              {error}
            </div>
          )}

          {/* Step 1: Owner Details */}
          {currentStep === 1 && (
            <div autoComplete="off">
              <h2 className='text-2xl font-semibold mb-6 text-neutral-900'>
                Dati del Proprietario
              </h2>
              <div className='grid gap-6'>
                <Field label="Nome e Cognome" required>
                  <input
                    type='text'
                    className='w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qorange-500 focus:border-transparent'
                    placeholder='Mario Rossi'
                    value={ownerData.name}
                    onChange={e => setOwnerData({...ownerData, name: e.target.value})}
                  />
                </Field>
                
                <Field label="Email" required>
                  <input
                    type='email'
                    className='w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qorange-500 focus:border-transparent'
                    placeholder='mario.rossi@email.com'
                    value={ownerData.email}
                    onChange={e => setOwnerData({...ownerData, email: e.target.value})}
                  />
                </Field>
                
                <Field label="Telefono" required>
                  <input
                    type='tel'
                    className='w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qorange-500 focus:border-transparent'
                    placeholder='+39 340 1234567'
                    value={ownerData.phone}
                    onChange={e => setOwnerData({...ownerData, phone: e.target.value})}
                  />
                </Field>
                
                <Field label="Password" required>
                  <input
                    type='password'
                    className='w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qorange-500 focus:border-transparent'
                    placeholder='Minimo 6 caratteri'
                    value={ownerData.password}
                    onChange={e => setOwnerData({...ownerData, password: e.target.value})}
                  />
                </Field>
                
                <Field label="Conferma Password" required>
                  <input
                    type='password'
                    className='w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qorange-500 focus:border-transparent'
                    placeholder='Ripeti la password'
                    value={ownerData.confirmPassword}
                    onChange={e => setOwnerData({...ownerData, confirmPassword: e.target.value})}
                  />
                </Field>
              </div>
            </div>
          )}

          {/* Step 2: Chain Details */}
          {currentStep === 2 && (
            <div autoComplete="off">
              <h2 className='text-2xl font-semibold mb-6 text-neutral-900'>
                Dettagli Catena
              </h2>
              <div className='grid gap-6'>
                <Field label="Nome Catena" required>
                  <input
                    type='text'
                    className='w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qorange-500 focus:border-transparent'
                    placeholder='Coffee Paradise Chain'
                    value={chainData.name}
                    onChange={e => setChainData({...chainData, name: e.target.value})}
                  />
                </Field>
                
                <Field label="Descrizione">
                  <textarea
                    className='w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qorange-500 focus:border-transparent'
                    rows={3}
                    placeholder='Descrizione della tua catena di bar...'
                    value={chainData.description}
                    onChange={e => setChainData({...chainData, description: e.target.value})}
                  />
                </Field>
                
                <div className='p-4 bg-blue-50 border border-blue-200 rounded-lg'>
                  <p className='text-sm text-blue-800'>
                    📊 <strong>Commissioni di Sistema</strong><br/>
                    Le commissioni sono gestite automaticamente dal sistema e applicate su ogni transazione. 
                    Potrai vedere i dettagli nelle tue analytics.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: First Branch */}
          {currentStep === 3 && (
            <div autoComplete="off">
              <h2 className='text-2xl font-semibold mb-6 text-neutral-900'>
                Prima Filiale
              </h2>
              <div className='grid gap-6'>
                <Field label="Nome Filiale" required>
                  <input
                    type='text'
                    className='w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qorange-500 focus:border-transparent'
                    placeholder='Coffee Paradise - Centro'
                    value={firstBranch.name}
                    onChange={e => setFirstBranch({...firstBranch, name: e.target.value})}
                  />
                </Field>
                
                <Field label="Indirizzo" required>
                  <GoogleAddressAutocompleteSimple
                    placeholder="Cerca e seleziona l'indirizzo della prima filiale..."
                    required={true}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qorange-500 focus:border-transparent"
                    onChange={(addressData) => {
                      setFirstBranch({
                        ...firstBranch,
                        // Map to both old and new format for compatibility
                        address: addressData.formatted_address,
                        city: addressData.citta,
                        province: addressData.provincia,
                        cap: addressData.cap,
                        // New standardized fields
                        via: addressData.via,
                        numero_civico: addressData.numero_civico,
                        citta: addressData.citta,
                        provincia: addressData.provincia,
                        regione: addressData.regione,
                        paese: addressData.paese,
                        lat: addressData.lat,
                        lng: addressData.lng
                      })
                    }}
                  />
                </Field>
                
                <AddressDisplay 
                  addressData={firstBranch} 
                  title="Indirizzo prima filiale selezionato"
                />
                
                <Field label="Telefono Filiale">
                  <input
                    type='tel'
                    className='w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qorange-500 focus:border-transparent'
                    placeholder='+39 02 1234567'
                    value={firstBranch.phone}
                    onChange={e => setFirstBranch({...firstBranch, phone: e.target.value})}
                  />
                </Field>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className='flex justify-between pt-8 border-t mt-8'>
            <button 
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-2 rounded-lg font-medium ${
                currentStep === 1 
                ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed' 
                : 'bg-neutral-600 text-white hover:bg-neutral-700'
              }`}
            >
              Indietro
            </button>
            
            {currentStep < 3 ? (
              <button 
                onClick={nextStep}
                className='px-6 py-2 rounded-lg bg-qorange-600 text-white font-medium hover:bg-qorange-700'
              >
                Avanti
              </button>
            ) : (
              <button 
                onClick={handleSubmit}
                disabled={loading}
                className={`px-6 py-2 rounded-lg font-medium ${
                  loading 
                  ? 'bg-neutral-400 cursor-not-allowed' 
                  : 'bg-qorange-600 hover:bg-qorange-700'
                } text-white`}
              >
                {loading ? 'Registrazione...' : 'Completa Registrazione'}
              </button>
            )}
          </div>

          <div className='text-center mt-6'>
            <p className='text-sm text-neutral-600'>
              Hai già un account?{' '}
              <button 
                onClick={() => navigate('/login-chain-owner')}
                className='text-qorange-600 hover:text-qorange-700 font-medium'
              >
                Accedi qui
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}