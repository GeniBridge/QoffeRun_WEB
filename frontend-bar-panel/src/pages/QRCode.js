// src/pages/QRCode.jsx
import { useState } from "react";
import { Modal, Button } from "react-bootstrap";

const QRCodePage = () => {
  const [showModal, setShowModal] = useState(false);

  // URL del menù digitale
  const qrUrl = "https://cafe.easypos.it/qr/123";

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(
      `<html><head><title>QR Code</title></head><body style="text-align:center; padding:50px;">
       <h2>Menù Digitale</h2>
       <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrUrl}" alt="QR Code" />
       <p>URL: <strong>${qrUrl}</strong></p>
       </body></html>`
    );
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div>
      <h3>QR Code</h3>
      <p>Mostra il QR code per l'accesso al menù digitale.</p>
      <Button variant="primary" onClick={() => setShowModal(true)}>
        Mostra QR Code
      </Button>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>QR Code Menù Digitale</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrUrl}`}
            alt="QR Code"
          />
          <p className="mt-3">URL: <strong>{qrUrl}</strong></p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Chiudi
          </Button>
          <Button variant="success" onClick={handlePrint}>
            Stampa QR Code
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default QRCodePage;
