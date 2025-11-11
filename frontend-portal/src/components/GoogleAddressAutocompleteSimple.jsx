import React, { useState, useRef, useEffect, useCallback } from 'react'
import { getGoogleMapsApiKey, loadGoogleMapsScript } from '../utils/api.js'

const GoogleAddressAutocompleteSimple = ({ 
  onChange, 
  value, 
  placeholder, 
  className, 
  required = false 
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  const loadGoogleMapsAPI = async () => {
    try {
      console.log('Loading Google Maps API...')
      
      // Get API key using utility function
      const apiKey = await getGoogleMapsApiKey()
      
      console.log('Google Maps API Key loaded:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NULL')
      
      // Load Google Maps using utility function
      await loadGoogleMapsScript(apiKey, {
        libraries: ['places'],
        language: 'it',
        region: 'IT'
      })
      
      console.log('Google Maps loaded successfully')
      
    } catch (error) {
      console.error('Error loading Google Maps:', error)
      throw new Error(`Errore configurazione Google Maps: ${error.message}`)
    }
  }

  const initializeAutocomplete = useCallback(async () => {
    try {
      if (!inputRef.current) return

      await loadGoogleMapsAPI()
      setIsLoading(true)

      console.log('🎯 Initializing simple autocomplete (working method)')

      if (!window.google?.maps?.places?.Autocomplete) {
        throw new Error('Google Places API non disponibile')
      }

      // SIMPLE APPROACH - exactly like the working test page
      const autocomplete = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ['address'],
          componentRestrictions: { country: 'IT' }
        }
      )

      // SIMPLE place_changed listener - exactly like test page
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace()
        console.log('📍 Place changed (simple):', place)
        
        if (!place.address_components) {
          console.warn('No address components')
          return
        }

        // Parse exactly like the test page
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

        const addressData = {
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

        console.log('✅ Parsed address data (simple):', addressData)
        console.log('📍 CRITICAL - Coordinates check:', {
          lat: addressData.lat,
          lng: addressData.lng,
          hasCoordinates: !!(addressData.lat && addressData.lng)
        })
        
        // Update input field
        if (inputRef.current) {
          inputRef.current.value = place.formatted_address
        }
        
        // Call onChange callback
        onChange(addressData)
      })

      setError(null)
      setIsLoading(false)
      console.log('✅ Simple autocomplete initialized successfully')
      
    } catch (error) {
      console.error('Errore inizializzazione Google Maps:', error)
      setError(`Errore Google Maps: ${error.message}`)
      setIsLoading(false)
    }
  }, [onChange])

  const handleInputChange = (e) => {
    const inputValue = e.target.value
    
    if (!inputValue) {
      onChange({
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
    }
  }

  // Update input value when value prop changes (for editing existing data)
  useEffect(() => {
    if (inputRef.current && value) {
      let displayAddress = value.formatted_address
      
      // If no formatted_address, create one from components
      if (!displayAddress && (value.via || value.citta)) {
        const parts = []
        if (value.via) {
          parts.push(value.numero_civico ? `${value.via} ${value.numero_civico}` : value.via)
        }
        if (value.citta) {
          const cityPart = value.cap ? `${value.cap} ${value.citta}` : value.citta
          parts.push(cityPart)
        }
        if (value.provincia) {
          parts.push(value.provincia)
        }
        if (value.paese && value.paese !== 'Italia') {
          parts.push(value.paese)
        }
        displayAddress = parts.join(', ')
      }
      
      if (displayAddress) {
        inputRef.current.value = displayAddress
      }
    }
  }, [value])

  useEffect(() => {
    if (inputRef.current) {
      // Delay initialization to avoid blocking the component mount
      const timer = setTimeout(() => {
        initializeAutocomplete().catch(err => {
          console.warn('Failed to initialize Google Maps autocomplete:', err)
          setError('Google Maps non disponibile')
          setIsLoading(false)
        })
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [initializeAutocomplete])

  if (error) {
    return (
      <div className="w-full">
        <input
          type="text"
          placeholder="Indirizzo (Google Maps non disponibile)"
          className={className || "w-full px-3 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"}
          required={required}
          autoComplete="off"
          onChange={(e) => {
            onChange({
              formatted_address: e.target.value,
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
          }}
        />
        <p className="text-red-500 text-sm mt-1">{error}</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="text"
        placeholder={isLoading ? "Caricamento Google Maps..." : (placeholder || "Inizia a digitare l'indirizzo...")}
        className={className || "w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-qorange-500 focus:border-qorange-500"}
        required={required}
        disabled={isLoading}
        onChange={handleInputChange}
        defaultValue=""
        // Disable browser autocomplete/autofill to prevent conflicts
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded="false"
      />
      {isLoading && (
        <p className="text-neutral-500 text-sm mt-1">⏳ Caricamento Google Maps...</p>
      )}
    </div>
  )
}

export default GoogleAddressAutocompleteSimple