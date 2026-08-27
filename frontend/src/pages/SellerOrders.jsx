import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import SellerSidebar from '../components/SellerSidebar';
import { Package, Truck, CheckCircle, Menu } from 'lucide-react';

const SellerOrders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'seller') {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = () => {
    setLoading(true);
    fetch(`http://localhost/SpecZone/backend/api/orders.php?action=read_seller&seller_id=${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setOrders(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching seller orders:", err);
        setLoading(false);
      });
  };

  const handleStatusChange = async (itemId, newStatus) => {
    try {
      const res = await fetch(`http://localhost/SpecZone/backend/api/orders.php?action=update_item_status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seller_id: user.id,
          item_id: itemId,
          status: newStatus
        })
      });
      const data = await res.json();
      if (res.ok) {
        // Refresh orders after successful update
        fetchOrders();
      } else {
        alert(data.message || "Failed to update status");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating status");
    }
  };

  const getStatusColor = (status) => {
    if (status === 'delivered') return 'var(--success)';
    if (status === 'shipped') return 'var(--warning)';
    return 'var(--text-secondary)';
  };

  return (
    <div className="dashboard-layout" style={{ minHeight: '100vh' }}>
      <SellerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && <div className="seller-dashboard-overlay" onClick={() => setSidebarOpen(false)} />}
      <main className="dashboard-content seller-dashboard-content">
        <div className="seller-mobile-header">
          <button className="seller-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <Menu size={24} />
          </button>
          <span className="seller-mobile-title">Manage Orders</span>
        </div>

        <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Manage Orders</h2>
        
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>Loading orders...</div>
          ) : orders.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <Package size={48} style={{ opacity: 0.5, margin: '0 auto 1rem' }} />
              <h3>No Orders Yet</h3>
              <p>You don't have any items to fulfill right now.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto', width: '100%' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <th style={{ padding: '1.2rem 1rem' }}>Order Info</th>
                  <th style={{ padding: '1.2rem 1rem' }}>Product</th>
                  <th style={{ padding: '1.2rem 1rem' }}>Customer</th>
                  <th style={{ padding: '1.2rem 1rem' }}>Total</th>
                  <th style={{ padding: '1.2rem 1rem' }}>Status</th>
                  <th style={{ padding: '1.2rem 1rem', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((item) => (
                  <tr key={item.item_id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 'bold' }}>#{item.order_id}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {new Date(item.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <img src={item.image_url || 'https://via.placeholder.com/40'} alt={item.title} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                        <div>
                          <div style={{ fontWeight: 'bold' }}>{item.title}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Qty: {item.quantity}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div>{item.buyer_name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.buyer_email}</div>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>
                      Rs. {(item.quantity * item.unit_price).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        padding: '0.3rem 0.6rem', 
                        borderRadius: '20px', 
                        fontSize: '0.8rem', 
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        background: 'rgba(255,255,255,0.1)',
                        color: getStatusColor(item.status)
                      }}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      {item.status === 'pending' && (
                        <button 
                          className="btn btn-primary" 
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: '0 auto' }}
                          onClick={() => handleStatusChange(item.item_id, 'shipped')}
                        >
                          <Truck size={14} /> Ship Item
                        </button>
                      )}
                      {item.status === 'shipped' && (
                        <button 
                          className="btn btn-outline" 
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: '0 auto', color: 'var(--success)' }}
                          onClick={() => handleStatusChange(item.item_id, 'delivered')}
                        >
                          <CheckCircle size={14} /> Mark Delivered
                        </button>
                      )}
                      {item.status === 'delivered' && (
                        <span style={{ color: 'var(--success)', fontSize: '0.9rem' }}>Completed</span>
                      )}
                    </td>
                  </tr>
                )                )}
              </tbody>
            </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SellerOrders;
