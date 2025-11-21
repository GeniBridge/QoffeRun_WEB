import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const TimeSlot = ({ day, shift, staff, onAssign, onRemove }) => (
  <div className='bg-white rounded-lg border p-4'>
    <div className='flex justify-between items-start mb-3'>
      <div>
        <h3 className='font-medium text-neutral-900'>{day}</h3>
        <p className='text-sm text-neutral-600'>{shift.name} ({shift.start} - {shift.end})</p>
      </div>
      <button
        onClick={() => onAssign(day, shift.id)}
        className='px-3 py-1 bg-qorange-600 text-white text-sm rounded hover:bg-qorange-700'
      >
        + Assegna
      </button>
    </div>
    
    <div className='space-y-2'>
      {shift.assigned?.map(assignment => (
        <div key={assignment.id} className='flex justify-between items-center p-2 bg-neutral-50 rounded'>
          <span className='text-sm'>{assignment.staff_name}</span>
          <button
            onClick={() => onRemove(assignment.id)}
            className='text-red-600 hover:text-red-700 text-xs'
          >
            ✕
          </button>
        </div>
      )) || (
        <p className='text-xs text-neutral-500 italic'>Nessuno assegnato</p>
      )}
    </div>
  </div>
)

export default function ScheduleManagement() {
  const { id: branchId } = useParams()
  const navigate = useNavigate()
  const [branch, setBranch] = useState(null)
  const [staff, setStaff] = useState([])
  const [schedules, setSchedules] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedWeek, setSelectedWeek] = useState(new Date())
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState({ day: null, shiftId: null })

  const shifts = [
    { id: 'morning', name: 'Mattino', start: '06:00', end: '14:00' },
    { id: 'afternoon', name: 'Pomeriggio', start: '14:00', end: '22:00' },
    { id: 'night', name: 'Sera/Notte', start: '22:00', end: '06:00' }
  ]

  const daysOfWeek = [
    'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'
  ]

  useEffect(() => {
    loadData()
  }, [branchId, selectedWeek])

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

      // Load staff using debug endpoint (temporary fix)
      const staffResponse = await fetch(`https://qofferun.com/api/v1/debug-branch-staff/${branchId}`, {
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (staffResponse.ok) {
        const staffData = await staffResponse.json()
        // Support both array and paginated shapes
        const list = Array.isArray(staffData.data) ? staffData.data : (staffData.data?.data || [])
        setStaff(list)
      }

      // Calculate week dates for schedule loading
      const currentWeekDates = getWeekDates(selectedWeek)
      
      // Load schedules for the selected week
      const startDate = currentWeekDates[0].toISOString().split('T')[0]
      const endDate = currentWeekDates[6].toISOString().split('T')[0]
      
      // Using debug endpoint temporarily
      const schedulesResponse = await fetch(`https://qofferun.com/api/v1/debug-branch/${branchId}/schedules?start_date=${startDate}&end_date=${endDate}`, {
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (schedulesResponse.ok) {
        const schedulesData = await schedulesResponse.json()
        if (schedulesData.success) {
          // Transform API response to component format
          const formattedSchedules = {}
          Object.entries(schedulesData.data || {}).forEach(([date, shifts]) => {
            formattedSchedules[date] = {}
            Object.entries(shifts).forEach(([shiftType, assignments]) => {
              formattedSchedules[date][shiftType] = assignments.map(assignment => ({
                id: assignment.id,
                staff: assignment.staff,
                staff_name: assignment.staff?.name || 'Unknown',
                shift_id: assignment.shift_type,
                date: new Date(assignment.date)
              }))
            })
          })
          setSchedules(formattedSchedules)
        }
      }
      
    } catch (err) {
      setError('Errore nel caricamento dei dati')
    } finally {
      setLoading(false)
    }
  }

  const getWeekDates = (startDate) => {
    const week = []
    const start = new Date(startDate)
    const day = start.getDay()
    const diff = start.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is Sunday
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(start.setDate(diff + i))
      week.push(new Date(date))
    }
    return week
  }

  const weekDates = getWeekDates(selectedWeek)

  const handleAssignStaff = (day, shiftId) => {
    setSelectedAssignment({ day, shiftId })
    setShowAssignModal(true)
  }

  const handleConfirmAssignment = async (staffId) => {
    const { day, shiftId } = selectedAssignment
    
    try {
      const assignment = {
        staff_id: staffId,
        shift_id: shiftId,
        date: typeof day === 'string' ? day : day.toISOString().split('T')[0],
        branch_id: branchId
      }

      // Using debug endpoint temporarily
      const response = await fetch('https://qofferun.com/api/v1/debug-schedules-assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assignment)
      })

      if (response.ok) {
        const result = await response.json()
        const created = result.data || null
        const dayKey = typeof day === 'string' ? day : day.toISOString().split('T')[0]
        setSchedules(prev => ({
          ...prev,
          [dayKey]: {
            ...prev[dayKey],
            [shiftId]: [...(prev[dayKey]?.[shiftId] || []), { 
              id: created?.id || Date.now(), 
              staff: staff.find(s => s.id === staffId),
              staff_name: staff.find(s => s.id === staffId)?.name || 'Unknown',
              shift_id: shiftId,
              date: day
            }]
          }
        }))
        setShowAssignModal(false)
      } else {
        setError('Errore nell\'assegnazione del turno')
      }
    } catch (err) {
      setError('Errore di connessione')
    }
  }

  const handleRemoveAssignment = async (assignmentId) => {
    
    try {
      // Using debug endpoint temporarily
      const response = await fetch(`https://qofferun.com/api/v1/debug-schedules-assignments/${assignmentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        // Remove from local state
        setSchedules(prev => {
          const newSchedules = { ...prev }
          Object.keys(newSchedules).forEach(date => {
            Object.keys(newSchedules[date]).forEach(shift => {
              newSchedules[date][shift] = newSchedules[date][shift].filter(a => a.id !== assignmentId)
            })
          })
          return newSchedules
        })
      } else {
        setError('Errore nella rimozione del turno')
      }
    } catch (err) {
      setError('Errore di connessione')
    }
  }

  const navigateWeek = (direction) => {
    const newWeek = new Date(selectedWeek)
    newWeek.setDate(newWeek.getDate() + (direction * 7))
    setSelectedWeek(newWeek)
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-neutral-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='text-4xl mb-4'>📅</div>
          <p className='text-neutral-600'>Caricamento planning...</p>
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
                  Gestione Turni
                </h1>
                <p className='text-sm text-neutral-600'>
                  {branch?.name} - Pianificazione settimanale
                </p>
              </div>
            </div>
            
            <div className='flex items-center gap-4'>
              <div className='text-sm text-neutral-600'>
                {staff.length} staff disponibili
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Week Navigator */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
        <div className='flex items-center justify-between bg-white rounded-lg shadow p-4'>
          <button
            onClick={() => navigateWeek(-1)}
            className='px-4 py-2 bg-neutral-600 text-white rounded-lg hover:bg-neutral-700'
          >
            ← Settimana precedente
          </button>
          
          <div className='text-center'>
            <h2 className='text-lg font-semibold text-neutral-900'>
              Settimana del {weekDates[0].toLocaleDateString('it-IT')} - {weekDates[6].toLocaleDateString('it-IT')}
            </h2>
            <p className='text-sm text-neutral-600'>
              {new Date().toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          
          <button
            onClick={() => navigateWeek(1)}
            className='px-4 py-2 bg-neutral-600 text-white rounded-lg hover:bg-neutral-700'
          >
            Settimana successiva →
          </button>
        </div>
      </div>

      {/* Schedule Grid */}
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8'>
        {staff.length === 0 ? (
          <div className='bg-white rounded-lg shadow p-12 text-center'>
            <div className='text-4xl mb-4'>👥</div>
            <h2 className='text-xl font-semibold text-neutral-900 mb-2'>
              Nessun Staff Disponibile
            </h2>
            <p className='text-neutral-600 mb-4'>
              Aggiungi prima del personale per poter creare i turni
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
            {/* Shifts Overview */}
            <div className='bg-white rounded-lg shadow p-6'>
              <h3 className='text-lg font-semibold text-neutral-900 mb-4'>
                Turni Configurati
              </h3>
              <div className='grid md:grid-cols-3 gap-4'>
                {shifts.map(shift => (
                  <div key={shift.id} className='p-4 border border-neutral-200 rounded-lg'>
                    <h4 className='font-medium text-neutral-900'>{shift.name}</h4>
                    <p className='text-sm text-neutral-600'>{shift.start} - {shift.end}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Schedule */}
            <div className='grid gap-6'>
              {daysOfWeek.map((day, dayIndex) => (
                <div key={day} className='bg-white rounded-lg shadow p-6'>
                  <div className='flex items-center justify-between mb-4'>
                    <h3 className='text-lg font-semibold text-neutral-900'>
                      {day}
                    </h3>
                    <span className='text-sm text-neutral-600'>
                      {weekDates[dayIndex]?.toLocaleDateString('it-IT')}
                    </span>
                  </div>
                  
                  <div className='grid md:grid-cols-3 gap-4'>
                    {shifts.map(shift => {
                      const dateKey = weekDates[dayIndex]?.toISOString().split('T')[0]
                      const shiftAssignments = schedules[dateKey]?.[shift.id] || []
                      
                      return (
                        <TimeSlot
                          key={`${day}-${shift.id}`}
                          day={day}
                          shift={{...shift, assigned: shiftAssignments}}
                          staff={staff}
                          onAssign={(dayName, shiftId) => handleAssignStaff(weekDates[dayIndex], shiftId)}
                          onRemove={handleRemoveAssignment}
                        />
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Staff Summary */}
            <div className='bg-white rounded-lg shadow p-6'>
              <h3 className='text-lg font-semibold text-neutral-900 mb-4'>
                Riepilogo Staff
              </h3>
              <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-4'>
                {staff.map(member => (
                  <div key={member.id} className='p-4 border border-neutral-200 rounded-lg'>
                    <h4 className='font-medium text-neutral-900'>{member.name}</h4>
                    <p className='text-sm text-neutral-600'>{member.role === 'branch_manager' ? 'Manager' : 'Staff'}</p>
                    <p className='text-xs text-neutral-500 mt-2'>
                      0 ore questa settimana {/* TODO: Calculate actual hours */}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 max-w-md w-full mx-4'>
            <h3 className='text-lg font-semibold mb-4'>
              Assegna Staff al Turno
            </h3>
            <p className='text-sm text-neutral-600 mb-4'>
              Seleziona il membro dello staff da assegnare al turno {selectedAssignment.shiftId} 
              del {selectedAssignment.day?.toLocaleDateString ? selectedAssignment.day.toLocaleDateString('it-IT') : selectedAssignment.day}
            </p>
            
            <div className='space-y-2 mb-6 max-h-60 overflow-y-auto'>
              {staff.map(member => (
                <button
                  key={member.id}
                  onClick={() => handleConfirmAssignment(member.id)}
                  className='w-full text-left p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors'
                >
                  <div className='font-medium'>{member.name}</div>
                  <div className='text-sm text-neutral-600'>
                    {(member.role === 'branch_manager' || member.work_preferences?.role === 'branch_manager') ? 'Manager' : 'Staff'} • {member.email}
                  </div>
                </button>
              ))}
            </div>

            <div className='flex gap-3 justify-end'>
              <button
                onClick={() => setShowAssignModal(false)}
                className='px-4 py-2 text-neutral-600 hover:text-neutral-800'
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}