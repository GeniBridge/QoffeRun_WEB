import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CAlert,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import adminAuthService from '../../../services/adminAuthService'

const Login = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError('Inserisci email e password')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await adminAuthService.login(email, password)
      navigate('/dashboard')
    } catch (error) {
      console.error('Login failed:', error)
      setError(error.message || 'Credenziali non valide')
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    
    if (!email) {
      setError('Inserisci la tua email per il reset password')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await adminAuthService.forgotPassword(email)
      alert('Email di reset password inviata! Controlla la tua casella di posta.')
      setShowForgotPassword(false)
    } catch (error) {
      console.error('Forgot password failed:', error)
      setError(error.message || 'Errore nell\'invio della email di reset')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={6}>
            <CCard className="p-4">
              <CCardBody>
                <CForm onSubmit={showForgotPassword ? handleForgotPassword : handleSubmit}>
                  <div className="text-center mb-4">
                    <h1 style={{color: '#f58220'}}>QoffeRun</h1>
                    <h3>{showForgotPassword ? 'Reset Password' : 'Admin Login'}</h3>
                    <p className="text-body-secondary">
                      {showForgotPassword ? 'Inserisci la tua email' : 'Accedi al pannello amministrativo'}
                    </p>
                  </div>
                  
                  {error && <CAlert color="danger">{error}</CAlert>}
                  
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilUser} />
                    </CInputGroupText>
                    <CFormInput 
                      type="email"
                      placeholder="Email" 
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      autoFocus
                    />
                  </CInputGroup>
                  
                  {!showForgotPassword && (
                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                      />
                    </CInputGroup>
                  )}
                  
                  <CRow>
                    <CCol xs={12}>
                      <CButton 
                        color="primary" 
                        className="w-100 px-4 mb-2"
                        type="submit"
                        disabled={isLoading}
                        style={{background:'#f58220', borderColor:'#f58220'}}
                      >
                        {isLoading && <CSpinner size="sm" className="me-2" />}
                        {showForgotPassword ? 'Invia Reset Password' : 'Accedi'}
                      </CButton>
                    </CCol>
                    <CCol xs={12} className="text-center">
                      <CButton 
                        color="link" 
                        className="px-0 text-decoration-none"
                        onClick={() => {
                          setShowForgotPassword(!showForgotPassword)
                          setError('')
                        }}
                        disabled={isLoading}
                      >
                        {showForgotPassword ? 'Torna al Login' : 'Password dimenticata?'}
                      </CButton>
                    </CCol>
                  </CRow>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
