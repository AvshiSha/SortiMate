import React, { useState, useEffect } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import AddBottle from './AddBottle';
import RecyclingBin from './RecyclingBin';
import '../styles/UserDashboard.css';
import { useNavigate } from 'react-router-dom'; 

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [userData, setUserData] = useState(null);
  const [familyData, setFamilyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserData = async () => {
    try {
      const auth = getAuth();
      const db = getFirestore();
      const user = auth.currentUser;

      if (user) {
        // חפש את המשתמש לפי uid
        const q = query(collection(db, 'users'), where('auth_uid', '==', user.uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userData = userDoc.data();
          setUserData(userData);

          // טען את הקבוצה אם קיימת
          if (userData.family && userData.family.group_id) {
            const groupDoc = await getDoc(doc(db, 'groups', userData.family.group_id));
            if (groupDoc.exists()) {
              const groupData = groupDoc.data();
              // מצא את כל המשתמשים באותה קבוצה
              const membersQuery = query(
                collection(db, 'users'),
                where('family.group_id', '==', userData.family.group_id)
              );
              const membersSnapshot = await getDocs(membersQuery);
              const members = membersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
              }));
              members.sort((a, b) => b.total_points - a.total_points);
              setFamilyData({ ...groupData, members });
            }
          } else {
            setFamilyData(null);
          }
        } else {
            setError("User data not found. You may have been removed.");
            const auth = getAuth();
            await signOut(auth);
            return;
        }
      }
    } catch (err) {
      setError('Error fetching user data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const navigate = useNavigate(); //??
  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      navigate('/'); // or navigate('/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="dashboard-container">
      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>

      <div className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          My Profile
        </button>
        <button 
          className={`tab-btn ${activeTab === 'add-bottle' ? 'active' : ''}`}
          onClick={() => setActiveTab('add-bottle')}
        >
          Add Bottle
        </button>
        {userData?.role === 'admin' && (
          <button 
            className={`tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin')}
          >
            Admin Tab
          </button>
        )}
      </div>

      <div className="tab-content">
        {activeTab === 'profile' && (
          <div className="profile-section">
            <div className="user-info">
              <h2>Welcome, {userData?.first_name}!</h2>
              <div className="user-stats">
                <div className="stat-item">
                  <h3>Your Points</h3>
                  <p>{userData?.total_points || 0}</p>
                </div>
                <div className="stat-item">
                  <h3>Items Recycled</h3>
                  <p>{userData?.items_recycled || 0}</p>
                </div>
              </div>
            </div>

            {familyData ? (
              <div className="family-info">
                <h2>Group: {familyData.group_name}</h2>
                <div className="members-list">
                  <h3>Family Members</h3>
                  <ul>
                    {familyData.members.map(member => (
                      <li key={member.id} className="member-item">
                        <span className="member-name">
                          {member.first_name} {member.last_name}
                          {member.role === 'admin' && <span className="admin-badge">Admin</span>}
                        </span>
                        <span className="member-points">{member.total_points} points</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="no-family">
                <h2>You're not part of a group yet</h2>
                <button className="create-family-btn">
                  Create a Group
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'add-bottle' && (
          <AddBottle onUpdate={fetchUserData} />
        )}

        {activeTab === 'admin' && userData?.role === 'admin' && (
          <RecyclingBin />
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
