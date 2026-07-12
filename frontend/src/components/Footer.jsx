import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, Mail, MessageCircle, Share2 } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <h4 className="text-gradient" style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1rem' }}>SpecZone</h4>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.8' }}>
              Your vision. Your build.<br/>
              The ultimate destination for PC hardware enthusiasts, gamers, and professionals.
            </p>
            <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)' }}>
              <a href="#" style={{ color: 'inherit', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent-primary)'} onMouseOut={(e) => e.currentTarget.style.color = 'inherit'}><Globe size={22} /></a>
              <a href="#" style={{ color: 'inherit', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent-primary)'} onMouseOut={(e) => e.currentTarget.style.color = 'inherit'}><Mail size={22} /></a>
              <a href="#" style={{ color: 'inherit', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent-primary)'} onMouseOut={(e) => e.currentTarget.style.color = 'inherit'}><MessageCircle size={22} /></a>
              <a href="#" style={{ color: 'inherit', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent-primary)'} onMouseOut={(e) => e.currentTarget.style.color = 'inherit'}><Share2 size={22} /></a>
            </div>
          </div>
          
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/shop">Shop Components</Link></li>
              <li><Link to="/builder">Custom PC Builder</Link></li>
              <li><Link to="/login">Login / Register</Link></li>
            </ul>
          </div>
          
          <div className="footer-col">
            <h4>Categories</h4>
            <ul>
              <li><Link to="/shop?category=cpu">Processors (CPU)</Link></li>
              <li><Link to="/shop?category=gpu">Graphics Cards</Link></li>
              <li><Link to="/shop?category=motherboard">Motherboards</Link></li>
              <li><Link to="/shop?category=ram">Memory (RAM)</Link></li>
            </ul>
          </div>
          
          <div className="footer-col">
            <h4>Support</h4>
            <ul>
              <li><Link to="#">Contact Us</Link></li>
              <li><Link to="#">FAQ</Link></li>
              <li><Link to="#">Shipping Info</Link></li>
              <li><Link to="#">Returns Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} SpecZone. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
