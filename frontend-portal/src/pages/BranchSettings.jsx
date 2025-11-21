import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'

const TabButton = ({ active, onClick, children, icon }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
      active 
        ? 'bg-qorange-500 text-white shadow-sm' 
        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
    }`}
  >
    <span className="text-lg">{icon}</span>
    {children}
  </button>
)

const Field = ({ label, children, required, description }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-neutral-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {description && (
      <p className="text-xs text-neutral-500">{description}</p>
    )}
  </div>
)

const Card = ({ title, children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border p-6 ${className}`}>
    {title && (
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">{title}</h3>
    )}
    {children}
  </div>
)

export default function BranchSettings() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState('fiscal')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [branch, setBranch] = useState(null)
  const [fiscalData, setFiscalData] = useState({
    business_name: '',
    vat_number: '',
    tax_code: '',
    sdi_code: '',
    pec_email: '',
    legal_address: '',
    billing_address: '',
    use_chain_defaults: true
  })
  const [chainDefaults, setChainDefaults] = useState({})
  const [chainBranches, setChainBranches] = useState([])
  const [showCopyModal, setShowCopyModal] = useState(false)
  const [selectedCopyFields, setSelectedCopyFields] = useState([])
  const [selectedSourceBranch, setSelectedSourceBranch] = useState('')
  
  const [stripeData, setStripeData] = useState({
    account_id: '',
    stripe_user_id: '',
    access_token: '',
    refresh_token: '',
    charges_enabled: false,
    payouts_enabled: false,
    details_submitted: false,
    default_currency: 'eur'
  })
  
  const [openingHours, setOpeningHours] = useState({
    monday: { open: '08:00', close: '20:00', closed: false },
    tuesday: { open: '08:00', close: '20:00', closed: false },
    wednesday: { open: '08:00', close: '20:00', closed: false },
    thursday: { open: '08:00', close: '20:00', closed: false },
    friday: { open: '08:00', close: '20:00', closed: false },
    saturday: { open: '08:00', close: '20:00', closed: false },
    sunday: { open: '09:00', close: '19:00', closed: false }
  })

  const tabs = [
    { id: 'fiscal', label: 'Dati Fiscali', icon: '📋' },
    { id: 'stripe', label: 'Pagamenti', icon: '💳' },
    { id: 'hours', label: 'Orari', icon: '🕒' },
    { id: 'invoices', label: 'Fatturazione', icon: '📄' },
  ]

  // Initialize tab from query string if present
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const t = params.get('tab')
    const valid = tabs.map(x => x.id)
    if (t && valid.includes(t)) {
      setActiveTab(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    loadBranchData()
    if (activeTab === 'fiscal') {
      loadFiscalData()
    } else if (activeTab === 'stripe') {
      loadStripeData()
    } else if (activeTab === 'hours') {
      loadOpeningHours()
    }
  }, [id, activeTab])

  const loadBranchData = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`https://api.qofferun.com/api/v1/branches/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        const data = await response.json()
        setBranch(data.data)
      }
    } catch (err) {
      setError('Errore nel caricamento dei dati della filiale')
    }
  }

  const loadFiscalData = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`https://api.qofferun.com/api/v1/branches/${id}/settings/fiscal`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        const data = await response.json()
        setFiscalData(data.data)
        setChainDefaults(data.chain_defaults)
      }
    } catch (err) {
      setError('Errore nel caricamento dei dati fiscali')
    }
  }

  const loadStripeData = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`https://api.qofferun.com/api/v1/branches/${id}/settings/stripe`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStripeData(data.data)
      }
    } catch (err) {
      setError('Errore nel caricamento dei dati Stripe')
    }
  }

  const loadOpeningHours = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`https://api.qofferun.com/api/v1/branches/${id}/settings/hours`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        const data = await response.json()
        setOpeningHours(data.data)
      }
    } catch (err) {
      setError('Errore nel caricamento degli orari')
    }
  }

  const loadChainBranches = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`https://api.qofferun.com/api/v1/branches/${id}/settings/fiscal/chain-branches`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        const data = await response.json()
        setChainBranches(data.data)
      }
    } catch (err) {
      setError('Errore nel caricamento delle filiali')
    }
  }

  const handleSaveFiscalData = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('auth_token')
      const settings = []

      Object.keys(fiscalData).forEach(key => {
        if (fiscalData[key] !== null && fiscalData[key] !== '') {
          settings.push({
            key: `fiscal_${key}`,
            value: fiscalData[key],
            type: typeof fiscalData[key] === 'boolean' ? 'boolean' : 'string'
          })
        }
      })

      const response = await fetch(`https://api.qofferun.com/api/v1/branches/${id}/settings/batch`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings })
      })

      if (response.ok) {
        setSuccess('Dati fiscali salvati con successo!')
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Errore nel salvataggio')
      }
    } catch (err) {
      setError('Errore di connessione')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveStripeData = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('auth_token')
      const settings = []

      Object.keys(stripeData).forEach(key => {
        if (stripeData[key] !== null && stripeData[key] !== '') {
          settings.push({
            key: `stripe_${key}`,
            value: stripeData[key],
            type: typeof stripeData[key] === 'boolean' ? 'boolean' : 
                  typeof stripeData[key] === 'number' ? 'number' : 'string'
          })
        }
      })

      const response = await fetch(`https://api.qofferun.com/api/v1/branches/${id}/settings/batch`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings })
      })

      if (response.ok) {
        setSuccess('Impostazioni Stripe salvate con successo!')
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Errore nel salvataggio')
      }
    } catch (err) {
      setError('Errore di connessione')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveOpeningHours = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('auth_token')
      const settings = []

      Object.keys(openingHours).forEach(day => {
        settings.push({
          key: `hours_${day}`,
          value: JSON.stringify(openingHours[day]),
          type: 'json'
        })
      })

      const response = await fetch(`https://api.qofferun.com/api/v1/branches/${id}/settings/batch`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings })
      })

      if (response.ok) {
        setSuccess('Orari di apertura salvati con successo!')
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Errore nel salvataggio')
      }
    } catch (err) {
      setError('Errore di connessione')
    } finally {
      setLoading(false)
    }
  }

  const handleStripeOnboarding = async () => {
    if (!stripeData.account_id) {
      setError('Inserisci prima l\'Account ID Stripe')
      return
    }

    setLoading(true)
    const token = localStorage.getItem('auth_token')
    
    try {
      // Chiamata API per avviare l'onboarding Stripe Connect
      const response = await fetch(`https://api.qofferun.com/api/v1/branches/${id}/stripe/onboarding`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account_id: stripeData.account_id
        })
      })

      const result = await response.json()
      
      if (response.ok) {
        // Se c'è un URL di onboarding, redirect l'utente
        if (result.onboarding_url) {
          window.location.href = result.onboarding_url
        } else {
          // Altrimenti aggiorna lo stato localmente
          setStripeData({
            ...stripeData,
            onboarding_completed: true,
            charges_enabled: true,
            payouts_enabled: true
          })
          setSuccess('Onboarding Stripe completato con successo!')
        }
      } else {
        setError(result.message || 'Errore durante l\'onboarding Stripe')
      }
    } catch (err) {
      // Fallback al comportamento precedente se l'endpoint non esiste
      console.warn('Endpoint onboarding non disponibile, usando simulazione:', err)
      setStripeData({
        ...stripeData,
        onboarding_completed: true,
        charges_enabled: true,
        payouts_enabled: true
      })
      setSuccess('Onboarding Stripe simulato completato!')
    } finally {
      setLoading(false)
    }
  }

  const updateOpeningHours = (day, field, value) => {
    setOpeningHours({
      ...openingHours,
      [day]: {
        ...openingHours[day],
        [field]: value
      }
    })
  }

  const handleCopyFromBranch = async () => {
    if (!selectedSourceBranch || selectedCopyFields.length === 0) {
      setError('Seleziona una filiale e i campi da copiare')
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`https://api.qofferun.com/api/v1/branches/${id}/settings/fiscal/copy`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source_branch_id: selectedSourceBranch,
          copy_fields: selectedCopyFields
        })
      })

      if (response.ok) {
        setSuccess('Dati copiati con successo!')
        setShowCopyModal(false)
        loadFiscalData()
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Errore nella copia')
      }
    } catch (err) {
      setError('Errore di connessione')
    } finally {
      setLoading(false)
    }
  }

  const openCopyModal = () => {
    loadChainBranches()
    setShowCopyModal(true)
    setSelectedCopyFields([])
    setSelectedSourceBranch('')
  }

  const toggleCopyField = (field) => {
    setSelectedCopyFields(prev => 
      prev.includes(field) 
        ? prev.filter(f => f !== field)
        : [...prev, field]
    )
  }

  const renderFiscalTab = () => (
    <div className="space-y-6">
      <Card title="Configurazione Dati Fiscali">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <input
              type="checkbox"
              id="use_chain_defaults"
              checked={fiscalData.use_chain_defaults}
              onChange={(e) => setFiscalData({...fiscalData, use_chain_defaults: e.target.checked})}
              className="rounded"
            />
            <label htmlFor="use_chain_defaults" className="text-sm text-blue-700">
              Usa i dati fiscali della catena come predefiniti
            </label>
          </div>

          <div className="flex gap-3">
            <button
              onClick={openCopyModal}
              className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors"
            >
              📋 Copia da Altra Filiale
            </button>
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card title="Dati Aziendali">
          <div className="space-y-4">
            <Field label="Ragione Sociale">
              <input
                type="text"
                value={fiscalData.business_name}
                onChange={(e) => setFiscalData({...fiscalData, business_name: e.target.value})}
                placeholder={fiscalData.use_chain_defaults ? chainDefaults.business_name : ''}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qorange-500 focus:border-transparent"
              />
            </Field>

            <Field label="Partita IVA">
              <input
                type="text"
                value={fiscalData.vat_number}
                onChange={(e) => setFiscalData({...fiscalData, vat_number: e.target.value})}
                placeholder={fiscalData.use_chain_defaults ? chainDefaults.vat_number : ''}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qorange-500 focus:border-transparent"
              />
            </Field>

            <Field label="Codice Fiscale">
              <input
                type="text"
                value={fiscalData.tax_code}
                onChange={(e) => setFiscalData({...fiscalData, tax_code: e.target.value})}
                placeholder={fiscalData.use_chain_defaults ? chainDefaults.tax_code : ''}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qorange-500 focus:border-transparent"
              />
            </Field>
          </div>
        </Card>

        <Card title="Fatturazione Elettronica">
          <div className="space-y-4">
            <Field label="Codice SDI" description="Codice per la fatturazione elettronica">
              <input
                type="text"
                value={fiscalData.sdi_code}
                onChange={(e) => setFiscalData({...fiscalData, sdi_code: e.target.value})}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qorange-500 focus:border-transparent"
              />
            </Field>

            <Field label="Email PEC" description="Posta elettronica certificata">
              <input
                type="email"
                value={fiscalData.pec_email}
                onChange={(e) => setFiscalData({...fiscalData, pec_email: e.target.value})}
                placeholder={fiscalData.use_chain_defaults ? chainDefaults.pec_email : ''}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qorange-500 focus:border-transparent"
              />
            </Field>
          </div>
        </Card>

        <Card title="Indirizzi" className="md:col-span-2">
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Sede Legale">
              <textarea
                value={fiscalData.legal_address}
                onChange={(e) => setFiscalData({...fiscalData, legal_address: e.target.value})}
                placeholder={fiscalData.use_chain_defaults ? chainDefaults.legal_address : ''}
                rows="3"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qorange-500 focus:border-transparent"
              />
            </Field>

            <Field label="Indirizzo Fatturazione">
              <textarea
                value={fiscalData.billing_address}
                onChange={(e) => setFiscalData({...fiscalData, billing_address: e.target.value})}
                placeholder={fiscalData.use_chain_defaults ? chainDefaults.billing_address : ''}
                rows="3"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qorange-500 focus:border-transparent"
              />
            </Field>
          </div>
        </Card>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSaveFiscalData}
          disabled={loading}
          className="px-6 py-2 bg-qorange-500 text-white rounded-lg hover:bg-qorange-600 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Salvando...' : 'Salva Dati Fiscali'}
        </button>
      </div>
    </div>
  )

  // Stripe tab extracted as its own component so Hooks are used at component top-level
  const StripeTab = ({ currentChainId }) => {
    const [stripeAccount, setStripeAccount] = useState(null)
    const [connectLoading, setConnectLoading] = useState(false)
    const [stripeChainBranches, setStripeChainBranches] = useState([])
    const [stripeLoading, setStripeLoading] = useState(false)

    // Carica stato Stripe Connect
    useEffect(() => {
      loadStripeConnectStatus()
      loadStripeChainBranches()
    }, [])

    const loadStripeConnectStatus = async () => {
      try {
        setStripeLoading(true)
        const token = localStorage.getItem('auth_token')
        const response = await fetch(`https://api.qofferun.com/api/v1/branches/${id}/stripe-account`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        })

        if (response.ok) {
          const data = await response.json()
          setStripeAccount(data.account)
        }
      } catch (err) {
        console.error('Errore caricamento Stripe Connect:', err)
      } finally {
        setStripeLoading(false)
      }
    }

    const loadStripeChainBranches = async () => {
      try {
        const token = localStorage.getItem('auth_token')
        const response = await fetch(`https://api.qofferun.com/api/v1/branches`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        })

        if (response.ok) {
          const data = await response.json()
          // Filtra solo le filiali della stessa catena, escludendo quella corrente
          const samechainBranches = (data.data || []).filter(b => 
            currentChainId && b.chain_id === currentChainId && b.id !== parseInt(id)
          )
          setStripeChainBranches(samechainBranches)
        }
      } catch (err) {
        console.error('Errore caricamento filiali catena:', err)
      }
    }

    const handleStripeConnect = async () => {
      setConnectLoading(true)
      try {
        const token = localStorage.getItem('auth_token')
        const response = await fetch(`https://api.qofferun.com/api/v1/branches/${id}/stripe-connect`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.connect_url) {
            // Reindirizza all'onboarding Stripe
            window.location.href = data.connect_url
          }
        } else {
          const errorData = await response.json()
          setError(errorData.error || 'Errore nella creazione del collegamento Stripe')
        }
      } catch (err) {
        setError('Errore: ' + err.message)
      } finally {
        setConnectLoading(false)
      }
    }

    const handleStripeDisconnect = async () => {
      if (!confirm('Sei sicuro di voler disconnettere l\'account Stripe?')) return
      
      setConnectLoading(true)
      try {
        const token = localStorage.getItem('auth_token')
        const response = await fetch(`https://api.qofferun.com/api/v1/branches/${id}/stripe-disconnect`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        })

        if (response.ok) {
          setStripeAccount(null)
          setSuccess('Account Stripe disconnesso con successo')
          loadStripeConnectStatus()
        }
      } catch (err) {
        setError('Errore disconnessione: ' + err.message)
      } finally {
        setConnectLoading(false)
      }
    }

    const copyStripeFromBranch = async (sourceBranchId) => {
      if (!confirm('Sei sicuro di voler copiare la configurazione Stripe da questa filiale?')) return
      
      setConnectLoading(true)
      try {
        const token = localStorage.getItem('auth_token')
        
        // Prima ottieni l'account della filiale sorgente
        const sourceResponse = await fetch(`https://api.qofferun.com/api/v1/branches/${sourceBranchId}/stripe-account`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        })

        if (sourceResponse.ok) {
          const sourceData = await sourceResponse.json()
          if (sourceData.account) {
            // Poi copia la configurazione alla filiale corrente
            // Nota: Stripe Connect non permette la copia diretta di account, 
            // quindi mostriamo un messaggio per creare un nuovo account
            setError('Per motivi di sicurezza Stripe, ogni filiale deve avere il proprio account. Usa "Collega Nuovo Account".')
          } else {
            setError('La filiale sorgente non ha un account Stripe configurato')
          }
        }
      } catch (err) {
        setError('Errore nella copia: ' + err.message)
      } finally {
        setConnectLoading(false)
      }
    }

    return (
      <div className="space-y-6">
        {/* Loading State */}
        {stripeLoading ? (
          <Card title="Stripe Connect">
            <div className="space-y-4 animate-pulse">
              <div className="flex items-center justify-between p-6 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-5 w-48 bg-gray-200 rounded"></div>
                    <div className="h-4 w-64 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="h-12 w-32 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="text-center py-4 text-gray-500">
                <div className="inline-flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  Verifica connessione Stripe...
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <>
            {/* Stripe Connect Status */}
            <Card title="Stripe Connect">
              <div className="space-y-4">
                {!stripeAccount ? (
              // Account non collegato
              <div className="space-y-4">
                <div className="flex items-center justify-between p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">⚠️</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-yellow-800">Account Stripe non configurato</h3>
                      <p className="text-yellow-700">
                        Collega un account Stripe per accettare pagamenti e ricevere versamenti automatici.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleStripeConnect}
                    disabled={connectLoading}
                    className="px-6 py-3 bg-qorange-500 text-white rounded-lg hover:bg-qorange-600 disabled:opacity-50 transition-colors font-medium"
                  >
                    {connectLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Collegando...
                      </div>
                    ) : (
                      '🔗 Collega Nuovo Account'
                    )}
                  </button>
                </div>

                {/* Copia da altre filiali */}
                {stripeChainBranches.length > 0 && (
                  <Card title="Copia da Altra Filiale">
                    <p className="text-sm text-neutral-600 mb-4">
                      <strong>Nota:</strong> Per motivi di sicurezza Stripe, ogni filiale deve avere il proprio account separato. 
                      Puoi vedere quali filiali hanno già Stripe configurato, ma dovrai creare un nuovo account per questa filiale.
                    </p>
                    <div className="space-y-2">
                      {stripeChainBranches.map(b => (
                        <div key={b.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                          <div>
                            <span className="font-medium">{b.name}</span>
                            <span className="text-sm text-neutral-600 ml-2">({b.city})</span>
                          </div>
                          <div className="text-xs text-neutral-500">
                            Configurazione indipendente richiesta
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            ) : (
              // Account collegato
              <div className="space-y-4">
                <div className="flex items-center justify-between p-6 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">✅</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-800">Account Stripe Collegato</h3>
                      <p className="text-green-700">
                        ID: {stripeAccount.id} - Pagamenti attivi
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleStripeDisconnect}
                    disabled={connectLoading}
                    className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
                  >
                    🗑️ Disconnetti
                  </button>
                </div>

                {/* Dettagli Account */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card title="Stato Account">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          stripeAccount.charges_enabled ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <span className="text-sm">
                          Addebiti: {stripeAccount.charges_enabled ? 'Abilitati' : 'Disabilitati'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          stripeAccount.payouts_enabled ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <span className="text-sm">
                          Versamenti: {stripeAccount.payouts_enabled ? 'Abilitati' : 'Disabilitati'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          stripeAccount.details_submitted ? 'bg-green-500' : 'bg-yellow-500'
                        }`} />
                        <span className="text-sm">
                          Dettagli: {stripeAccount.details_submitted ? 'Completati' : 'In attesa'}
                        </span>
                      </div>
                    </div>
                  </Card>

                  <Card title="Commissioni">
                    <div className="space-y-3">
                      <div className="p-4 bg-neutral-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-neutral-600">Commissione piattaforma:</span>
                          <span className="font-medium">5%</span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm text-neutral-600">Tu ricevi:</span>
                          <span className="font-medium text-green-600">95%</span>
                        </div>
                      </div>
                      <p className="text-xs text-neutral-500">
                        I versamenti vengono automaticamente trasferiti sul tuo conto ogni 2-7 giorni lavorativi.
                      </p>
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </Card>
          </>
        )}
      </div>
    )
  }

  const renderHoursTab = () => {
    const dayNames = {
      monday: 'Lunedì',
      tuesday: 'Martedì', 
      wednesday: 'Mercoledì',
      thursday: 'Giovedì',
      friday: 'Venerdì',
      saturday: 'Sabato',
      sunday: 'Domenica'
    }

    const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    const weekend = ['saturday', 'sunday']

    return (
      <div className="space-y-6">
        <Card title="Orari Settimanali">
          <div className="space-y-4">
            {/* Quick Actions */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => {
                  const standardHours = { open: '08:00', close: '20:00', closed: false }
                  weekdays.forEach(day => {
                    setOpeningHours(prev => ({ ...prev, [day]: standardHours }))
                  })
                }}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                Set Standard Settimana (8-20)
              </button>
              <button
                onClick={() => {
                  const weekendHours = { open: '09:00', close: '19:00', closed: false }
                  weekend.forEach(day => {
                    setOpeningHours(prev => ({ ...prev, [day]: weekendHours }))
                  })
                }}
                className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
              >
                Set Weekend (9-19)
              </button>
              <button
                onClick={() => {
                  weekend.forEach(day => {
                    setOpeningHours(prev => ({ ...prev, [day]: { ...prev[day], closed: true } }))
                  })
                }}
                className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                Chiuso Weekend
              </button>
            </div>

            {/* Weekdays */}
            <div>
              <h3 className="font-medium text-neutral-900 mb-3 flex items-center gap-2">
                📅 Giorni Feriali
              </h3>
              <div className="space-y-3">
                {weekdays.map(day => (
                  <div key={day} className="flex items-center gap-4 p-3 bg-neutral-50 rounded-lg">
                    <div className="w-20 font-medium text-neutral-700">
                      {dayNames[day]}
                    </div>
                    
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={openingHours[day].closed}
                        onChange={(e) => updateOpeningHours(day, 'closed', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm">Chiuso</span>
                    </label>

                    {!openingHours[day].closed && (
                      <>
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-medium">Apertura:</label>
                          <input
                            type="time"
                            value={openingHours[day].open}
                            onChange={(e) => updateOpeningHours(day, 'open', e.target.value)}
                            className="px-2 py-1 border border-neutral-300 rounded text-sm focus:ring-2 focus:ring-qorange-500 focus:border-transparent"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="text-sm font-medium">Chiusura:</label>
                          <input
                            type="time"
                            value={openingHours[day].close}
                            onChange={(e) => updateOpeningHours(day, 'close', e.target.value)}
                            className="px-2 py-1 border border-neutral-300 rounded text-sm focus:ring-2 focus:ring-qorange-500 focus:border-transparent"
                          />
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Weekend */}
            <div>
              <h3 className="font-medium text-neutral-900 mb-3 flex items-center gap-2">
                🏖️ Weekend
              </h3>
              <div className="space-y-3">
                {weekend.map(day => (
                  <div key={day} className="flex items-center gap-4 p-3 bg-orange-50 rounded-lg">
                    <div className="w-20 font-medium text-neutral-700">
                      {dayNames[day]}
                    </div>
                    
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={openingHours[day].closed}
                        onChange={(e) => updateOpeningHours(day, 'closed', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm">Chiuso</span>
                    </label>

                    {!openingHours[day].closed && (
                      <>
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-medium">Apertura:</label>
                          <input
                            type="time"
                            value={openingHours[day].open}
                            onChange={(e) => updateOpeningHours(day, 'open', e.target.value)}
                            className="px-2 py-1 border border-neutral-300 rounded text-sm focus:ring-2 focus:ring-qorange-500 focus:border-transparent"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="text-sm font-medium">Chiusura:</label>
                          <input
                            type="time"
                            value={openingHours[day].close}
                            onChange={(e) => updateOpeningHours(day, 'close', e.target.value)}
                            className="px-2 py-1 border border-neutral-300 rounded text-sm focus:ring-2 focus:ring-qorange-500 focus:border-transparent"
                          />
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Special Hours */}
        <Card title="Orari Speciali">
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">🎉 Giorni Festivi</h4>
              <p className="text-sm text-yellow-700 mb-3">
                Configura orari speciali per giorni festivi e eventi particolari
              </p>
              <button className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-sm hover:bg-yellow-200 transition-colors">
                Gestisci Festivi (Prossimamente)
              </button>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">⏰ Pausa Pranzo</h4>
              <p className="text-sm text-blue-700 mb-3">
                Imposta una pausa durante il giorno (es. 13:00-14:00)
              </p>
              <button className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200 transition-colors">
                Configura Pausa (Prossimamente)
              </button>
            </div>
          </div>
        </Card>

        <div className="flex gap-3">
          <button
            onClick={handleSaveOpeningHours}
            disabled={loading}
            className="px-6 py-2 bg-qorange-500 text-white rounded-lg hover:bg-qorange-600 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Salvando...' : 'Salva Orari'}
          </button>
        </div>
      </div>
    )
  }

  const renderInvoicesTab = () => (
    <Card title="Integrazione Fatturazione">
      <div className="text-center py-8">
        <span className="text-4xl mb-4 block">📄</span>
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          Fatture per Tutti
        </h3>
        <p className="text-neutral-600 mb-4">
          Integrazione con servizi di fatturazione elettronica
        </p>
        <div className="text-sm text-neutral-500">
          Funzionalità in sviluppo...
        </div>
      </div>
    </Card>
  )

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/branch/${id}`)}
              className="text-qorange-600 hover:text-qorange-700"
            >
              ← Torna alla Filiale
            </button>
            <div>
              <h1 className="text-xl font-bold text-neutral-900">
                Impostazioni Filiale
              </h1>
              <p className="text-sm text-neutral-600">
                {branch ? `${branch.name} - ${branch.code}` : 'Caricamento...'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {success}
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-2 mb-8 overflow-x-auto">
          {tabs.map(tab => (
            <TabButton
              key={tab.id}
              active={activeTab === tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                const params = new URLSearchParams(location.search)
                params.set('tab', tab.id)
                navigate({ pathname: `/branch/${id}/settings`, search: params.toString() }, { replace: true })
              }}
              icon={tab.icon}
            >
              {tab.label}
            </TabButton>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'fiscal' && renderFiscalTab()}
  {activeTab === 'stripe' && <StripeTab currentChainId={branch?.chain_id} />}
        {activeTab === 'hours' && renderHoursTab()}
        {activeTab === 'invoices' && renderInvoicesTab()}
      </main>

      {/* Copy Modal */}
      {showCopyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-neutral-900">
                  Copia Dati Fiscali da Altra Filiale
                </h3>
                <button
                  onClick={() => setShowCopyModal(false)}
                  className="text-neutral-400 hover:text-neutral-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <Field label="Filiale di origine">
                  <select
                    value={selectedSourceBranch}
                    onChange={(e) => setSelectedSourceBranch(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qorange-500 focus:border-transparent"
                  >
                    <option value="">Seleziona filiale...</option>
                    {chainBranches.map(branch => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name} ({branch.code})
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Campi da copiare">
                  <div className="space-y-2">
                    {[
                      { key: 'business_name', label: 'Ragione Sociale' },
                      { key: 'vat_number', label: 'Partita IVA' },
                      { key: 'tax_code', label: 'Codice Fiscale' },
                      { key: 'sdi_code', label: 'Codice SDI' },
                      { key: 'pec_email', label: 'Email PEC' },
                      { key: 'legal_address', label: 'Sede Legale' },
                      { key: 'billing_address', label: 'Indirizzo Fatturazione' }
                    ].map(field => (
                      <label key={field.key} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedCopyFields.includes(field.key)}
                          onChange={() => toggleCopyField(field.key)}
                          className="rounded"
                        />
                        <span className="text-sm">{field.label}</span>
                      </label>
                    ))}
                  </div>
                </Field>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCopyFromBranch}
                  disabled={loading || !selectedSourceBranch || selectedCopyFields.length === 0}
                  className="px-4 py-2 bg-qorange-500 text-white rounded-lg hover:bg-qorange-600 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Copiando...' : 'Copia Dati'}
                </button>
                <button
                  onClick={() => setShowCopyModal(false)}
                  className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors"
                >
                  Annulla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}