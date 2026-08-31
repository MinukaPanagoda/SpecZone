import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, PlusSquare, ShoppingCart, BarChart2, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SellerSidebar = ({ open, onClose }) => {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <aside className={`dashboard-sidebar seller-dashboard-sidebar ${open ? 'open' : ''}`} style={{ height: '100vh' }}>
      <h3 style={{ marginBottom: '2rem', paddingLeft: '1rem', color: 'var(--text-secondary)' }}>Seller Panel</h3>
      <nav>
        <Link to="/seller/dashboard" className={`sidebar-link ${location.pathname === '/seller/dashboard' ? 'active' : ''}`} onClick={onClose}>
          <LayoutDashboard size={20} />
          Dashboard
        </Link>
        <Link to="/seller/products" className={`sidebar-link ${location.pathname === '/seller/products' ? 'active' : ''}`} onClick={onClose}>
          <Package size={20} />
          My Products
        </Link>
        <Link to="/seller/add-product" className={`sidebar-link ${location.pathname === '/seller/add-product' ? 'active' : ''}`} onClick={onClose}>
          <PlusSquare size={20} />
          Add Product
        </Link>
        <Link to="/seller/orders" className={`sidebar-link ${location.pathname === '/seller/orders' ? 'active' : ''}`} onClick={onClose}>
          <ShoppingCart size={20} />
          Manage Orders
        </Link>
        <Link to="/seller/analytics" className={`sidebar-link ${location.pathname === '/seller/analytics' ? 'active' : ''}`} onClick={onClose}>
          <BarChart2 size={20} />
          Sales Analytics
        </Link>
        <button onClick={() => { logout(); if (onClose) onClose(); }} className="sidebar-link" style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--danger)', marginTop: '2rem' }}>
          <LogOut size={20} />
          Logout
        </button>
      </nav>
    </aside>
  );
};

export default SellerSidebar;
