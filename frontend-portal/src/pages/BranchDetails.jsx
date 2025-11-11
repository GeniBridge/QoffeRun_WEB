import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const StatCard = ({ title, value, subtitle, icon, color = 'qorange' }) => (
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

const StaffCard = ({ staff, onEdit }) => (
  <div className='bg-white rounded-lg shadow p-6 border-l-4 border-qorange-600'>
    <div className='flex justify-between items-start mb-4'>
      <div>
        <h3 className='font-semibold text-neutral-900'>{staff.name}</h3>
        <p className='text-sm text-neutral-600'>{staff.email}</p>
        <p className='text-xs text-neutral-500'>{staff.phone}</p>
      </div>
      <div className='flex items-center gap-2'>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          staff.role === 'branch_manager' 
          ? 'bg-blue-100 text-blue-800' 
          : 'bg-gray-100 text-gray-800'
        }`}>
          {staff.role === 'branch_manager' ? 'Manager' : 'Staff'}
        </span>
        <button
          onClick={() => onEdit(staff)}
          className='text-qorange-600 hover:text-qorange-700 text-sm'
        >
          Modifica
        </button>
      </div>
    </div>
    
    <div className='grid grid-cols-2 gap-4 text-sm'>
      <div>
        <span className='text-neutral-500'>Codice:</span>
        <span className='ml-2 font-mono'>{staff.employee_code || 'N/A'}</span>
      </div>
      <div>
        <span className='text-neutral-500'>Data inizio:</span>
        <span className='ml-2'>{staff.created_at ? new Date(staff.created_at).toLocaleDateString('it-IT') : 'N/A'}</span>
      </div>
    </div>
  </div>
)

export default function BranchDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [branch, setBranch] = useState(null)
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadBranchData()
  }, [id])

  const loadBranchData = async () => {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      navigate('/login-chain-owner')
      return
    }

    try {
      // Load branch details
      const branchResponse = await fetch(`https://api.qofferun.com/api/v1/branches/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      })

      if (branchResponse.ok) {
        const branchData = await branchResponse.json()
        setBranch(branchData.data)
      }

      // Load branch staff
      const staffResponse = await fetch(`https://api.qofferun.com/api/v1/branches/${id}/staff`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      })

      if (staffResponse.ok) {
        const staffData = await staffResponse.json()
        // L'API restituisce dati paginati: { success: true, data: { current_page: 1, data: [...] } }
        setStaff(staffData.data?.data || [])
      }
    } catch (err) {
      setError('Errore nel caricamento dei dati')
    } finally {
      setLoading(false)
    }
  }

  const handleEditStaff = (staffMember) => {
    navigate(`/branch/${id}/staff/${staffMember.id}/edit`)
  }

  const handleAddStaff = () => {
    navigate(`/branch/${id}/add-staff`)
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-neutral-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='text-4xl mb-4'>🏪</div>
          <p className='text-neutral-600'>Caricamento dettagli filiale...</p>
        </div>
      </div>
    )
  }

  if (error || !branch) {
    return (
      <div className='min-h-screen bg-neutral-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='text-4xl mb-4'>⚠️</div>
          <p className='text-red-600'>{error || 'Filiale non trovata'}</p>
          <button 
            onClick={() => navigate('/chain-dashboard')} 
            className='mt-4 px-4 py-2 bg-qorange-600 text-white rounded-lg hover:bg-qorange-700'
          >
            Torna al Dashboard
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
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <button
                onClick={() => navigate('/chain-dashboard')}
                className='text-qorange-600 hover:text-qorange-700'
              >
                ← Torna al Dashboard
              </button>
              <div>
                <h1 className='text-xl font-bold text-neutral-900'>
                  {branch.name}
                </h1>
                <p className='text-sm text-neutral-600'>
                  {branch.address}, {branch.city} ({branch.province})
                </p>
              </div>
            </div>
            
            <div className='flex items-center gap-2'>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                branch.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
              }`}>
                {branch.status === 'active' ? 'Attiva' : 'Inattiva'}
              </span>
              <button
                onClick={() => navigate(`/branch/${id}/edit`)}
                className='px-4 py-2 bg-qorange-600 text-white rounded-lg hover:bg-qorange-700'
              >
                Modifica
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='border-b border-neutral-200'>
          <nav className='-mb-px flex space-x-8'>
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                ? 'border-qorange-500 text-qorange-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
              }`}
            >
              📊 Panoramica
            </button>
            <button
              onClick={() => setActiveTab('staff')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'staff'
                ? 'border-qorange-500 text-qorange-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
              }`}
            >
              👥 Staff ({staff.length})
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'orders'
                ? 'border-qorange-500 text-qorange-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
              }`}
            >
              📋 Ordini
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                ? 'border-qorange-500 text-qorange-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
              }`}
            >
              📈 Analytics
            </button>
            <button
              onClick={() => navigate(`/branch/${id}/schedules`)}
              className='py-4 px-1 border-b-2 border-transparent text-neutral-500 hover:text-neutral-700 font-medium text-sm'
            >
              ⏰ Turni
            </button>
            <button
              onClick={() => navigate(`/branch/${id}/permissions`)}
              className='py-4 px-1 border-b-2 border-transparent text-neutral-500 hover:text-neutral-700 font-medium text-sm'
            >
              🔐 Permessi
            </button>
            <button
              onClick={() => navigate(`/branch/${id}/settings`)}
              className='py-4 px-1 border-b-2 border-transparent text-neutral-500 hover:text-neutral-700 font-medium text-sm'
            >
              ⚙️ Impostazioni
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className='space-y-8'>
            {/* Stats */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
              <StatCard 
                title="Ordini Oggi"
                value="0"
                subtitle="Nessun ordine"
                icon="📋"
              />
              <StatCard 
                title="Staff Attivo"
                value={staff.length}
                subtitle={`${staff.filter(s => s.role === 'branch_manager').length} manager`}
                icon="👥"
              />
              <StatCard 
                title="Fatturato Mese"
                value="€ 0"
                subtitle="In attesa"
                icon="💰"
              />
              <StatCard 
                title="Rating Medio"
                value="N/A"
                subtitle="Nessuna recensione"
                icon="⭐"
              />
            </div>

            {/* Branch Info */}
            <div className='bg-white rounded-lg shadow p-6'>
              <h2 className='text-xl font-semibold text-neutral-900 mb-6'>
                Informazioni Filiale
              </h2>
              <div className='grid md:grid-cols-2 gap-8'>
                <div>
                  <h3 className='font-medium text-neutral-900 mb-4'>Dettagli</h3>
                  <div className='space-y-3 text-sm'>
                    <div className='flex justify-between'>
                      <span className='text-neutral-600'>Codice:</span>
                      <span className='font-mono'>{branch.code}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-neutral-600'>Email:</span>
                      <span>{branch.email || 'Non impostata'}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-neutral-600'>Telefono:</span>
                      <span>{branch.phone || 'Non impostato'}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-neutral-600'>Paese:</span>
                      <span>{branch.country}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className='font-medium text-neutral-900 mb-4'>Servizi</h3>
                  <div className='space-y-3'>
                    <div className='flex items-center gap-3'>
                      <span className={branch.delivery_enabled ? 'text-green-600' : 'text-red-600'}>
                        {branch.delivery_enabled ? '✅' : '❌'}
                      </span>
                      <span>Delivery</span>
                    </div>
                    <div className='flex items-center gap-3'>
                      <span className={branch.takeaway_enabled ? 'text-green-600' : 'text-red-600'}>
                        {branch.takeaway_enabled ? '✅' : '❌'}
                      </span>
                      <span>Takeaway</span>
                    </div>
                    <div className='flex items-center gap-3'>
                      <span className={branch.dine_in_enabled ? 'text-green-600' : 'text-red-600'}>
                        {branch.dine_in_enabled ? '✅' : '❌'}
                      </span>
                      <span>Dine-in</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Staff Tab */}
        {activeTab === 'staff' && (
          <div className='space-y-6'>
            <div className='flex justify-between items-center'>
              <h2 className='text-xl font-semibold text-neutral-900'>
                Gestione Staff
              </h2>
              <button
                onClick={handleAddStaff}
                className='px-4 py-2 bg-qorange-600 text-white rounded-lg hover:bg-qorange-700'
              >
                + Aggiungi Staff
              </button>
            </div>

            {staff.length === 0 ? (
              <div className='bg-white rounded-lg shadow p-12 text-center'>
                <div className='text-4xl mb-4'>👥</div>
                <p className='text-neutral-600 mb-4'>Nessun membro dello staff ancora assegnato</p>
                <button
                  onClick={handleAddStaff}
                  className='px-6 py-2 bg-qorange-600 text-white rounded-lg hover:bg-qorange-700'
                >
                  Aggiungi il Primo Staff
                </button>
              </div>
            ) : (
              <div className='grid gap-4'>
                {staff.map((staffMember) => (
                  <StaffCard 
                    key={staffMember.id}
                    staff={staffMember}
                    onEdit={handleEditStaff}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className='bg-white rounded-lg shadow p-12 text-center'>
            <div className='text-4xl mb-4'>📋</div>
            <h2 className='text-xl font-semibold text-neutral-900 mb-2'>
              Gestione Ordini
            </h2>
            <p className='text-neutral-600 mb-4'>
              Visualizza e gestisci tutti gli ordini di questa filiale
            </p>
            <p className='text-sm text-neutral-500'>
              Funzionalità in sviluppo...
            </p>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className='bg-white rounded-lg shadow p-12 text-center'>
            <div className='text-4xl mb-4'>📈</div>
            <h2 className='text-xl font-semibold text-neutral-900 mb-2'>
              Analytics Avanzate
            </h2>
            <p className='text-neutral-600 mb-4'>
              Report dettagliati e statistiche per questa filiale
            </p>
            <p className='text-sm text-neutral-500'>
              Funzionalità in sviluppo...
            </p>
          </div>
        )}
      </main>
    </div>
  )
}