import React, { useState } from 'react'
import GoogleAddressAutocomplete from '../components/GoogleAddressAutocomplete'
import AddressDisplay from '../components/AddressDisplay'

export default function AddressDebugTest() {
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
    lng: null
  })

  const [validationResult, setValidationResult] = useState('')

  const validateAddress = (data) => {
    const required = ['via', 'citta', 'provincia', 'cap']
    const missing = required.filter(field => !data[field])
    
    if (missing.length === 0) {
      setValidationResult('✅ Tutti i campi obbligatori sono presenti')
      return true
    } else {
      setValidationResult(`❌ Campi mancanti: ${missing.join(', ')}`)
      return false
    }
  }

  const handleAddressChange = (data) => {
    console.log('🔍 Address data received:', data)
    setAddressData(data)
    validateAddress(data)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          🧪 Test Debug Indirizzo Google Maps
        </h1>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleziona un indirizzo:
          </label>
          <GoogleAddressAutocomplete
            placeholder="Cerca un indirizzo in Italia..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            onChange={handleAddressChange}
            required={true}
          />
        </div>

        {/* Validation Status */}
        {validationResult && (
          <div className={`p-3 rounded-lg mb-4 ${
            validationResult.includes('✅') 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <strong>{validationResult}</strong>
          </div>
        )}

        {/* Address Display */}
        <AddressDisplay 
          addressData={addressData} 
          title="🎯 Dati indirizzo catturati"
        />

        {/* Raw JSON Data */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">📋 Dati JSON grezzi:</h3>
          <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
            {JSON.stringify(addressData, null, 2)}
          </pre>
        </div>

        {/* Enhanced Debug Console Instructions */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-medium text-blue-700 mb-2">🔍 Enhanced Debug Console:</h3>
          <div className="text-xs text-blue-600 space-y-2">
            <p><strong>Apri la console del browser (F12 → Console)</strong></p>
            <p>Cerca questi log in ordine:</p>
            <ul className="ml-4 space-y-1">
              <li>• <code>🔍 Google Maps Place Data</code> - Dati grezzi dall'API</li>
              <li>• <code>📍 Address Components Raw</code> - Componenti indirizzo</li>
              <li>• <code>🏷️ Component: [type] = [value]</code> - Ogni componente</li>
              <li>• <code>✅ Found [type]: [value]</code> - Componenti trovati</li>
              <li>• <code>❌ Not found in types</code> - Componenti mancanti</li>
              <li>• <code>🔄 Attempting fallback parsing</code> - Parsing di fallback</li>
              <li>• <code>🎯 Final Address Data</code> - Risultato finale</li>
            </ul>
            <p><strong>Se vedi ❌ per citta/provincia/cap, copia tutti i log!</strong></p>
          </div>
        </div>

        {/* Field-by-field check */}
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">✅ Campi obbligatori:</h3>
            <div className="space-y-1 text-sm">
              {['via', 'citta', 'provincia', 'cap'].map(field => (
                <div key={field} className="flex justify-between">
                  <span className="capitalize">{field}:</span>
                  <span className={addressData[field] ? 'text-green-600 font-medium' : 'text-red-600'}>
                    {addressData[field] || '❌ Vuoto'}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">ℹ️ Campi opzionali:</h3>
            <div className="space-y-1 text-sm">
              {['numero_civico', 'regione', 'paese'].map(field => (
                <div key={field} className="flex justify-between">
                  <span className="capitalize">{field.replace('_', ' ')}:</span>
                  <span className={addressData[field] ? 'text-blue-600 font-medium' : 'text-gray-400'}>
                    {addressData[field] || '⚪ Vuoto'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Simulation of form validation */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-medium text-yellow-800 mb-2">🔧 Simulazione validazione form:</h3>
          <div className="text-sm text-yellow-700">
            <p><strong>Condizione:</strong> <code>!via || !citta || !provincia || !cap</code></p>
            <p><strong>Risultato:</strong> {
              !addressData.via || !addressData.citta || !addressData.provincia || !addressData.cap
                ? '❌ FALLISCE - "Tutti i campi sono obbligatori"'
                : '✅ PASSA - Form valido'
            }</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">📝 Istruzioni:</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p>1. Digita un indirizzo completo (es: "Via Giuseppe Garibaldi 78, Boscoreale")</p>
            <p>2. Seleziona un suggerimento dall'autocomplete</p>
            <p>3. Verifica che tutti i campi obbligatori siano compilati</p>
            <p>4. Se alcuni campi sono vuoti, prova con un indirizzo più specifico</p>
          </div>
        </div>
      </div>
    </div>
  )
}