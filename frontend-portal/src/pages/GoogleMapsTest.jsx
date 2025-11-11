import React, { useState, useEffect } from 'react'
import { getGoogleMapsApiKey, loadGoogleMapsScript } from '../utils/api.js'

const GoogleMapsTest = () => {
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false)
  const [googleMapsError, setGoogleMapsError] = useState(null)
  const [addressData, setAddressData] = useState({
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
  })

  const [testAddresses] = useState([
    'Via Roma 123, Milano',
    'Piazza del Duomo, Firenze',
    'Via del Corso 456, Roma',
    'Via Garibaldi 78, Napoli',
    'Corso Buenos Aires 234, Milano',
    'Via Tornabuoni, Firenze',
    'Piazza Venezia, Roma',
    'Via Chiaia 90, Napoli',
    'Via Montenapoleone 12, Milano',
    'Borgo Ognissanti 45, Firenze'
  ])

  const [manualMode, setManualMode] = useState(false)
  const [testResults, setTestResults] = useState([])

  // Load Google Maps on component mount
  useEffect(() => {
    loadGoogleMapsAPI().catch(err => {
      console.error('Failed to load Google Maps:', err)
      setGoogleMapsError(err.message)
    })
  }, [])

  // Initialize autocomplete when Google Maps is loaded
  useEffect(() => {
    if (isGoogleMapsLoaded && window.google?.maps?.places?.Autocomplete) {
      initializeAutocomplete()
    }
  }, [isGoogleMapsLoaded])

  const loadGoogleMapsAPI = async () => {
    try {
      // Get API key using utility function
      const apiKey = await getGoogleMapsApiKey()
      
      // Load Google Maps script using utility function
      await loadGoogleMapsScript(apiKey)
      
      setIsGoogleMapsLoaded(true)
      
    } catch (error) {
      console.error('Failed to load Google Maps API:', error)
      throw error
    }
  }

  const initializeAutocomplete = () => {
    try {
      const input = document.getElementById('address-input')
      if (!input) return

      const autocomplete = new window.google.maps.places.Autocomplete(input, {
        types: ['address'],
        componentRestrictions: { country: 'IT' }
      })

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace()
        if (!place.address_components) return

        const addressComponents = {}
        place.address_components.forEach(component => {
          const type = component.types[0]
          addressComponents[type] = {
            long_name: component.long_name,
            short_name: component.short_name
          }
        })

        const getComponent = (types, nameType = 'long_name') => {
          for (const type of types) {
            if (addressComponents[type]) {
              return addressComponents[type][nameType]
            }
          }
          return ''
        }

        const newAddressData = {
          formatted_address: place.formatted_address || '',
          via: getComponent(['route']) || '',
          numero_civico: getComponent(['street_number']) || '',
          citta: getComponent(['locality', 'administrative_area_level_3']) || '',
          provincia: getComponent(['administrative_area_level_2'], 'short_name') || '',
          regione: getComponent(['administrative_area_level_1']) || '',
          cap: getComponent(['postal_code']) || '',
          paese: getComponent(['country']) || 'Italia',
          lat: place.geometry?.location?.lat() || null,
          lng: place.geometry?.location?.lng() || null,
          place_name: place.name || ''
        }

        handleAddressChange(newAddressData)
      })
    } catch (error) {
      console.error('Error initializing autocomplete:', error)
      setGoogleMapsError('Errore inizializzazione autocomplete: ' + error.message)
    }
  }

  const handleAddressChange = (newAddressData) => {
    console.log('📍 Address selected:', newAddressData)
    setAddressData(newAddressData)
    
    // Add to test results
    if (newAddressData.formatted_address) {
      setTestResults(prev => [...prev.slice(-4), {
        timestamp: new Date().toLocaleTimeString(),
        address: newAddressData
      }])
    }
  }

  const testAddress = (address) => {
    // Simulate typing the address
    const input = document.querySelector('input[placeholder*="Inizia a digitare"]')
    if (input) {
      input.value = address
      input.focus()
      
      // Trigger change event
      const event = new Event('input', { bubbles: true })
      input.dispatchEvent(event)
    }
  }

  const clearData = () => {
    setAddressData({
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
    })
    setTestResults([])
  }

  const Field = ({ label, value, className = "" }) => (
    <div className={`space-y-1 ${className}`}>
      <label className="block text-sm font-medium text-neutral-700">
        {label}
      </label>
      <input
        type="text"
        value={value || ''}
        readOnly
        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-sm"
        placeholder="Non specificato"
      />
    </div>
  )

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
                🗺️ Google Maps Autocomplete Test
              </h1>
              <p className="text-neutral-600 mt-1">
                Test dell'integrazione Google Maps con tutti i campi dell'indirizzo
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setManualMode(!manualMode)}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  manualMode 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
                }`}
              >
                {manualMode ? '🤖 Auto Mode' : '✏️ Manual Mode'}
              </button>
              <button
                onClick={clearData}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition-colors"
              >
                🗑️ Clear
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                📍 Ricerca Indirizzo
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Indirizzo completo
                  </label>
                  <input
                    id="address-input"
                    type="text"
                    placeholder={googleMapsError ? "Google Maps non disponibile" : (isGoogleMapsLoaded ? "Inizia a digitare l'indirizzo..." : "⏳ Caricamento Google Maps...")}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={!isGoogleMapsLoaded || googleMapsError}
                  />
                  {googleMapsError && (
                    <p className="text-red-600 text-sm mt-2">Errore: {googleMapsError}</p>
                  )}
                </div>

                {!manualMode && (
                  <div>
                    <h3 className="text-sm font-medium text-neutral-700 mb-3">
                      Indirizzi di test rapido:
                    </h3>
                    <div className="grid gap-2">
                      {testAddresses.map((address, index) => (
                        <button
                          key={index}
                          onClick={() => testAddress(address)}
                          className="text-left px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                        >
                          📍 {address}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* API Status */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                🔧 Status API
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    isGoogleMapsLoaded ? 'bg-green-500' : (googleMapsError ? 'bg-red-500' : 'bg-yellow-500')
                  }`} />
                  <span>Google API: {isGoogleMapsLoaded ? 'Loaded' : (googleMapsError ? 'Error' : 'Loading...')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    window.google?.maps ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span>Maps API: {window.google?.maps ? 'Available' : 'Not available'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    window.google?.maps?.places ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span>Places API: {window.google?.maps?.places ? 'Available' : 'Not available'}</span>
                </div>
                {googleMapsError && (
                  <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-red-700">
                    <strong>Errore:</strong> {googleMapsError}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                📋 Risultati Parsing
              </h2>
              
              <div className="grid gap-4">
                <Field label="Indirizzo Completo" value={addressData.formatted_address} />
                
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Via" value={addressData.via} />
                  <Field label="Numero Civico" value={addressData.numero_civico} />
                </div>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <Field label="Città" value={addressData.citta} />
                  <Field label="Provincia" value={addressData.provincia} />
                  <Field label="CAP" value={addressData.cap} />
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Regione" value={addressData.regione} />
                  <Field label="Paese" value={addressData.paese} />
                </div>

                {addressData.place_name && (
                  <Field label="Nome Luogo" value={addressData.place_name} />
                )}
                
                {(addressData.lat && addressData.lng) && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <Field label="Latitudine" value={addressData.lat?.toFixed(6)} />
                    <Field label="Longitudine" value={addressData.lng?.toFixed(6)} />
                  </div>
                )}
              </div>
            </div>

            {/* JSON Output */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                🔍 JSON Output
              </h2>
              <pre className="text-xs bg-neutral-50 p-4 rounded-lg overflow-auto max-h-60 border">
                {JSON.stringify(addressData, null, 2)}
              </pre>
            </div>

            {/* Recent Tests */}
            {testResults.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                  📊 Test Recenti
                </h2>
                <div className="space-y-3">
                  {testResults.map((result, index) => (
                    <div key={index} className="p-3 bg-neutral-50 rounded-lg">
                      <div className="text-xs text-neutral-500 mb-1">
                        {result.timestamp}
                      </div>
                      <div className="text-sm font-medium">
                        {result.address.formatted_address}
                      </div>
                      <div className="text-xs text-neutral-600 mt-1">
                        🏙️ {result.address.citta} ({result.address.provincia}) • 
                        📮 {result.address.cap} • 
                        🌍 {result.address.lat?.toFixed(4)}, {result.address.lng?.toFixed(4)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            📚 Come testare
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">🎯 Test Automatici:</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Clicca su uno degli indirizzi di test</li>
                <li>Osserva il parsing automatico dei campi</li>
                <li>Verifica coordinate GPS</li>
                <li>Controlla il JSON output</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">✏️ Test Manuali:</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Attiva "Manual Mode"</li>
                <li>Digita un indirizzo nel campo</li>
                <li>Seleziona dai suggerimenti</li>
                <li>Verifica tutti i campi estratti</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GoogleMapsTest