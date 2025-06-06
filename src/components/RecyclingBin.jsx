import React, { useState, useEffect } from 'react';
import { getFirestore, collection, doc, setDoc, getDocs } from 'firebase/firestore';
import '../styles/RecyclingBin.css';
import { QRCode } from 'react-qr-code';

const RecyclingBin = () => {
  const [allBins, setAllBins] = useState([]);

  const generateBinId = () => {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `BIN-${timestamp}-${randomStr}`;
  };

  const createNewBin = async () => {
    try {
      const db = getFirestore();
      const binId = generateBinId();
      const binRef = doc(db, 'bins', binId);
      const bin = {
        bin_id: binId,
        created_at: new Date(),
        location: '',
        capacity: { aluminium: 0, glass: 0, plastic: 0, other: 0 },
        alert: { aluminium: false, glass: false, plastic: false, other: false, bin_id: binId },
        status: 'available',
        admin_notes: '',
        rpi_connected: false,
        last_update: new Date(),
        current_user: null
      };

      await setDoc(binRef, bin);
      fetchAllBins(); // Refresh bin list
    } catch (error) {
      console.error('Error creating bin:', error);
      alert('Error creating bin. Please try again.');
    }
  };

  const fetchAllBins = async () => {
    try {
      const db = getFirestore();
      const binsSnapshot = await getDocs(collection(db, 'bins'));
      setAllBins(binsSnapshot.docs.map(doc => doc.data()));
    } catch (error) {
      console.error('Error fetching bins:', error);
    }
  };

  useEffect(() => {
    fetchAllBins();
  }, []);

  return (
    <div className="recycling-bin-container">
      <h2>Recycling Bins (Admin)</h2>

      <button onClick={createNewBin} className="create-bin-btn">Create New Bin</button>

      <div className="all-bins-list">
        <h3>All Bins</h3>
        {allBins.length === 0 && <div>No bins found.</div>}
        {allBins.map((bin) => (
          <div key={bin.bin_id} className="bin-info-card">
            <h4>Bin ID: {bin.bin_id}</h4>
            <div>Location: {bin.location}</div>
            <div>Status: {bin.status}</div>
            <div>
              Capacity: Plastic: {bin.capacity?.plastic || 0}, Glass: {bin.capacity?.glass || 0},
              Aluminium: {bin.capacity?.aluminium || 0}, Other: {bin.capacity?.other || 0}
            </div>
            <div>Admin Notes: {bin.admin_notes}</div>
            <div>
              Created:{' '}
              {bin.created_at?.toDate
                ? bin.created_at.toDate().toLocaleString()
                : String(bin.created_at)}
            </div>

            {/* ✅ Show QR code for each bin */}
            <div className="qr-display">
              <p>Scan to identify this bin:</p>
              <QRCode value={bin.bin_id} size={120} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecyclingBin;

