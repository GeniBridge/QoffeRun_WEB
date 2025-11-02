import React from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function QrCode() {
  const barUrl = "https://qofferun.bar/demo-bar";

  const handlePrint = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    const printWindow = window.open('', '', 'width=400,height=500');
    printWindow.document.write('<html><head><title>Stampa QR Code</title></head><body style="display:flex;align-items:center;justify-content:center;height:100vh;"><img src="' + dataUrl + '" style="width:256px;height:256px;" /></body></html>');
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return (
    <div className="container d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '80vh', paddingTop: '3.5rem' }}>
      <QRCodeCanvas value={barUrl} size={256} level="H" includeMargin={true} />
      <div className="mt-3">{barUrl}</div>
      <button className="btn btn-primary mt-4" onClick={handlePrint}>
        <i className="bi bi-printer me-2"></i>Stampa QR Code
      </button>
    </div>
  );
}
