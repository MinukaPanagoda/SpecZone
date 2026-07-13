import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, ShoppingBag, Heart, Wrench, Settings } from 'lucide-react';

const BuyerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role === 'buyer') {
      fetch(`http://localhost/Spec%20Zone/backend/api/orders.php?action=read_buyer&buyer_id=${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setOrders(data);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching orders:", err);
          setLoading(false);
        });
    }
  }, [user]);

  const getStatusColor = (status) => {
    if (status === 'delivered') return 'var(--success)';
    if (status === 'shipped') return 'var(--warning)';
    return 'var(--text-secondary)';
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <h3 style={{ marginBottom: '2rem', paddingLeft: '1rem', color: 'var(--text-secondary)' }}>Buyer Panel</h3>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0 1rem' }}>
          <button 
            className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-outline'}`}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.8rem', justifyContent: 'flex-start', padding: '0.8rem 1rem', border: activeTab !== 'overview' ? 'none' : '' }}
            onClick={() => setActiveTab('overview')}
          >
            <LayoutDashboard size={20} /> Overview
          </button>
          <button 
            className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-outline'}`}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.8rem', justifyContent: 'flex-start', padding: '0.8rem 1rem', border: activeTab !== 'orders' ? 'none' : '' }}
            onClick={() => setActiveTab('orders')}
          >
            <ShoppingBag size={20} /> My Orders
          </button>
          <button className="btn btn-outline" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.8rem', justifyContent: 'flex-start', padding: '0.8rem 1rem', border: 'none', color: 'var(--text-secondary)' }}>
            <Wrench size={20} /> My PC Builds
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="dashboard-content">
        
        {activeTab === 'overview' && (
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Welcome back, {user?.first_name}!</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
              <div className="glass-panel stat-card">
                <div className="stat-icon"><ShoppingBag size={24} /></div>
                <div className="stat-info">
                  <h3>{orders.length}</h3>
                  <p>Total Orders</p>
                </div>
              </div>
              <div className="glass-panel stat-card">
                <div className="stat-icon"><Wrench size={24} /></div>
                <div className="stat-info">
                  <h3>0</h3>
                  <p>Saved PC Builds</p>
                </div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Recent Activity</h3>
              <p style={{ color: 'var(--text-secondary)' }}>You recently placed {orders.length} orders.</p>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>My Orders</h2>
            
            {loading ? (
              <p>Loading orders...</p>
            ) : orders.length === 0 ? (
              <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <ShoppingBag size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <h3>No Orders Yet</h3>
                <p>You haven't placed any orders yet. Start exploring components!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {orders.map(order => (
                  <div key={order.id} className="glass-panel" style={{ overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <div>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Order Placed: {new Date(order.created_at).toLocaleDateString()}</span>
                        <h4 style={{ margin: '0.3rem 0 0 0' }}>Order #{order.id}</h4>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Total Amount</span>
                        <h4 style={{ margin: '0.3rem 0 0 0', color: 'var(--accent-primary)' }}>Rs. {parseFloat(order.total_amount).toLocaleString('en-IN')}</h4>
                      </div>
                    </div>
                    <div style={{ padding: '1.5rem' }}>
                      {order.items && order.items.map(item => (
                        <div key={item.item_id} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <img src={item.image_url || 'https://via.placeholder.com/60'} alt={item.title} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                          <div style={{ flex: 1 }}>
                            <h5 style={{ margin: '0 0 0.3rem 0', fontSize: '1rem' }}>{item.title}</h5>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Sold by: {item.seller_name} | Qty: {item.quantity}</p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '0.3rem' }}>Rs. {(item.quantity * item.unit_price).toLocaleString('en-IN')}</div>
                            <span style={{ 
                              padding: '0.2rem 0.5rem', 
                              borderRadius: '4px', 
                              fontSize: '0.75rem', 
                              fontWeight: 'bold',
                              textTransform: 'uppercase',
                              background: 'rgba(255,255,255,0.1)',
                              color: getStatusColor(item.status)
                            }}>
                              {item.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
};

export default BuyerDashboard;
