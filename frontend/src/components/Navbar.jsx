import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Heart, User, LogOut, Cpu, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { getCartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'PC Builder', path: '/builder' },
    { name: 'Compare', path: '/compare' },
  ];

  const dashboardPath =
    user?.role === 'admin'
      ? '/admin/dashboard'
      : user?.role === 'seller'
      ? '/seller/dashboard'
      : '/buyer/dashboard';

  const renderWishlist = (variant) => {
    if (user && user.role !== 'buyer') return null;
    return (
      <Link to="/wishlist" className="icon-link" aria-label="Wishlist" style={{ position: 'relative' }}>
        <Heart size={variant === 'mobile' ? 22 : 24} />
        {wishlistCount > 0 && (
          <span className="cart-badge" style={{ backgroundColor: 'var(--danger)', borderColor: 'rgba(0,0,0,0.5)' }}>
            {wishlistCount}
          </span>
        )}
      </Link>
    );
  };

  const renderCart = (variant) => {
    if (user && user.role !== 'buyer') return null;
    const count = getCartCount();
    return (
      <Link to="/cart" className="icon-link" aria-label="Cart">
        <ShoppingCart size={variant === 'mobile' ? 22 : 24} />
        {count > 0 && <span className="cart-badge">{count}</span>}
      </Link>
    );
  };

  const renderAuthBlock = (variant) => {
    if (user) {
      return (
        <div
          className="user-actions"
          style={variant === 'desktop' ? { display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '1rem' } : undefined}
        >
          <Link to={dashboardPath} className="dashboard-link">
            <User size={20} />
            <span>{user.first_name}</span>
          </Link>
          <button
            onClick={logout}
            className="btn btn-outline"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      );
    }
    return (
      <Link
        to="/login"
        className="btn btn-primary"
        style={variant === 'desktop' ? { padding: '0.5rem 1.2rem', marginLeft: '1rem' } : undefined}
      >
        Login
      </Link>
    );
  };

  return (
    <>
      <style>{`
        .navbar .icon-link {
          position: relative;
          display: inline-flex;
          align-items: center;
          color: inherit;
          transition: color var(--transition-fast);
        }
        .navbar .icon-link:hover {
          color: var(--accent-hover);
        }
        .navbar .dashboard-link {
          color: var(--accent-primary);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: bold;
          transition: color var(--transition-fast);
        }
        .navbar .dashboard-link:hover {
          color: var(--accent-hover);
        }
        .cart-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: var(--accent-primary);
          color: #fff;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: bold;
        }

        /* Hamburger toggle (mobile only) */
        .navbar .hamburger-btn {
          display: none;
          background: transparent;
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-md);
          color: var(--text-primary);
          width: 44px;
          height: 44px;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .navbar .hamburger-btn:hover {
          border-color: var(--accent-primary);
          color: var(--accent-primary);
          box-shadow: 0 0 15px rgba(0, 240, 255, 0.2);
        }

        /* Collapsible mobile menu */
        .navbar .mobile-menu {
          position: absolute;
          top: 80px;
          left: 0;
          width: 100%;
          background: rgba(10, 10, 12, 0.95);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-bottom: 1px solid var(--border-color);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          animation: mobileMenuFade var(--transition-normal);
        }
        @keyframes mobileMenuFade {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .navbar .mobile-nav-links {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .navbar .mobile-nav-links a {
          display: block;
          color: var(--text-secondary);
          font-weight: 600;
          padding: 0.75rem 1rem;
          border-radius: var(--border-radius-md);
          transition: all var(--transition-fast);
        }
        .navbar .mobile-nav-links a:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.08);
        }
        .navbar .mobile-nav-links a.active {
          color: #000;
          background: linear-gradient(135deg, var(--accent-primary), #00ffcc);
          box-shadow: 0 0 20px rgba(0, 240, 255, 0.3);
        }
        .navbar .mobile-nav-actions {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 0.5rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-color);
        }
        .navbar .mobile-nav-actions .user-actions {
          flex-direction: column;
          align-items: stretch;
          gap: 0.75rem;
          width: 100%;
          margin-left: 0;
        }
        .navbar .mobile-nav-actions .btn {
          width: 100%;
          justify-content: center;
        }
        .navbar .mobile-nav-actions .icon-link {
          align-self: flex-start;
        }

        /* Tablet: compact but still inline, not a hamburger */
        @media (max-width: 1024px) {
          .nav-brand {
            font-size: 1.4rem;
          }
          .nav-links {
            gap: 0.25rem;
            padding: 0.3rem;
          }
          .nav-links a {
            padding: 0.5rem 1rem;
            font-size: 0.85rem;
          }
          .nav-actions {
            gap: 0.5rem;
          }
        }

        /* Mobile: hamburger + collapsible menu */
        @media (max-width: 768px) {
          .nav-links,
          .nav-actions {
            display: none;
          }
          .navbar .hamburger-btn {
            display: inline-flex;
          }
        }

        /* Prevent the mobile menu from showing if resized to desktop while open */
        @media (min-width: 769px) {
          .navbar .mobile-menu {
            display: none !important;
          }
        }
      `}</style>

      <nav className="navbar">
        <div className="container">
          {/* Brand */}
          <Link to="/" className="nav-brand text-gradient" onClick={() => setMobileOpen(false)}>
            <Cpu size={28} color="var(--accent-primary)" />
            <span>SpecZone</span>
          </Link>

          {/* Desktop links */}
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

          {/* Desktop actions */}
          <div className="nav-actions">
            <div className="nav-icons" style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
              {renderWishlist('desktop')}
              {renderCart('desktop')}
              {renderAuthBlock('desktop')}
            </div>
          </div>

          {/* Mobile hamburger */}
          <button
            className="hamburger-btn"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Collapsible mobile menu */}
        {mobileOpen && (
          <div className="mobile-menu">
            <ul className="mobile-nav-links">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className={location.pathname === link.path ? 'active' : ''}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mobile-nav-actions">
              <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
                {renderWishlist('mobile')}
                {renderCart('mobile')}
              </div>
              {renderAuthBlock('mobile')}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
