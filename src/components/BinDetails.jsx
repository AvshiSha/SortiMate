import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

const BinDetails = () => {
  const { binId } = useParams();
  const [bin, setBin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBin = async () => {
      try {
        const db = getFirestore();
        const binsRef = collection(db, 'bins');
        const q = query(binsRef, where('bin_id', '==', binId));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setBin(querySnapshot.docs[0].data());
        } else {
          setError('Bin not found.');
        }
      } catch (err) {
        setError('Error loading bin data.');
      }
      setLoading(false);
    };
    fetchBin();
  }, [binId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{color: 'red'}}>{error}</div>;

  return (
    <div>
      <button onClick={() => navigate(-1)}>Back</button>
      <h2>Bin Details</h2>
      <p><b>ID:</b> {bin.bin_id}</p>
      <p><b>Location:</b> {bin.location}</p>
      <p><b>Status:</b> {bin.status}</p>
      <p><b>Capacity:</b> {JSON.stringify(bin.capacity)}</p>
    </div>
  );
};

export default BinDetails;