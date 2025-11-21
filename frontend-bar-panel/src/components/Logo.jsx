import React, { useState, useEffect } from 'react';

const Logo = ({ className = '', width = '180', height = 'auto', alt = 'QoffeRun' }) => {
  const [logoPath, setLogoPath] = useState('/assets/logos/qofferun-logo.png');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogoPath = async () => {
      try {
        // Prova a recuperare il logo path dalle impostazioni API
        const apiBase = import.meta.env.VITE_API_URL || 'https://api.qofferun.com';
        const response = await fetch(`${apiBase}/api/v1/system-settings/system_logo_path`);
        if (response.ok) {
          const data = await response.json();
          if (data.value) {
            setLogoPath(data.value);
          }
        }
      } catch (error) {
        console.log('Usando logo di default:', error);
        // Mantieni il logo di default se l'API non è disponibile
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogoPath();
  }, []);

  if (isLoading) {
    return (
      <div 
        className={`animate-pulse bg-gray-200 rounded ${className}`}
        style={{ width: `${width}px`, height: height === 'auto' ? '40px' : height }}
      />
    );
  }

  return (
    <img
      src={logoPath}
      alt={alt}
      className={className}
      style={{ width: `${width}px`, height }}
      onError={(e) => {
        // Fallback al logo di default se l'immagine non si carica
        e.target.src = '/assets/logos/qofferun-logo.png';
      }}
    />
  );
};

export default Logo;