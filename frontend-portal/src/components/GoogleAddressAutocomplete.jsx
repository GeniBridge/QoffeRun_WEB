import React, { useState, useRef, useEffect, useCallback } from 'react'
import { getGoogleMapsApiKey, loadGoogleMapsScript } from '../utils/api.js'

const GoogleAddressAutocomplete = ({ 
  onChange, 
  value, 
  placeholder, 
  className, 
  required = false 
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)
  const autocompleteRef = useRef(null)

  const loadGoogleMaps = async () => {
    try {
      console.log('Loading Google Maps API...')
      
      // Get API key using utility function
      const apiKey = await getGoogleMapsApiKey()
      
      console.log('Google Maps API Key loaded:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NULL')
      console.log('Current domain:', window.location.hostname)
      
      // Load Google Maps using utility function
      await loadGoogleMapsScript(apiKey, {
        libraries: ['places'],
        language: 'it',
        region: 'IT',
        timeout: 10000
      })
      
      console.log('Google Maps loaded successfully')
      
    } catch (error) {
      console.error('Error loading Google Maps:', error)
      throw new Error(`Errore configurazione Google Maps: ${error.message}`)
    }
  }

  const getAddressComponent = (components, types, nameType = 'long_name') => {
    for (const type of types) {
      if (components[type]) {
        const value = components[type][nameType]
        if (value) {
          console.log(`✅ Found ${type}: ${value}`)
          return value
        }
      }
    }
    console.log(`❌ Not found in types:`, types)
    return ''
  }

  const handlePlaceSelect = useCallback(() => {
    console.log('🎬 handlePlaceSelect TRIGGERED')
    
    if (!autocomplete) {
      console.error('❌ No autocomplete instance available')
      return
    }

    const place = autocomplete.getPlace()
    console.log('🔍 Google Maps Place Data:', place)
    
    if (!place || (!place.address_components && !place.formatted_address)) {
      console.warn('⚠️ No valid place data available')
      console.log('Place object keys:', place ? Object.keys(place) : 'place is null/undefined')
      return
    }
    
    if (!place.address_components) {
      console.warn('⚠️ No address_components but place exists, using formatted_address only')
      // Handle case where we only have formatted_address
      if (place.formatted_address) {
        const basicAddressData = {
          formatted_address: place.formatted_address,
          via: '',
          numero_civico: '',
          citta: '',
          provincia: '',
          regione: '',
          cap: '',
          paese: 'Italia',
          lat: place.geometry?.location?.lat() || null,
          lng: place.geometry?.location?.lng() || null,
          place_name: place.name || ''
        }
        
        console.log('📤 Sending basic address data:', basicAddressData)
        
        try {
          if (typeof onChange === 'function') {
            onChange(basicAddressData)
          }
        } catch (error) {
          console.error('❌ Error calling onChange:', error)
        }
        
        // Update input field
        if (inputRef.current) {
          inputRef.current.value = place.formatted_address
        }
      }
      return
    }

    console.log('📍 Address Components Raw:', place.address_components)

    const addressComponents = {}
    place.address_components.forEach(component => {
      const type = component.types[0]
      addressComponents[type] = {
        long_name: component.long_name,
        short_name: component.short_name
      }
      console.log(`🏷️ Component: ${type} = ${component.long_name} (${component.short_name})`)
    })

    console.log('📋 Processed Components:', addressComponents)

    console.log('📍 Raw formatted_address from Google:', place.formatted_address)
    
    const addressData = {
      formatted_address: place.formatted_address || '',
      via: getAddressComponent(addressComponents, ['route', 'street_address', 'establishment']) || '',
      numero_civico: getAddressComponent(addressComponents, ['street_number', 'subpremise']) || '',
      citta: getAddressComponent(addressComponents, [
        'locality', 
        'administrative_area_level_3', 
        'administrative_area_level_2',
        'sublocality', 
        'sublocality_level_1',
        'postal_town'
      ]) || '',
      provincia: getAddressComponent(addressComponents, [
        'administrative_area_level_2', 
        'administrative_area_level_1'
      ], 'short_name') || getAddressComponent(addressComponents, [
        'administrative_area_level_2', 
        'administrative_area_level_1'
      ]) || '',
      regione: getAddressComponent(addressComponents, [
        'administrative_area_level_1',
        'administrative_area_level_2'
      ]) || '',
      cap: getAddressComponent(addressComponents, ['postal_code', 'postal_code_prefix', 'postal_code_suffix']) || '',
      paese: getAddressComponent(addressComponents, ['country']) || 'Italia',
      lat: place.geometry?.location?.lat() || null,
      lng: place.geometry?.location?.lng() || null,
      place_name: place.name || ''
    }

    // Fallback parsing from formatted address if key fields are missing
    if (!addressData.citta && !addressData.cap && place.formatted_address) {
      console.log('� Attempting fallback parsing from formatted_address:', place.formatted_address)
      
      const addressParts = place.formatted_address.split(',').map(part => part.trim())
      console.log('📝 Address parts:', addressParts)
      
      // Try to extract CAP (5 digits) and city from formatted address
      addressParts.forEach((part, index) => {
        const capMatch = part.match(/\b\d{5}\b/)
        if (capMatch && !addressData.cap) {
          addressData.cap = capMatch[0]
          console.log('📮 Found CAP from formatted address:', addressData.cap)
          
          // City is usually in the same part as CAP or the part before
          const cityPart = part.replace(capMatch[0], '').trim()
          if (cityPart && !addressData.citta) {
            addressData.citta = cityPart
            console.log('🏙️ Found city from formatted address:', addressData.citta)
          } else if (index > 0 && !addressData.citta) {
            addressData.citta = addressParts[index - 1]
            console.log('🏙️ Found city from previous part:', addressData.citta)
          }
        }
      })
    }

    console.log('🎯 Final Address Data:', addressData)

    // Debug each field lookup with enhanced debugging
    console.log('🔍 Field Lookup Debug:', {
      via: addressData.via,
      numero_civico: addressData.numero_civico,
      citta: addressData.citta,
      provincia: addressData.provincia,
      cap: addressData.cap,
      lat: addressData.lat,
      lng: addressData.lng
    })

    // Always update the input field with formatted address
    if (inputRef.current && addressData.formatted_address) {
      inputRef.current.value = addressData.formatted_address
    }

    console.log('📤 Sending address data to parent:', addressData)
    
    try {
      if (typeof onChange === 'function') {
        console.log('✅ Calling onChange callback')
        onChange(addressData)
        console.log('✅ onChange callback completed')
      } else {
        console.error('❌ onChange is not a function:', typeof onChange)
      }
    } catch (error) {
      console.error('❌ Error calling onChange:', error)
    }
  }, [autocomplete, onChange])

  // Manual geocoding fallback using Google Geocoding API
  const manualGeocode = useCallback(async (address) => {
    console.log('🌍 Manual geocoding for:', address)
    
    try {
      const geocoder = new window.google.maps.Geocoder()
      geocoder.geocode(
        { 
          address: address,
          componentRestrictions: { country: 'IT' }
        },
        (results, status) => {
          if (status === 'OK' && results[0]) {
            console.log('✅ Manual geocoding successful:', results[0])
            
            // Parse the geocoding result like a place object
            const result = results[0]
            const addressComponents = {}
            
            result.address_components.forEach(component => {
              const type = component.types[0]
              addressComponents[type] = {
                long_name: component.long_name,
                short_name: component.short_name
              }
            })

            const addressData = {
              formatted_address: result.formatted_address || address,
              via: getAddressComponent(addressComponents, ['route', 'street_address', 'establishment']) || '',
              numero_civico: getAddressComponent(addressComponents, ['street_number', 'subpremise']) || '',
              citta: getAddressComponent(addressComponents, [
                'locality', 
                'administrative_area_level_3', 
                'administrative_area_level_2',
                'sublocality', 
                'sublocality_level_1',
                'postal_town'
              ]) || '',
              provincia: getAddressComponent(addressComponents, [
                'administrative_area_level_2', 
                'administrative_area_level_1'
              ], 'short_name') || '',
              regione: getAddressComponent(addressComponents, [
                'administrative_area_level_1'
              ]) || '',
              cap: getAddressComponent(addressComponents, ['postal_code']) || '',
              paese: getAddressComponent(addressComponents, ['country']) || 'Italia',
              lat: result.geometry?.location?.lat() || null,
              lng: result.geometry?.location?.lng() || null,
              place_name: result.name || ''
            }

            console.log('🎯 Manual geocoding result:', addressData)
            
            if (inputRef.current) {
              inputRef.current.value = addressData.formatted_address
            }
            
            onChange(addressData)
          } else {
            console.error('❌ Manual geocoding failed:', status)
          }
        }
      )
    } catch (error) {
      console.error('❌ Geocoding error:', error)
    }
  }, [onChange])

  // Monitor for address selection after input click
  const startSelectionMonitoring = useCallback(() => {
    let attempts = 0
    const maxAttempts = 20
    
    const monitorInterval = setInterval(() => {
      attempts++
      
      if (autocomplete && inputRef.current) {
        const currentValue = inputRef.current.value
        
        if (currentValue && currentValue.length > 15 && currentValue.includes(',')) {
          const place = autocomplete.getPlace()
          if (place && (place.address_components || place.formatted_address)) {
            console.log('🎯 Selection monitoring detected valid place')
            clearInterval(monitorInterval)
            handlePlaceSelect()
            return
          }
        }
      }
      
      if (attempts >= maxAttempts) {
        clearInterval(monitorInterval)
        console.log('⚠️ Selection monitoring timeout')
      }
    }, 100)
  }, [autocomplete, handlePlaceSelect])

  const startPlacePolling = useCallback(() => {
    if (pollingRef.current) clearInterval(pollingRef.current)
    
    let lastValue = inputRef.current?.value || ''
    
    pollingRef.current = setInterval(() => {
      if (autocomplete && inputRef.current) {
        const currentValue = inputRef.current.value
        
        // Check if value changed (Google autocomplete filled it)
        if (currentValue !== lastValue && currentValue.length > 10) {
          console.log('🔍 Value changed during polling:', lastValue, '->', currentValue)
          lastValue = currentValue
          
          setTimeout(() => {
            const place = autocomplete.getPlace()
            if (place && (place.address_components || place.formatted_address)) {
              console.log('🎯 Polling detected valid place after value change')
              handlePlaceSelect()
              stopPlacePolling()
            }
          }, 50)
        }
        
        // Also check if we have place data even without value change
        if (currentValue.length > 10) {
          const place = autocomplete.getPlace()
          if (place && (place.address_components || place.formatted_address)) {
            console.log('🔍 Polling detected valid place')
            handlePlaceSelect()
            stopPlacePolling()
          }
        }
      }
    }, 50) // Check every 50ms for faster response
  }, [autocomplete, handlePlaceSelect])

  const stopPlacePolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
  }, [])

  const initializeAutocomplete = useCallback(async () => {
    if (!inputRef.current || autocomplete) return

    try {
      setIsLoading(true)
      await loadGoogleMaps()

      console.log('Checking Google Places API availability...')
      console.log('window.google:', !!window.google)
      console.log('window.google.maps:', !!window.google?.maps)
      console.log('window.google.maps.places:', !!window.google?.maps?.places)
      console.log('window.google.maps.places.Autocomplete:', !!window.google?.maps?.places?.Autocomplete)

      if (!window.google?.maps?.places?.Autocomplete) {
        console.error('Google Places API not available. Available APIs:', Object.keys(window.google?.maps || {}))
        throw new Error('Google Places API non disponibile')
      }

      const autocompleteInstance = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ['address'],
          componentRestrictions: { country: 'IT' },
          fields: ['address_components', 'formatted_address', 'geometry', 'name', 'place_id'],
          // Disable geolocation and browser location services completely
          bounds: null,
          strictBounds: false,
          // Prevent any automatic location detection
          placeIdOnly: false
        }
      )

      // NUCLEAR OPTION: Force place_changed event manually
      const forceFirePlaceChanged = () => {
        console.log('🚀 FORCING place_changed event manually')
        window.google.maps.event.trigger(autocompleteInstance, 'place_changed')
      }
      
      // Disable geolocation entirely by removing location bias
      autocompleteInstance.setBounds(null)

      console.log('🎯 Adding place_changed listener')
      autocompleteInstance.addListener('place_changed', handlePlaceSelect)
      console.log('✅ place_changed listener added successfully')

      // CRITICAL FIX: Force immediate place detection on any selection
      const forceSelectionDetection = () => {
        const place = autocompleteInstance.getPlace()
        if (place && (place.address_components || place.formatted_address)) {
          console.log('🎯 FORCE: Valid place detected, triggering handler')
          handlePlaceSelect()
          return true
        }
        return false
      }

      // Override Google's methods to catch internal calls
      const originalGetPlace = autocompleteInstance.getPlace
      autocompleteInstance.getPlace = function() {
        const place = originalGetPlace.call(this)
        if (place && (place.address_components || place.formatted_address)) {
          console.log('🎯 getPlace() intercepted with valid data')
          setTimeout(() => handlePlaceSelect(), 10)
        }
        return place
      }

      // Direct container click detection with immediate response
      const setupDirectClickHandler = () => {
        // Remove any existing listeners first
        const existingHandler = document.querySelector('[data-qofferun-click-handler]')
        if (existingHandler) {
          existingHandler.remove()
        }

        // Create invisible overlay to catch clicks
        const clickCatcher = document.createElement('div')
        clickCatcher.setAttribute('data-qofferun-click-handler', 'true')
        clickCatcher.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          pointer-events: none;
          z-index: 9999;
        `
        
        clickCatcher.addEventListener('click', (e) => {
          const target = e.target
          if (target.closest('.pac-container') || target.classList.contains('pac-item')) {
            console.log('🎯 DIRECT: Click intercepted on Google Maps suggestion')
            
            // Multiple immediate attempts
            setTimeout(() => forceSelectionDetection(), 0)
            setTimeout(() => forceSelectionDetection(), 50)
            setTimeout(() => forceSelectionDetection(), 100)
            setTimeout(() => forceSelectionDetection(), 200)
          }
        }, true)

        document.body.appendChild(clickCatcher)
        console.log('🚀 Direct click handler installed')
      }

      setupDirectClickHandler()
      
      // Also add direct input event listeners as backup
      if (inputRef.current) {
        console.log('🎯 Adding backup input event listeners')
        
        // Listen for keyboard selection (Enter key)
        inputRef.current.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            console.log('⌨️ Enter key pressed, checking for place')
            setTimeout(handlePlaceSelect, 50) // Faster response
          }
        })
        
        // Listen for mouse clicks on suggestions - use mousedown for faster detection
        inputRef.current.addEventListener('mousedown', (e) => {
          console.log('�️ Mouse down event, checking for place')
          setTimeout(handlePlaceSelect, 100) // Small delay for Google to process click
        })
        
        // Keep blur as fallback but with faster timing
        inputRef.current.addEventListener('blur', (e) => {
          console.log('👆 Input blur event, checking for place')
          setTimeout(handlePlaceSelect, 50) // Faster response
        })
        
        // Add focus listener to start aggressive polling
        inputRef.current.addEventListener('focus', () => {
          console.log('🎯 Input focused, starting place polling')
          startPlacePolling()
        })
        
        // Stop polling when input loses focus (with delay to catch selection)
        inputRef.current.addEventListener('blur', () => {
          console.log('👋 Input blurred, checking once more then stopping polling')
          // Check immediately on blur
          setTimeout(() => {
            const place = autocomplete.getPlace()
            if (place && (place.address_components || place.formatted_address)) {
              console.log('🎯 Found place on blur')
              handlePlaceSelect()
            }
            stopPlacePolling()
          }, 100)
        })
        
        // Monitor for programmatic value changes (Google Maps autocomplete)
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'value') {
              console.log('🔍 Input value changed programmatically')
              setTimeout(() => {
                const place = autocomplete.getPlace()
                if (place && (place.address_components || place.formatted_address)) {
                  console.log('🎯 Found place after programmatic change')
                  handlePlaceSelect()
                }
              }, 50)
            }
          })
        })
        
        observer.observe(inputRef.current, {
          attributes: true,
          attributeFilter: ['value']
        })
        
        console.log('✅ Backup listeners added')
      }
      
      setAutocomplete(autocompleteInstance)
      setError(null)
      console.log('✅ Autocomplete instance set successfully')

      // SIMPLE BUT EFFECTIVE: Monitor any clicks anywhere and force check
      const universalClickHandler = (e) => {
        // If any click happens anywhere, check if our input now has a complete address
        setTimeout(() => {
          if (inputRef.current && inputRef.current.value) {
            const currentValue = inputRef.current.value
            console.log('� Universal click - checking input value:', currentValue)
            
            if (currentValue.length > 10 && (currentValue.includes(',') || currentValue.includes(' '))) {
              console.log('🎯 Complete address detected after universal click')
              
              // Force trigger the place_changed event
              forceFirePlaceChanged()
              
              // Also try direct place lookup
              try {
                const place = autocompleteInstance.getPlace()
                if (place && (place.formatted_address || place.address_components)) {
                  console.log('✅ Valid place found after universal click')
                  handlePlaceSelect()
                } else {
                  console.log('⚠️ No place data yet, will try geocoding')
                  // If no place data, try geocoding the address directly
                  geocodeAddress(currentValue)
                }
              } catch (error) {
                console.log('❌ Error getting place:', error)
                // Fallback to geocoding
                geocodeAddress(currentValue)
              }
            }
          }
        }, 100)
      }

      // Add universal click listener
      document.addEventListener('click', universalClickHandler)
      document.addEventListener('mouseup', universalClickHandler)
      
      console.log('🌐 Universal click monitoring active')

      // ADDITIONAL FIX: Watch for input value changes from Google Maps
      if (inputRef.current) {
        let lastInputValue = inputRef.current.value
        const inputWatcher = new MutationObserver(() => {
          const currentValue = inputRef.current?.value || ''
          if (currentValue !== lastInputValue && currentValue.length > 10) {
            console.log('🔍 Input value changed by Google Maps:', lastInputValue, '->', currentValue)
            lastInputValue = currentValue
            setTimeout(() => handlePlaceSelect(), 100)
          }
        })

        // Watch for changes to the input element
        inputWatcher.observe(inputRef.current, {
          attributes: true,
          childList: true,
          subtree: true,
          characterData: true
        })

        // Also watch the input value property directly
        const originalValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')
        Object.defineProperty(inputRef.current, 'value', {
          get: originalValue.get,
          set: function(newValue) {
            if (newValue !== lastInputValue && newValue && newValue.length > 10) {
              console.log('🎯 Value set programmatically by Google Maps:', newValue)
              lastInputValue = newValue
              setTimeout(() => handlePlaceSelect(), 150)
            }
            return originalValue.set.call(this, newValue)
          }
        })

        console.log('🔍 Input value monitoring active')

        // CRITICAL: Manual geocoding fallback when autocomplete fails
        let debounceTimeout
        inputRef.current.addEventListener('input', (e) => {
          const value = e.target.value
          console.log('📝 Direct input event:', value)
          
          clearTimeout(debounceTimeout)
          debounceTimeout = setTimeout(() => {
            if (value && value.length > 10 && value.includes(',')) {
              console.log('🎯 Complete address detected, checking autocomplete first')
              
              // First try autocomplete
              if (autocompleteInstance) {
                const place = autocompleteInstance.getPlace()
                if (place && (place.address_components || place.formatted_address)) {
                  console.log('✅ Valid place found in autocomplete')
                  handlePlaceSelect()
                  return
                }
              }
              
              // Fallback: Manual geocoding
              console.log('🔄 Autocomplete failed, trying manual geocoding')
              manualGeocode(value)
            }
          }, 200)
        })

        // Add direct click monitoring on the input itself
        inputRef.current.addEventListener('click', () => {
          console.log('📍 Input clicked - starting selection monitoring')
          startSelectionMonitoring()
        })
      }
    } catch (error) {
      console.error('Errore inizializzazione Google Maps:', error)
      setError(`Errore Google Maps: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }, [handlePlaceSelect])

  const handleInputChange = (e) => {
    const inputValue = e.target.value
    console.log('📝 Input changed:', inputValue)
    
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
    } else {
      // Check immediately if this looks like a complete address
      if (inputValue.length > 15 && inputValue.includes(',')) {
        console.log('🎯 Detected complete address format, checking immediately')
        setTimeout(() => {
          if (autocomplete) {
            const place = autocomplete.getPlace()
            if (place && (place.address_components || place.formatted_address)) {
              console.log('✅ Found place data immediately')
              handlePlaceSelect()
            } else {
              console.log('⚠️ No place data yet, will try polling')
            }
          }
        }, 50) // Very fast check
      }
      
      // Also keep the delayed check as backup
      setTimeout(() => {
        if (autocomplete && inputRef.current && inputRef.current.value === inputValue) {
          console.log('🔄 Checking for place after input delay')
          const place = autocomplete.getPlace()
          if (place && (place.address_components || place.formatted_address)) {
            console.log('🎯 Found place after input delay')
            handlePlaceSelect()
          }
        }
      }, 300)
    }
  }

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
    return () => {
      stopPlacePolling()
      if (autocomplete && window.google?.maps?.event?.clearInstanceListeners) {
        window.google.maps.event.clearInstanceListeners(autocomplete)
      }
    }
  }, [autocomplete, stopPlacePolling])

  if (error) {
    return (
      <div className="w-full">
        <input
          type="text"
          placeholder="Indirizzo (Google Maps non disponibile)"
          className={className || "w-full px-3 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"}
          required={required}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
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

export default GoogleAddressAutocomplete
