import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, ShoppingBag, Package, LayoutDashboard, Trash2, LogOut, Star, AlertTriangle } from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  
  const [stats, setStats] = useState({
    total_buyers: 0,
    total_sellers: 0,
    total_products: 0,
    total_orders: 0
  });
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch stats
        const statsRes = await fetch(`http://localhost/Spec%20Zone/backend/api/admin.php?action=stats&admin_id=${user.id}`);
        const statsData = await statsRes.json();
        if (statsData.total_buyers !== undefined) {
          setStats(statsData);
        }

        // Fetch users
        const usersRes = await fetch(`http://localhost/Spec%20Zone/backend/api/admin.php?action=users&admin_id=${user.id}`);
        const usersData = await usersRes.json();
        if (Array.isArray(usersData)) {
          setUsers(usersData);
        }
      } catch (err) {
        console.error("Error fetching admin data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

    try {
      const res = await fetch('http://localhost/Spec%20Zone/backend/api/admin.php?action=delete_user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_id: user.id, user_id: userId })
      });
      
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setUsers(users.filter(u => u.id !== userId));
      } else {
        alert(data.message || "Failed to delete user");
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Error deleting user");
    }
  };

  if (loading) return <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>Loading Admin Dashboard...</div>;

  return (
    <div className="container dashboard-container" style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem', padding: '2rem 1rem' }}>
      
      {/* Sidebar */}
      <aside className="dashboard-sidebar glass-panel" style={{ padding: '2rem 1rem', height: 'calc(100vh - 120px)', position: 'sticky', top: '80px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold' }}>
            {user?.first_name?.charAt(0)}
          </div>
          <h3 style={{ margin: 0 }}>{user?.first_name} {user?.last_name}</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Administrator</span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button 
            className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-outline'}`}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.8rem', justifyContent: 'flex-start', padding: '0.8rem 1rem', border: activeTab !== 'overview' ? 'none' : '' }}
            onClick={() => setActiveTab('overview')}
          >
            <LayoutDashboard size={20} /> Overview
          </button>
          <button 
            className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-outline'}`}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.8rem', justifyContent: 'flex-start', padding: '0.8rem 1rem', border: activeTab !== 'users' ? 'none' : '' }}
            onClick={() => setActiveTab('users')}
          >
            <Users size={20} /> Manage Users
          </button>
        </nav>

        <div style={{ position: 'absolute', bottom: '2rem', left: '1rem', right: '1rem' }}>
          <button 
            className="btn btn-outline" 
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.8rem', justifyContent: 'flex-start', padding: '0.8rem 1rem', border: 'none', color: 'var(--danger)' }}
            onClick={() => {
              logout();
              navigate('/');
            }}
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main>
        
        {activeTab === 'overview' && (
          <div>
            <h2 style={{ marginBottom: '2rem' }}>Platform Overview</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
              
              <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', borderTop: '4px solid #3b82f6' }}>
                <Users size={32} color="#3b82f6" style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem 0' }}>{stats.total_buyers}</h3>
                <p style={{ color: 'var(--text-secondary)', margin: 0, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Total Buyers</p>
              </div>

              <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', borderTop: '4px solid #10b981' }}>
                <Users size={32} color="#10b981" style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem 0' }}>{stats.total_sellers}</h3>
                <p style={{ color: 'var(--text-secondary)', margin: 0, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Total Sellers</p>
              </div>

              <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', borderTop: '4px solid #8b5cf6' }}>
                <Package size={32} color="#8b5cf6" style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem 0' }}>{stats.total_products}</h3>
                <p style={{ color: 'var(--text-secondary)', margin: 0, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Live Products</p>
              </div>

              <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', borderTop: '4px solid #f59e0b' }}>
                <ShoppingBag size={32} color="#f59e0b" style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem 0' }}>{stats.total_orders}</h3>
                <p style={{ color: 'var(--text-secondary)', margin: 0, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Total Orders</p>
              </div>

            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ margin: 0 }}>User Management</h2>
              <select 
                className="form-control" 
                style={{ width: '250px' }} 
                value={filterRole} 
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="all">All Users</option>
                <option value="buyer">Buyers Only</option>
                <option value="seller">Sellers Only</option>
                <option value="critical_seller">Critical Sellers (Rating ≤ 4)</option>
              </select>
            </div>
            
            <div className="glass-panel" style={{ overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
                    <th style={{ padding: '1.2rem 1rem' }}>ID</th>
                    <th style={{ padding: '1.2rem 1rem' }}>Name</th>
                    <th style={{ padding: '1.2rem 1rem' }}>Email</th>
                    <th style={{ padding: '1.2rem 1rem' }}>Role</th>
                    <th style={{ padding: '1.2rem 1rem' }}>Seller Rating</th>
                    <th style={{ padding: '1.2rem 1rem' }}>Joined</th>
                    <th style={{ padding: '1.2rem 1rem', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.filter(u => {
                    if (filterRole === 'all') return true;
                    if (filterRole === 'critical_seller') return u.role === 'seller' && u.avg_rating !== null && u.avg_rating <= 4;
                    return u.role === filterRole;
                  }).map(u => (
                    <tr key={u.id} style={{ 
                      borderTop: '1px solid rgba(255,255,255,0.05)',
                      backgroundColor: (u.role === 'seller' && u.avg_rating !== null && u.avg_rating <= 4) ? 'rgba(239, 68, 68, 0.05)' : 'transparent'
                    }}>
                      <td style={{ padding: '1rem' }}>#{u.id}</td>
                      <td style={{ padding: '1rem', fontWeight: 'bold' }}>{u.first_name} {u.last_name}</td>
                      <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ 
                          padding: '0.3rem 0.6rem', 
                          borderRadius: '20px', 
                          fontSize: '0.8rem', 
                          fontWeight: 'bold',
                          textTransform: 'uppercase',
                          background: u.role === 'admin' ? 'rgba(239, 68, 68, 0.2)' : u.role === 'seller' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                          color: u.role === 'admin' ? '#ef4444' : u.role === 'seller' ? '#10b981' : '#3b82f6'
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {u.role === 'seller' ? (
                          u.avg_rating !== null ? (
                            <div style={{ 
                              display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 'bold',
                              color: u.avg_rating <= 4 ? 'var(--danger)' : u.avg_rating <= 7 ? 'var(--warning)' : 'var(--success)'
                            }}>
                              <Star size={16} fill="currentColor" />
                              <span>{u.avg_rating}/10</span>
                              {u.avg_rating <= 4 && <AlertTriangle size={16} color="var(--danger)" style={{ marginLeft: '0.5rem' }} title="Low Rating Warning" />}
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No Ratings</span>
                          )
                        ) : (
                          <span style={{ color: 'var(--text-secondary)' }}>-</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        {u.id !== user.id && (
                          <button 
                            onClick={() => handleDeleteUser(u.id)}
                            style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.5rem', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', transition: 'background 0.2s' }}
                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                            title="Delete User"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.filter(u => {
                if (filterRole === 'all') return true;
                if (filterRole === 'critical_seller') return u.role === 'seller' && u.avg_rating !== null && u.avg_rating <= 4;
                return u.role === filterRole;
              }).length === 0 && (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No users found for this filter.
                </div>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminDashboard;
