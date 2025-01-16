import React from "react";
import QrScanner from "react-qr-scanner";
import "../theme/QrScannerModal.css"; // Import CSS for styling

const QrScannerModal = ({ onClose, onScan }) => {
  const handleScan = (data) => {
    if (data) {
      onScan(data.text); // Pass scanned data back to the parent component
      onClose(); // Close the modal after successful scan
    }
  };

  const handleError = (err) => {
    console.error("QR Scanner Error:", err);
  };

  const previewStyle = {
    height: 240,
    width: 320,
  };

  return (
    <div className="qr-scanner-modal">
      <div className="qr-scanner-content">
        <h2>Scan a QR Code</h2>
        <QrScanner
          delay={300}
          style={previewStyle}
          onError={handleError}
          onScan={handleScan}
          constraints={{
            facingMode: "environment", // Use the back camera
          }}
        />
        <button className="close-button" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default QrScannerModal;
