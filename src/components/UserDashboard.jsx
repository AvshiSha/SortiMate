import React, { useState, useEffect } from 'react';
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import AddBottle from './AddBottle';
import AdminBinManager from './AdminBinManager';
import FamilyManager from './FamilyManager';
import InvitationManager from './InvitationManager';
import JoinRequestManager from './JoinRequestManager';
import FamilyMemberView from './FamilyMemberView';


const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showInvitations, setShowInvitations] = useState(false);
  const [userData, setUserData] = useState(null);
  const [familyData, setFamilyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [redirectBinId, setRedirectBinId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchUserData = async () => {
    try {
      const auth = getAuth();
      const db = getFirestore();
      const user = auth.currentUser;

      if (user) {
        // Search for user by uid
        const q = query(collection(db, 'users'), where('auth_uid', '==', user.uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userData = userDoc.data();
          setUserData(userData);

          // Load family if exists
          if (userData.family && userData.family.group_id) {
            const groupDoc = await getDoc(doc(db, 'groups', userData.family.group_id));
            if (groupDoc.exists()) {
              const groupData = groupDoc.data();
              // Find all users in the same group
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
    // Listen for auth state changes to keep userData up-to-date
    const unsubscribe = getAuth().onAuthStateChanged(() => {
      fetchUserData();
    });
    return () => unsubscribe();
  }, []);

  // Handle bin query parameter for QR redirects
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const binId = urlParams.get('bin');
    
    if (binId && userData) {
      // Store the bin ID in state before clearing URL
      setRedirectBinId(binId);
      // Switch to add-bottle tab
      setActiveTab('add-bottle');
      // Clear the query parameter from URL
      navigate('/dashboard', { replace: true });
    }
  }, [location.search, userData, navigate]);

  // Clear redirect bin ID when switching away from add-bottle tab
  useEffect(() => {
    if (activeTab !== 'add-bottle') {
      setRedirectBinId(null);
    }
  }, [activeTab]);

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      navigate('/'); // or navigate('/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };



  if (loading) {
    return (
      <div className="container">
        <div className="flex-center" style={{ minHeight: '60vh' }}>
          <div className="text-center">
            <div className="loading-spinner"></div>
            <p className="text-secondary mt-3">Loading your recycling journey...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="message message-error">
          <h3>Oops! Something went wrong</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Header */}
      <div className="card mb-4">
        <div className="flex-between">
          <div>
            <h1 className="text-success">🌱 Welcome back, {userData?.first_name || 'Recycler'}!</h1>
            <p className="text-secondary">Ready to make the world greener?</p>
          </div>
          <div className="flex">
            <button className="btn btn-danger" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
        </div>
      </div>

                        {/* Tabs */}
                  <div className="card">
                    <div className="flex" style={{ borderBottom: '2px solid var(--light-gray)', marginBottom: 'var(--spacing-lg)' }}>
                      <button 
                        className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setActiveTab('profile')}
                        style={{ marginRight: 'var(--spacing-sm)', borderRadius: 'var(--border-radius-md) 0 0 0' }}
                      >
                        👤 My Profile
                      </button>
                      <button 
                        className={`btn ${activeTab === 'add-bottle' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => {
                          setActiveTab('add-bottle');
                          // Clear redirect bin ID when manually switching to add-bottle tab
                          if (activeTab !== 'add-bottle') {
                            setRedirectBinId(null);
                          }
                        }}
                        style={{ marginRight: 'var(--spacing-sm)' }}
                      >
                        🥤 Add Bottle
                      </button>
                      
                      {/* Show different tabs based on family status */}
                      {!familyData ? (
                        <>
                          <button 
                            className={`btn ${activeTab === 'invitations' ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setActiveTab('invitations')}
                            style={{ marginRight: 'var(--spacing-sm)' }}
                          >
                            📨 Invitations
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            className={`btn ${activeTab === 'join-requests' ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setActiveTab('join-requests')}
                            style={{ marginRight: 'var(--spacing-sm)' }}
                          >
                            🤝 Join Requests
                          </button>
                        </>
                      )}
                      
                      {userData?.role === 'admin' && (
                        <button 
                          className={`btn ${activeTab === 'admin' ? 'btn-primary' : 'btn-outline'}`}
                          onClick={() => setActiveTab('admin')}
                          style={{ borderRadius: '0 var(--border-radius-md) 0 0' }}
                        >
                          ⚙️ Admin
                        </button>
                      )}
                    </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="fade-in">
            <div className="grid grid-2">
              {/* User Stats */}
              <div className="card">
                <h3 className="text-center">📈 Your Stats</h3>
                <div className="grid grid-2">
                  <div className="text-center">
                    <div className="text-success font-bold" style={{ fontSize: '2rem' }}>
                      {userData?.total_points || 0}
                    </div>
                    <p className="text-secondary">Total Points</p>
                  </div>
                  <div className="text-center">
                    <div className="text-info font-bold" style={{ fontSize: '2rem' }}>
                      {userData?.items_recycled || 0}
                    </div>
                    <p className="text-secondary">Items Recycled</p>
                  </div>
                </div>
              </div>

              {/* Recycling Stats */}
              <div className="card">
                <h3 className="text-center">♻️ Recycling Breakdown</h3>
                <div className="grid grid-2">
                  <div className="text-center">
                    <div className="text-info font-bold">🥤</div>
                    <p className="text-secondary">Plastic: {userData?.recycle_stats?.plastic || 0}</p>
                  </div>
                  <div className="text-center">
                    <div className="text-warning font-bold">🍾</div>
                    <p className="text-secondary">Glass: {userData?.recycle_stats?.glass || 0}</p>
                  </div>
                  <div className="text-center">
                    <div className="text-purple font-bold">🥫</div>
                    <p className="text-secondary">Aluminium: {userData?.recycle_stats?.aluminium || 0}</p>
                  </div>
                  <div className="text-center">
                    <div className="text-success font-bold">📦</div>
                    <p className="text-secondary">Other: {userData?.recycle_stats?.other || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Family Section */}
            {familyData ? (
              <FamilyMemberView 
                userData={userData}
                familyData={familyData}
                onFamilyLeft={fetchUserData}
                onFamilyDeleted={fetchUserData}
              />
            ) : (
              <FamilyManager 
                onFamilyCreated={fetchUserData}
                onFamilyJoined={fetchUserData}
                userData={userData}
              />
            )}
          </div>
        )}

        {/* Add Bottle Tab */}
        {activeTab === 'add-bottle' && (
          <div className="fade-in">
            <AddBottle 
              onUpdate={fetchUserData} 
              userData={userData} 
              binId={redirectBinId}
            />
          </div>
        )}

        {/* Invitations Tab */}
        {activeTab === 'invitations' && (
          <div className="fade-in">
            <InvitationManager 
              userData={userData}
              onInvitationAccepted={fetchUserData}
              onInvitationDeclined={fetchUserData}
            />
          </div>
        )}

        {/* Join Requests Tab */}
        {activeTab === 'join-requests' && familyData && (
          <div className="fade-in">
            <JoinRequestManager 
              userData={userData}
              familyData={familyData}
              onRequestProcessed={fetchUserData}
            />
          </div>
        )}

        {/* Admin Tab */}
        {activeTab === 'admin' && userData?.role === 'admin' && (
          <div className="fade-in">
            <AdminBinManager />
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
