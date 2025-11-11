import React from 'react'
import appPreview from '/app-preview.png'
import pos1 from '/s1.png'
import pos2 from '/s2.png'
import Logo from '../components/Logo'

export default function Home(){
  return (
    <>
    <section className='relative overflow-hidden'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 grid lg:grid-cols-2 gap-10 items-center'>
        <div>
          <span className='inline-flex items-center gap-2 text-qorange-700 font-semibold bg-qorange-100 rounded-full px-3 py-1 text-xs'>Ordina • Paga • Ritira</span>
          <h1 className='mt-4 text-4xl sm:text-5xl font-extrabold leading-tight'>Il tuo caffè <span className='text-qorange-600'>senza fila</span>.<br/>Sempre pronto quando arrivi.</h1>
          <p className='mt-4 text-neutral-700 text-lg'>Con <strong>QoffeRun</strong> ordini e paghi dal telefono. Per i bar, gestione completa di menu, ordini, pagamenti e <em>scontrini elettronici</em> integrati con <strong>Fattura per Tutti</strong>.</p>
          <div className='mt-6 flex flex-wrap gap-3'>
            <a href='/registrazione#cliente' className='px-5 py-3 rounded-xl bg-qorange-600 text-white font-semibold shadow-soft hover:bg-qorange-700'>Prova come cliente</a>
            <a href='/registrazione#bar' className='px-5 py-3 rounded-xl border font-semibold hover:bg-neutral-100'>Attiva per il tuo bar</a>
          </div>
          <ul className='mt-6 grid sm:grid-cols-2 gap-3 text-sm text-neutral-700'>
            <li className='flex items-center gap-2'><span className='inline-block h-2.5 w-2.5 rounded-full bg-qorange-500'></span> Registrazione gratuita</li>
            <li className='flex items-center gap-2'><span className='inline-block h-2.5 w-2.5 rounded-full bg-qorange-500'></span> Pagamenti sicuri e immediati</li>
            <li className='flex items-center gap-2'><span className='inline-block h-2.5 w-2.5 rounded-full bg-qorange-500'></span> Commissione automatica per QoffeRun</li>
            <li className='flex items-center gap-2'><span className='inline-block h-2.5 w-2.5 rounded-full bg-qorange-500'></span> POS digitale e dashboard web</li>
          </ul>
        </div>
        <div className='relative'>
          <img src={appPreview} alt='Anteprima app QoffeRun' className='mx-auto max-h-[640px] drop-shadow-2xl'/>
          <div className='absolute -bottom-4 left-1/2 -translate-x-1/2 glass rounded-2xl shadow-soft px-4 py-3 flex items-center gap-3'>
            <Logo width="32" height="32" className='h-8'/>
            <p className='text-sm font-medium'>Mario Rossi • Piazza Navona, Roma</p>
          </div>
        </div>
      </div>
    </section>

    <section id='funziona' className='py-16 bg-white'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <h2 className='text-3xl fw-bold text-center mb-8' style={{fontFamily: 'var(--bs-body-font-family)'}}>Come Funziona</h2>
        <div className='grid md:grid-cols-3 gap-8'>
          <div className='text-center'>
            <div className='w-16 h-16 bg-qorange-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <span className='text-2xl'>📱</span>
            </div>
            <h3 className='font-semibold mb-2'>1. Ordina</h3>
            <p className='text-neutral-600'>Scegli i tuoi prodotti preferiti dal menu del bar</p>
          </div>
          <div className='text-center'>
            <div className='w-16 h-16 bg-qorange-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <span className='text-2xl'>💳</span>
            </div>
            <h3 className='font-semibold mb-2'>2. Paga</h3>
            <p className='text-neutral-600'>Paga direttamente dall'app in modo sicuro e veloce</p>
          </div>
          <div className='text-center'>
            <div className='w-16 h-16 bg-qorange-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <span className='text-2xl'>☕</span>
            </div>
            <h3 className='font-semibold mb-2'>3. Ritira</h3>
            <p className='text-neutral-600'>Il tuo ordine sarà pronto quando arrivi al bar</p>
          </div>
        </div>
      </div>
    </section>

    <section id='clienti' className='py-16 bg-neutral-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <h2 className='text-3xl fw-bold text-center mb-8' style={{fontFamily: 'var(--bs-body-font-family)'}}>Per i Clienti</h2>
        <div className='grid md:grid-cols-2 gap-8 items-center'>
          <div>
            <h3 className='text-2xl font-semibold mb-4'>Niente più code</h3>
            <ul className='space-y-3'>
              <li className='flex items-center gap-3'>
                <span className='w-2 h-2 bg-qorange-500 rounded-full'></span>
                Ordina in anticipo dal tuo telefono
              </li>
              <li className='flex items-center gap-3'>
                <span className='w-2 h-2 bg-qorange-500 rounded-full'></span>
                Paga con carta o wallet digitale
              </li>
              <li className='flex items-center gap-3'>
                <span className='w-2 h-2 bg-qorange-500 rounded-full'></span>
                Ricevi notifiche quando l'ordine è pronto
              </li>
              <li className='flex items-center gap-3'>
                <span className='w-2 h-2 bg-qorange-500 rounded-full'></span>
                Accumula punti fedeltà
              </li>
            </ul>
          </div>
          <div className='bg-white rounded-2xl p-6 shadow-soft'>
            <h4 className='font-semibold mb-4'>Vantaggi per te:</h4>
            <div className='space-y-2'>
              <div className='flex justify-between'>
                <span>Tempo risparmiato</span>
                <span className='text-qorange-600 font-semibold'>5-10 min</span>
              </div>
              <div className='flex justify-between'>
                <span>Pagamento</span>
                <span className='text-qorange-600 font-semibold'>Contactless</span>
              </div>
              <div className='flex justify-between'>
                <span>Sconti</span>
                <span className='text-qorange-600 font-semibold'>Fino al 10%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id='bar' className='py-16 bg-white'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center gap-3'>
          <Logo width="32" height="32" className='h-8'/>
          <h2 className='text-3xl fw-bold' style={{fontFamily: 'var(--bs-body-font-family)'}}>QoffeRun per i bar</h2>
        </div>
        <p className='mt-2 text-neutral-700'>Gestione completa: prodotti, ordini, pagamenti e scontrini elettronici via <strong>Fattura per Tutti</strong>.</p>
        <div className='mt-8 grid lg:grid-cols-2 gap-6'>
          <img src={pos1} alt='Dashboard – lista ordini' className='rounded-2xl shadow-soft border'/>
          <img src={pos2} alt='Dashboard – ordine selezionato' className='rounded-2xl shadow-soft border'/>
        </div>
        
        <div className='mt-12 text-center'>
          <button 
            onClick={() => window.location.href = '/registrazione'}
            className='inline-flex items-center px-6 py-3 bg-qorange-600 text-white rounded-lg hover:bg-qorange-700 font-medium mr-4'
          >
            Registra il tuo bar
          </button>
        </div>
      </div>
    </section>

    <section id='chains' className='py-16 bg-gradient-to-br from-neutral-900 to-neutral-800 text-white'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl fw-bold mb-4' style={{fontFamily: 'var(--bs-body-font-family)'}}>
            🏢 QoffeRun per le Catene
          </h2>
          <p className='text-xl text-neutral-300'>
            Gestisci multiple filiali con un unico dashboard centralizzato
          </p>
        </div>
        
        <div className='grid lg:grid-cols-2 gap-12 items-center'>
          <div>
            <h3 className='text-2xl font-semibold mb-6'>Controllo Centralizzato</h3>
            <ul className='space-y-4'>
              <li className='flex items-start gap-3'>
                <span className='w-2 h-2 bg-qorange-400 rounded-full mt-2 flex-shrink-0'></span>
                <div>
                  <strong className='text-qorange-400'>Dashboard Unificata:</strong> Visualizza le performance di tutte le tue filiali in un colpo d'occhio
                </div>
              </li>
              <li className='flex items-start gap-3'>
                <span className='w-2 h-2 bg-qorange-400 rounded-full mt-2 flex-shrink-0'></span>
                <div>
                  <strong className='text-qorange-400'>Gestione Multi-Filiale:</strong> Aggiungi, modifica e gestisci tutte le tue location da un unico posto
                </div>
              </li>
              <li className='flex items-start gap-3'>
                <span className='w-2 h-2 bg-qorange-400 rounded-full mt-2 flex-shrink-0'></span>
                <div>
                  <strong className='text-qorange-400'>Report Avanzati:</strong> Analytics dettagliate per ogni filiale e confronti di performance
                </div>
              </li>
              <li className='flex items-start gap-3'>
                <span className='w-2 h-2 bg-qorange-400 rounded-full mt-2 flex-shrink-0'></span>
                <div>
                  <strong className='text-qorange-400'>Gestione Staff:</strong> Assegna manager alle filiali e gestisci i permessi centralizzati
                </div>
              </li>
            </ul>
            
            <div className='mt-8 flex flex-col sm:flex-row gap-4'>
              <button 
                onClick={() => window.location.href = '/register-chain-owner'}
                className='inline-flex items-center justify-center px-6 py-3 bg-qorange-600 text-white rounded-lg hover:bg-qorange-700 font-medium'
              >
                🚀 Registra la tua Catena
              </button>
              <button 
                onClick={() => window.location.href = '/login-chain-owner'}
                className='inline-flex items-center justify-center px-6 py-3 border border-qorange-400 text-qorange-400 rounded-lg hover:bg-qorange-400 hover:text-white font-medium'
              >
                Accedi al Dashboard
              </button>
            </div>
          </div>
          
          <div className='bg-gradient-to-br from-qorange-600/20 to-qorange-800/20 rounded-2xl p-8 border border-qorange-600/30'>
            <h4 className='text-xl font-semibold mb-6 text-qorange-400'>Vantaggi per le Catene:</h4>
            <div className='space-y-4'>
              <div className='flex justify-between items-center py-2 border-b border-neutral-700'>
                <span>Visibilità completa</span>
                <span className='text-qorange-400 font-semibold'>✅ Multi-filiale</span>
              </div>
              <div className='flex justify-between items-center py-2 border-b border-neutral-700'>
                <span>Gestione centralizzata</span>
                <span className='text-qorange-400 font-semibold'>✅ Dashboard unico</span>
              </div>
              <div className='flex justify-between items-center py-2 border-b border-neutral-700'>
                <span>Controlli avanzati</span>
                <span className='text-qorange-400 font-semibold'>✅ Ruoli & Permessi</span>
              </div>
              <div className='flex justify-between items-center py-2'>
                <span>Commissioni scalabili</span>
                <span className='text-qorange-400 font-semibold'>✅ Fino al 10%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id='schermate' className='py-16 bg-neutral-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <h2 className='text-3xl fw-bold text-center mb-8' style={{fontFamily: 'var(--bs-body-font-family)'}}>Schermate dell'App</h2>
        <div className='grid md:grid-cols-3 gap-6'>
          <div className='bg-white rounded-2xl p-4 shadow-soft'>
            <div className='aspect-[9/16] bg-neutral-100 rounded-xl mb-4 overflow-hidden'>
              <img 
                src="/menu-screenshot.png" 
                alt="Screenshot del menu dell'app QoffeRun"
                className='w-full h-full object-cover object-center'
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              <div className='w-full h-full bg-gradient-to-b from-qorange-100 to-qorange-200 rounded-xl flex items-center justify-center' style={{display: 'none'}}>
                <span className='text-qorange-700 font-semibold'>Menu</span>
              </div>
            </div>
            <h3 className='font-semibold'>Sfoglia il Menu</h3>
            <p className='text-sm text-neutral-600'>Visualizza tutti i prodotti disponibili</p>
          </div>
          <div className='bg-white rounded-2xl p-4 shadow-soft'>
            <div className='aspect-[9/16] bg-neutral-100 rounded-xl mb-4 overflow-hidden'>
              <img 
                src="/carrello-screenshot.png" 
                alt="Screenshot del carrello dell'app QoffeRun"
                className='w-full h-full object-cover object-center'
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              <div className='w-full h-full bg-gradient-to-b from-qorange-100 to-qorange-200 rounded-xl flex items-center justify-center' style={{display: 'none'}}>
                <span className='text-qorange-700 font-semibold'>Carrello</span>
              </div>
            </div>
            <h3 className='font-semibold'>Componi l'Ordine</h3>
            <p className='text-sm text-neutral-600'>Aggiungi prodotti e personalizza</p>
          </div>
          <div className='bg-white rounded-2xl p-4 shadow-soft'>
            <div className='aspect-[9/16] bg-neutral-100 rounded-xl mb-4 overflow-hidden'>
              <img 
                src="/pagamento-screenshot.png" 
                alt="Screenshot del pagamento dell'app QoffeRun"
                className='w-full h-full object-cover object-center'
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              <div className='w-full h-full bg-gradient-to-b from-qorange-100 to-qorange-200 rounded-xl flex items-center justify-center' style={{display: 'none'}}>
                <span className='text-qorange-700 font-semibold'>Pagamento</span>
              </div>
            </div>
            <h3 className='font-semibold'>Paga e Ritira</h3>
            <p className='text-sm text-neutral-600'>Completa l'ordine e ricevi notifiche</p>
          </div>
        </div>
      </div>
    </section>

    <section id='faq' className='py-16 bg-white'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
        <h2 className='text-3xl fw-bold text-center mb-8' style={{fontFamily: 'var(--bs-body-font-family)'}}>Domande Frequenti</h2>
        <div className='space-y-6'>
          <div className='bg-neutral-50 rounded-lg p-6'>
            <h3 className='font-semibold mb-2'>È gratuito per i clienti?</h3>
            <p className='text-neutral-600'>Sì, l'app è completamente gratuita per i clienti. Non ci sono commissioni sui pagamenti.</p>
          </div>
          <div className='bg-neutral-50 rounded-lg p-6'>
            <h3 className='font-semibold mb-2'>Come funzionano i pagamenti?</h3>
            <p className='text-neutral-600'>Puoi pagare con carta di credito, debito o wallet digitali come Apple Pay e Google Pay.</p>
          </div>
          <div className='bg-neutral-50 rounded-lg p-6'>
            <h3 className='font-semibold mb-2'>Cosa succede se il bar non ha il prodotto?</h3>
            <p className='text-neutral-600'>Il bar ti contatterà immediatamente e potrai scegliere un'alternativa o ricevere un rimborso.</p>
          </div>
          <div className='bg-neutral-50 rounded-lg p-6'>
            <h3 className='font-semibold mb-2'>Posso modificare l'ordine dopo averlo inviato?</h3>
            <p className='text-neutral-600'>Puoi modificare l'ordine entro 2 minuti dall'invio, dopodiché dovrai contattare direttamente il bar.</p>
          </div>
        </div>
      </div>
    </section>

    <section className='py-16 bg-gradient-to-br from-qorange-600 to-qorange-700 text-white'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
        <h2 className='text-3xl sm:text-4xl font-extrabold'>Pronto a servire più caffè, in meno tempo?</h2>
        <p className='mt-2 text-white/90'>Attiva QoffeRun oggi. Gratis la registrazione, subito operativo.</p>
        <div className='mt-6 flex flex-wrap items-center justify-center gap-3'>
          <a href='/registrazione#cliente' className='px-6 py-3 rounded-xl bg-white text-qorange-700 font-semibold hover:bg-neutral-100'>Provalo come cliente</a>
          <a href='/registrazione#bar' className='px-6 py-3 rounded-xl bg-black/20 font-semibold hover:bg-black/30'>Attivalo nel tuo bar</a>
        </div>
      </div>
    </section>
    </>
  )
}
