  const renderStripeTab = () => {
    const [stripeAccount, setStripeAccount] = useState(null)
    const [connectLoading, setConnectLoading] = useState(false)
    const [chainBranches, setChainBranches] = useState([])
    
    // Carica stato Stripe Connect
    useEffect(() => {
      loadStripeConnectStatus()
      loadChainBranches()
    }, [])

    const loadStripeConnectStatus = async () => {
      try {
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
      }
    }

    const loadChainBranches = async () => {
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
          const samechainBranches = data.data.filter(branch => 
            branch.chain_id === branch.chain_id && branch.id !== parseInt(id)
          )
          setChainBranches(samechainBranches)
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
                {chainBranches.length > 0 && (
                  <Card title="Copia da Altra Filiale">
                    <p className="text-sm text-neutral-600 mb-4">
                      <strong>Nota:</strong> Per motivi di sicurezza Stripe, ogni filiale deve avere il proprio account separato. 
                      Puoi vedere quali filiali hanno già Stripe configurato, ma dovrai creare un nuovo account per questa filiale.
                    </p>
                    <div className="space-y-2">
                      {chainBranches.map(branch => (
                        <div key={branch.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                          <div>
                            <span className="font-medium">{branch.name}</span>
                            <span className="text-sm text-neutral-600 ml-2">({branch.city})</span>
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

        {/* Informazioni Webhook (solo se account collegato) */}
        {stripeAccount && (
          <Card title="Configurazione Webhook">
            <div className="space-y-4">
              <Field label="Endpoint URL" description="URL automatico per ricevere eventi Stripe">
                <input
                  type="url"
                  value={`https://api.qofferun.com/api/v1/stripe/webhook`}
                  readOnly
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-neutral-50 text-neutral-600"
                />
              </Field>

              <Field label="Eventi Monitorati">
                <div className="text-sm text-neutral-600 space-y-1">
                  <div>• payment_intent.succeeded</div>
                  <div>• payment_intent.payment_failed</div>
                  <div>• account.updated</div>
                  <div>• payout.paid</div>
                </div>
              </Field>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  💡 <strong>Automatico:</strong> La configurazione webhook viene gestita automaticamente da Stripe Connect.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    )
  }