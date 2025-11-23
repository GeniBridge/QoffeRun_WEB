import React, { useRef } from 'react'
import QRCode from 'qrcode.react'
import { useBranch } from '../context/BranchContext'

export default function QRCodePage(){
  const { selectedBranch } = useBranch();
  // Generate branch-specific menu URL for customer portal
  const customerPortalUrl = 'https://qofferun.com';
  const barUrl = selectedBranch ? `${customerPortalUrl}/branches/${selectedBranch.id}/menu` : customerPortalUrl;
  const printRef = useRef()

  function handlePrint() {
    const printContents = printRef.current.innerHTML;
    const win = window.open('', '', 'width=600,height=600');
    win.document.write('<html><head><title>Stampa QR Code</title>');
    win.document.write('<style>body{margin:0;padding:0;text-align:center;font-family:sans-serif;} img{margin:24px auto;display:block;} h2{margin-top:16px;}</style>');
    win.document.write('</head><body>');
    win.document.write(printContents);
    win.document.write('</body></html>');
    win.document.close();
    win.focus();
    setTimeout(()=>{ win.print(); win.close(); }, 500);
  }

  return (
    <section>
      <h5 className="mb-3">QR Code Menu</h5>
      
      {!selectedBranch && (
        <div className="alert alert-warning">
          <i className="bi bi-info-circle me-2"></i>
          Seleziona una filiale per generare il QR code del menu
        </div>
      )}
      
      <div className="p-4 bg-white rounded-4 border d-flex align-items-center justify-content-center" style={{minHeight:320}}>
        <div className="text-center w-100">
          <div ref={printRef}>
            <QRCode value={barUrl} size={200} includeMargin={true} renderAs="svg" />
            <h2 className="mt-3 mb-1">Scansiona per accedere al menu</h2>
            <div className="text-muted small mb-2">{barUrl}</div>
          </div>
          <button className="btn btn-dark mt-3" onClick={handlePrint}><i className="bi bi-printer me-2"></i>Stampa QR Code</button>
        </div>
      </div>
    </section>
  )
}
