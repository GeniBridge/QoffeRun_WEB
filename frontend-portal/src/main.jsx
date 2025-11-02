import React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import Layout from './layout/Layout.jsx'
import Home from './pages/Home.jsx'
import Registrazione from './pages/Registrazione.jsx'
import Successo from './pages/Successo.jsx'

const router = createBrowserRouter([
  { path: '/', element: <Layout />, children: [
    { index: true, element: <Home /> },
    { path: 'registrazione', element: <Registrazione /> },
    { path: 'successo', element: <Successo /> },
  ]}
])

createRoot(document.getElementById('root')).render(<RouterProvider router={router} />)
