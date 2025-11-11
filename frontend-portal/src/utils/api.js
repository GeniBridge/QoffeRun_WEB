/**
 * API Utility functions for QoffeRun frontend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.qofferun.com'

/**
 * Makes a safe API call with proper error handling
 * @param {string} endpoint - API endpoint (e.g., '/api/v1/settings/public/google_maps')
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} - Parsed JSON response
 */
export const apiCall = async (endpoint, options = {}) => {
  try {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    // Check if response is OK
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    // Check if response is JSON
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text()
      throw new Error(`Server returned non-JSON response: ${text.substring(0, 200)}`)
    }

    const data = await response.json()
    return data

  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error)
    throw error
  }
}

/**
 * Makes an authenticated API call
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} - Parsed JSON response
 */
export const authenticatedApiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('auth_token')
  
  if (!token) {
    throw new Error('No authentication token available')
  }

  return apiCall(endpoint, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  })
}

/**
 * Gets the Google Maps API key from backend
 * @returns {Promise<string>} - API key
 */
export const getGoogleMapsApiKey = async () => {
  try {
    const data = await apiCall('/api/v1/settings/public/google_maps')
    
    if (!data.api_key) {
      throw new Error('No API key available in response')
    }

    return data.api_key
  } catch (error) {
    console.error('Failed to load Google Maps API key:', error)
    throw new Error(`Google Maps API key not available: ${error.message}`)
  }
}

/**
 * Loads Google Maps JavaScript API
 * @param {string} apiKey - Google Maps API key
 * @param {Object} options - Loading options
 * @returns {Promise<void>}
 */
export const loadGoogleMapsScript = (apiKey, options = {}) => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.google?.maps?.places) {
      resolve()
      return
    }

    // Check if script is already loading
    if (window.googleMapsLoading) {
      // Wait for existing load
      const checkInterval = setInterval(() => {
        if (window.google?.maps?.places) {
          clearInterval(checkInterval)
          resolve()
        } else if (!window.googleMapsLoading) {
          clearInterval(checkInterval)
          reject(new Error('Google Maps loading failed'))
        }
      }, 100)
      return
    }

    window.googleMapsLoading = true

    const {
      libraries = ['places'],
      language = 'it',
      region = 'IT',
      timeout = 15000,
    } = options

    // Global error handler for auth failures
    window.gm_authFailure = () => {
      window.googleMapsLoading = false
      reject(new Error('Google Maps authentication failed. Check API key and domain restrictions.'))
    }

    // Create callback name
    const callbackName = `initGoogleMaps_${Date.now()}`

    window[callbackName] = () => {
      window.googleMapsLoading = false
      
      if (window.google?.maps?.places) {
        delete window[callbackName]
        resolve()
      } else {
        reject(new Error('Google Maps loaded but Places API not available'))
      }
    }

    // Create script
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${libraries.join(',')}&language=${language}&region=${region}&callback=${callbackName}`
    script.async = true
    script.defer = true

    script.onerror = () => {
      window.googleMapsLoading = false
      delete window[callbackName]
      reject(new Error('Failed to load Google Maps script'))
    }

    // Add timeout
    const timeoutId = setTimeout(() => {
      if (window[callbackName]) {
        window.googleMapsLoading = false
        delete window[callbackName]
        reject(new Error(`Google Maps loading timeout after ${timeout}ms`))
      }
    }, timeout)

    // Clean up timeout when resolved
    const originalCallback = window[callbackName]
    window[callbackName] = () => {
      clearTimeout(timeoutId)
      originalCallback()
    }

    document.head.appendChild(script)
  })
}

export default {
  apiCall,
  authenticatedApiCall,
  getGoogleMapsApiKey,
  loadGoogleMapsScript,
}