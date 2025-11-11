import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const PermissionMatrix = ({ staff, permissions, onToggle }) => (
  <div className='bg-white rounded-lg shadow overflow-hidden'>
    <div className='overflow-x-auto'>
      <table className='w-full'>
        <thead className='bg-neutral-50'>
          <tr>
            <th className='px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider'>
              Staff / Permessi
            </th>
            {permissions.map(permission => (
              <th key={permission.key} className='px-3 py-3 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider'>
                <div className='writing-vertical transform -rotate-90 whitespace-nowrap'>
                  {permission.label}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className='bg-white divide-y divide-neutral-200'>
          {staff.map(member => (
            <tr key={member.id} className='hover:bg-neutral-50'>
              <td className='px-6 py-4 whitespace-nowrap'>
                <div className='flex items-center'>
                  <div>
                    <div className='text-sm font-medium text-neutral-900'>{member.name}</div>
                    <div className='text-sm text-neutral-500'>{member.email}</div>
                    <div className='text-xs text-neutral-400'>
                      {member.role === 'branch_manager' ? 'Manager' : 'Staff'}
                    </div>
                  </div>
                </div>
              </td>
              {permissions.map(permission => (
                <td key={permission.key} className='px-3 py-4 text-center'>
                  <input
                    type='checkbox'
                    checked={member.permissions?.includes(permission.key) || false}
                    onChange={() => onToggle(member.id, permission.key)}
                    className='w-4 h-4 text-qorange-600 focus:ring-qorange-500 rounded'
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)

const PermissionGroup = ({ group, expanded, onToggle }) => (
  <div className='bg-white rounded-lg shadow'>
    <button
      onClick={() => onToggle(group.id)}
      className='w-full px-6 py-4 text-left flex items-center justify-between hover:bg-neutral-50'
    >
      <div>
        <h3 className='text-lg font-medium text-neutral-900'>{group.title}</h3>
        <p className='text-sm text-neutral-600'>{group.permissions.length} permessi</p>
      </div>
      <span className={`transform transition-transform ${expanded ? 'rotate-180' : ''}`}>
        ▼
      </span>
    </button>
    
    {expanded && (
      <div className='px-6 pb-6 space-y-3'>
        {group.permissions.map(permission => (
          <div key={permission.key} className='flex items-start gap-3 p-3 border border-neutral-200 rounded'>
            <div className='flex-1'>
              <div className='font-medium text-neutral-900'>{permission.label}</div>
              <div className='text-sm text-neutral-600'>{permission.description}</div>
              <div className='text-xs text-neutral-500 mt-1'>Chiave: {permission.key}</div>
            </div>
            <div className='text-2xl'>{permission.icon}</div>
          </div>
        ))}
      </div>
    )}
  </div>
)

export default function PermissionManagement() {
  const { id: branchId } = useParams()
  const navigate = useNavigate()
  const [branch, setBranch] = useState(null)
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [expandedGroups, setExpandedGroups] = useState({})

  const permissionGroups = [
    {
      id: 'orders',
      title: '📋 Gestione Ordini',
      permissions: [
        { key: 'orders.view', label: 'Visualizza', description: 'Può vedere tutti gli ordini', icon: '👀' },
        { key: 'orders.create', label: 'Crea', description: 'Può creare nuovi ordini', icon: '➕' },
        { key: 'orders.update', label: 'Modifica', description: 'Può modificare ordini esistenti', icon: '✏️' },
        { key: 'orders.delete', label: 'Cancella', description: 'Può cancellare ordini', icon: '🗑️' },
        { key: 'orders.refund', label: 'Rimborsi', description: 'Può elaborare rimborsi', icon: '💸' }
      ]
    },
    {
      id: 'menu',
      title: '🍕 Gestione Menu',
      permissions: [
        { key: 'menu.view', label: 'Visualizza', description: 'Può vedere il menu', icon: '👀' },
        { key: 'menu.update', label: 'Modifica', description: 'Può modificare prezzi e disponibilità', icon: '✏️' },
        { key: 'menu.create', label: 'Aggiungi', description: 'Può aggiungere nuovi prodotti', icon: '➕' },
        { key: 'menu.delete', label: 'Rimuovi', description: 'Può rimuovere prodotti', icon: '🗑️' }
      ]
    },
    {
      id: 'payments',
      title: '💰 Gestione Pagamenti',
      permissions: [
        { key: 'payments.view', label: 'Visualizza', description: 'Può vedere i pagamenti', icon: '👀' },
        { key: 'payments.process', label: 'Elabora', description: 'Può elaborare i pagamenti', icon: '💳' },
        { key: 'payments.refund', label: 'Rimborsi', description: 'Può emettere rimborsi', icon: '💸' },
        { key: 'payments.reports', label: 'Report', description: 'Può vedere report finanziari', icon: '📊' }
      ]
    },
    {
      id: 'staff',
      title: '👥 Gestione Staff',
      permissions: [
        { key: 'staff.view', label: 'Visualizza', description: 'Può vedere il personale', icon: '👀' },
        { key: 'staff.manage', label: 'Gestisci', description: 'Può gestire altri membri dello staff', icon: '👨‍💼' },
        { key: 'schedules.view', label: 'Vedi Turni', description: 'Può vedere i turni', icon: '📅' },
        { key: 'schedules.manage', label: 'Gestisci Turni', description: 'Può creare e modificare i turni', icon: '⏰' }
      ]
    },
    {
      id: 'reports',
      title: '📊 Report e Analytics',
      permissions: [
        { key: 'reports.view', label: 'Visualizza', description: 'Può vedere i report di vendita', icon: '👀' },
        { key: 'reports.export', label: 'Esporta', description: 'Può esportare i report', icon: '📤' },
        { key: 'analytics.view', label: 'Analytics', description: 'Può vedere le analytics dettagliate', icon: '📈' },
        { key: 'analytics.advanced', label: 'Analytics Avanzate', description: 'Accesso alle analytics avanzate', icon: '🔬' }
      ]
    },
    {
      id: 'settings',
      title: '⚙️ Impostazioni',
      permissions: [
        { key: 'settings.branch', label: 'Filiale', description: 'Può modificare le impostazioni della filiale', icon: '🏪' },
        { key: 'settings.integrations', label: 'Integrazioni', description: 'Può gestire le integrazioni', icon: '🔌' },
        { key: 'settings.notifications', label: 'Notifiche', description: 'Può configurare le notifiche', icon: '🔔' },
        { key: 'settings.security', label: 'Sicurezza', description: 'Può modificare impostazioni di sicurezza', icon: '🔒' }
      ]
    }
  ]

  const allPermissions = permissionGroups.flatMap(group => group.permissions)

  useEffect(() => {
    loadData()
  }, [branchId])

  const loadData = async () => {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      navigate('/login-chain-owner')
      return
    }

    try {
      // Load branch info
      const branchResponse = await fetch(`https://api.qofferun.com/api/v1/branches/${branchId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      })

      if (branchResponse.ok) {
        const branchData = await branchResponse.json()
        setBranch(branchData.data)
      }

      // Load staff with permissions
      const staffResponse = await fetch(`https://api.qofferun.com/api/v1/branches/${branchId}/staff`, {
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

  const togglePermission = async (staffId, permissionKey) => {
    const token = localStorage.getItem('auth_token')
    
    try {
      // Update local state optimistically
      setStaff(prevStaff => 
        prevStaff.map(member => {
          if (member.id === staffId) {
            const currentPermissions = member.permissions || []
            const newPermissions = currentPermissions.includes(permissionKey)
              ? currentPermissions.filter(p => p !== permissionKey)
              : [...currentPermissions, permissionKey]
            
            return { ...member, permissions: newPermissions }
          }
          return member
        })
      )

      // TODO: Make API call to update permissions
      // const response = await fetch(`https://api.qofferun.com/api/v1/staff/${staffId}/permissions`, {
      //   method: 'PUT',
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ permission_key: permissionKey })
      // })

      setSuccess('Permessi aggiornati con successo!')
      setTimeout(() => setSuccess(''), 3000)
      
    } catch (err) {
      setError('Errore nell\'aggiornamento dei permessi')
      // Reload data to restore previous state
      loadData()
    }
  }

  const toggleGroupExpansion = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }))
  }

  const applyRoleTemplate = (staffId, template) => {
    // TODO: Apply role-based permission template
    console.log('Apply template', template, 'to staff', staffId)
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-neutral-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='text-4xl mb-4'>🔐</div>
          <p className='text-neutral-600'>Caricamento permessi...</p>
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
                onClick={() => navigate(`/branch/${branchId}?tab=staff`)}
                className='text-qorange-600 hover:text-qorange-700'
              >
                ← Torna alla Filiale
              </button>
              <div>
                <h1 className='text-xl font-bold text-neutral-900'>
                  Gestione Permessi
                </h1>
                <p className='text-sm text-neutral-600'>
                  {branch?.name} - Matrice permessi staff
                </p>
              </div>
            </div>
            
            <div className='flex items-center gap-4'>
              <span className='text-sm text-neutral-600'>
                {staff.length} membri staff
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {error && (
          <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700'>
            {error}
          </div>
        )}

        {success && (
          <div className='mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700'>
            {success}
          </div>
        )}

        {staff.length === 0 ? (
          <div className='bg-white rounded-lg shadow p-12 text-center'>
            <div className='text-4xl mb-4'>👥</div>
            <h2 className='text-xl font-semibold text-neutral-900 mb-2'>
              Nessun Staff da Gestire
            </h2>
            <p className='text-neutral-600 mb-4'>
              Aggiungi prima del personale per poter gestire i permessi
            </p>
            <button
              onClick={() => navigate(`/branch/${branchId}/add-staff`)}
              className='px-6 py-2 bg-qorange-600 text-white rounded-lg hover:bg-qorange-700'
            >
              Aggiungi Staff
            </button>
          </div>
        ) : (
          <div className='space-y-8'>
            {/* Permission Matrix */}
            <div>
              <h2 className='text-lg font-semibold text-neutral-900 mb-4'>
                Matrice Permessi
              </h2>
              <PermissionMatrix
                staff={staff}
                permissions={allPermissions}
                onToggle={togglePermission}
              />
            </div>

            {/* Permission Groups Detail */}
            <div>
              <h2 className='text-lg font-semibold text-neutral-900 mb-4'>
                Dettaglio Permessi per Categoria
              </h2>
              <div className='space-y-4'>
                {permissionGroups.map(group => (
                  <PermissionGroup
                    key={group.id}
                    group={group}
                    expanded={expandedGroups[group.id]}
                    onToggle={toggleGroupExpansion}
                  />
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className='bg-white rounded-lg shadow p-6'>
              <h3 className='text-lg font-semibold text-neutral-900 mb-4'>
                Azioni Rapide
              </h3>
              <div className='grid md:grid-cols-3 gap-4'>
                <button
                  onClick={() => console.log('Apply manager template')}
                  className='p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 text-left'
                >
                  <div className='font-medium text-neutral-900'>👨‍💼 Template Manager</div>
                  <div className='text-sm text-neutral-600'>Applica tutti i permessi da manager</div>
                </button>
                
                <button
                  onClick={() => console.log('Apply staff template')}
                  className='p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 text-left'
                >
                  <div className='font-medium text-neutral-900'>👤 Template Staff</div>
                  <div className='text-sm text-neutral-600'>Applica permessi base staff</div>
                </button>
                
                <button
                  onClick={() => console.log('Reset all permissions')}
                  className='p-4 border border-red-200 text-red-700 rounded-lg hover:bg-red-50 text-left'
                >
                  <div className='font-medium'>🚫 Reset Tutto</div>
                  <div className='text-sm'>Rimuovi tutti i permessi</div>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}