import React, { useEffect, useRef, useState } from 'react';

const NEWS = [
  'Benvenuto su QoffeRun!',
  'Nuova funzione: stampa QR code per i clienti!',
  'Ricordati di aggiornare il menu ogni giorno.',
  'Supporto 24/7 disponibile per i partner.'
];

export default function NewsCarousel() {
  const [index, setIndex] = useState(0);
  const intervalRef = useRef();

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setIndex(i => (i + 1) % NEWS.length);
    }, 3000);
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <div style={{height: 28, overflow: 'hidden', display: 'flex', alignItems: 'center'}}>
      <div className="text-primary fw-semibold" style={{transition: 'transform 0.5s', whiteSpace: 'nowrap'}}>
        {NEWS[index]}
      </div>
    </div>
  );
}
