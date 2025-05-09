import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase/config';
import { signOut } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import CreateFamily from './CreateFamily';
import '../styles/UserDashboard.css';

const UserDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [familyData, setFamilyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateFamily, setShowCreateFamily] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setError('No user logged in');
          return;
        }

        // Fetch user profile
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserData(userData);

          // If user is part of a family, fetch family data
          if (userData.familyId) {
            const familyDoc = await getDoc(doc(db, 'families', userData.familyId));
            if (familyDoc.exists()) {
              const familyData = familyDoc.data();
              
              // Fetch all family members
              const membersQuery = query(
                collection(db, 'users'),
                where('familyId', '==', userData.familyId)
              );
              const membersSnapshot = await getDocs(membersQuery);
              const members = membersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
              }));

              // Sort members by points
              members.sort((a, b) => b.points - a.points);
              
              setFamilyData({
                ...familyData,
                members
              });
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // The auth state listener in App.jsx will handle the navigation
    } catch (error) {
      console.error('Error signing out:', error);
      setError('Failed to sign out');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="dashboard-container">
      <button className="logout-btn" onClick={handleLogout}>
        Log Out
      </button>
      
      <div className="user-info">
        <h2>Welcome, {userData?.firstName}!</h2>
        <div className="user-stats">
          <div className="stat-item">
            <h3>Your Points</h3>
            <p>{userData?.points || 0}</p>
          </div>
          <div className="stat-item">
            <h3>Items Recycled</h3>
            <p>{userData?.itemsRecycled || 0}</p>
          </div>
        </div>
      </div>

      {familyData ? (
        <div className="family-info">
          <h2>Family: {familyData.name}</h2>
          <div className="members-list">
            <h3>Family Members</h3>
            <ul>
              {familyData.members.map(member => (
                <li key={member.id} className="member-item">
                  <span className="member-name">
                    {member.firstName} {member.lastName}
                    {member.isAdmin && <span className="admin-badge">Admin</span>}
                  </span>
                  <span className="member-points">{member.points} points</span>
                </li>
              ))}
            </ul>
          </div>
          {userData?.isAdmin && (
            <div className="admin-actions">
              <button className="action-btn">Add Member</button>
              <button className="action-btn">Manage Admins</button>
            </div>
          )}
        </div>
      ) : (
        <div className="no-family">
          <h2>You're not part of a family yet</h2>
          <button 
            className="create-family-btn"
            onClick={() => setShowCreateFamily(true)}
          >
            Create a Family
          </button>
        </div>
      )}

      {showCreateFamily && (
        <CreateFamily
          onClose={() => setShowCreateFamily(false)}
          userId={auth.currentUser.uid}
        />
      )}
    </div>
  );
};

export default UserDashboard; 