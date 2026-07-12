import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Heart, Wrench, Settings } from 'lucide-react';

const BuyerDashboard = () => {
  const location = useLocation();

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <h3 style={{ marginBottom: '2rem', paddingLeft: '1rem', color: 'var(--text-secondary)' }}>Buyer Panel</h3>
        <nav>
          <Link to="/buyer/dashboard" className={`sidebar-link ${location.pathname === '/buyer/dashboard' ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            Overview
          </Link>
          <Link to="/buyer/orders" className={`sidebar-link ${location.pathname === '/buyer/orders' ? 'active' : ''}`}>
            <ShoppingBag size={20} />
            My Orders
          </Link>
          <Link to="/buyer/wishlist" className={`sidebar-link ${location.pathname === '/buyer/wishlist' ? 'active' : ''}`}>
            <Heart size={20} />
            Wishlist
          </Link>
          <Link to="/buyer/builds" className={`sidebar-link ${location.pathname === '/buyer/builds' ? 'active' : ''}`}>
            <Wrench size={20} />
            My PC Builds
          </Link>
          <Link to="/buyer/settings" className={`sidebar-link ${location.pathname === '/buyer/settings' ? 'active' : ''}`}>
            <Settings size={20} />
            Account Settings
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="dashboard-content">
        <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Welcome back, Buyer!</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          <div className="glass-panel stat-card">
            <div className="stat-icon"><ShoppingBag size={24} /></div>
            <div className="stat-info">
              <h3>3</h3>
              <p>Active Orders</p>
            </div>
          </div>
          <div className="glass-panel stat-card">
            <div className="stat-icon"><Wrench size={24} /></div>
            <div className="stat-info">
              <h3>2</h3>
              <p>Saved PC Builds</p>
            </div>
          </div>
          <div className="glass-panel stat-card">
            <div className="stat-icon"><Heart size={24} /></div>
            <div className="stat-info">
              <h3>12</h3>
              <p>Wishlist Items</p>
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Recent Orders</h3>
          <p style={{ color: 'var(--text-secondary)' }}>You don't have any recent orders.</p>
        </div>
      </main>
    </div>
  );
};

export default BuyerDashboard;
