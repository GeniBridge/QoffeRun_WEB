import React from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
} from '@coreui/react'

const ApiDocs = () => {
  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>🔌 REST API Documentation</strong>
          </CCardHeader>
          <CCardBody>
            <div style={{ height: 'calc(100vh - 200px)', width: '100%' }}>
              <iframe
                src="https://api.qofferun.com/api/documentation"
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  borderRadius: '8px',
                }}
                title="API Documentation"
              />
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default ApiDocs
