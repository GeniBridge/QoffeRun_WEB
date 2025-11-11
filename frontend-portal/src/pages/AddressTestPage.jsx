import React, { useState } from 'react'
import GoogleAddressAutocomplete from '../components/GoogleAddressAutocomplete'

export default function AddressTestPage() {
  const [selectedAddress, setSelectedAddress] = useState({})

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-8 text-center">
            Test Indirizzo Standardizzato
          </h1>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Seleziona un indirizzo:
              </label>
              <GoogleAddressAutocomplete
                placeholder="Cerca un indirizzo in Italia..."
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qorange-500 focus:border-qorange-500"
                onChange={(addressData) => {
                  console.log('Address selected:', addressData)
                  setSelectedAddress(addressData)
                }}
              />
            </div>

            {selectedAddress.via && (
              <div className="mt-6 p-6 bg-qorange-50 border border-qorange-200 rounded-lg">
                <h2 className="text-lg font-semibold text-qorange-900 mb-4">
                  ✅ Indirizzo Selezionato (Formato Standardizzato)
                </h2>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div>
                      <strong className="text-qorange-800">Via:</strong>
                      <span className="ml-2 text-neutral-700">{selectedAddress.via}</span>
                    </div>
                    <div>
                      <strong className="text-qorange-800">Numero Civico:</strong>
                      <span className="ml-2 text-neutral-700">{selectedAddress.numero_civico}</span>
                    </div>
                    <div>
                      <strong className="text-qorange-800">Città:</strong>
                      <span className="ml-2 text-neutral-700">{selectedAddress.citta}</span>
                    </div>
                    <div>
                      <strong className="text-qorange-800">Provincia:</strong>
                      <span className="ml-2 text-neutral-700">{selectedAddress.provincia}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <strong className="text-qorange-800">Regione:</strong>
                      <span className="ml-2 text-neutral-700">{selectedAddress.regione}</span>
                    </div>
                    <div>
                      <strong className="text-qorange-800">CAP:</strong>
                      <span className="ml-2 text-neutral-700">{selectedAddress.cap}</span>
                    </div>
                    <div>
                      <strong className="text-qorange-800">Paese:</strong>
                      <span className="ml-2 text-neutral-700">{selectedAddress.paese}</span>
                    </div>
                    {selectedAddress.lat && selectedAddress.lng && (
                      <div>
                        <strong className="text-qorange-800">Coordinate:</strong>
                        <span className="ml-2 text-neutral-700">
                          {selectedAddress.lat}, {selectedAddress.lng}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 p-4 bg-white rounded-lg">
                  <strong className="text-qorange-800">Indirizzo Completo:</strong>
                  <div className="mt-2 text-neutral-700 font-mono text-sm bg-neutral-100 p-3 rounded">
                    {selectedAddress.formatted_address}
                  </div>
                </div>

                <div className="mt-4">
                  <strong className="text-qorange-800">JSON per Database:</strong>
                  <pre className="mt-2 text-xs bg-neutral-900 text-green-400 p-4 rounded overflow-x-auto">
{JSON.stringify({
  via: selectedAddress.via,
  numero_civico: selectedAddress.numero_civico,
  citta: selectedAddress.citta,
  provincia: selectedAddress.provincia,
  regione: selectedAddress.regione,
  cap: selectedAddress.cap,
  paese: selectedAddress.paese,
  lat: selectedAddress.lat,
  lng: selectedAddress.lng
}, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {!selectedAddress.via && (
              <div className="mt-6 p-6 bg-neutral-100 border border-neutral-300 rounded-lg text-center">
                <p className="text-neutral-600">
                  📍 Seleziona un indirizzo per vedere il formato standardizzato
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}