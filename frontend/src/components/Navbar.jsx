import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Cpu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { getCartCount } = useCart();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'PC Builder', path: '/builder' },
  ];

  return (
    <nav className="navbar">
      <div className="container">
        {/* Brand */}
        <Link to="/" className="nav-brand text-gradient">
          <Cpu size={28} color="var(--accent-primary)" />
          <span>SpecZone</span>
        </Link>

        {/* Links */}
        <ul className="nav-links">
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link 
                to={link.path} 
                className={location.pathname === link.path ? 'active' : ''}
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="nav-actions">
          <div className="nav-icons" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {(!user || user.role === 'buyer') && (
              <Link to="/cart" className="icon-link" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <ShoppingCart size={24} />
                {getCartCount() > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    background: 'var(--accent-primary)',
                    color: 'white',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                  }}>
                    {getCartCount()}
                  </span>
                )}
              </Link>
            )}
            
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '1rem' }}>
                <Link to={user.role === 'admin' ? '/admin/dashboard' : user.role === 'seller' ? '/seller/dashboard' : '/buyer/dashboard'} style={{ color: 'var(--accent-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                  <User size={20} />
                  <span>{user.first_name}</span>
                </Link>
                <button onClick={logout} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <LogOut size={16} /> Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary" style={{ padding: '0.5rem 1.2rem', marginLeft: '1rem' }}>
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
