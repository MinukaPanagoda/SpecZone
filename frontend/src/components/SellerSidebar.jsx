import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, PlusSquare, ShoppingCart, BarChart2, User, LogOut, Store, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SellerSidebar = ({ open, isOpen, onClose }) => {
  const location = useLocation();
  const { logout } = useAuth();
  const isVisible = open || isOpen;

  return (
    <aside className={`dashboard-sidebar seller-dashboard-sidebar ${isVisible ? 'open' : ''}`} style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '1.5rem', paddingLeft: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>Seller Panel</h3>
        <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>Vendor Console</span>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <Link to="/seller/dashboard" className={`sidebar-link ${location.pathname === '/seller/dashboard' ? 'active' : ''}`} onClick={onClose}>
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </Link>
        <Link to="/seller/products" className={`sidebar-link ${location.pathname === '/seller/products' ? 'active' : ''}`} onClick={onClose}>
          <Package size={18} />
          <span>My Products</span>
        </Link>
        <Link to="/seller/add-product" className={`sidebar-link ${location.pathname === '/seller/add-product' ? 'active' : ''}`} onClick={onClose}>
          <PlusSquare size={18} />
          <span>Add Product</span>
        </Link>
        <Link to="/seller/orders" className={`sidebar-link ${location.pathname === '/seller/orders' ? 'active' : ''}`} onClick={onClose}>
          <ShoppingCart size={18} />
          <span>Manage Orders</span>
        </Link>
        <Link to="/seller/analytics" className={`sidebar-link ${location.pathname === '/seller/analytics' ? 'active' : ''}`} onClick={onClose}>
          <BarChart2 size={18} />
          <span>Sales Analytics</span>
        </Link>
        <Link to="/seller/profile" className={`sidebar-link ${location.pathname === '/seller/profile' ? 'active' : ''}`} onClick={onClose}>
          <User size={18} />
          <span>Store & Profile</span>
        </Link>
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <Link
          to="/shop"
          className="sidebar-link"
          onClick={onClose}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: 'var(--accent-primary)',
            background: 'rgba(0, 240, 255, 0.08)',
            border: '1px solid rgba(0, 240, 255, 0.25)',
            fontWeight: '600',
            textDecoration: 'none',
            borderRadius: 'var(--border-radius-sm)',
            padding: '0.75rem 1rem',
            marginBottom: 0
          }}
        >
          <Store size={18} />
          <span>View Store</span>
          <ArrowUpRight size={15} style={{ marginLeft: 'auto', opacity: 0.8 }} />
        </Link>

        <button 
          onClick={() => { logout(); if (onClose) onClose(); }} 
          className="sidebar-link" 
          style={{ 
            width: '100%', 
            background: 'transparent', 
            border: 'none', 
            cursor: 'pointer', 
            textAlign: 'left', 
            color: 'var(--danger)', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem', 
            padding: '0.75rem 1rem',
            marginBottom: 0 
          }}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default SellerSidebar;
