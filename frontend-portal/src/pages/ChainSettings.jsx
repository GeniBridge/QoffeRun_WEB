import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import GoogleAddressAutocompleteSimple from '../components/GoogleAddressAutocompleteSimple'

const FileUpload = ({ label, accept, onChange, currentImage, required = false }) => {
  const [preview, setPreview] = useState(currentImage || null)
  const [uploading, setUploading] = useState(false)

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target.result)
    reader.readAsDataURL(file)

    // Upload file
    setUploading(true)
    try {
      await onChange(file)
    } catch (err) {
      console.error('Upload error:', err)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <label className='block text-sm font-medium text-neutral-700 mb-2'>
        {label} {required && <span className='text-red-500'>*</span>}
      </label>
      <div className='border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center'>
        {preview ? (
          <div className='space-y-4'>
            <img 
              src={preview} 
              alt='Preview' 
              className='mx-auto max-h-32 rounded-lg shadow-sm'
            />
            <div>
              <button
                type='button'
                onClick={() => document.getElementById(`file-${label.replace(/\s+/g, '-')}`).click()}
                className='px-4 py-2 text-sm bg-qorange-600 text-white rounded-lg hover:bg-qorange-700'
                disabled={uploading}
              >
                {uploading ? 'Caricamento...' : 'Cambia Immagine'}
              </button>
            </div>
          </div>
        ) : (
          <div className='space-y-2'>
            <div className='text-4xl text-neutral-400'>📁</div>
            <div>
              <button
                type='button'
                onClick={() => document.getElementById(`file-${label.replace(/\s+/g, '-')}`).click()}
                className='px-4 py-2 text-sm bg-qorange-600 text-white rounded-lg hover:bg-qorange-700'
                disabled={uploading}
              >
                {uploading ? 'Caricamento...' : 'Seleziona Immagine'}
              </button>
            </div>
            <p className='text-xs text-neutral-500'>
              PNG, JPG fino a 5MB
            </p>
          </div>
        )}
        <input
          id={`file-${label.replace(/\s+/g, '-')}`}
          type='file'
          accept={accept}
          onChange={handleFileChange}
          className='hidden'
        />
      </div>
    </div>
  )
}

export default function ChainSettings() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [chainData, setChainData] = useState({
    id: null,
    name: '',
    business_name: '',
    vat_number: '',
    tax_code: '',
    legal_address: '',
    billing_address: '',
    // New standardized legal address fields
    legal_via: '',
    legal_numero_civico: '',
    legal_citta: '',
    legal_provincia: '',
    legal_regione: '',
    legal_cap: '',
    legal_paese: 'Italia',
    legal_lat: null,
    legal_lng: null,
    // New standardized billing address fields
    billing_via: '',
    billing_numero_civico: '',
    billing_citta: '',
    billing_provincia: '',
    billing_regione: '',
    billing_cap: '',
    billing_paese: 'Italia',
    billing_lat: null,
    billing_lng: null,
    phone: '',
    email: '',
    pec_email: '',
    website: '',
    logo_path: '',
    cover_image_path: '',
    brand_logo_path: ''
  })

  useEffect(() => {
    loadChainData()
  }, [])

  const loadChainData = async () => {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      navigate('/login-chain-owner')
      return
    }

    try {
      const response = await fetch('https://api.qofferun.com/api/v1/chains/my-chains', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        const result = await response.json()
        const chains = result.data
        if (chains.length > 0) {
          const chain = chains[0] // Get first chain
          setChainData({
            id: chain.id, // Save chain ID for API calls
            name: chain.name || '',
            business_name: chain.business_name || '',
            vat_number: chain.vat_number || '',
            tax_code: chain.tax_code || '',
            legal_address: chain.legal_address || '',
            billing_address: chain.billing_address || '',
            phone: chain.phone || '',
            email: chain.email || '',
            pec_email: chain.pec_email || '',
            website: chain.website || '',
            logo_path: chain.logo_path || '',
            cover_image_path: chain.cover_image_path || '',
            brand_logo_path: chain.brand_logo_path || ''
          })
        }
      }
    } catch (err) {
      setError('Errore nel caricamento dei dati')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setChainData(prev => ({...prev, [field]: value}))
  }

  const handleImageUpload = async (file, imageType) => {
    const token = localStorage.getItem('auth_token')
    
    if (!chainData.id) {
      setError('ID catena non disponibile')
      return
    }
    
    const formData = new FormData()
    formData.append('image', file)
    formData.append('type', imageType)
    formData.append('chain_id', chainData.id)

    try {
      const response = await fetch('https://api.qofferun.com/api/v1/chains/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      })

      const result = await response.json()
      
      if (response.ok && result.success) {
        // Update the image path in local state
        setChainData(prev => ({
          ...prev,
          [`${imageType}_path`]: result.data.image_url
        }))
        setSuccess(result.message)
      } else {
        throw new Error(result.message || 'Errore nel caricamento')
      }
    } catch (err) {
      setError(`Errore nel caricamento dell'immagine: ${err.message}`)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const token = localStorage.getItem('auth_token')
    if (!token) {
      navigate('/login-chain-owner')
      return
    }

    try {
      const response = await fetch(`https://api.qofferun.com/api/v1/chains/${chainData.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chainData)
      })

      const result = await response.json()
      
      if (response.ok && result.success) {
        setSuccess('Profilo catena aggiornato con successo!')
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
          <div className='text-4xl mb-4'>🏢</div>
          <p className='text-neutral-600'>Caricamento impostazioni catena...</p>
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
            onClick={() => navigate('/chain-dashboard')}
            className='flex items-center gap-2 text-qorange-600 hover:text-qorange-700 mb-4'
          >
            ← Torna al Dashboard
          </button>
          <h1 className='text-3xl font-bold text-neutral-900'>Impostazioni Catena</h1>
          <p className='text-neutral-600 mt-2'>
            Gestisci le informazioni e le immagini della tua catena
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

        <form onSubmit={handleSubmit} className='space-y-8' autoComplete="off">
          {/* Images Section */}
          <div className='bg-white rounded-lg shadow p-6'>
            <h2 className='text-xl font-semibold mb-6'>Immagini della Catena</h2>
            
            <div className='grid md:grid-cols-3 gap-6'>
              <FileUpload
                label='Logo Principale'
                accept='image/*'
                currentImage={chainData.logo_path}
                onChange={(file) => handleImageUpload(file, 'logo')}
              />
              
              <FileUpload
                label='Cover Image'
                accept='image/*'
                currentImage={chainData.cover_image_path}
                onChange={(file) => handleImageUpload(file, 'cover')}
              />
              
              <FileUpload
                label='Brand Logo'
                accept='image/*'
                currentImage={chainData.brand_logo_path}
                onChange={(file) => handleImageUpload(file, 'brand_logo')}
              />
            </div>
          </div>

          {/* Basic Info */}
          <div className='bg-white rounded-lg shadow p-6'>
            <h2 className='text-xl font-semibold mb-6'>Informazioni Generali</h2>
            
            <div className='grid md:grid-cols-2 gap-6'>
              <div>
                <label className='block text-sm font-medium text-neutral-700 mb-2'>
                  Nome Catena *
                </label>
                <input
                  type='text'
                  value={chainData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className='w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qorange-500 focus:border-qorange-500'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-neutral-700 mb-2'>
                  Ragione Sociale
                </label>
                <input
                  type='text'
                  value={chainData.business_name}
                  onChange={(e) => handleInputChange('business_name', e.target.value)}
                  className='w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qorange-500 focus:border-qorange-500'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-neutral-700 mb-2'>
                  Partita IVA
                </label>
                <input
                  type='text'
                  value={chainData.vat_number}
                  onChange={(e) => handleInputChange('vat_number', e.target.value)}
                  className='w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qorange-500 focus:border-qorange-500'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-neutral-700 mb-2'>
                  Codice Fiscale
                </label>
                <input
                  type='text'
                  value={chainData.tax_code}
                  onChange={(e) => handleInputChange('tax_code', e.target.value)}
                  className='w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qorange-500 focus:border-qorange-500'
                />
              </div>

              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-neutral-700 mb-2'>
                  Indirizzo Legale
                </label>
                <GoogleAddressAutocompleteSimple
                  placeholder="Cerca e seleziona l'indirizzo legale della catena..."
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qorange-500 focus:border-qorange-500"
                  value={{
                    formatted_address: chainData.legal_address,
                    via: chainData.legal_via,
                    numero_civico: chainData.legal_numero_civico,
                    citta: chainData.legal_citta,
                    provincia: chainData.legal_provincia,
                    regione: chainData.legal_regione,
                    cap: chainData.legal_cap,
                    paese: chainData.legal_paese,
                    lat: chainData.legal_lat,
                    lng: chainData.legal_lng
                  }}
                  onChange={(addressData) => {
                    setChainData({
                      ...chainData,
                      legal_address: addressData.formatted_address,
                      legal_via: addressData.via,
                      legal_numero_civico: addressData.numero_civico,
                      legal_citta: addressData.citta,
                      legal_provincia: addressData.provincia,
                      legal_regione: addressData.regione,
                      legal_cap: addressData.cap,
                      legal_paese: addressData.paese,
                      legal_lat: addressData.lat,
                      legal_lng: addressData.lng
                    })
                  }}
                />
                {chainData.legal_via && (
                  <div className="mt-2 p-3 bg-neutral-50 rounded-lg">
                    <div className="text-sm text-neutral-600">
                      <strong>Indirizzo legale:</strong> {chainData.legal_via} {chainData.legal_numero_civico}, {chainData.legal_citta} ({chainData.legal_provincia}) {chainData.legal_cap}, {chainData.legal_regione}, {chainData.legal_paese}
                    </div>
                  </div>
                )}
              </div>

              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-neutral-700 mb-2'>
                  Indirizzo Fatturazione
                </label>
                <GoogleAddressAutocompleteSimple
                  placeholder="Cerca e seleziona l'indirizzo di fatturazione (lascia vuoto per usare quello legale)..."
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qorange-500 focus:border-qorange-500"
                  value={{
                    formatted_address: chainData.billing_address,
                    via: chainData.billing_via,
                    numero_civico: chainData.billing_numero_civico,
                    citta: chainData.billing_citta,
                    provincia: chainData.billing_provincia,
                    regione: chainData.billing_regione,
                    cap: chainData.billing_cap,
                    paese: chainData.billing_paese,
                    lat: chainData.billing_lat,
                    lng: chainData.billing_lng
                  }}
                  onChange={(addressData) => {
                    setChainData({
                      ...chainData,
                      billing_address: addressData.formatted_address,
                      billing_via: addressData.via,
                      billing_numero_civico: addressData.numero_civico,
                      billing_citta: addressData.citta,
                      billing_provincia: addressData.provincia,
                      billing_regione: addressData.regione,
                      billing_cap: addressData.cap,
                      billing_paese: addressData.paese,
                      billing_lat: addressData.lat,
                      billing_lng: addressData.lng
                    })
                  }}
                />
                {chainData.billing_via && (
                  <div className="mt-2 p-3 bg-neutral-50 rounded-lg">
                    <div className="text-sm text-neutral-600">
                      <strong>Indirizzo fatturazione:</strong> {chainData.billing_via} {chainData.billing_numero_civico}, {chainData.billing_citta} ({chainData.billing_provincia}) {chainData.billing_cap}, {chainData.billing_regione}, {chainData.billing_paese}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className='bg-white rounded-lg shadow p-6'>
            <h2 className='text-xl font-semibold mb-6'>Contatti</h2>
            
            <div className='grid md:grid-cols-2 gap-6'>
              <div>
                <label className='block text-sm font-medium text-neutral-700 mb-2'>
                  Telefono
                </label>
                <input
                  type='tel'
                  value={chainData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className='w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qorange-500 focus:border-qorange-500'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-neutral-700 mb-2'>
                  Email
                </label>
                <input
                  type='email'
                  value={chainData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className='w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qorange-500 focus:border-qorange-500'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-neutral-700 mb-2'>
                  PEC
                </label>
                <input
                  type='email'
                  value={chainData.pec_email}
                  onChange={(e) => handleInputChange('pec_email', e.target.value)}
                  className='w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qorange-500 focus:border-qorange-500'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-neutral-700 mb-2'>
                  Sito Web
                </label>
                <input
                  type='url'
                  value={chainData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className='w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qorange-500 focus:border-qorange-500'
                  placeholder='https://example.com'
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className='flex flex-col sm:flex-row gap-4 justify-end'>
            <button
              type='button'
              onClick={() => navigate('/chain-dashboard')}
              className='px-6 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50'
            >
              Annulla
            </button>
            <button
              type='submit'
              disabled={saving}
              className='px-6 py-2 bg-qorange-600 text-white rounded-lg hover:bg-qorange-700 disabled:opacity-50'
            >
              {saving ? 'Salvataggio...' : 'Salva Modifiche'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}