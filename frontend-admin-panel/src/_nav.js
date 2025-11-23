// src/_nav.js
import React from 'react'
import CIcon from '@coreui/icons-react'

import {
  cilSpeedometer,
  cilBuilding,
  cilUser,
  cilCreditCard,
  cilChartLine,
  cilSettings,
  cilImage,
  cilPeople,
    cilCode,
  } from '@coreui/icons'

import { CNavItem } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: '📊 Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: '🏢 Catene',
    to: '/catene',
    icon: <CIcon icon={cilBuilding} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: '👤 Clienti',
    to: '/clienti',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: '💳 Transazioni',
    to: '/transazioni',
    icon: <CIcon icon={cilCreditCard} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: '📈 Statistiche',
    to: '/statistiche',
    icon: <CIcon icon={cilChartLine} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: '⚙️ Impostazioni',
    to: '/impostazioni',
    icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: '🎨 Logo',
    to: '/settings/logo',
    icon: <CIcon icon={cilImage} customClassName="nav-icon" />,
  },
    {
      component: CNavItem,
      name: '🔌 REST API',
      to: '/api-docs',
      icon: <CIcon icon={cilCode} customClassName="nav-icon" />,
    },
]

export default _nav
