import React, { useState, useEffect } from 'react'
import { Outlet, Link, NavLink, useLocation } from 'react-router-dom'
import logo from '/logo.png'

const ContactModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefono: '',
    messaggio: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Contact form submitted:', formData)
    // Here you would typically send the data to your API
    alert('Grazie per il tuo messaggio! Ti contatteremo presto.')
    onClose()
    setFormData({ nome: '', email: '', telefono: '', messaggio: '' })
  }

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
      <div className='bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto'>
        <div className='p-6'>
          <div className='flex justify-between items-center mb-6'>
            <h2 className='text-2xl fw-bold text-neutral-900' style={{fontFamily: 'var(--bs-body-font-family)'}}>Contattaci</h2>
            <button 
              onClick={onClose}
              className='text-neutral-400 hover:text-neutral-600 text-2xl'
            >
              ×
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-neutral-700 mb-1'>
                Nome *
              </label>
              <input
                type='text'
                name='nome'
                value={formData.nome}
                onChange={handleChange}
                required
                className='w-full border border-neutral-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-qorange-500 focus:border-transparent'
                placeholder='Il tuo nome'
              />
            </div>
            
            <div>
              <label className='block text-sm font-medium text-neutral-700 mb-1'>
                Email *
              </label>
              <input
                type='email'
                name='email'
                value={formData.email}
                onChange={handleChange}
                required
                className='w-full border border-neutral-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-qorange-500 focus:border-transparent'
                placeholder='la.tua.email@esempio.com'
              />
            </div>
            
            <div>
              <label className='block text-sm font-medium text-neutral-700 mb-1'>
                Telefono
              </label>
              <input
                type='tel'
                name='telefono'
                value={formData.telefono}
                onChange={handleChange}
                className='w-full border border-neutral-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-qorange-500 focus:border-transparent'
                placeholder='+39 xxx xxx xxxx'
              />
            </div>
            
            <div>
              <label className='block text-sm font-medium text-neutral-700 mb-1'>
                Messaggio *
              </label>
              <textarea
                name='messaggio'
                value={formData.messaggio}
                onChange={handleChange}
                required
                rows={4}
                className='w-full border border-neutral-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-qorange-500 focus:border-transparent'
                placeholder='Scrivi il tuo messaggio...'
              />
            </div>
            
            <div className='flex gap-3 pt-4'>
              <button
                type='button'
                onClick={onClose}
                className='flex-1 px-4 py-2 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50'
              >
                Annulla
              </button>
              <button
                type='submit'
                className='flex-1 px-4 py-2 bg-qorange-600 text-white rounded-lg hover:bg-qorange-700'
              >
                Invia Messaggio
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function Layout(){
  const [open, setOpen] = useState(false)
  const [contactModalOpen, setContactModalOpen] = useState(false)
  const location = useLocation()
  const link = 'hover:text-qorange-600'
  const active = 'text-qorange-700 font-semibold'

  // Handle hash scrolling when on home page
  useEffect(() => {
    if (location.pathname === '/' && location.hash) {
      const element = document.getElementById(location.hash.slice(1))
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [location])

  const handleHashClick = (hash) => {
    if (location.pathname === '/') {
      const element = document.getElementById(hash)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  const handleContactClick = (e) => {
    e.preventDefault()
    setContactModalOpen(true)
  }
  return (
    <div className='min-h-screen bg-neutral-50 text-neutral-900'>
      <header className='sticky top-0 z-40 bg-white/90 border-b border-neutral-200/60 backdrop-blur'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between'>
          <Link to='/' className='flex items-center gap-3'>
            <img src={logo} alt='QoffeRun' className='h-9 w-auto'/>
            <span className='brand text-2xl tracking-tight fs-4 fw-bold'>QoffeRun</span>
          </Link>
          <nav className='hidden md:flex items-center gap-8 text-sm font-medium'>
            <Link to='/#funziona' className={link} onClick={() => handleHashClick('funziona')}>Come funziona</Link>
            <Link to='/#clienti' className={link} onClick={() => handleHashClick('clienti')}>Per i clienti</Link>
            <Link to='/#bar' className={link} onClick={() => handleHashClick('bar')}>Per i bar</Link>
            <Link to='/#schermate' className={link} onClick={() => handleHashClick('schermate')}>Schermate</Link>
            <Link to='/#faq' className={link} onClick={() => handleHashClick('faq')}>FAQ</Link>
            <NavLink to='/registrazione' className={({isActive})=> isActive?active:link }>Registrazione</NavLink>
          </nav>
          <div className='hidden md:flex items-center gap-3'>
            <button onClick={handleContactClick} className='px-4 py-2 rounded-lg border border-neutral-300 hover:bg-neutral-100'>Contattaci</button>
            <Link to='/registrazione' className='px-4 py-2 rounded-lg bg-qorange-600 text-white hover:bg-qorange-700'>Inizia gratis</Link>
          </div>
          <button onClick={()=>setOpen(!open)} className='md:hidden inline-flex items-center justify-center p-2 rounded-lg border border-neutral-300' aria-label='Apri menu'>
☰</button>
        </div>
        {open && (
          <div className='md:hidden border-t border-neutral-200 bg-white'>
            <nav className='px-4 py-3 space-y-2 text-sm'>
              <Link to='/#funziona' className='block' onClick={() => {setOpen(false); handleHashClick('funziona')}}>Come funziona</Link>
              <Link to='/#clienti' className='block' onClick={() => {setOpen(false); handleHashClick('clienti')}}>Per i clienti</Link>
              <Link to='/#bar' className='block' onClick={() => {setOpen(false); handleHashClick('bar')}}>Per i bar</Link>
              <Link to='/#schermate' className='block' onClick={() => {setOpen(false); handleHashClick('schermate')}}>Schermate</Link>
              <Link to='/#faq' className='block' onClick={() => {setOpen(false); handleHashClick('faq')}}>FAQ</Link>
              <NavLink to='/registrazione' className='block' onClick={()=>setOpen(false)}>Registrazione</NavLink>
              <button onClick={() => {setOpen(false); setContactModalOpen(true)}} className='block text-left w-full'>Contattaci</button>
            </nav>
          </div>
        )}
      </header>
      <Outlet />
      <footer id='contatti' className='bg-neutral-900 text-neutral-200 mt-20'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid md:grid-cols-3 gap-8'>
          <div>
            <div className='flex items-center gap-3'>
              <img src={logo} className='h-9' alt='logo'/>
              <span className='brand text-xl fw-bold'>QoffeRun</span>
            </div>
            <p className='mt-3 text-neutral-400'>Ordina, paga, ritira. Semplifica la pausa caff8 e digitalizza il tuo bar.</p>
          </div>
          <div>
            <h4 className='font-semibold'>Prodotto</h4>
            <ul className='mt-3 space-y-1 text-neutral-400'>
              <li><a href='#funziona' className='hover:text-white'>Come funziona</a></li>
              <li><a href='#clienti' className='hover:text-white'>Per i clienti</a></li>
              <li><a href='#bar' className='hover:text-white'>Per i bar</a></li>
              <li><a href='#schermate' className='hover:text-white'>Schermate</a></li>
            </ul>
          </div>
          <div>
            <h4 className='font-semibold'>Contatti</h4>
            <ul className='mt-3 space-y-1 text-neutral-400'>
              <li>Email: <a href='mailto:shikosoft.italia@gmail.com' className='hover:text-white'>shikosoft.italia@gmail.com</a></li>
              <li>Telefono: <a href='tel:+393479062828' className='hover:text-white'>+39 347 906 2828</a></li>
              <li>Roma, Italia</li>
            </ul>
          </div>
        </div>
        <div className='border-t border-neutral-800 py-4 text-center text-neutral-500 text-sm'>© {new Date().getFullYear()} QoffeRun. Tutti i diritti riservati.</div>
      </footer>
      
      <ContactModal 
        isOpen={contactModalOpen} 
        onClose={() => setContactModalOpen(false)} 
      />
    </div>
  )
}
