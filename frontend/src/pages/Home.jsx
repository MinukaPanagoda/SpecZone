import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cpu, Monitor, HardDrive, Zap, Star, ShieldCheck, Truck, Headphones, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Home = () => {
  const [trendingProducts, setTrendingProducts] = useState([]);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    // Fetch latest products
    fetch('http://localhost/Spec%20Zone/backend/api/products.php?action=read')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Get top 4 products
          setTrendingProducts(data.slice(0, 4));
        }
      })
      .catch(err => console.error("Error fetching trending products:", err));
  }, []);
  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg"></div>
        <div className="container" style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ padding: '4rem 2rem', maxWidth: '900px', margin: '0 auto', background: '#1a1a24', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)' }}>
            <div style={{ display: 'inline-block', padding: '0.4rem 1rem', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
              THE ULTIMATE PC BUILDER PLATFORM
            </div>
            <h1 style={{ fontSize: '4.5rem', marginBottom: '1.5rem', lineHeight: '1.1', letterSpacing: '-1px', color: 'var(--text-primary)' }}>
              Your Vision. <br/><span style={{ color: 'var(--accent-primary)' }}>Your Dream Build.</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', marginBottom: '2.5rem', padding: '0 2rem', maxWidth: '700px', margin: '0 auto 2.5rem' }}>
              SpecZone is the premium marketplace for PC enthusiasts. Discover elite components, compare performance, and assemble your masterpiece today.
            </p>
            <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
              <Link to="/shop" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 2.5rem', borderRadius: '4px' }}>
                Explore Shop <ChevronRight size={18} />
              </Link>
              <Link to="/builder" className="btn btn-outline" style={{ fontSize: '1.1rem', padding: '1rem 2.5rem', borderRadius: '4px' }}>
                PC Builder Tool
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        {/* Categories Section */}
        <h2 className="section-title">Shop by Category</h2>
        <div className="category-grid">
          <Link to="/shop?category=cpu" className="glass-panel category-card" style={{ textDecoration: 'none' }}>
            <Cpu size={48} color="var(--accent-primary)" />
            <h3 style={{ color: 'var(--text-primary)', margin: 0 }}>Processors</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>Intel & AMD CPUs</p>
          </Link>
          <Link to="/shop?category=gpu" className="glass-panel category-card" style={{ textDecoration: 'none' }}>
            <Monitor size={48} color="var(--accent-secondary)" />
            <h3 style={{ color: 'var(--text-primary)', margin: 0 }}>Graphics Cards</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>NVIDIA & Radeon GPUs</p>
          </Link>
          <Link to="/shop?category=ram" className="glass-panel category-card" style={{ textDecoration: 'none' }}>
            <Zap size={48} color="var(--warning)" />
            <h3 style={{ color: 'var(--text-primary)', margin: 0 }}>Memory</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>DDR4 & DDR5 RAM</p>
          </Link>
          <Link to="/shop?category=storage" className="glass-panel category-card" style={{ textDecoration: 'none' }}>
            <HardDrive size={48} color="var(--success)" />
            <h3 style={{ color: 'var(--text-primary)', margin: 0 }}>Storage</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>NVMe SSDs & HDDs</p>
          </Link>
        </div>

        {/* Featured Build Section */}
        <div style={{ marginTop: '4rem', marginBottom: '4rem' }}>
          <div style={{ padding: '3rem', background: '#1a1a24', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '3rem', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'inline-block', padding: '0.4rem 1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                  BUILD OF THE MONTH
                </div>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', lineHeight: '1.2' }}>The "Neon Beast" <br/>4K Gaming Rig</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.1rem' }}>
                  Dominate any game at 4K resolution with our hand-picked build of the month. Perfectly balanced for maximum performance and stunning aesthetics.
                </p>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>Rs. 450,000</span>
                  <Link to="/builder" className="btn btn-primary" style={{ padding: '0.8rem 2rem', borderRadius: '4px' }}>Customize Build</Link>
                </div>
              </div>
              
              <div style={{ background: '#121217', padding: '2rem', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)' }}>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1.5rem', margin: 0, padding: 0 }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                    <div style={{ padding: '0.8rem', color: 'var(--accent-primary)' }}><Cpu size={24} /></div>
                    <div><span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>Processor</span><strong style={{ fontSize: '1.1rem' }}>AMD Ryzen 7 7800X3D</strong></div>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                    <div style={{ padding: '0.8rem', color: 'var(--accent-primary)' }}><Monitor size={24} /></div>
                    <div><span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>Graphics Card</span><strong style={{ fontSize: '1.1rem' }}>NVIDIA GeForce RTX 4080</strong></div>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                    <div style={{ padding: '0.8rem', color: 'var(--accent-primary)' }}><Zap size={24} /></div>
                    <div><span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>Memory</span><strong style={{ fontSize: '1.1rem' }}>32GB Corsair DDR5 6000MHz</strong></div>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                    <div style={{ padding: '0.8rem', color: 'var(--accent-primary)' }}><HardDrive size={24} /></div>
                    <div><span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>Storage</span><strong style={{ fontSize: '1.1rem' }}>2TB Samsung 990 PRO NVMe</strong></div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Products */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
          <h2 className="section-title" style={{ margin: 0 }}>Trending Components</h2>
          <Link to="/shop" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
            View All <ChevronRight size={16} />
          </Link>
        </div>
        
        <div className="product-grid">
          {trendingProducts.length > 0 ? (
            trendingProducts.map(product => (
              <div key={product.id} className="product-card" onClick={() => navigate(`/product/${product.id}`)} style={{ cursor: 'pointer' }}>
                <div style={{ height: '220px', backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 'var(--border-radius-sm)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <Monitor size={64} color="var(--text-muted)" />
                  )}
                </div>
                <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.title}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  <Star size={16} color="var(--warning)" fill="var(--warning)" />
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>4.8 (Verified)</span>
                </div>
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>Rs. {parseFloat(product.price).toLocaleString('en-IN')}</span>
                  <button 
                    className="btn btn-outline" 
                    style={{ padding: '0.4rem 0.8rem', borderRadius: '4px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product);
                      alert('Added to cart!');
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--border-radius-lg)' }}>
              No products available right now.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
