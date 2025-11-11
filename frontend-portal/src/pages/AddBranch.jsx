import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import GoogleAddressAutocompleteSimple from '../components/GoogleAddressAutocompleteSimple'
import AddressDisplay from '../components/AddressDisplay'

const Field = ({label, children, required}) => (
  <label className='block text-sm font-medium text-neutral-700'>
    {label} {required && <span className='text-red-500'>*</span>}
    <div className='mt-1'>{children}</div>
  </label>
)

export default function AddBranch() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [chains, setChains] = useState([])

  const [branchData, setBranchData] = useState({
    chain_id: '',
    code: '',
    name: '',
    address: '',
    city: '',
    province: '',
    cap: '',
    country: 'Italia',
    // New standardized address fields
    via: '',
    numero_civico: '',
    citta: '',
    provincia: '',
    regione: '',
    paese: 'Italia',
    lat: null,
    lng: null,
    phone: '',
    email: '',
    delivery_enabled: true,
    takeaway_enabled: true,
    dine_in_enabled: true,
    status: 'active'
  })

  useEffect(() => {
    loadChains()
  }, [])

    const loadChains = async () => {
    const token = localStorage.getItem('auth_token')
    console.log('Token trovato:', token ? 'SI' : 'NO')
    
    if (!token) {
      navigate('/login-chain-owner')
      return
    }

    try {
      console.log('Chiamata API in corso...')
      const response = await fetch('https://api.qofferun.com/api/v1/chains/my-chains', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      })

      console.log('Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Catene ricevute:', data.data)
        setChains(data.data)
        if (data.data.length > 0) {
          setBranchData(prev => ({...prev, chain_id: data.data[0].id}))
        }
      } else {
        console.log('Errore response:', await response.text())
        setError('Errore nel caricamento delle catene')
      }
    } catch (err) {
      console.log('Errore catch:', err)
      setError('Errore nel caricamento delle catene')
    }
  }

  const generateBranchCode = () => {
    const prefix = branchData.city.substring(0, 3).toUpperCase()
    const number = Math.floor(Math.random() * 999) + 1
    const code = `${prefix}${number.toString().padStart(3, '0')}`
    setBranchData(prev => ({...prev, code}))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validation - CAP can be empty for landmarks/piazzas
    if (!branchData.chain_id || !branchData.name || !branchData.via || !branchData.citta || !branchData.provincia) {
      setError('Compila tutti i campi obbligatori (catena, nome, via, città, provincia)')
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('https://api.qofferun.com/api/v1/branches', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(branchData)
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Filiale creata con successo!')
        setTimeout(() => {
          navigate('/chain-dashboard')
        }, 2000)
      } else {
        setError(data.message || 'Errore nella creazione della filiale')
      }
    } catch (err) {
      setError('Errore di connessione. Riprova più tardi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-neutral-50'>
      {/* Header */}
      <header className='bg-white shadow-sm border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
          <div className='flex items-center gap-4'>
            <button
              onClick={() => navigate('/chain-dashboard')}
              className='text-qorange-600 hover:text-qorange-700'
            >
              ← Torna al Dashboard
            </button>
            <div>
              <h1 className='text-xl font-bold text-neutral-900'>
                Aggiungi Nuova Filiale
              </h1>
              <p className='text-sm text-neutral-600'>
                Espandi la tua catena con una nuova location
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='bg-white rounded-xl shadow p-8'>
          {error && (
            <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700'>
              {error}
            </div>
          )}

          {success && (
            <div className='mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700'>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className='space-y-8' autoComplete="off">
            {/* Informazioni Base */}
            <div>
              <h2 className='text-lg font-semibold text-neutral-900 mb-4'>
                Informazioni Base
              </h2>
              <div className='grid md:grid-cols-2 gap-6'>
                <Field label="Catena" required>
                  <select
                    className='w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qorange-500 focus:border-transparent'
                    value={branchData.chain_id}
                    onChange={e => setBranchData({...branchData, chain_id: e.target.value})}
                  >
                    <option value="">Seleziona catena</option>
                    {chains.map(chain => (
                      <option key={chain.id} value={chain.id}>{chain.name}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Nome Filiale" required>
                  <input
                    type='text'
                    className='w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qorange-500 focus:border-transparent'
                    placeholder='Coffee Paradise - Centro'
                    value={branchData.name}
                    onChange={e => setBranchData({...branchData, name: e.target.value})}
                    autoComplete="off"
                  />
                </Field>

                <Field label="Codice Filiale" required>
                  <div className='flex gap-2'>
                    <input
                      type='text'
                      className='flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qorange-500 focus:border-transparent'
                      placeholder='MIL001'
                      value={branchData.code}
                      autoComplete="off"
                      onChange={e => setBranchData({...branchData, code: e.target.value.toUpperCase()})}
                    />
                    <button
                      type='button'
                      onClick={generateBranchCode}
                      className='px-4 py-2 bg-neutral-600 text-white rounded-lg hover:bg-neutral-700'
                    >
                      Genera
                    </button>
                  </div>
                </Field>

                <Field label="Email Filiale">
                  <input
                    type='email'
                    className='w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qorange-500 focus:border-transparent'
                    placeholder='centro@coffeeparadise.com'
                    value={branchData.email}
                    onChange={e => setBranchData({...branchData, email: e.target.value})}
                    autoComplete="email"
                  />
                </Field>
              </div>
            </div>

            {/* Indirizzo */}
            <div>
              <h2 className='text-lg font-semibold text-neutral-900 mb-4'>
                Indirizzo
              </h2>
              <div className='grid gap-6'>
                <Field label="Indirizzo" required>
                  <GoogleAddressAutocompleteSimple
                    placeholder="Cerca e seleziona l'indirizzo della filiale..."
                    required={true}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qorange-500 focus:border-transparent"
                    onChange={(addressData) => {
                      setBranchData({
                        ...branchData,
                        // Map to both old and new format for compatibility
                        address: addressData.formatted_address,
                        city: addressData.citta,
                        province: addressData.provincia,
                        cap: addressData.cap,
                        country: addressData.paese,
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
                  addressData={branchData} 
                  title="Indirizzo filiale selezionato"
                />

                <Field label="Telefono">
                  <input
                    type='tel'
                    className='w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qorange-500 focus:border-transparent'
                    placeholder='+39 02 1234567'
                    value={branchData.phone}
                    onChange={e => setBranchData({...branchData, phone: e.target.value})}
                    autoComplete="tel"
                  />
                </Field>
              </div>
            </div>

            {/* Servizi */}
            <div>
              <h2 className='text-lg font-semibold text-neutral-900 mb-4'>
                Servizi Offerti
              </h2>
              <div className='grid md:grid-cols-3 gap-6'>
                <label className='flex items-center gap-3 p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50'>
                  <input
                    type='checkbox'
                    checked={branchData.delivery_enabled}
                    onChange={e => setBranchData({...branchData, delivery_enabled: e.target.checked})}
                    className='w-4 h-4 text-qorange-600 focus:ring-qorange-500'
                  />
                  <div>
                    <div className='font-medium text-neutral-900'>🚚 Delivery</div>
                    <div className='text-sm text-neutral-600'>Consegna a domicilio</div>
                  </div>
                </label>

                <label className='flex items-center gap-3 p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50'>
                  <input
                    type='checkbox'
                    checked={branchData.takeaway_enabled}
                    onChange={e => setBranchData({...branchData, takeaway_enabled: e.target.checked})}
                    className='w-4 h-4 text-qorange-600 focus:ring-qorange-500'
                  />
                  <div>
                    <div className='font-medium text-neutral-900'>🥤 Takeaway</div>
                    <div className='text-sm text-neutral-600'>Asporto</div>
                  </div>
                </label>

                <label className='flex items-center gap-3 p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50'>
                  <input
                    type='checkbox'
                    checked={branchData.dine_in_enabled}
                    onChange={e => setBranchData({...branchData, dine_in_enabled: e.target.checked})}
                    className='w-4 h-4 text-qorange-600 focus:ring-qorange-500'
                  />
                  <div>
                    <div className='font-medium text-neutral-900'>🪑 Dine-in</div>
                    <div className='text-sm text-neutral-600'>Consumazione al tavolo</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit */}
            <div className='flex justify-between pt-6 border-t'>
              <button
                type='button'
                onClick={() => navigate('/chain-dashboard')}
                className='px-6 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50'
              >
                Annulla
              </button>
              
              <button
                type='submit'
                disabled={loading}
                className={`px-6 py-2 rounded-lg font-medium text-white ${
                  loading 
                  ? 'bg-neutral-400 cursor-not-allowed' 
                  : 'bg-qorange-600 hover:bg-qorange-700'
                }`}
              >
                {loading ? 'Creazione...' : 'Crea Filiale'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}