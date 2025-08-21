// src/views/pages/Impostazioni.js
import React, { useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CFormTextarea,
  CButton,
  CAlert,
} from '@coreui/react'
// ✅ Removed: import { CLoadingButton } from '@coreui/react-pro' (PRO-only)
import CIcon from '@coreui/icons-react'
import { cilSave, cilWarning } from '@coreui/icons'

const Impostazioni = () => {
  const [form, setForm] = useState({
    stripePublishableKey: '',
    stripeSecretKey: '',
    googleMapsApiKey: '',
    notificationServerKey: '', // Firebase FCM Server Key
    webhookUrl: '',
  })

  const [errors, setErrors] = useState({})
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!form.stripeSecretKey.trim()) {
      newErrors.stripeSecretKey = 'Stripe Secret Key è obbligatoria'
    }
    if (!form.googleMapsApiKey.trim()) {
      newErrors.googleMapsApiKey = 'Google Maps API Key è obbligatoria'
    }
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setErrors({ submit: 'Errore durante il salvataggio delle impostazioni.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2>⚙️ Impostazioni di Sistema</h2>

      {saved && (
        <CAlert color="success" dismissible onClose={() => setSaved(false)}>
          ✅ Impostazioni salvate con successo!
        </CAlert>
      )}

      {errors.submit && <CAlert color="danger">{errors.submit}</CAlert>}

      <CCard className="mt-4">
        <CCardHeader>
          <strong>Integrazioni API</strong>
        </CCardHeader>
        <CCardBody>
          <CForm onSubmit={handleSubmit}>
            {/* Stripe Settings */}
            <h5>💳 Stripe</h5>
            <div className="mb-3">
              <CFormLabel htmlFor="stripePublishableKey">Stripe Publishable Key</CFormLabel>
              <CFormInput
                type="text"
                id="stripePublishableKey"
                name="stripePublishableKey"
                value={form.stripePublishableKey}
                onChange={handleChange}
                placeholder="pk_test_..."
              />
            </div>
            <div className="mb-4">
              <CFormLabel htmlFor="stripeSecretKey">Stripe Secret Key</CFormLabel>
              <CFormInput
                type="password"
                id="stripeSecretKey"
                name="stripeSecretKey"
                value={form.stripeSecretKey}
                onChange={handleChange}
                placeholder="sk_test_..."
              />
              {errors.stripeSecretKey && (
                <CAlert color="danger" className="mt-2">
                  {errors.stripeSecretKey}
                </CAlert>
              )}
            </div>

            <hr className="my-4" />

            {/* Google Maps */}
            <h5>🗺️ Google Maps & Autocomplete</h5>
            <div className="mb-4">
              <CFormLabel htmlFor="googleMapsApiKey">Google Maps API Key</CFormLabel>
              <CFormInput
                type="text"
                id="googleMapsApiKey"
                name="googleMapsApiKey"
                value={form.googleMapsApiKey}
                onChange={handleChange}
                placeholder="AIzaSy..."
              />
              {errors.googleMapsApiKey && (
                <CAlert color="danger" className="mt-2">
                  {errors.googleMapsApiKey}
                </CAlert>
              )}
              <small className="text-muted">
                Usata per geolocalizzazione e autocomplete indirizzo nei form.
              </small>
            </div>

            <hr className="my-4" />

            {/* Push Notifications */}
            <h5>🔔 Notifiche Push (Mobile Apps)</h5>
            <div className="mb-4">
              <CFormLabel htmlFor="notificationServerKey">Firebase Server Key (FCM)</CFormLabel>
              <CFormTextarea
                id="notificationServerKey"
                name="notificationServerKey"
                value={form.notificationServerKey}
                onChange={handleChange}
                rows="3"
                placeholder="AAAA... (Server Key da Firebase Cloud Messaging)"
              />
              <small className="text-muted">
                Per inviare notifiche push alle app dei baristi o clienti.
              </small>
            </div>

            <div className="mb-4">
              <CFormLabel htmlFor="webhookUrl">URL Webhook per Notifiche</CFormLabel>
              <CFormInput
                type="url"
                id="webhookUrl"
                name="webhookUrl"
                value={form.webhookUrl}
                onChange={handleChange}
                placeholder="https://api.yourapp.com/webhook"
              />
              <small className="text-muted">
                Endpoint dove inviare eventi in tempo reale (es. nuovi ordini).
              </small>
            </div>

            {/* Save Button - Free Version */}
            <CButton type="submit" color="primary" disabled={loading}>
              {loading ? (
                <>
                  <CIcon icon={cilWarning} spin /> Salvataggio...
                </>
              ) : (
                <>
                  <CIcon icon={cilSave} /> Salva Impostazioni
                </>
              )}
            </CButton>
          </CForm>
        </CCardBody>
      </CCard>
    </div>
  )
}

export default Impostazioni
