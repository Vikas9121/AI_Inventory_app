import React, { useEffect, useRef, useState } from 'react';
import './BarcodeScanner.css';

const BarcodeScanner = ({ onScan }) => {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasPermission(true);
      } catch (err) {
        setError('Failed to access camera: ' + err.message);
        setHasPermission(false);
      }
    };

    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const handleScanClick = () => {
    // Here you would typically integrate with a barcode detection library
    // For now, we'll simulate a scan
    const mockBarcode = '123456789';
    onScan(mockBarcode);
  };

  if (error) {
    return <div className="scanner-error">{error}</div>;
  }

  return (
    <div className="scanner-container">
      {!hasPermission && (
        <div className="scanner-loading">Requesting camera permission...</div>
      )}
      <video 
        ref={videoRef}
        autoPlay
        playsInline
        className="scanner-video"
      />
      <button 
        onClick={handleScanClick}
        className="scan-button"
      >
        Scan Barcode
      </button>
    </div>
  );
};

export default BarcodeScanner; 