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
    name: '🏪 Bar',
    to: '/bar',
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
]

export default _nav
