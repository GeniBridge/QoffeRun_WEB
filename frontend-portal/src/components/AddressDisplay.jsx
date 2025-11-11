import React from 'react'

const AddressDisplay = ({ addressData, title = "Indirizzo selezionato" }) => {
  if (!addressData || (!addressData.via && !addressData.formatted_address)) {
    return null
  }

  return (
    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 className="text-sm font-semibold text-blue-800 mb-3">{title}</h3>
      
      {/* Raw formatted address - prominently displayed */}
      {addressData.formatted_address && (
        <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded">
          <strong className="text-sm text-green-700">📍 Indirizzo Google Maps:</strong>
          <div className="text-base font-medium text-green-900 mt-1">{addressData.formatted_address}</div>
        </div>
      )}
      
      {/* Standardized fields */}
      <div className="grid md:grid-cols-2 gap-3">
        <div className="space-y-2">
          <div className="flex justify-between items-center py-1 px-2 bg-white rounded border">
            <span className="text-xs font-medium text-gray-600">Via:</span>
            <span className="text-sm font-semibold text-gray-900">
              {addressData.via || <em className="text-red-500">Non trovata</em>}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-1 px-2 bg-white rounded border">
            <span className="text-xs font-medium text-gray-600">Numero civico:</span>
            <span className="text-sm font-semibold text-gray-900">
              {addressData.numero_civico || <em className="text-red-500">Non trovato</em>}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-1 px-2 bg-white rounded border">
            <span className="text-xs font-medium text-gray-600">Città:</span>
            <span className="text-sm font-semibold text-gray-900">
              {addressData.citta || <em className="text-red-500">Non trovata</em>}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-1 px-2 bg-white rounded border">
            <span className="text-xs font-medium text-gray-600">Provincia:</span>
            <span className="text-sm font-semibold text-gray-900">
              {addressData.provincia || <em className="text-red-500">Non trovata</em>}
            </span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center py-1 px-2 bg-white rounded border">
            <span className="text-xs font-medium text-gray-600">Regione:</span>
            <span className="text-sm font-semibold text-gray-900">
              {addressData.regione || <em className="text-red-500">Non trovata</em>}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-1 px-2 bg-white rounded border">
            <span className="text-xs font-medium text-gray-600">CAP:</span>
            <span className="text-sm font-semibold text-gray-900">
              {addressData.cap || <em className="text-red-500">Non trovato</em>}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-1 px-2 bg-white rounded border">
            <span className="text-xs font-medium text-gray-600">Paese:</span>
            <span className="text-sm font-semibold text-gray-900">
              {addressData.paese || 'Italia'}
            </span>
          </div>
          
          {addressData.lat && addressData.lng && (
            <div className="py-1 px-2 bg-white rounded border">
              <span className="text-xs font-medium text-gray-600">Coordinate:</span>
              <div className="text-sm font-semibold text-gray-900">
                Lat: {addressData.lat}<br />
                Lng: {addressData.lng}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Validation status */}
      <div className="mt-3 pt-2 border-t border-blue-200">
        <div className="text-xs font-medium text-blue-700">Campi obbligatori completati:</div>
        <div className="flex flex-wrap gap-1 mt-1">
          {['via', 'citta', 'provincia', 'cap'].map((field) => (
            <span
              key={field}
              className={`px-2 py-1 rounded text-xs font-medium ${
                addressData[field] 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {field}: {addressData[field] ? '✓' : '✗'}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AddressDisplay