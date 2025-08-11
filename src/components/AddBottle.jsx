import React, { useState, useEffect } from 'react';
import { getFirestore, doc, getDoc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import QrScanner from 'qr-scanner';
import { useNavigate } from 'react-router-dom';
import WaitingScreen from './WaitingScreen';
import IdentificationConfirmation from './IdentificationConfirmation';
import CorrectionForm from './CorrectionForm';

const AddBottle = ({ onUpdate, userData, binId }) => {
  const [scanning, setScanning] = useState(false);
  const [scanner, setScanner] = useState(null);
  const [currentStep, setCurrentStep] = useState('scanner'); // 'scanner', 'waiting', 'confirmation', 'correction'
  const [wasteEvent, setWasteEvent] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [currentBinId, setCurrentBinId] = useState(binId);
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

  // Auto-start recycling process if binId is provided (from external QR scan)
  useEffect(() => {
    if (binId && !scanning && currentStep === 'scanner') {
      console.log('Auto-starting recycling process for bin:', binId);
      setCurrentBinId(binId);
      setCurrentStep('waiting');
    }
  }, [binId, scanning, currentStep]);

  const handleScan = (scannedText) => {
    // Handle new URL format: https://sortimate0.web.app/bin/bin_001
    if (scannedText.includes('/bin/')) {
      try {
        const url = new URL(scannedText);
        const pathParts = url.pathname.split('/');
        const binId = pathParts[pathParts.length - 1]; // Get the last part as bin ID
        setCurrentBinId(binId);
        setScanning(false);
        setCurrentStep('waiting');
        return;
      } catch (error) {
        console.error('Error parsing URL:', error);
      }
    }
    
    // Handle custom URL scheme: sortimate://bin/bin_001
    if (scannedText.startsWith('sortimate://')) {
      try {
        const path = scannedText.replace('sortimate://', '');
        const parts = path.split('/');
        if (parts[0] === 'bin' && parts[1]) {
          setCurrentBinId(parts[1]);
          setScanning(false);
          setCurrentStep('waiting');
          return;
        }
      } catch (error) {
        console.error('Error parsing custom URL scheme:', error);
      }
    }
    
    // Handle old format: bin_001
    if (scannedText.startsWith('bin_')) {
      setCurrentBinId(scannedText);
      setScanning(false);
      setCurrentStep('waiting');
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

  const handleIdentificationReceived = (event) => {
    setWasteEvent(event);
    setCurrentStep('confirmation');
  };

  const handleCorrectIdentification = async () => {
    setProcessing(true);
    try {
      await awardPoints(wasteEvent.waste_type);
      alert(`✅ Points awarded! You earned points for recycling a ${wasteEvent.waste_type} bottle.`);
      resetToScanner();
    } catch (error) {
      alert('Error awarding points: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleIncorrectIdentification = () => {
    setCurrentStep('correction');
  };

  const handleCorrectionSubmit = async (correctedType) => {
    setProcessing(true);
    try {
      // Create alert in Firebase
      await createAlert(currentBinId, wasteEvent.waste_type, correctedType);
      alert('📝 Thank you for your feedback! Your correction has been recorded.');
      resetToScanner();
    } catch (error) {
      alert('Error submitting correction: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleCorrectionCancel = () => {
    setCurrentStep('confirmation');
  };

  const resetToScanner = () => {
    setCurrentStep('scanner');
    setWasteEvent(null);
    if (onUpdate) onUpdate();
  };

  const awardPoints = async (bottleType) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error("No user is signed in");
    }

    const db = getFirestore();
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error("User not found in database");
    }

    const userData = userSnap.data();
    const typeKey = bottleType.toLowerCase();
    const statsKey = typeKey === 'aluminum' ? 'aluminium' : typeKey;

    // Award points based on bottle type (simplified for now)
    let addedPoints = 1; // You can adjust this logic

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
  };

  const createAlert = async (binId, originalType, correctedType) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error("No user is signed in");
    }

    const db = getFirestore();
    const alertsRef = collection(db, 'alerts');

    const alertData = {
      bin_id: binId,
      created_at: serverTimestamp(),
      message: `User reported incorrect identification. Identified as ${originalType}, corrected to ${correctedType}`,
      resolved: false,
      type: "sensor_error",
      user_id: user.uid,
      original_identification: originalType,
      corrected_identification: correctedType
    };

    await addDoc(alertsRef, alertData);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'scanner':
        return (
          <div className="container">
            {/* Scanner Section - Available for all users */}
            <div className="card mb-4">
              <div className="text-center">
                <h3>🗑️ Scan Bin QR Code</h3>
                <p className="text-secondary mb-4">Scan a QR code to access recycling bins and track your recycling</p>
                
                <button 
                  onClick={() => setScanning(true)} 
                  className="btn btn-primary btn-lg"
                >
                  📷 Start Scanning
                </button>
                
                {scanning && (
                  <div className="mt-4">
                    <div className="card">
                      <h4 className="text-center">📱 Scanner Active</h4>
                      <p className="text-center text-secondary">Point camera at QR code</p>
                      <video 
                        id="qr-video" 
                        className="card"
                        style={{ 
                          width: '100%', 
                          maxWidth: '400px', 
                          height: '300px',
                          objectFit: 'cover',
                          borderRadius: 'var(--border-radius-md)'
                        }}
                      ></video>
                      <div className="text-center mt-3">
                        <button 
                          onClick={() => setScanning(false)} 
                          className="btn btn-outline"
                        >
                          ❌ Cancel Scan
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Manual Entry Section - Only for Admins */}
            {userData?.role === 'admin' && (
              <div className="card">
                <div className="text-center">
                  <h3>⚙️ Add Bottle Manually (Admin Only)</h3>
                  <p className="text-secondary mb-4">Manually add bottles for testing or data entry</p>
                </div>
                
                <form onSubmit={handleSubmit} className="grid grid-1">
                  <div>
                    <label htmlFor="type" className="font-semibold">🍾 Bottle Type</label>
                    <select
                      id="type"
                      name="type"
                      value={bottleData.type}
                      onChange={handleChange}
                      required
                      className="card"
                      style={{ 
                        width: '100%', 
                        padding: 'var(--spacing-md)',
                        border: '2px solid var(--medium-gray)',
                        borderRadius: 'var(--border-radius-md)',
                        marginTop: 'var(--spacing-sm)'
                      }}
                    >
                      <option value="">Select Type</option>
                      <option value="Plastic">🥤 Plastic</option>
                      <option value="Aluminum">🥫 Aluminum</option>
                      <option value="Glass">🍾 Glass</option>
                      <option value="other">📦 Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="volume" className="font-semibold">📏 Volume (ml)</label>
                    <input
                      type="number"
                      id="volume"
                      name="volume"
                      value={bottleData.volume}
                      onChange={handleChange}
                      required
                      className="card"
                      style={{ 
                        width: '100%', 
                        padding: 'var(--spacing-md)',
                        border: '2px solid var(--medium-gray)',
                        borderRadius: 'var(--border-radius-md)',
                        marginTop: 'var(--spacing-sm)'
                      }}
                      placeholder="Enter volume in milliliters"
                    />
                  </div>

                  <button type="submit" className="btn btn-primary btn-lg">
                    ➕ Add Bottle
                  </button>
                </form>
              </div>
            )}
          </div>
        );

      case 'waiting':
        return (
          <WaitingScreen 
            onIdentificationReceived={handleIdentificationReceived}
            userData={userData}
          />
        );

      case 'confirmation':
        return (
          <IdentificationConfirmation 
            wasteEvent={wasteEvent}
            onCorrect={handleCorrectIdentification}
            onIncorrect={handleIncorrectIdentification}
          />
        );

      case 'correction':
        return (
          <CorrectionForm 
            originalIdentification={wasteEvent?.waste_type}
            onSubmit={handleCorrectionSubmit}
            onCancel={handleCorrectionCancel}
          />
        );

      default:
        return null;
    }
  };

  // Legacy manual entry handler (for admin manual entry)
  const [bottleData, setBottleData] = useState({ type: '', volume: '' });

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

  return (
    <div className="fade-in">
      {renderCurrentStep()}
    </div>
  );
};

export default AddBottle;