import React, { useState, useEffect } from 'react';
import { getFirestore, collection, doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

import '../styles/BinScanner.css';

const BinScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [currentBin, setCurrentBin] = useState(null);
  const [binData, setBinData] = useState(null);
  const [activeTab, setActiveTab] = useState('scan');
  const [scanner, setScanner] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (scanning) {
      const videoElement = document.getElementById('qr-video');
      if (videoElement) {
        const newScanner = new QrScanner(
          videoElement,
          (result) => {
            console.log('QR Code detected:', result);
            handleScan(result.data);
          },
          {
            returnDetailedScanResult: true,
            highlightScanRegion: true,
            highlightCodeOutline: true,
          }
        );
        newScanner.start();
        setScanner(newScanner);
      }
    }

    return () => {
      if (scanner) {
        scanner.stop();
      }
    };
  }, [scanning]);

  const handleScan = async (scannedText) => {
    console.log('Processing scan:', scannedText);
    if (scannedText.startsWith('bin_')) {
      navigate(`/bin/${scannedText}`);
      setScanning(false);
      return;
    }
    try {
      const db = getFirestore();
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        alert('Please sign in to use the bin');
        return;
      }
      alert('Invalid bin ID');
    } catch (error) {
      console.error('Error scanning bin:', error);
      alert('Error scanning bin: ' + error.message);
    }
  };

  const leaveBin = async () => {
    if (!currentBin) return;

    try {
      const db = getFirestore();
      await updateDoc(currentBin.ref, {
        status: 'available',
        current_user: null,
        last_update: new Date()
      });

      setBinData(prev => ({
        ...prev,
        status: 'available',
        current_user: null
      }));
      setCurrentBin(null);
      setActiveTab('scan');
    } catch (error) {
      console.error('Error leaving bin:', error);
    }
  };

  return (
    <div className="bin-scanner-container">
      {activeTab === 'scan' ? (
        <div className="scan-tab">
          <h2>Scan Bin QR Code</h2>
          <button onClick={() => setScanning(true)} className="scan-btn">Start Scanning</button>
          
          {scanning && (
            <div className="scanner-container">
              <h3>Scan a bin QR code</h3>
              <video id="qr-video" className="qr-video"></video>
              <button onClick={() => setScanning(false)} className="cancel-btn">Cancel Scan</button>
            </div>
          )}
        </div>
      ) : (
        <div className="waiting-tab">
          <div className="waiting-container">
            <h3>Waiting for recycling event...</h3>
            <p>Bin ID: {currentBin?.id}</p>
            <p>Status: {binData?.status}</p>
            <div className="capacity-info">
              <h4>Current Capacity:</h4>
              <p>Plastic: {binData?.capacity?.plastic || 0}</p>
              <p>Glass: {binData?.capacity?.glass || 0}</p>
              <p>Aluminium: {binData?.capacity?.aluminium || 0}</p>
              <p>Other: {binData?.capacity?.other || 0}</p>
            </div>
            <button onClick={leaveBin} className="leave-btn">Leave Bin</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BinScanner;
