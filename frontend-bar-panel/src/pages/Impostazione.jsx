import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import BarSettings from '../components/Settings/BarSettings';

export default function Impostazione() {
  const { user } = useContext(AuthContext);

  // Assumiamo che l'utente abbia un barId associato
  // In un sistema reale, questo potrebbe venire dal profilo utente o da un API call
  const barId = user?.bar_id || 1; // Default per test

  return (
    <div className="page-container">
      <BarSettings barId={barId} />
    </div>
  );
}
