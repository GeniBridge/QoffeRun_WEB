import React from 'react'
import { useLocation, Link } from 'react-router-dom'
export default function Successo(){
  const { state } = useLocation()
  return (
    <section className='py-20 text-center'>
      <h1 className='text-3xl font-bold'>Registrazione inviata</h1>
      <p className='mt-2'>Grazie! ({state?.tipo})</p>
      <Link to='/' className='mt-6 inline-block px-5 py-3 rounded-lg bg-qorange-600 text-white'>Torna alla Home</Link>
    </section>
  )
}
