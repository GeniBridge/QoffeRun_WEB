import React, { useState, useEffect } from 'react'
import { getGoogleMapsApiKey, loadGoogleMapsScript } from '../utils/api.js'

const GoogleMapsTestSimple = () => {
  const [status, setStatus] = useState('Initializing...')
  const [apiKey, setApiKey] = useState(null)
  const [googleMapsReady, setGoogleMapsReady] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadGoogleMapsTest()
  }, [])

  const loadGoogleMapsTest = async () => {
    try {
      setStatus('Loading API key...')
      
      // Get API key using utility function
      const apiKey = await getGoogleMapsApiKey()
      setApiKey(apiKey.substring(0, 15) + '...')
      
      setStatus('API key loaded, initializing Google Maps...')
      
      // Load Google Maps using utility function
      await loadGoogleMapsScript(apiKey)
      
      setGoogleMapsReady(true)
      setStatus('Google Maps loaded successfully!')
      
    } catch (err) {
      setError(err.message)
      setStatus('Error occurred')
    }
  }

  const testAutocomplete = () => {
    if (!window.google?.maps?.places?.Autocomplete) {
      setError('Autocomplete not available')
      return
    }
    
    try {
      const input = document.getElementById('test-input')
      const autocomplete = new window.google.maps.places.Autocomplete(input, {
        types: ['address'],
        componentRestrictions: { country: 'IT' }
      })
      
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace()
        console.log('Place selected:', place)
        setStatus(`Selected: ${place.formatted_address}`)
      })
      
      setStatus('Autocomplete initialized - try typing!')
      
    } catch (err) {
      setError('Autocomplete initialization error: ' + err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🗺️ Google Maps Test - Simple Version</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Status</h2>
          <div className="space-y-2">
            <p><strong>Current Status:</strong> {status}</p>
            <p><strong>API Key:</strong> {apiKey || 'Not loaded'}</p>
            <p><strong>Google Maps Ready:</strong> {googleMapsReady ? 'Yes' : 'No'}</p>
            {error && <p className="text-red-600"><strong>Error:</strong> {error}</p>}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">API Status Check</h2>
          <div className="space-y-2 text-sm">
            <p>Google object: {window.google ? '✅ Available' : '❌ Not available'}</p>
            <p>Maps API: {window.google?.maps ? '✅ Available' : '❌ Not available'}</p>
            <p>Places API: {window.google?.maps?.places ? '✅ Available' : '❌ Not available'}</p>
            <p>Autocomplete: {window.google?.maps?.places?.Autocomplete ? '✅ Available' : '❌ Not available'}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Test Autocomplete</h2>
          <div className="space-y-4">
            <input
              id="test-input"
              type="text"
              placeholder="Type an address..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!googleMapsReady}
            />
            <button
              onClick={testAutocomplete}
              disabled={!googleMapsReady}
              className={`px-4 py-2 rounded-lg ${
                googleMapsReady 
                  ? 'bg-blue-500 text-white hover:bg-blue-600' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Initialize Autocomplete
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mt-6">
          <h2 className="text-xl font-semibold mb-4">Direct API Test</h2>
          <button
            onClick={() => {
              fetch('/api/v1/settings/public/google_maps')
                .then(r => r.json())
                .then(d => {
                  console.log('Backend response:', d)
                  return fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=Milano,Italia&key=${d.api_key}`)
                })
                .then(r => r.json())
                .then(d => {
                  console.log('Geocoding response:', d)
                  setStatus(`Geocoding test: ${d.status}`)
                })
                .catch(e => setError('Direct API test failed: ' + e.message))
            }}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Test Direct API Call
          </button>
        </div>
      </div>
    </div>
  )
}

export default GoogleMapsTestSimple