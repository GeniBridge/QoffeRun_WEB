// src/views/settings/AdminSettings.js
import React from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow
} from '@coreui/react';
import SystemSettings from './SystemSettings';

const AdminSettings = () => {
  return (
    <CRow>
      <CCol xs={12}>
        <CCard>
          <CCardHeader>
            <h4 className="mb-0">Gestione Impostazioni</h4>
          </CCardHeader>
          <CCardBody>
            {/* Rimosso il sistema di tab - mostra solo le impostazioni di sistema */}
            <SystemSettings />
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default AdminSettings;