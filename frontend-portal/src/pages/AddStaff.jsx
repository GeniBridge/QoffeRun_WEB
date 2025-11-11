import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const Field = ({label, children, required}) => (
  <label className='block text-sm font-medium text-neutral-700'>
    {label} {required && <span className='text-red-500'>*</span>}
    <div className='mt-1'>{children}</div>
  </label>
)

const PermissionGroup = ({ title, permissions, selectedPermissions, onToggle }) => (
  <div className='bg-white rounded-lg border p-4'>
    <h3 className='font-medium text-neutral-900 mb-3'>{title}</h3>
    <div className='space-y-2'>
      {permissions.map(permission => (
        <label key={permission.key} className='flex items-center gap-3'>
          <input
            type='checkbox'
            checked={selectedPermissions.includes(permission.key)}
            onChange={() => onToggle(permission.key)}
            className='w-4 h-4 text-qorange-600 focus:ring-qorange-500'
          />
          <div>
            <div className='text-sm font-medium text-neutral-900'>{permission.label}</div>
            <div className='text-xs text-neutral-600'>{permission.description}</div>
          </div>
        </label>
      ))}
    </div>
  </div>
)

export default function AddStaff() {
  const { id: branchId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [branch, setBranch] = useState(null)

  const [staffData, setStaffData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'staff',
    employee_code: '',
    permissions: []
  })

  // Permission definitions
  const permissionGroups = [
    {
      title: '📋 Gestione Ordini',
      permissions: [
        { key: 'orders.view', label: 'Visualizza ordini', description: 'Può vedere tutti gli ordini' },
        { key: 'orders.create', label: 'Crea ordini', description: 'Può creare nuovi ordini' },
        { key: 'orders.update', label: 'Modifica ordini', description: 'Può modificare ordini esistenti' },
        { key: 'orders.delete', label: 'Cancella ordini', description: 'Può cancellare ordini' }
      ]
    },
    {
      title: '🍕 Gestione Menu',
      permissions: [
        { key: 'menu.view', label: 'Visualizza menu', description: 'Può vedere il menu' },
        { key: 'menu.update', label: 'Modifica menu', description: 'Può modificare prezzi e disponibilità' },
        { key: 'menu.create', label: 'Aggiungi prodotti', description: 'Può aggiungere nuovi prodotti' }
      ]
    },
    {
      title: '💰 Gestione Pagamenti',
      permissions: [
        { key: 'payments.view', label: 'Visualizza pagamenti', description: 'Può vedere i pagamenti' },
        { key: 'payments.process', label: 'Elabora pagamenti', description: 'Può elaborare i pagamenti' },
        { key: 'payments.refund', label: 'Rimborsi', description: 'Può emettere rimborsi' }
      ]
    },
    {
      title: '📊 Report e Analytics',
      permissions: [
        { key: 'reports.view', label: 'Visualizza report', description: 'Può vedere i report di vendita' },
        { key: 'reports.export', label: 'Esporta report', description: 'Può esportare i report' },
        { key: 'analytics.view', label: 'Analytics', description: 'Può vedere le analytics dettagliate' }
      ]
    },
    {
      title: '👥 Gestione Staff',
      permissions: [
        { key: 'staff.view', label: 'Visualizza staff', description: 'Può vedere il personale' },
        { key: 'staff.manage', label: 'Gestisci staff', description: 'Può gestire altri membri dello staff' },
        { key: 'schedules.manage', label: 'Gestisci turni', description: 'Può creare e modificare i turni' }
      ]
    },
    {
      title: '⚙️ Impostazioni',
      permissions: [
        { key: 'settings.branch', label: 'Impostazioni filiale', description: 'Può modificare le impostazioni della filiale' },
        { key: 'settings.integrations', label: 'Integrazioni', description: 'Può gestire le integrazioni' }
      ]
    }
  ]

  const roleTemplates = {
    staff: ['orders.view', 'orders.create', 'menu.view', 'payments.view', 'payments.process'],
    branch_manager: [
      'orders.view', 'orders.create', 'orders.update', 'orders.delete',
      'menu.view', 'menu.update', 'menu.create',
      'payments.view', 'payments.process', 'payments.refund',
      'reports.view', 'reports.export', 'analytics.view',
      'staff.view', 'staff.manage', 'schedules.manage',
      'settings.branch'
    ]
  }

  useEffect(() => {
    loadBranchData()
  }, [branchId])

  useEffect(() => {
    // Apply role template permissions
    if (roleTemplates[staffData.role]) {
      setStaffData(prev => ({
        ...prev,
        permissions: roleTemplates[staffData.role]
      }))
    }
  }, [staffData.role])

  const loadBranchData = async () => {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      navigate('/login-chain-owner')
      return
    }

    try {
      const response = await fetch(`https://api.qofferun.com/api/v1/branches/${branchId}`, {
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
      setError('Errore nel caricamento della filiale')
    }
  }

  const generateEmployeeCode = () => {
    const prefix = branch?.code?.substring(0, 3) || 'EMP'
    const number = Math.floor(Math.random() * 9999) + 1
    const code = `${prefix}${number.toString().padStart(4, '0')}`
    setStaffData(prev => ({...prev, employee_code: code}))
  }

  const togglePermission = (permissionKey) => {
    setStaffData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionKey)
        ? prev.permissions.filter(p => p !== permissionKey)
        : [...prev.permissions, permissionKey]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validation
    if (!staffData.name || !staffData.email || !staffData.password) {
      setError('Compila tutti i campi obbligatori')
      return
    }

    if (staffData.password.length < 8) {
      setError('La password deve essere di almeno 8 caratteri')
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('auth_token')
      
      // Use the new StaffController API
      const staffResponse = await fetch('https://api.qofferun.com/api/v1/staff', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: staffData.name,
          email: staffData.email,
          password: staffData.password,
          phone: staffData.phone,
          chain_id: branch?.chain_id,
          employee_code: staffData.employee_code || undefined,
          hire_date: new Date().toISOString().split('T')[0], // Today's date
          work_preferences: {
            role: staffData.role,
            permissions: staffData.permissions || [],
            branch_id: branchId
          }
        })
      })

      const staffData_response = await staffResponse.json()
      
      if (!staffResponse.ok) {
        if (staffData_response.errors) {
          // Handle validation errors
          const errorMessages = Object.values(staffData_response.errors).flat()
          setError(errorMessages.join(', '))
        } else {
          setError(staffData_response.message || 'Errore nella creazione dello staff')
        }
        return
      }

      // If it's a branch manager, also create the branch manager assignment
      if (staffData.role === 'branch_manager') {
        const managerResponse = await fetch('https://api.qofferun.com/api/v1/branch-managers', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            branch_id: branchId,
            user_id: staffData_response.data.id,
            is_primary_manager: false,
            permissions: staffData.permissions || [],
            can_access_reports: staffData.permissions.includes('reports.view'),
            can_manage_staff: staffData.permissions.includes('staff.manage'),
            can_modify_menu: staffData.permissions.includes('menu.update'),
            notes: `Creato tramite interfaccia staff per filiale ${branchId}`
          })
        })

        if (!managerResponse.ok) {
          // Staff was created but manager assignment failed
          console.warn('Staff created but manager assignment failed')
        }
      }

      setSuccess('Staff aggiunto con successo!')
      setTimeout(() => {
        navigate(`/branch/${branchId}?tab=staff`)
      }, 2000)
      
    } catch (err) {
      console.error('Error creating staff:', err)
      setError('Errore di connessione. Riprova più tardi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-neutral-50'>
      {/* Header */}
      <header className='bg-white shadow-sm border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
          <div className='flex items-center gap-4'>
            <button
              onClick={() => navigate(`/branch/${branchId}?tab=staff`)}
              className='text-qorange-600 hover:text-qorange-700'
            >
              ← Torna alla Filiale
            </button>
            <div>
              <h1 className='text-xl font-bold text-neutral-900'>
                Aggiungi Staff
              </h1>
              <p className='text-sm text-neutral-600'>
                {branch ? `Filiale: ${branch.name}` : 'Caricamento...'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='bg-white rounded-xl shadow p-8'>
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

          <form onSubmit={handleSubmit} className='space-y-8'>
            {/* Informazioni Base */}
            <div>
              <h2 className='text-lg font-semibold text-neutral-900 mb-4'>
                Informazioni Personali
              </h2>
              <div className='grid md:grid-cols-2 gap-6'>
                <Field label="Nome e Cognome" required>
                  <input
                    type='text'
                    className='w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qorange-500 focus:border-transparent'
                    placeholder='Mario Rossi'
                    value={staffData.name}
                    onChange={e => setStaffData({...staffData, name: e.target.value})}
                  />
                </Field>

                <Field label="Email" required>
                  <input
                    type='email'
                    className='w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qorange-500 focus:border-transparent'
                    placeholder='mario.rossi@email.com'
                    value={staffData.email}
                    onChange={e => setStaffData({...staffData, email: e.target.value})}
                  />
                </Field>

                <Field label="Telefono">
                  <input
                    type='tel'
                    className='w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qorange-500 focus:border-transparent'
                    placeholder='+39 340 1234567'
                    value={staffData.phone}
                    onChange={e => setStaffData({...staffData, phone: e.target.value})}
                  />
                </Field>

                <Field label="Password" required>
                  <input
                    type='password'
                    className='w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qorange-500 focus:border-transparent'
                    placeholder='Minimo 8 caratteri'
                    value={staffData.password}
                    onChange={e => setStaffData({...staffData, password: e.target.value})}
                  />
                </Field>
              </div>
            </div>

            {/* Ruolo e Codice */}
            <div>
              <h2 className='text-lg font-semibold text-neutral-900 mb-4'>
                Ruolo e Identificazione
              </h2>
              <div className='grid md:grid-cols-2 gap-6'>
                <Field label="Ruolo" required>
                  <select
                    className='w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qorange-500 focus:border-transparent'
                    value={staffData.role}
                    onChange={e => setStaffData({...staffData, role: e.target.value})}
                  >
                    <option value="staff">👤 Staff</option>
                    <option value="branch_manager">👨‍💼 Manager Filiale</option>
                  </select>
                  <p className='text-xs text-neutral-500 mt-1'>
                    {staffData.role === 'branch_manager' 
                      ? 'Può gestire la filiale e il personale'
                      : 'Può gestire ordini e operazioni base'
                    }
                  </p>
                </Field>

                <Field label="Codice Dipendente">
                  <div className='flex gap-2'>
                    <input
                      type='text'
                      className='flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qorange-500 focus:border-transparent font-mono'
                      placeholder='EMP0001'
                      value={staffData.employee_code}
                      onChange={e => setStaffData({...staffData, employee_code: e.target.value.toUpperCase()})}
                    />
                    <button
                      type='button'
                      onClick={generateEmployeeCode}
                      className='px-4 py-2 bg-neutral-600 text-white rounded-lg hover:bg-neutral-700'
                    >
                      Genera
                    </button>
                  </div>
                </Field>
              </div>
            </div>

            {/* Permessi */}
            <div>
              <h2 className='text-lg font-semibold text-neutral-900 mb-4'>
                Permessi e Autorizzazioni
              </h2>
              <p className='text-sm text-neutral-600 mb-6'>
                Seleziona le funzionalità che questo staff può utilizzare. I permessi sono già preconfigurati in base al ruolo selezionato.
              </p>
              
              <div className='grid gap-4'>
                {permissionGroups.map(group => (
                  <PermissionGroup
                    key={group.title}
                    title={group.title}
                    permissions={group.permissions}
                    selectedPermissions={staffData.permissions}
                    onToggle={togglePermission}
                  />
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className='flex justify-between pt-6 border-t'>
              <button
                type='button'
                onClick={() => navigate(`/branch/${branchId}?tab=staff`)}
                className='px-6 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50'
              >
                Annulla
              </button>
              
              <button
                type='submit'
                disabled={loading}
                className={`px-6 py-2 rounded-lg font-medium text-white ${
                  loading 
                  ? 'bg-neutral-400 cursor-not-allowed' 
                  : 'bg-qorange-600 hover:bg-qorange-700'
                }`}
              >
                {loading ? 'Creazione...' : 'Aggiungi Staff'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}