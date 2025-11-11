import React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'

// Contexts
import { AuthProvider } from './contexts/AuthContext.jsx'

// Layouts
import Layout from './layout/Layout.jsx'
import DashboardLayout from './components/dashboard/DashboardLayout.jsx'

// Public Pages
import Home from './pages/Home.jsx'
import Registrazione from './pages/Registrazione.jsx'
import Successo from './pages/Successo.jsx'
import Login from './pages/Login.jsx'

// Chain Owner Pages
import ChainOwnerRegistration from './pages/ChainOwnerRegistration.jsx'
import ChainOwnerLogin from './pages/ChainOwnerLogin.jsx'
import ChainOwnerDashboard from './pages/ChainOwnerDashboard.jsx'
import ChainSettings from './pages/ChainSettings.jsx'
import AddBranch from './pages/AddBranch.jsx'
import BranchDetails from './pages/BranchDetails.jsx'
import BranchSettings from './pages/BranchSettings.jsx'
import EditBranch from './pages/EditBranch.jsx'
import AddStaff from './pages/AddStaff.jsx'
import EditStaff from './pages/EditStaff.jsx'
import ScheduleManagement from './pages/ScheduleManagement.jsx'
import PermissionManagement from './pages/PermissionManagement.jsx'
import GoogleMapsTest from './pages/GoogleMapsTest'
import GoogleMapsTestSimple from './pages/GoogleMapsTestSimple'
import AddressTestPage from './pages/AddressTestPage'
import AddressDebugTest from './pages/AddressDebugTest'

// Protected Pages
import Dashboard from './pages/dashboard/Dashboard.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

const router = createBrowserRouter([
  // Public routes
  { path: '/', element: <Layout />, children: [
    { index: true, element: <Home /> },
    { path: 'registrazione', loader: () => { throw new Response('', { status: 302, headers: { Location: '/register-chain-owner' } }) } },
    { path: 'successo', element: <Successo /> },
  ]},
  
  // Auth routes
  { path: '/login', element: <Login /> },
  
  // Chain Owner routes
  { path: '/register-chain-owner', element: <ChainOwnerRegistration /> },
  { path: '/login-chain-owner', element: <ChainOwnerLogin /> },
  { path: '/chain-dashboard', element: <ChainOwnerDashboard /> },
  { path: '/chain-settings', element: <ChainSettings /> },
  { path: '/add-branch', element: <AddBranch /> },
  { path: '/branch/:id', element: <BranchDetails /> },
  { path: '/branch/:id/edit', element: <EditBranch /> },
  { path: '/branch/:id/settings', element: <BranchSettings /> },
  { path: '/branch/:id/add-staff', element: <AddStaff /> },
  { path: '/branch/:id/staff/:staffId/edit', element: <EditStaff /> },
  { path: '/branch/:id/schedules', element: <ScheduleManagement /> },
  { path: '/branch/:id/permissions', element: <PermissionManagement /> },
  
  // Test routes
  { path: '/test/google-maps', element: <GoogleMapsTest /> },
  { path: '/test/google-maps-simple', element: <GoogleMapsTestSimple /> },
  {
    path: '/test/address',
    element: <AddressTestPage />
  },
  {
    path: '/test/address-debug',
    element: <AddressDebugTest />
  },
  
  // Protected dashboard routes
  { 
    path: '/dashboard', 
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ), 
    children: [
      { index: true, element: <Dashboard /> },
      // TODO: Aggiungere altre route dashboard
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>
)
