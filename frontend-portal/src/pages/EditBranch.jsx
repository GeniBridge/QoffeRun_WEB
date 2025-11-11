import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import GoogleAddressAutocompleteSimple from '../components/GoogleAddressAutocompleteSimple'
import AddressDisplay from '../components/AddressDisplay'

const Field = ({label, children, required}) => (
  <label className='block text-sm font-medium text-neutral-700'>
    {label} {required && <span className='text-red-500'>*</span>}
    <div className='mt-1'>{children}</div>
  </label>
)

export default function EditBranch() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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
    table_service_enabled: false,
    status: 'active'
  })

  useEffect(() => {
    loadBranchData()
  }, [id])

  const loadBranchData = async () => {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      navigate('/login-chain-owner')
      return
    }

    try {
      const response = await fetch(`https://api.qofferun.com/api/v1/branches/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        const result = await response.json()
        const branch = result.data
        
        setBranchData({
          chain_id: branch.chain_id || '',
          code: branch.code || '',
          name: branch.name || '',
          // Legacy address fields
          address: branch.address || '',
          city: branch.city || '',
          province: branch.province || '',
          cap: branch.cap || '',
          country: branch.country || 'Italia',
          // New standardized address fields
          via: branch.via || branch.address || '',
          numero_civico: branch.numero_civico || '',
          citta: branch.citta || branch.city || '',
          provincia: branch.provincia || branch.province || '',
          regione: branch.regione || '',
          paese: branch.paese || branch.country || 'Italia',
          lat: branch.lat || null,
          lng: branch.lng || null,
          phone: branch.phone || '',
          email: branch.email || '',
          delivery_enabled: branch.delivery_enabled ?? true,
          takeaway_enabled: branch.takeaway_enabled ?? true,
          table_service_enabled: branch.table_service_enabled ?? false,
          status: branch.status || 'active'
        })
      } else {
        setError('Filiale non trovata')
      }
    } catch (err) {
      setError('Errore nel caricamento dei dati')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setBranchData(prev => ({...prev, [field]: value}))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    // Validation - CAP can be empty for landmarks/piazzas
    if (!branchData.name || !branchData.via || !branchData.citta || !branchData.provincia) {
      setError('Nome, via, città e provincia sono obbligatori')
      setSaving(false)
      return
    }

    const token = localStorage.getItem('auth_token')
    if (!token) {
      navigate('/login-chain-owner')
      return
    }

    try {
      const response = await fetch(`https://api.qofferun.com/api/v1/branches/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(branchData)
      })

      const result = await response.json()
      
      if (response.ok) {
        setSuccess('Filiale aggiornata con successo!')
        setTimeout(() => {
          navigate(`/branch/${id}`)
        }, 2000)
      } else {
        setError(result.message || 'Errore durante l\'aggiornamento')
      }
    } catch (err) {
      setError('Errore di connessione')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-neutral-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='text-4xl mb-4'>🏪</div>
          <p className='text-neutral-600'>Caricamento dati filiale...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-neutral-50'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <button
            onClick={() => navigate(`/branch/${id}`)}
            className='flex items-center gap-2 text-qorange-600 hover:text-qorange-700 mb-4'
          >
            ← Torna alla Filiale
          </button>
          <h1 className='text-3xl font-bold text-neutral-900'>Modifica Filiale</h1>
          <p className='text-neutral-600 mt-2'>
            Aggiorna le informazioni della filiale
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className='bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6'>
            {error}
          </div>
        )}

        {success && (
          <div className='bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6'>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} autoComplete="off">
          {/* Basic Information */}
          <div className='bg-white rounded-xl shadow-sm p-6 mb-6'>
            <h2 className='text-xl font-semibold text-neutral-900 mb-6'>Informazioni Generali</h2>
            
            <div className='grid gap-6 md:grid-cols-2'>
              <Field label='Nome Filiale' required>
                <input
                  type='text'
                  value={branchData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className='w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qorange-500 focus:border-qorange-500'
                  placeholder='Es: Bar Roma Centro'
                  required
                  autoComplete="off"
                />
              </Field>

              <Field label='Codice Filiale'>
                <input
                  type='text'
                  value={branchData.code}
                  onChange={(e) => handleInputChange('code', e.target.value)}
                  className='w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qorange-500 focus:border-qorange-500'
                  placeholder='Es: ROM001'
                  autoComplete="off"
                />
              </Field>

              <div className='md:col-span-2'>
                <Field label='Indirizzo' required>
                  <GoogleAddressAutocompleteSimple
                    placeholder="Cerca e seleziona l'indirizzo della filiale..."
                    required={true}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qorange-500 focus:border-qorange-500"
                    value={{
                      formatted_address: branchData.address,
                      via: branchData.via,
                      numero_civico: branchData.numero_civico,
                      citta: branchData.citta,
                      provincia: branchData.provincia,
                      regione: branchData.regione,
                      cap: branchData.cap,
                      paese: branchData.paese,
                      lat: branchData.lat,
                      lng: branchData.lng
                    }}
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
              </div>

              <div className="md:col-span-2">
                <AddressDisplay 
                  addressData={branchData} 
                  title="Indirizzo filiale corrente"
                />
              </div>

              <Field label='Paese'>
                <select
                  value={branchData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className='w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qorange-500 focus:border-qorange-500'
                >
                  <option value='Italia'>Italia</option>
                  <option value='Francia'>Francia</option>
                  <option value='Germania'>Germania</option>
                  <option value='Spagna'>Spagna</option>
                </select>
              </Field>
            </div>
          </div>

          {/* Contact Information */}
          <div className='bg-white rounded-xl shadow-sm p-6 mb-6'>
            <h2 className='text-xl font-semibold text-neutral-900 mb-6'>Contatti</h2>
            
            <div className='grid gap-6 md:grid-cols-2'>
              <Field label='Telefono'>
                <input
                  type='tel'
                  value={branchData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className='w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qorange-500 focus:border-qorange-500'
                  placeholder='Es: +39 06 1234567'
                  autoComplete="tel"
                />
              </Field>

              <Field label='Email'>
                <input
                  type='email'
                  value={branchData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className='w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qorange-500 focus:border-qorange-500'
                  autoComplete="email"
                  placeholder='Es: roma@example.com'
                />
              </Field>
            </div>
          </div>

          {/* Services */}
          <div className='bg-white rounded-xl shadow-sm p-6 mb-6'>
            <h2 className='text-xl font-semibold text-neutral-900 mb-6'>Servizi Offerti</h2>
            
            <div className='grid gap-4 md:grid-cols-3'>
              <label className='flex items-center space-x-3 cursor-pointer'>
                <input
                  type='checkbox'
                  checked={branchData.delivery_enabled}
                  onChange={(e) => handleInputChange('delivery_enabled', e.target.checked)}
                  className='w-5 h-5 text-qorange-600 border-neutral-300 rounded focus:ring-qorange-500'
                />
                <div>
                  <div className='font-medium'>🚚 Delivery</div>
                  <div className='text-sm text-neutral-600'>Consegna a domicilio</div>
                </div>
              </label>

              <label className='flex items-center space-x-3 cursor-pointer'>
                <input
                  type='checkbox'
                  checked={branchData.takeaway_enabled}
                  onChange={(e) => handleInputChange('takeaway_enabled', e.target.checked)}
                  className='w-5 h-5 text-qorange-600 border-neutral-300 rounded focus:ring-qorange-500'
                />
                <div>
                  <div className='font-medium'>🥤 Takeaway</div>
                  <div className='text-sm text-neutral-600'>Ritiro presso il bar</div>
                </div>
              </label>

              <label className='flex items-center space-x-3 cursor-pointer'>
                <input
                  type='checkbox'
                  checked={branchData.table_service_enabled}
                  onChange={(e) => handleInputChange('table_service_enabled', e.target.checked)}
                  className='w-5 h-5 text-qorange-600 border-neutral-300 rounded focus:ring-qorange-500'
                />
                <div>
                  <div className='font-medium'>🪑 Servizio al Tavolo</div>
                  <div className='text-sm text-neutral-600'>Consumazione sul posto</div>
                </div>
              </label>
            </div>
          </div>

          {/* Status */}
          <div className='bg-white rounded-xl shadow-sm p-6 mb-6'>
            <h2 className='text-xl font-semibold text-neutral-900 mb-6'>Stato Filiale</h2>
            
            <Field label='Stato Operativo'>
              <select
                value={branchData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className='w-full md:w-1/2 px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qorange-500 focus:border-qorange-500'
              >
                <option value='active'>🟢 Attiva</option>
                <option value='inactive'>🔴 Inattiva</option>
                <option value='maintenance'>🟡 Manutenzione</option>
              </select>
            </Field>
          </div>

          {/* Actions */}
          <div className='flex flex-col sm:flex-row gap-4 justify-end'>
            <button
              type='button'
              onClick={() => navigate(`/branch/${id}`)}
              className='px-6 py-3 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 font-medium'
            >
              Annulla
            </button>
            <button
              type='submit'
              disabled={saving}
              className='px-6 py-3 bg-qorange-600 text-white rounded-lg hover:bg-qorange-700 disabled:opacity-50 font-medium'
            >
              {saving ? 'Salvataggio...' : 'Aggiorna Filiale'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}