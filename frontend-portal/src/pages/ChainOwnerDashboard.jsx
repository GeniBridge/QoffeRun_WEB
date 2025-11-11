import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const KPICard = ({ title, value, subtitle, icon, color = 'qorange' }) => (
  <div className='bg-white rounded-lg shadow p-6'>
    <div className='flex items-center justify-between'>
      <div>
        <p className='text-sm text-neutral-600'>{title}</p>
        <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
        {subtitle && <p className='text-xs text-neutral-500 mt-1'>{subtitle}</p>}
      </div>
      <div className={`text-3xl text-${color}-600`}>{icon}</div>
    </div>
  </div>
)

const BranchCard = ({ branch, onClick }) => (
  <div 
    onClick={onClick}
    className='bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-qorange-600'
  >
    <div className='flex justify-between items-start mb-4'>
      <div>
        <h3 className='font-semibold text-neutral-900'>{branch.name}</h3>
        <p className='text-sm text-neutral-600'>{branch.address}, {branch.city}</p>
      </div>
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        branch.status === 'active' 
        ? 'bg-green-100 text-green-800' 
        : 'bg-red-100 text-red-800'
      }`}>
        {branch.status === 'active' ? 'Attivo' : 'Inattivo'}
      </span>
    </div>
    
    <div className='grid grid-cols-2 gap-4 text-sm'>
      <div>
        <span className='text-neutral-500'>Delivery:</span>
        <span className='ml-2'>{branch.delivery_enabled ? '✅' : '❌'}</span>
      </div>
      <div>
        <span className='text-neutral-500'>Takeaway:</span>
        <span className='ml-2'>{branch.takeaway_enabled ? '✅' : '❌'}</span>
      </div>
    </div>
  </div>
)

export default function ChainOwnerDashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [chain, setChain] = useState(null)
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const userData = localStorage.getItem('user_data')

    if (!token || !userData) {
      navigate('/login-chain-owner')
      return
    }

    setUser(JSON.parse(userData))
    loadDashboardData(token)
  }, [navigate])

  const loadDashboardData = async (token) => {
    try {
      // Load chain data
      const chainResponse = await fetch('https://api.qofferun.com/api/v1/chains/my-chains', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      })

      if (chainResponse.ok) {
        const chainData = await chainResponse.json()
        const userChain = chainData.data[0] // Get first chain
        setChain(userChain)

        // Load branches for this chain
        if (userChain) {
          const branchesResponse = await fetch(`https://api.qofferun.com/api/v1/branches`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            }
          })

          if (branchesResponse.ok) {
            const branchesData = await branchesResponse.json()
            console.log('Tutte le filiali:', branchesData.data)
            // Filter branches for current chain
            const chainBranches = branchesData.data.filter(branch => branch.chain_id === userChain.id)
            console.log('Filiali per catena', userChain.id, ':', chainBranches)
            setBranches(chainBranches)
          } else {
            console.log('Errore caricamento filiali:', await branchesResponse.text())
          }
        }
      }
    } catch (err) {
      setError('Errore nel caricamento dei dati')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
    navigate('/login-chain-owner')
  }

  const handleAddBranch = () => {
    navigate('/add-branch')
  }

  const handleBranchClick = (branch) => {
    navigate(`/branch/${branch.id}`)
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-neutral-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='text-4xl mb-4'>☕</div>
          <p className='text-neutral-600'>Caricamento dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='min-h-screen bg-neutral-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='text-4xl mb-4'>⚠️</div>
          <p className='text-red-600'>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className='mt-4 px-4 py-2 bg-qorange-600 text-white rounded-lg hover:bg-qorange-700'
          >
            Riprova
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-neutral-50'>
      {/* Header */}
      <header className='bg-white shadow-sm border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
          <div className='flex justify-between items-center'>
            <div className='flex items-center gap-4'>
              <div className='text-2xl'>☕</div>
              <div>
                <h1 className='text-xl font-bold text-neutral-900'>
                  QoffeRun Chain Dashboard
                </h1>
                <p className='text-sm text-neutral-600'>
                  Benvenuto, {user?.name}
                </p>
              </div>
            </div>
            
            <div className='flex items-center gap-4'>
              <div className='text-right'>
                <p className='text-sm font-medium text-neutral-900'>{chain?.name}</p>
                <p className='text-xs text-neutral-600'>{branches.length} filiali</p>
              </div>
              <button
                onClick={() => navigate('/chain-settings')}
                className='px-4 py-2 bg-qorange-600 text-white rounded-lg hover:bg-qorange-700 text-sm'
              >
                ⚙️ Impostazioni
              </button>
              <button
                onClick={handleLogout}
                className='px-4 py-2 bg-neutral-600 text-white rounded-lg hover:bg-neutral-700 text-sm'
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* KPIs */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          <KPICard 
            title="Filiali Attive"
            value={branches.filter(b => b.status === 'active').length}
            subtitle={`su ${branches.length} totali`}
            icon="🏪"
          />
          <KPICard 
            title="Ordini Oggi"
            value="0"
            subtitle="Nessun ordine registrato"
            icon="📋"
          />
          <KPICard 
            title="Fatturato Mese"
            value="€ 0"
            subtitle="In attesa di ordini"
            icon="💰"
          />
          <KPICard 
            title="Commissioni"
            value={`${chain?.commission_rate || 15}%`}
            subtitle="Tasso applicato"
            icon="📊"
          />
        </div>

        {/* Chain Overview */}
        <div className='bg-white rounded-lg shadow p-6 mb-8'>
          <h2 className='text-xl font-semibold text-neutral-900 mb-4'>
            Panoramica Catena: {chain?.name}
          </h2>
          <div className='grid md:grid-cols-2 gap-6'>
            <div>
              <p className='text-sm text-neutral-600 mb-2'>Stato</p>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                chain?.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
              }`}>
                {chain?.status === 'active' ? 'Attiva' : 'Inattiva'}
              </span>
            </div>
            <div>
              <p className='text-sm text-neutral-600 mb-2'>Modalità Pagamento</p>
              <p className='font-medium text-neutral-900'>
                {chain?.payment_mode === 'unified' ? 'Pagamenti Unificati' : 'Pagamenti Separati'}
              </p>
            </div>
          </div>
          {chain?.description && (
            <div className='mt-4'>
              <p className='text-sm text-neutral-600 mb-2'>Descrizione</p>
              <p className='text-neutral-900'>{chain.description}</p>
            </div>
          )}
        </div>

        {/* Branches Section */}
        <div className='bg-white rounded-lg shadow p-6'>
          <div className='flex justify-between items-center mb-6'>
            <h2 className='text-xl font-semibold text-neutral-900'>
              Le Tue Filiali ({branches.length})
            </h2>
            <button
              onClick={handleAddBranch}
              className='px-4 py-2 bg-qorange-600 text-white rounded-lg hover:bg-qorange-700 font-medium'
            >
              + Aggiungi Filiale
            </button>
          </div>

          {branches.length === 0 ? (
            <div className='text-center py-12'>
              <div className='text-4xl mb-4'>🏪</div>
              <p className='text-neutral-600 mb-4'>Nessuna filiale ancora registrata</p>
              <button
                onClick={handleAddBranch}
                className='px-6 py-2 bg-qorange-600 text-white rounded-lg hover:bg-qorange-700 font-medium'
              >
                Aggiungi la Prima Filiale
              </button>
            </div>
          ) : (
            <div className='grid gap-4'>
              {branches.map((branch) => (
                <BranchCard 
                  key={branch.id}
                  branch={branch}
                  onClick={() => handleBranchClick(branch)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}