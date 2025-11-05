import React, { useRef, useEffect } from 'react'

const GoogleAddressAutocomplete = ({ value, onChange, placeholder, required, className }) => {
  const inputRef = useRef(null)
  const autocompleteRef = useRef(null)

  useEffect(() => {
    // Carica l'API Google Maps se non è già caricata
    if (!window.google) {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places&language=it&region=IT`
      script.async = true
      script.defer = true
      script.onload = initializeAutocomplete
      document.head.appendChild(script)
    } else {
      initializeAutocomplete()
    }

    return () => {
      if (autocompleteRef.current && window.google) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current)
      }
    }
  }, [])

  const initializeAutocomplete = () => {
    if (!window.google || !inputRef.current) return

    // Inizializza l'autocomplete limitato all'Italia
    autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['address'],
      componentRestrictions: { country: 'it' },
      fields: ['address_components', 'formatted_address', 'geometry', 'name']
    })

    // Listener per quando viene selezionato un indirizzo
    autocompleteRef.current.addListener('place_changed', handlePlaceSelect)
  }

  const handlePlaceSelect = () => {
    const place = autocompleteRef.current.getPlace()
    
    if (!place.address_components) {
      console.warn('Nessun dettaglio disponibile per questo indirizzo')
      return
    }

    // Estrai i componenti dell'indirizzo
    const addressComponents = {}
    place.address_components.forEach(component => {
      const type = component.types[0]
      addressComponents[type] = {
        long_name: component.long_name,
        short_name: component.short_name
      }
    })

    // Costruisci l'oggetto indirizzo strutturato
    const addressData = {
      // Indirizzo completo formattato
      formatted_address: place.formatted_address || '',
      
      // Componenti specifici per l'Italia
      via: getAddressComponent(addressComponents, ['route']) || '',
      numero_civico: getAddressComponent(addressComponents, ['street_number']) || '',
      citta: getAddressComponent(addressComponents, ['locality', 'administrative_area_level_3']) || '',
      provincia: getAddressComponent(addressComponents, ['administrative_area_level_2'], 'short_name') || '',
      regione: getAddressComponent(addressComponents, ['administrative_area_level_1']) || '',
      cap: getAddressComponent(addressComponents, ['postal_code']) || '',
      paese: getAddressComponent(addressComponents, ['country']) || 'Italia',
      
      // Coordinate geografiche
      lat: place.geometry?.location?.lat() || null,
      lng: place.geometry?.location?.lng() || null,
      
      // Nome del luogo (se disponibile)
      place_name: place.name || ''
    }

    // Chiama la funzione onChange con i dati strutturati
    onChange(addressData)
    
    // Aggiorna il valore dell'input con l'indirizzo formattato
    if (inputRef.current) {
      inputRef.current.value = place.formatted_address
    }
  }

  // Funzione helper per estrarre componenti specifici dell'indirizzo
  const getAddressComponent = (components, types, nameType = 'long_name') => {
    for (const type of types) {
      if (components[type]) {
        return components[type][nameType]
      }
    }
    return ''
  }

  const handleInputChange = (e) => {
    // Permetti la digitazione manuale ma non triggerare onChange finché non viene selezionato un indirizzo
    const inputValue = e.target.value
    
    // Se l'utente cancella completamente l'input, resetta i dati
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

  return (
    <input
      ref={inputRef}
      type="text"
      placeholder={placeholder || "Inizia a digitare l'indirizzo..."}
      className={className || "w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-qorange-500 focus:border-qorange-500"}
      required={required}
      onChange={handleInputChange}
      defaultValue={value?.formatted_address || ''}
    />
  )
}

export default GoogleAddressAutocomplete