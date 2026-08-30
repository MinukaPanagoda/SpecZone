import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Package, ShoppingCart, BarChart2, Star, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SellerSidebar from '../components/SellerSidebar';

const SellerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ avg_rating: 0, total_reviews: 0, active_listings: 0 });
  const [sales, setSales] = useState([]);
  const [salesLoading, setSalesLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'seller') {
      navigate('/login');
      return;
    }

    fetch(`http://localhost/SpecZone/backend/api/seller_stats.php?seller_id=${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data && !data.message) {
          setStats(data);
        }
      })
      .catch(err => console.error(err));
  }, [user, navigate]);

  useEffect(() => {
    if (!user || user.role !== 'seller') return;

    setSalesLoading(true);
    fetch(`http://localhost/SpecZone/backend/api/orders.php?action=read_seller&seller_id=${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSales(data.slice(0, 5));
        }
        setSalesLoading(false);
      })
      .catch(err => {
        console.error(err);
        setSalesLoading(false);
      });
  }, [user, navigate]);

  let ratingColor = 'var(--text-secondary)';
  let ratingBg = 'rgba(255, 255, 255, 0.1)';
  
  if (stats.total_reviews > 0) {
    if (stats.avg_rating <= 4) {
      ratingColor = 'var(--danger)'; // Red
      ratingBg = 'rgba(255, 50, 50, 0.1)';
    } else if (stats.avg_rating <= 7) {
      ratingColor = 'var(--warning)'; // Yellow
      ratingBg = 'rgba(255, 171, 0, 0.1)';
    } else {
      ratingColor = 'var(--success)'; // Green
      ratingBg = 'rgba(50, 255, 50, 0.1)';
    }
  }

  return (
    <div className="dashboard-layout" style={{ minHeight: '100vh' }}>
      <SellerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && <div className="seller-dashboard-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Main Content */}
      <main className="dashboard-content seller-dashboard-content">
        <div className="seller-mobile-header">
          <button className="seller-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <Menu size={24} />
          </button>
          <span className="seller-mobile-title">Seller Dashboard</span>
        </div>

        <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Seller Dashboard</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          <div className="glass-panel stat-card">
            <div className="stat-icon"><Package size={24} /></div>
            <div className="stat-info">
              <h3>{stats.active_listings}</h3>
              <p>Active Listings</p>
            </div>
          </div>
          <div className="glass-panel stat-card">
            <div className="stat-icon" style={{ background: ratingBg, color: ratingColor }}>
              <Star size={24} />
            </div>
            <div className="stat-info">
              <h3 style={{ color: ratingColor }}>{stats.avg_rating} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>/ 10</span></h3>
              <p>{stats.total_reviews} Reviews</p>
            </div>
          </div>
          <div className="glass-panel stat-card">
            <div className="stat-icon"><BarChart2 size={24} /></div>
            <div className="stat-info">
              <h3>Rs. 0</h3>
              <p>Revenue This Month</p>
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3>Recent Sales</h3>
            <button className="btn btn-outline" style={{ padding: '0.5rem 1rem' }} onClick={() => navigate('/seller/orders')}>View All</button>
          </div>

          {salesLoading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading sales...</div>
          ) : sales.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No sales yet.</div>
          ) : (
          <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '1rem 0' }}>Order ID</th>
                <th style={{ padding: '1rem 0' }}>Product</th>
                <th style={{ padding: '1rem 0' }}>Customer</th>
                <th style={{ padding: '1rem 0' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((item) => (
                <tr key={item.item_id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem 0' }}>#{item.order_id}</td>
                  <td style={{ padding: '1rem 0' }}>{item.title}</td>
                  <td style={{ padding: '1rem 0' }}>{item.buyer_name}</td>
                  <td style={{ padding: '1rem 0' }}>
                    <span style={{ color: item.status === 'delivered' ? 'var(--success)' : item.status === 'shipped' ? 'var(--warning)' : 'var(--text-secondary)' }}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SellerDashboard;
