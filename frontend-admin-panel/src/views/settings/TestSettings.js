// src/views/settings/TestSettings.js
import React, { useState, useEffect } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CButton,
  CAlert
} from '@coreui/react';
import adminSettingsService from '../../services/adminSettingsService';

const TestSettings = () => {
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    setTestResult('Testing...');

    try {
      // Test connection
      setTestResult(prev => prev + '\n✓ Starting API test...');
      
      // Test system settings
      const systemSettings = await adminSettingsService.getSystemSettings();
      setTestResult(prev => prev + '\n✓ System settings loaded: ' + systemSettings.length + ' items');
      
      // Test bar list (if exists)
      const bars = await adminSettingsService.getAllBars();
      setTestResult(prev => prev + '\n✓ Bars loaded: ' + bars.length + ' items');
      
      if (bars.length > 0) {
        const barSettings = await adminSettingsService.getBarSettings(bars[0].id);
        setTestResult(prev => prev + '\n✓ Bar settings loaded: ' + barSettings.length + ' items');
      }
      
      setTestResult(prev => prev + '\n\n🎉 All tests passed!');
      
    } catch (error) {
      console.error('Test failed:', error);
      setTestResult(prev => prev + '\n❌ Test failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CRow>
      <CCol xs={12}>
        <CCard>
          <CCardHeader>
            <h4 className="mb-0">API Settings Test</h4>
          </CCardHeader>
          <CCardBody>
            <CButton 
              color="primary" 
              onClick={testAPI}
              disabled={loading}
            >
              {loading ? 'Testing...' : 'Test API'}
            </CButton>
            
            {testResult && (
              <div className="mt-3">
                <pre style={{ 
                  background: '#f8f9fa', 
                  padding: '1rem', 
                  borderRadius: '4px',
                  whiteSpace: 'pre-wrap'
                }}>
                  {testResult}
                </pre>
              </div>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default TestSettings;