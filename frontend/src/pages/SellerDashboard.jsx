import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Package, ShoppingCart, BarChart2, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SellerSidebar from '../components/SellerSidebar';

const SellerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ avg_rating: 0, total_reviews: 0, active_listings: 0 });

  useEffect(() => {
    if (!user || user.role !== 'seller') {
      navigate('/login');
      return;
    }

    fetch(`http://localhost/Spec%20Zone/backend/api/seller_stats.php?seller_id=${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data && !data.message) {
          setStats(data);
        }
      })
      .catch(err => console.error(err));
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
      <SellerSidebar />

      {/* Main Content */}
      <main className="dashboard-content">
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
            <button className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>View All</button>
          </div>
          
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
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem 0' }}>#ORD-001</td>
                <td style={{ padding: '1rem 0' }}>RTX 3060 Ti</td>
                <td style={{ padding: '1rem 0' }}>Lahiru</td>
                <td style={{ padding: '1rem 0' }}><span style={{ color: 'var(--warning)' }}>Pending</span></td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem 0' }}>#ORD-002</td>
                <td style={{ padding: '1rem 0' }}>Ryzen 5 5600X</td>
                <td style={{ padding: '1rem 0' }}>Kasun</td>
                <td style={{ padding: '1rem 0' }}><span style={{ color: 'var(--success)' }}>Shipped</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default SellerDashboard;
