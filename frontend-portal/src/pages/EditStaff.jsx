import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

export default function EditStaff() {
  const navigate = useNavigate()
  const { id: branchId, staffId } = useParams()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [branch, setBranch] = useState(null)
  
  const [staffData, setStaffData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'staff',
    hire_date: '',
    employee_code: '',
    permissions: {}
  })

  // Permission categories
  const permissionCategories = [
    {
      id: 'orders',
      title: '📋 Gestione Ordini',
      permissions: [
        { key: 'view_orders', label: 'Visualizza ordini', description: 'Può vedere gli ordini in corso', icon: '👀' },
        { key: 'create_orders', label: 'Crea ordini', description: 'Può inserire nuovi ordini', icon: '➕' },
        { key: 'manage_orders', label: 'Modifica ordini', description: 'Può modificare ordini esistenti', icon: '✏️' },
        { key: 'delete_orders', label: 'Elimina ordini', description: 'Può cancellare ordini', icon: '🗑️' },
      ]
    },
    {
      id: 'menu',
      title: '🍽️ Gestione Menu',
      permissions: [
        { key: 'view_menu', label: 'Visualizza menu', description: 'Può vedere il menu', icon: '👀' },
        { key: 'manage_menu', label: 'Modifica menu', description: 'Può modificare prezzi e disponibilità', icon: '✏️' },
        { key: 'create_menu', label: 'Crea prodotti', description: 'Può aggiungere nuovi prodotti', icon: '➕' },
      ]
    },
    {
      id: 'payments',
      title: '💳 Gestione Pagamenti',
      permissions: [
        { key: 'view_payments', label: 'Visualizza pagamenti', description: 'Può vedere i pagamenti', icon: '👀' },
        { key: 'process_payments', label: 'Processa pagamenti', description: 'Può gestire transazioni', icon: '💰' },
        { key: 'refund_payments', label: 'Rimborsi', description: 'Può effettuare rimborsi', icon: '↩️' },
      ]
    },
    {
      id: 'reports',
      title: '📊 Report e Analytics',
      permissions: [
        { key: 'view_reports', label: 'Visualizza report', description: 'Può vedere i report', icon: '📈' },
        { key: 'export_reports', label: 'Esporta report', description: 'Può scaricare i dati', icon: '📥' },
        { key: 'view_analytics', label: 'Analytics', description: 'Può accedere alle statistiche avanzate', icon: '📊' },
      ]
    },
    {
      id: 'staff',
      title: '👥 Gestione Staff',
      permissions: [
        { key: 'view_staff', label: 'Visualizza staff', description: 'Può vedere il personale', icon: '👀' },
        { key: 'manage_staff', label: 'Gestisci staff', description: 'Può gestire altri membri dello staff', icon: '👨‍💼' },
      ]
    },
    {
      id: 'schedules',
      title: '📅 Gestione Turni',
      permissions: [
        { key: 'view_schedules', label: 'Visualizza turni', description: 'Può vedere i turni di lavoro', icon: '👀' },
        { key: 'manage_schedules', label: 'Gestisci turni', description: 'Può modificare i turni di lavoro', icon: '📝' },
      ]
    },
    {
      id: 'settings',
      title: '⚙️ Impostazioni',
      permissions: [
        { key: 'manage_settings', label: 'Impostazioni filiale', description: 'Può modificare le impostazioni della filiale', icon: '🏦' },
        { key: 'manage_pos', label: 'Impostazioni POS', description: 'Può configurare il sistema POS', icon: '🖥️' },
      ]
    }
  ]

  // Role templates
  const roleTemplates = {
    staff: ['view_orders', 'create_orders', 'view_menu', 'view_payments', 'process_payments'],
    cashier: [
      'view_orders', 'create_orders', 'manage_orders', 'view_menu', 
      'view_payments', 'process_payments', 'refund_payments'
    ],
    supervisor: [
      'view_orders', 'create_orders', 'manage_orders', 'delete_orders',
      'view_menu', 'manage_menu', 'view_payments', 'process_payments', 'refund_payments',
      'view_reports', 'view_staff', 'view_schedules'
    ],
    branch_manager: [
      'view_orders', 'create_orders', 'manage_orders', 'delete_orders',
      'view_menu', 'manage_menu', 'create_menu', 'view_payments', 'process_payments', 'refund_payments',
      'view_reports', 'export_reports', 'view_analytics',
      'view_staff', 'manage_staff', 'manage_schedules',
      'manage_settings'
    ]
  }

  useEffect(() => {
    loadData()
  }, [branchId, staffId])

  // Apply role template only for new staff (when permissions are empty)
  const applyRoleTemplate = (role) => {
    if (roleTemplates[role] && Object.keys(staffData.permissions).length === 0) {
      const newPermissions = {}
      roleTemplates[role].forEach(permission => {
        newPermissions[permission] = true
      })
      setStaffData(prev => ({
        ...prev,
        permissions: newPermissions
      }))
    }
  }

  const loadData = async () => {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      navigate('/login-chain-owner')
      return
    }

    try {
      // Load branch data
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

      // Load staff data using debug endpoint (temporary fix)
      const staffResponse = await fetch(`https://qofferun.com/api/v1/debug-staff/${staffId}`, {
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (staffResponse.ok) {
        const staffResult = await staffResponse.json()
        const staff = staffResult.data
        
        setStaffData({
          name: staff.name || '',
          email: staff.email || '',
          phone: staff.phone || '',
          role: staff.role_at_branch || staff.role || 'staff',
          hire_date: staff.hire_date ? staff.hire_date.split('T')[0] : '',
          employee_code: staff.employee_code || '',
          permissions: staff.permissions || {}
        })
      } else {
        setError('Staff non trovato')
      }
    } catch (err) {
      setError('Errore nel caricamento dei dati')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setStaffData(prev => ({...prev, [field]: value}))
    
    // Apply role template when role changes and ask user if they want to update permissions
    if (field === 'role' && roleTemplates[value]) {
      if (confirm('Vuoi applicare i permessi predefiniti per questo ruolo?')) {
        applyRoleTemplate(value)
      }
    }
  }

  const togglePermission = (permissionKey) => {
    setStaffData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permissionKey]: !prev.permissions[permissionKey]
      }
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    // Validation
    if (!staffData.name || !staffData.email) {
      setError('Nome ed email sono obbligatori')
      setSaving(false)
      return
    }

    const token = localStorage.getItem('auth_token')
    if (!token) {
      navigate('/login-chain-owner')
      return
    }

    try {
      const requestData = {
        name: staffData.name,
        email: staffData.email,
        phone: staffData.phone,
        hire_date: staffData.hire_date,
        work_preferences: {
          role: staffData.role,
          permissions: staffData.permissions,
          branch_id: parseInt(branchId)
        }
      }

      // Update staff permissions using debug endpoint (temporary fix)
      const response = await fetch(`https://qofferun.com/api/v1/debug-staff/${staffId}/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          permissions: staffData.permissions
        })
      })

      const result = await response.json()
      
      if (response.ok) {
        setSuccess('Staff aggiornato con successo!')
        setTimeout(() => {
          navigate(`/branch/${branchId}`)
        }, 2000)
      } else {
        setError(result.message || 'Errore durante l\'aggiornamento')
      }
    } catch (err) {
      setError('Errore di connessione')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-neutral-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='text-4xl mb-4'>👥</div>
          <p className='text-neutral-600'>Caricamento dati staff...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-neutral-50'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <button
            onClick={() => navigate(`/branch/${branchId}`)}
            className='flex items-center gap-2 text-qorange-600 hover:text-qorange-700 mb-4'
          >
            ← Torna alla Filiale
          </button>
          <h1 className='text-3xl font-bold text-neutral-900'>Modifica Staff</h1>
          {branch && (
            <p className='text-neutral-600 mt-2'>
              {branch.name} - {branch.city}
            </p>
          )}
        </div>

        {/* Messages */}
        {error && (
          <div className='bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6'>
            {error}
          </div>
        )}

        {success && (
          <div className='bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6'>
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className='space-y-8'>
          {/* Basic Info */}
          <div className='bg-white rounded-lg shadow p-6'>
            <h2 className='text-xl font-semibold mb-6'>Informazioni Personali</h2>
            
            <div className='grid md:grid-cols-2 gap-6'>
              <div>
                <label className='block text-sm font-medium text-neutral-700 mb-2'>
                  Nome Completo *
                </label>
                <input
                  type='text'
                  value={staffData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className='w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qorange-500 focus:border-qorange-500'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-neutral-700 mb-2'>
                  Email *
                </label>
                <input
                  type='email'
                  value={staffData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className='w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qorange-500 focus:border-qorange-500'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-neutral-700 mb-2'>
                  Telefono
                </label>
                <input
                  type='tel'
                  value={staffData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className='w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qorange-500 focus:border-qorange-500'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-neutral-700 mb-2'>
                  Data Assunzione
                </label>
                <input
                  type='date'
                  value={staffData.hire_date}
                  onChange={(e) => handleInputChange('hire_date', e.target.value)}
                  className='w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qorange-500 focus:border-qorange-500'
                />
              </div>
            </div>

            {staffData.employee_code && (
              <div className='mt-4 p-4 bg-neutral-50 rounded-lg'>
                <div className='text-sm text-neutral-600'>Codice Dipendente</div>
                <div className='font-mono font-semibold'>{staffData.employee_code}</div>
              </div>
            )}
          </div>

          {/* Role & Permissions */}
          <div className='bg-white rounded-lg shadow p-6'>
            <h2 className='text-xl font-semibold mb-6'>Ruolo e Permessi</h2>
            
            <div className='mb-6'>
              <label className='block text-sm font-medium text-neutral-700 mb-2'>
                Ruolo
              </label>
              <select
                value={staffData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                className='w-full md:w-1/2 px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qorange-500 focus:border-qorange-500'
              >
                <option value='staff'>Staff</option>
                <option value='cashier'>Cassiere</option>
                <option value='supervisor'>Supervisore</option>
                <option value='branch_manager'>Manager Filiale</option>
              </select>
            </div>

            {/* Permission Categories */}
            <div className='space-y-6'>
              <h3 className='text-lg font-medium'>Permessi Dettagliati</h3>
              
              {permissionCategories.map((category) => (
                <div key={category.id} className='border border-neutral-200 rounded-lg p-4'>
                  <h4 className='font-semibold text-neutral-900 mb-3'>{category.title}</h4>
                  <div className='grid gap-3'>
                    {category.permissions.map((permission) => {
                      const isChecked = !!staffData.permissions[permission.key]
                      return (
                      <label key={permission.key} className='flex items-start gap-3 cursor-pointer'>
                        <input
                          type='checkbox'
                          checked={isChecked}
                          onChange={() => togglePermission(permission.key)}
                          className='mt-1 w-4 h-4 text-qorange-600 border-neutral-300 rounded focus:ring-qorange-500'
                        />
                        <div>
                          <div className='flex items-center gap-2'>
                            <span>{permission.icon}</span>
                            <span className='font-medium'>{permission.label}</span>
                          </div>
                          <p className='text-sm text-neutral-600'>{permission.description}</p>
                        </div>
                      </label>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className='flex flex-col sm:flex-row gap-4 justify-end'>
            <button
              type='button'
              onClick={() => navigate(`/branch/${branchId}`)}
              className='px-6 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50'
            >
              Annulla
            </button>
            <button
              type='submit'
              disabled={saving}
              className='px-6 py-2 bg-qorange-600 text-white rounded-lg hover:bg-qorange-700 disabled:opacity-50'
            >
              {saving ? 'Salvataggio...' : 'Aggiorna Staff'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}