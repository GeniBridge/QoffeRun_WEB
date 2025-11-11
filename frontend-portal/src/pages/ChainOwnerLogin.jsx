import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function ChainOwnerLogin() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isRegistered = searchParams.get('registered') === 'true'

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError('Inserisci email e password')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('https://api.qofferun.com/api/v1/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password
        })
      })

      const data = await response.json()

      if (response.ok) {
        // Check if user is a chain owner
        if (data.user.role === 'chain_owner') {
          // Store auth data
          localStorage.setItem('auth_token', data.access_token)
          localStorage.setItem('user_data', JSON.stringify(data.user))
          
          // Redirect to chain owner dashboard
          navigate('/chain-dashboard')
        } else {
          setError('Accesso non autorizzato. Solo i proprietari di catene possono accedere.')
        }
      } else {
        setError(data.message || 'Credenziali non valide')
      }
    } catch (err) {
      setError('Errore di connessione. Riprova più tardi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-qorange-50 to-neutral-100 flex items-center justify-center py-12'>
      <div className='max-w-md w-full mx-4'>
        <div className='bg-white rounded-xl shadow-lg p-8'>
          <div className='text-center mb-8'>
            <div className='text-4xl mb-4'>☕</div>
            <h1 className='text-3xl font-bold text-neutral-900'>
              QoffeRun Chain
            </h1>
            <p className='text-neutral-600 mt-2'>
              Accedi al pannello Chain Owner
            </p>
          </div>

          {isRegistered && (
            <div className='mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700'>
              🎉 Registrazione completata con successo! Ora puoi accedere.
            </div>
          )}

          {error && (
            <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700'>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className='space-y-6'>
            <div>
              <label className='block text-sm font-medium text-neutral-700 mb-2'>
                Email
              </label>
              <input
                type='email'
                value={email}
                onChange={e => setEmail(e.target.value)}
                className='w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qorange-500 focus:border-transparent'
                placeholder='la-tua-email@example.com'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-neutral-700 mb-2'>
                Password
              </label>
              <input
                type='password'
                value={password}
                onChange={e => setPassword(e.target.value)}
                className='w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qorange-500 focus:border-transparent'
                placeholder='La tua password'
                required
              />
            </div>

            <button
              type='submit'
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
                loading 
                ? 'bg-neutral-400 cursor-not-allowed' 
                : 'bg-qorange-600 hover:bg-qorange-700'
              }`}
            >
              {loading ? 'Accesso in corso...' : 'Accedi'}
            </button>
          </form>

          <div className='mt-8 pt-6 border-t text-center'>
            <p className='text-sm text-neutral-600'>
              Non hai ancora un account?{' '}
              <button 
                onClick={() => navigate('/register-chain-owner')}
                className='text-qorange-600 hover:text-qorange-700 font-medium'
              >
                Registrati qui
              </button>
            </p>
          </div>

          <div className='mt-4 text-center'>
            <p className='text-xs text-neutral-500'>
              Per i singoli bar:{' '}
              <button 
                onClick={() => navigate('/registrazione')}
                className='text-qorange-600 hover:text-qorange-700'
              >
                Registrazione Bar Singolo
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}