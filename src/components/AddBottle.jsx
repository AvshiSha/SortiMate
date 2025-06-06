import React, { useState, useEffect } from 'react';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import QrScanner from 'qr-scanner';
import { useNavigate } from 'react-router-dom';
import '../styles/AddBottle.css';

const AddBottle = ({ onUpdate }) => {
  const [bottleData, setBottleData] = useState({ type: '', volume: '' });
  const [scanning, setScanning] = useState(false);
  const [scanner, setScanner] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (scanning) {
      const videoElement = document.getElementById('qr-video');
      if (videoElement) {
        const newScanner = new QrScanner(
          videoElement,
          (result) => {
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
    // eslint-disable-next-line
  }, [scanning]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBottleData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert("No user is signed in");
      return;
    }

    const db = getFirestore();
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      alert("User not found in database");
      return;
    }

    const userData = userSnap.data();
    const volume = parseInt(bottleData.volume, 10);

    let addedPoints = volume < 500 ? 1 : volume < 1000 ? 2 : 3;
    const typeKey = bottleData.type.toLowerCase();
    const statsKey = typeKey === 'aluminum' ? 'aluminium' : typeKey;

    const newStats = {
      ...userData.recycle_stats,
      [statsKey]: (userData.recycle_stats?.[statsKey] || 0) + 1
    };

    await updateDoc(userRef, {
      recycle_stats: newStats,
      total_points: (userData.total_points || 0) + addedPoints,
      items_recycled: (userData.items_recycled || 0) + 1,
      last_activity: new Date()
    });

    alert(`✅ Bottle added! You earned ${addedPoints} points.`);
    setBottleData({ type: '', volume: '' });
    if (onUpdate) onUpdate();
  };

  const handleScan = (scannedText) => {
    if (scannedText.startsWith('bin_')) {
      setScanning(false);
      navigate(`/bin/${scannedText}`);
      return;
    }
    try {
      const url = new URL(scannedText);
      window.open(url.href, '_blank');
      setScanning(false);
    } catch (error) {
      alert('Invalid QR code. Please scan a valid bottle or bin QR code.');
      setScanning(false);
    }
  };

  return (
    <div className="add-bottle-container">
      <div className="scanner-section">
        <h2>Scan Bottle or Bin QR Code</h2>
        <p>Scan a QR code to learn more about the bottle or view bin details.</p>
        <button onClick={() => setScanning(true)} className="scan-btn">
          Start Scanning
        </button>
        {scanning && (
          <div className="scanner-container">
            <h3>Scan a QR code</h3>
            <video id="qr-video" className="qr-video"></video>
            <button onClick={() => setScanning(false)} className="cancel-btn">
              Cancel Scan
            </button>
          </div>
        )}
      </div>

      <div className="manual-entry-section">
        <h2>Add Bottle Manually</h2>
        <form onSubmit={handleSubmit} className="add-bottle-form">
          <div className="form-group">
            <label htmlFor="type">Type</label>
            <select
              id="type"
              name="type"
              value={bottleData.type}
              onChange={handleChange}
              required
            >
              <option value="">Select Type</option>
              <option value="Plastic">Plastic</option>
              <option value="Aluminum">Aluminum</option>
              <option value="Glass">Glass</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="volume">Volume (ml)</label>
            <input
              type="number"
              id="volume"
              name="volume"
              value={bottleData.volume}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="submit-btn">Add Bottle</button>
        </form>
      </div>
    </div>
  );
};

export default AddBottle;