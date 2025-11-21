import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { branchesAPI } from '../services/api';

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
  const [managers, setManagers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [staffLoading, setStaffLoading] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [availableUsers, setAvailableUsers] = useState([])
  const [overview, setOverview] = useState(null)
  // Orders state
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersError, setOrdersError] = useState('')
  const [ordersPage, setOrdersPage] = useState(1)
  const [ordersPerPage, setOrdersPerPage] = useState(10)
  const [ordersTotalPages, setOrdersTotalPages] = useState(1)
  const [ordersTotal, setOrdersTotal] = useState(0)
  const [orderFilters, setOrderFilters] = useState({
    q: '',
    status: '',
    payment_status: '',
    date_from: '',
    date_to: '',
  })
  const [orderFiltersDraft, setOrderFiltersDraft] = useState({
    q: '',
    status: '',
    payment_status: '',
    date_from: '',
    date_to: '',
  })
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [orderDetails, setOrderDetails] = useState(null)
  // Analytics state
  const [stats, setStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(false)
  const [statsError, setStatsError] = useState('')

  // Helper to format currency even if API returns string numbers
  const formatEuro = (value) => {
    const n = Number(value)
    return Number.isFinite(n) ? `€${n.toFixed(2)}` : '€0.00'
  }

  useEffect(() => {
    loadBranchData()
    
    // Handle URL parameters for tab switching
    const searchParams = new URLSearchParams(window.location.search)
    const tabParam = searchParams.get('tab')
    if (tabParam && ['overview', 'staff', 'orders', 'analytics'].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [id])

  useEffect(() => {
    async function fetchOverview() {
      try {
        const response = await branchesAPI.overview(id);
        // API shape: { success: true, data: { ...overview } }
        setOverview(response?.data?.data || null);
      } catch (e) {
        setOverview(null);
      }
    }
    fetchOverview();
  }, [id]);

  // Fetch orders when Orders tab active or filters/page change
  useEffect(() => {
    if (activeTab !== 'orders') return
    const fetchOrders = async () => {
      setOrdersLoading(true)
      setOrdersError('')
      try {
        const params = {
          page: ordersPage,
          per_page: ordersPerPage,
          ...Object.fromEntries(Object.entries(orderFilters).filter(([_, v]) => v !== '' && v != null))
        }
        const resp = await branchesAPI.orders(id, params)
        const payload = resp?.data?.data
        // Laravel paginator structure
        const list = payload?.data || []
        setOrders(list)
        setOrdersPage(payload?.current_page || 1)
        setOrdersPerPage(payload?.per_page || 10)
        setOrdersTotal(payload?.total || list.length)
        setOrdersTotalPages(payload?.last_page || 1)
      } catch (e) {
        setOrdersError('Impossibile caricare gli ordini')
        setOrders([])
        setOrdersTotal(0)
        setOrdersTotalPages(1)
      } finally {
        setOrdersLoading(false)
      }
    }
    fetchOrders()
  }, [activeTab, id, ordersPage, ordersPerPage, orderFilters])

  const openOrderDetails = async (orderId) => {
    try {
      setOrderDetails(null)
      setShowOrderModal(true)
      const resp = await branchesAPI.orderDetails(id, orderId)
      setOrderDetails(resp?.data?.data || null)
    } catch (e) {
      setOrderDetails(null)
    }
  }

  const applyFilters = () => {
    setOrdersPage(1)
    setOrderFilters({ ...orderFiltersDraft })
  }

  const resetFilters = () => {
    const empty = { q: '', status: '', payment_status: '', date_from: '', date_to: '' }
    setOrderFiltersDraft(empty)
    setOrderFilters(empty)
    setOrdersPage(1)
  }

  // Fetch analytics stats when analytics tab active
  useEffect(() => {
    if (activeTab !== 'analytics') return
    const loadStats = async () => {
      setStatsLoading(true)
      setStatsError('')
      try {
        const resp = await branchesAPI.orderStats(id)
        setStats(resp?.data?.data || null)
      } catch (e) {
        setStats(null)
        setStatsError('Impossibile caricare le statistiche')
      } finally {
        setStatsLoading(false)
      }
    }
    loadStats()
  }, [activeTab, id])

  const loadBranchData = async () => {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      navigate('/login-chain-owner')
      return
    }

    try {
      // Load branch details (with fallback to debug endpoint)
      let branchLoaded = false
      try {
        const branchResponse = await fetch(`https://api.qofferun.com/api/v1/branches/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        })
        if (branchResponse.ok) {
          const branchData = await branchResponse.json()
          setBranch(branchData.data)
          branchLoaded = true
        }
      } catch (_) {}
      
      if (!branchLoaded) {
        const branchDebugResp = await fetch(`https://qofferun.com/api/v1/debug-branch/${id}`)
        if (branchDebugResp.ok) {
          const dbg = await branchDebugResp.json()
          if (dbg.success) setBranch(dbg.data)
        }
      }

      // Load branch staff using debug endpoint (temporary fix)
      const staffResponse = await fetch(`https://qofferun.com/api/v1/debug-branch-staff/${id}`, {
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (staffResponse.ok) {
        const staffData = await staffResponse.json()
        if (staffData.success) {
          // Separate managers and regular staff based on role_at_branch
          const allStaff = staffData.data || []
          setManagers(allStaff.filter(s => s.role === 'branch_manager'))
          setStaff(allStaff.filter(s => s.role !== 'branch_manager'))
        }
      } else {
        // Fallback to old API if new one fails
        const fallbackResponse = await fetch(`https://qofferun.com/api/v1/branches/${id}/staff`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        })
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json()
          const allStaff = fallbackData.data?.data || []
          // Manually separate managers and staff
          setManagers(allStaff.filter(s => s.role === 'branch_manager'))
          setStaff(allStaff.filter(s => s.role !== 'branch_manager'))
        }
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

  const loadAvailableUsers = async () => {
    const token = localStorage.getItem('auth_token')
    if (!token) return

    try {
      const response = await fetch('https://api.qofferun.com/api/v1/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        const data = await response.json()
        setAvailableUsers(data.data?.data || [])
      }
    } catch (err) {
      console.error('Error loading users:', err)
    }
  }

  const assignUserToBranch = async (userData) => {
    const token = localStorage.getItem('auth_token')
    if (!token) return

    setStaffLoading(true)
    try {
      const response = await fetch('https://qofferun.com/api/v1/staff-management/assign', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...userData,
          branch_id: id
        })
      })

      const result = await response.json()
      if (result.success) {
        setSuccess('Staff assegnato con successo!')
        setShowAssignModal(false)
        loadBranchData() // Reload data
      } else {
        setError(result.message || 'Errore nell\'assegnazione')
      }
    } catch (err) {
      setError('Errore durante l\'assegnazione')
    } finally {
      setStaffLoading(false)
    }
  }

  const removeStaffFromBranch = async (userId) => {
    if (!confirm('Sei sicuro di voler rimuovere questo staff dalla filiale?')) return

    try {
      const response = await fetch(`https://qofferun.com/api/v1/debug-remove-staff/${userId}/branch/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const result = await response.json()
      if (result.success) {
        setSuccess('Staff rimosso con successo!')
        loadBranchData() // Reload data
      } else {
        setError(result.message || 'Errore nella rimozione')
      }
    } catch (err) {
      setError('Errore durante la rimozione')
    }
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    // Update URL without page reload
    const url = new URL(window.location)
    url.searchParams.set('tab', tab)
    window.history.pushState({}, '', url.toString())
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

  if (!overview) {
    return <p>Loading...</p>;
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
              onClick={() => handleTabChange('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                ? 'border-qorange-500 text-qorange-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
              }`}
            >
              📊 Panoramica
            </button>
            <button
              onClick={() => handleTabChange('staff')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'staff'
                ? 'border-qorange-500 text-qorange-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
              }`}
            >
              👥 Staff ({managers.length + staff.length})
            </button>
            <button
              onClick={() => handleTabChange('orders')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'orders'
                ? 'border-qorange-500 text-qorange-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
              }`}
            >
              📋 Ordini
            </button>
            <button
              onClick={() => handleTabChange('analytics')}
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
        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">×</button>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center justify-between">
            <span>{success}</span>
            <button onClick={() => setSuccess('')} className="text-green-500 hover:text-green-700">×</button>
          </div>
        )}
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className='space-y-8'>
            {/* Stats */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
              <StatCard 
                title="Ordini Oggi"
                value={overview.ordini_oggi ?? 0}
                subtitle={overview.ordini_oggi === 1 ? "1 ordine" : overview.ordini_oggi > 1 ? `${overview.ordini_oggi} ordini` : "Nessun ordine"}
                icon="📋"
              />
              <StatCard 
                title="Ordini Mese"
                value={overview.ordini_mese ?? 0}
                subtitle={overview.ordini_mese === 1 ? "1 ordine" : overview.ordini_mese > 1 ? `${overview.ordini_mese} ordini` : "Nessun ordine"}
                icon="🗓️"
              />
              <StatCard 
                title="Fatturato Mese"
                value={formatEuro(overview.fatturato_mese)}
                subtitle="In attesa"
                icon="💰"
              />
              <StatCard 
                title="Rating Medio"
                value={typeof overview.rating_medio === 'number' ? overview.rating_medio.toFixed(1) : "N/A"}
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

            

            {/* Eligibility to Publish */}
            <div className='bg-white rounded-lg shadow p-6'>
              <div className='flex items-center justify-between mb-4'>
                <h2 className='text-xl font-semibold text-neutral-900'>
                  Idoneità alla Pubblicazione
                </h2>
                {(() => {
                  const flags = overview?.eligible_to_publish || {};
                  const total = Object.keys(flags).length;
                  const completed = Object.values(flags).filter(Boolean).length;
                  const allComplete = total > 0 && completed === total;
                  return total > 0 ? (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${allComplete ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {allComplete ? 'Completata' : 'Incompleta'} • {completed}/{total}
                    </span>
                  ) : null;
                })()}
              </div>
              <div className='grid grid-cols-1 gap-3'>
                {overview?.eligible_to_publish ? (
                  Object.entries(overview.eligible_to_publish).map(([key, value]) => {
                    const labelMap = {
                      has_minimum_menu_items: 'Menu minimo: 5 prodotti attivi',
                      chain_has_logo_and_cover: 'Logo e cover della catena caricati',
                      stripe_connected: 'Stripe Connect configurato',
                      address_complete: 'Indirizzo completo con lat/lng'
                    };
                    const label = labelMap[key] || key.replace(/_/g, ' ');
                    return (
                      <div key={key} className='flex items-center'>
                        <span className={`mr-2 ${value ? 'text-green-600' : 'text-red-600'}`}>
                          {value ? '✅' : '❌'}
                        </span>
                        <span>{label}</span>
                      </div>
                    );
                  })
                ) : (
                  <span className='text-neutral-500'>Nessun dato disponibile</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Staff Tab */}
        {activeTab === 'staff' && (
          <div className='space-y-6'>
            {/* Header with Actions */}
            <div className='flex justify-between items-center'>
              <div>
                <h2 className='text-xl font-semibold text-neutral-900'>
                  Gestione Staff
                </h2>
                <p className='text-sm text-neutral-600 mt-1'>
                  {managers.length + staff.length} membri totali • {managers.length} manager • {staff.length} staff
                </p>
              </div>
              <div className='flex gap-2'>
                <button
                  onClick={() => navigate(`/branch/${id}/permissions`)}
                  className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
                >
                  🔐 Permessi
                </button>
                <button
                  onClick={() => navigate(`/branch/${id}/schedules`)}
                  className='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700'
                >
                  📅 Turni
                </button>
                <button
                  onClick={() => {
                    loadAvailableUsers()
                    setShowAssignModal(true)
                  }}
                  className='px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700'
                >
                  ➕ Assegna Staff
                </button>
                <button
                  onClick={handleAddStaff}
                  className='px-4 py-2 bg-qorange-600 text-white rounded-lg hover:bg-qorange-700'
                >
                  + Nuovo Staff
                </button>
              </div>
            </div>

            {managers.length === 0 && staff.length === 0 ? (
              <div className='bg-white rounded-lg shadow p-12 text-center'>
                <div className='text-4xl mb-4'>👥</div>
                <h3 className='text-xl font-semibold text-neutral-900 mb-2'>Nessuno Staff Assegnato</h3>
                <p className='text-neutral-600 mb-6'>
                  Inizia assegnando staff esistenti o creando nuovi membri del team per questa filiale.
                </p>
                <div className='flex gap-3 justify-center'>
                  <button
                    onClick={() => {
                      loadAvailableUsers()
                      setShowAssignModal(true)
                    }}
                    className='px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700'
                  >
                    Assegna Staff Esistente
                  </button>
                  <button
                    onClick={handleAddStaff}
                    className='px-6 py-2 bg-qorange-600 text-white rounded-lg hover:bg-qorange-700'
                  >
                    Crea Nuovo Staff
                  </button>
                </div>
              </div>
            ) : (
              <div className='space-y-6'>
                {/* Managers Section */}
                {managers.length > 0 && (
                  <div className='bg-white rounded-lg shadow-sm border border-blue-200'>
                    <div className='px-6 py-4 bg-blue-50 border-b border-blue-200'>
                      <h3 className='text-lg font-semibold text-blue-900 flex items-center gap-2'>
                        👨‍💼 Manager ({managers.length})
                      </h3>
                      <p className='text-sm text-blue-700 mt-1'>Responsabili della gestione della filiale</p>
                    </div>
                    <div className='p-6'>
                      <div className='grid gap-4'>
                        {managers.map((manager) => (
                          <div key={manager.id} className='border border-blue-200 rounded-lg p-4 bg-blue-50/50'>
                            <div className='flex justify-between items-start mb-3'>
                              <div>
                                <h4 className='font-semibold text-neutral-900 flex items-center gap-2'>
                                  {manager.name}
                                  {manager.is_primary_branch && (
                                    <span className='px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full'>
                                      Filiale Primaria
                                    </span>
                                  )}
                                </h4>
                                <p className='text-sm text-neutral-600'>{manager.email}</p>
                                <p className='text-xs text-neutral-500'>{manager.phone}</p>
                              </div>
                              <div className='flex items-center gap-2'>
                                <span className='px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800'>
                                  {manager.role_at_branch || 'Manager'}
                                </span>
                                <button
                                  onClick={() => handleEditStaff(manager)}
                                  className='text-blue-600 hover:text-blue-700 text-sm px-2 py-1 rounded'
                                >
                                  ✏️ Modifica
                                </button>
                                <button
                                  onClick={() => removeStaffFromBranch(manager.id)}
                                  className='text-red-600 hover:text-red-700 text-sm px-2 py-1 rounded'
                                >
                                  🗑️ Rimuovi
                                </button>
                              </div>
                            </div>
                            
                            <div className='grid grid-cols-2 gap-4 text-sm'>
                              <div>
                                <span className='text-neutral-500'>Codice:</span>
                                <span className='ml-2 font-mono'>{manager.employee_code || 'N/A'}</span>
                              </div>
                              <div>
                                <span className='text-neutral-500'>Assegnato:</span>
                                <span className='ml-2'>{manager.assigned_at ? new Date(manager.assigned_at).toLocaleDateString('it-IT') : 'N/A'}</span>
                              </div>
                            </div>

                            {manager.permissions && manager.permissions.length > 0 && (
                              <div className='mt-3'>
                                <span className='text-neutral-500 text-sm'>Permessi:</span>
                                <div className='flex flex-wrap gap-1 mt-1'>
                                  {manager.permissions.map((permission, index) => (
                                    <span key={index} className='px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded'>
                                      {permission}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Regular Staff Section */}
                {staff.length > 0 && (
                  <div className='bg-white rounded-lg shadow-sm border border-green-200'>
                    <div className='px-6 py-4 bg-green-50 border-b border-green-200'>
                      <h3 className='text-lg font-semibold text-green-900 flex items-center gap-2'>
                        👥 Staff ({staff.length})
                      </h3>
                      <p className='text-sm text-green-700 mt-1'>Membri del team operativo</p>
                    </div>
                    <div className='p-6'>
                      <div className='grid gap-4'>
                        {staff.map((staffMember) => (
                          <div key={staffMember.id} className='border border-green-200 rounded-lg p-4 bg-green-50/50'>
                            <div className='flex justify-between items-start mb-3'>
                              <div>
                                <h4 className='font-semibold text-neutral-900 flex items-center gap-2'>
                                  {staffMember.name}
                                  {staffMember.is_primary_branch && (
                                    <span className='px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full'>
                                      Filiale Primaria
                                    </span>
                                  )}
                                </h4>
                                <p className='text-sm text-neutral-600'>{staffMember.email}</p>
                                <p className='text-xs text-neutral-500'>{staffMember.phone}</p>
                              </div>
                              <div className='flex items-center gap-2'>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  staffMember.role_at_branch === 'barista' 
                                    ? 'bg-orange-100 text-orange-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {staffMember.role_at_branch || 'Staff'}
                                </span>
                                <button
                                  onClick={() => handleEditStaff(staffMember)}
                                  className='text-green-600 hover:text-green-700 text-sm px-2 py-1 rounded'
                                >
                                  ✏️ Modifica
                                </button>
                                <button
                                  onClick={() => removeStaffFromBranch(staffMember.id)}
                                  className='text-red-600 hover:text-red-700 text-sm px-2 py-1 rounded'
                                >
                                  🗑️ Rimuovi
                                </button>
                              </div>
                            </div>
                            
                            <div className='grid grid-cols-2 gap-4 text-sm'>
                              <div>
                                <span className='text-neutral-500'>Codice:</span>
                                <span className='ml-2 font-mono'>{staffMember.employee_code || 'N/A'}</span>
                              </div>
                              <div>
                                <span className='text-neutral-500'>Assegnato:</span>
                                <span className='ml-2'>{staffMember.assigned_at ? new Date(staffMember.assigned_at).toLocaleDateString('it-IT') : 'N/A'}</span>
                              </div>
                            </div>

                            {staffMember.permissions && staffMember.permissions.length > 0 && (
                              <div className='mt-3'>
                                <span className='text-neutral-500 text-sm'>Permessi:</span>
                                <div className='flex flex-wrap gap-1 mt-1'>
                                  {staffMember.permissions.map((permission, index) => (
                                    <span key={index} className='px-2 py-1 bg-green-100 text-green-800 text-xs rounded'>
                                      {permission}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className='bg-neutral-50 rounded-lg p-6'>
                  <h4 className='text-lg font-semibold text-neutral-900 mb-4'>Azioni Rapide</h4>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <button
                      onClick={() => navigate(`/branch/${id}/permissions`)}
                      className='p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow text-left'
                    >
                      <div className='text-2xl mb-2'>🔐</div>
                      <h5 className='font-medium text-neutral-900'>Gestione Permessi</h5>
                      <p className='text-sm text-neutral-600'>Configura permessi dettagliati per ogni membro</p>
                    </button>
                    
                    <button
                      onClick={() => navigate(`/branch/${id}/schedules`)}
                      className='p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow text-left'
                    >
                      <div className='text-2xl mb-2'>📅</div>
                      <h5 className='font-medium text-neutral-900'>Pianificazione Turni</h5>
                      <p className='text-sm text-neutral-600'>Organizza orari di lavoro e turni</p>
                    </button>
                    
                    <button
                      onClick={() => navigate(`/branch/${id}/settings`)}
                      className='p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow text-left'
                    >
                      <div className='text-2xl mb-2'>⚙️</div>
                      <h5 className='font-medium text-neutral-900'>Impostazioni Filiale</h5>
                      <p className='text-sm text-neutral-600'>Configura impostazioni specifiche</p>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className='bg-white rounded-lg shadow p-6'>
            <div className='flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6'>
              <div className='grid grid-cols-1 md:grid-cols-5 gap-3 w-full'>
                <div className='md:col-span-2'>
                  <label className='block text-sm text-neutral-600 mb-1'>Cerca</label>
                  <input
                    type='text'
                    value={orderFiltersDraft.q}
                    onChange={(e) => setOrderFiltersDraft({ ...orderFiltersDraft, q: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                    placeholder='Ordine ID / Cliente / Telefono / Email / Codice'
                    className='w-full border rounded-lg px-3 py-2'
                  />
                </div>
                <div>
                  <label className='block text-sm text-neutral-600 mb-1'>Stato</label>
                  <select
                    value={orderFiltersDraft.status}
                    onChange={(e) => setOrderFiltersDraft({ ...orderFiltersDraft, status: e.target.value })}
                    className='w-full border rounded-lg px-3 py-2'
                  >
                    <option value=''>Tutti</option>
                    <option value='pending'>In attesa</option>
                    <option value='confirmed'>Confermato</option>
                    <option value='ready'>Pronto</option>
                    <option value='completed'>Completato</option>
                    <option value='cancelled'>Annullato</option>
                  </select>
                </div>
                <div>
                  <label className='block text-sm text-neutral-600 mb-1'>Pagamento</label>
                  <select
                    value={orderFiltersDraft.payment_status}
                    onChange={(e) => setOrderFiltersDraft({ ...orderFiltersDraft, payment_status: e.target.value })}
                    className='w-full border rounded-lg px-3 py-2'
                  >
                    <option value=''>Tutti</option>
                    <option value='paid'>Pagato</option>
                    <option value='failed'>Fallito</option>
                    <option value='cancelled'>Annullato</option>
                  </select>
                </div>
                <div className='flex gap-2'>
                  <div className='flex-1'>
                    <label className='block text-sm text-neutral-600 mb-1'>Dal</label>
                    <input type='date' value={orderFiltersDraft.date_from} onChange={(e) => setOrderFiltersDraft({ ...orderFiltersDraft, date_from: e.target.value })} className='w-full border rounded-lg px-3 py-2' />
                  </div>
                  <div className='flex-1'>
                    <label className='block text-sm text-neutral-600 mb-1'>Al</label>
                    <input type='date' value={orderFiltersDraft.date_to} onChange={(e) => setOrderFiltersDraft({ ...orderFiltersDraft, date_to: e.target.value })} className='w-full border rounded-lg px-3 py-2' />
                  </div>
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <button onClick={resetFilters} className='px-3 py-2 border rounded-lg'>Reset</button>
                <button onClick={applyFilters} className='px-4 py-2 bg-qorange-600 text-white rounded-lg hover:bg-qorange-700'>Filtra</button>
              </div>
            </div>

            {/* Orders Table */}
            <div className='overflow-x-auto'>
              <table className='min-w-full table-auto'>
                <thead>
                  <tr className='bg-neutral-50 text-left text-sm text-neutral-600'>
                    <th className='px-4 py-2'>ID</th>
                    <th className='px-4 py-2'>Numero Ordine</th>
                    <th className='px-4 py-2'>Cliente</th>
                    <th className='px-4 py-2'>Totale</th>
                    <th className='px-4 py-2'>Stato</th>
                    <th className='px-4 py-2'>Pagamento</th>
                    <th className='px-4 py-2'>Creato</th>
                    <th className='px-4 py-2'></th>
                  </tr>
                </thead>
                <tbody>
                  {ordersLoading ? (
                    <tr>
                      <td colSpan={8} className='px-4 py-6 text-center text-neutral-500'>Caricamento...</td>
                    </tr>
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className='px-4 py-6 text-center text-neutral-500'>Nessun ordine trovato</td>
                    </tr>
                  ) : (
                    orders.map((o) => (
                      <tr key={o.id} className='border-t text-sm hover:bg-neutral-50'>
                        <td className='px-4 py-2 font-mono'>#{o.id}</td>
                        <td className='px-4 py-2'>{o.order_number || '-'}</td>
                        <td className='px-4 py-2'>
                          <div className='font-medium'>{o.customer_name || '-'}</div>
                          <div className='text-xs text-neutral-500'>{o.customer_phone || o.customer_email || ''}</div>
                        </td>
                        <td className='px-4 py-2'>{formatEuro(o.total_amount ?? o.total)}</td>
                        <td className='px-4 py-2'>
                          <span className='px-2 py-1 rounded-full text-xs bg-neutral-100'>{o.status}</span>
                        </td>
                        <td className='px-4 py-2'>{o.payment_status}</td>
                        <td className='px-4 py-2'>{o.created_at ? new Date(o.created_at).toLocaleString('it-IT') : '-'}</td>
                        <td className='px-4 py-2 text-right'>
                          <button onClick={() => openOrderDetails(o.id)} className='text-qorange-600 hover:text-qorange-700'>Dettagli</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className='flex items-center justify-between mt-4'>
              <div className='text-sm text-neutral-600'>
                Totale: {ordersTotal}
              </div>
              <div className='flex items-center gap-2'>
                <button disabled={ordersPage <= 1} onClick={() => setOrdersPage((p) => Math.max(1, p - 1))} className='px-3 py-1 border rounded disabled:opacity-50'>Precedente</button>
                <span className='text-sm'>Pagina {ordersPage} di {ordersTotalPages}</span>
                <button disabled={ordersPage >= ordersTotalPages} onClick={() => setOrdersPage((p) => Math.min(ordersTotalPages, p + 1))} className='px-3 py-1 border rounded disabled:opacity-50'>Successiva</button>
                <select value={ordersPerPage} onChange={(e) => { setOrdersPerPage(parseInt(e.target.value) || 10); setOrdersPage(1) }} className='ml-2 border rounded px-2 py-1 text-sm'>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
            {ordersError && (
              <div className='mt-3 text-sm text-red-600'>{ordersError}</div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className='space-y-6'>
            {/* KPI Cards */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
              <StatCard title='Ordini Oggi' value={stats?.today?.total_orders ?? 0} icon='📦' />
              <StatCard title='Fatturato Oggi' value={formatEuro(stats?.today?.revenue ?? 0)} icon='💶' />
              <StatCard title='In Attesa' value={stats?.today?.pending_orders ?? 0} icon='⏳' />
              <StatCard title='Completati' value={stats?.today?.completed_orders ?? 0} icon='✅' />
            </div>

            {/* Hourly Orders Today */}
            <div className='bg-white rounded-lg shadow p-6'>
              <h3 className='text-lg font-semibold text-neutral-900 mb-4'>Andamento Ordini Oggi (per ora)</h3>
              {statsLoading ? (
                <div className='text-neutral-500'>Caricamento...</div>
              ) : statsError ? (
                <div className='text-red-600 text-sm'>{statsError}</div>
              ) : (
                <div className='h-40 flex items-end gap-1 border-t pt-2'>
                  {Array.from({ length: 24 }, (_, h) => {
                    const count = Number(stats?.hourly_orders?.[h] || 0)
                    const max = Math.max(1, ...Object.values(stats?.hourly_orders || {0:0}))
                    const height = Math.round((count / max) * 100)
                    return (
                      <div key={h} className='flex-1 flex flex-col items-center'>
                        <div className='w-full bg-qorange-500' style={{ height: `${height}%` }} />
                        <div className='text-[10px] text-neutral-400 mt-1'>{h}</div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Status Breakdown Today */}
            <div className='bg-white rounded-lg shadow p-6'>
              <h3 className='text-lg font-semibold text-neutral-900 mb-4'>Stato Ordini (oggi)</h3>
              {(() => {
                const map = stats?.status_breakdown || {}
                const total = Object.values(map).reduce((a, b) => a + b, 0)
                const entries = Object.entries(map)
                if (!total) return <div className='text-neutral-500 text-sm'>Nessun dato</div>
                return (
                  <div className='space-y-3'>
                    {entries.map(([key, val]) => {
                      const pct = Math.round((val / total) * 100)
                      const labels = { pending: 'In attesa', confirmed: 'Confermato', ready: 'Pronto', completed: 'Completato', cancelled: 'Annullato' }
                      return (
                        <div key={key}>
                          <div className='flex justify-between text-sm mb-1'>
                            <span className='capitalize'>{labels[key] || key}</span>
                            <span>{val} · {pct}%</span>
                          </div>
                          <div className='w-full h-2 bg-neutral-100 rounded'>
                            <div className='h-2 bg-qorange-500 rounded' style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })()}
            </div>

            {/* Week / Month Summary */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='bg-white rounded-lg shadow p-6'>
                <h3 className='text-lg font-semibold text-neutral-900 mb-2'>Questa Settimana</h3>
                <div className='grid grid-cols-2 gap-4 text-sm'>
                  <div>
                    <div className='text-neutral-500'>Ordini</div>
                    <div className='text-lg font-semibold'>{stats?.this_week?.total_orders ?? 0}</div>
                  </div>
                  <div>
                    <div className='text-neutral-500'>Fatturato</div>
                    <div className='text-lg font-semibold'>{formatEuro(stats?.this_week?.revenue ?? 0)}</div>
                  </div>
                </div>
              </div>
              <div className='bg-white rounded-lg shadow p-6'>
                <h3 className='text-lg font-semibold text-neutral-900 mb-2'>Questo Mese</h3>
                <div className='grid grid-cols-2 gap-4 text-sm'>
                  <div>
                    <div className='text-neutral-500'>Ordini</div>
                    <div className='text-lg font-semibold'>{stats?.this_month?.total_orders ?? 0}</div>
                  </div>
                  <div>
                    <div className='text-neutral-500'>Fatturato</div>
                    <div className='text-lg font-semibold'>{formatEuro(stats?.this_month?.revenue ?? 0)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Staff Assignment Modal */}
      {/* Order Details Modal */}
      {showOrderModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto'>
            <div className='p-6 border-b border-gray-200 flex justify-between items-center'>
              <h3 className='text-xl font-semibold text-gray-900'>Dettagli Ordine</h3>
              <button onClick={() => setShowOrderModal(false)} className='text-gray-400 hover:text-gray-600 text-2xl'>×</button>
            </div>
            <div className='p-6'>
              {!orderDetails ? (
                <div className='text-center text-neutral-600'>Caricamento dettagli...</div>
              ) : (
                <div className='space-y-4 text-sm'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <div className='text-neutral-500'>Ordine</div>
                      <div className='font-medium'>#{orderDetails.id} · {orderDetails.order_number || '-'}</div>
                    </div>
                    <div>
                      <div className='text-neutral-500'>Creato</div>
                      <div>{orderDetails.created_at ? new Date(orderDetails.created_at).toLocaleString('it-IT') : '-'}</div>
                    </div>
                    <div>
                      <div className='text-neutral-500'>Cliente</div>
                      <div>{orderDetails.customer_name || '-'}</div>
                      <div className='text-neutral-500'>{orderDetails.customer_phone || orderDetails.customer_email || ''}</div>
                    </div>
                    <div>
                      <div className='text-neutral-500'>Totale</div>
                      <div className='font-medium'>{formatEuro(orderDetails.total_amount ?? orderDetails.total)}</div>
                    </div>
                  </div>
                  <div>
                    <div className='text-neutral-700 font-medium mb-2'>Articoli</div>
                    <div className='border rounded'>
                      {(orderDetails.items || []).map((it) => (
                        <div key={it.id} className='flex justify-between items-center px-3 py-2 border-t first:border-t-0'>
                          <div>
                            <div className='font-medium'>{it.menu_item?.name || it.name || 'Prodotto'}</div>
                            <div className='text-xs text-neutral-500'>x{it.quantity}</div>
                          </div>
                          <div className='text-sm'>{formatEuro(Number(it.price_at_time) * it.quantity)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {orderDetails.notes && (
                    <div>
                      <div className='text-neutral-700 font-medium mb-1'>Note</div>
                      <pre className='bg-neutral-50 p-3 rounded whitespace-pre-wrap text-sm'>{orderDetails.notes}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {showAssignModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto'>
            <div className='p-6 border-b border-gray-200'>
              <div className='flex justify-between items-center'>
                <h3 className='text-xl font-semibold text-gray-900'>
                  Assegna Staff Esistente alla Filiale
                </h3>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className='text-gray-400 hover:text-gray-600 text-2xl'
                >
                  ×
                </button>
              </div>
              <p className='text-sm text-gray-600 mt-2'>
                Seleziona un membro dello staff esistente da assegnare a questa filiale
              </p>
            </div>
            
            <div className='p-6'>
              {availableUsers.length === 0 ? (
                <div className='text-center py-8'>
                  <div className='text-4xl mb-4'>👥</div>
                  <p className='text-gray-600'>Nessun utente disponibile per l'assegnazione</p>
                  <button
                    onClick={handleAddStaff}
                    className='mt-4 px-4 py-2 bg-qorange-600 text-white rounded-lg hover:bg-qorange-700'
                  >
                    Crea Nuovo Staff
                  </button>
                </div>
              ) : (
                <div className='space-y-4'>
                  {availableUsers.map((user) => (
                    <div key={user.id} className='border border-gray-200 rounded-lg p-4 hover:border-qorange-300 transition-colors'>
                      <div className='flex justify-between items-start'>
                        <div className='flex-1'>
                          <h4 className='font-medium text-gray-900'>{user.name}</h4>
                          <p className='text-sm text-gray-600'>{user.email}</p>
                          <p className='text-xs text-gray-500'>{user.phone}</p>
                          <div className='flex items-center gap-2 mt-2'>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.role === 'branch_manager' 
                                ? 'bg-red-100 text-red-800'
                                : user.role === 'barista'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {user.role}
                            </span>
                            {user.employee_code && (
                              <span className='text-xs text-gray-500'>
                                Codice: {user.employee_code}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className='flex flex-col gap-2'>
                          <button
                            onClick={() => assignUserToBranch({
                              user_id: user.id,
                              role_at_branch: 'branch_manager',
                              is_primary_branch: false,
                              permissions: {
                                manage_inventory: true,
                                view_reports: true,
                                handle_cash: true,
                                manage_schedule: true
                              }
                            })}
                            disabled={staffLoading}
                            className='px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50'
                          >
                            👨‍💼 Come Manager
                          </button>
                          <button
                            onClick={() => assignUserToBranch({
                              user_id: user.id,
                              role_at_branch: 'barista',
                              is_primary_branch: false,
                              permissions: {
                                manage_inventory: false,
                                view_reports: false,
                                handle_cash: true,
                                manage_schedule: false
                              }
                            })}
                            disabled={staffLoading}
                            className='px-3 py-1 bg-orange-600 text-white text-xs rounded hover:bg-orange-700 disabled:opacity-50'
                          >
                            ☕ Come Barista
                          </button>
                          <button
                            onClick={() => assignUserToBranch({
                              user_id: user.id,
                              role_at_branch: 'staff',
                              is_primary_branch: false,
                              permissions: {
                                manage_inventory: false,
                                view_reports: false,
                                handle_cash: false,
                                manage_schedule: false
                              }
                            })}
                            disabled={staffLoading}
                            className='px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 disabled:opacity-50'
                          >
                            👤 Come Staff
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}