import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cpu, Monitor, HardDrive, Zap, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Home = () => {
  const [trendingProducts, setTrendingProducts] = useState([]);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchTrendingProducts = async () => {
      try {
        const res = await fetch('http://localhost/SpecZone/backend/api/products.php?action=read');
        const data = await res.json();
        if (Array.isArray(data)) {
          setTrendingProducts(data.slice(0, 4));
        }
      } catch (err) {
        console.error('Error fetching trending products:', err);
      }
    };
    fetchTrendingProducts();
  }, []);

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    addToCart(product.id);
  };

  const handleCardClick = (product) => {
    navigate(`/product/${product.id}`);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section" style={{ padding: '20px 0 40px 0' }}>
        <div className="hero-bg"></div>
        <div className="container">
          <div className="glass-panel" style={{ padding: '2rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '4rem', marginBottom: '1rem', lineHeight: '1.1' }}>
              Your Vision. <br/><span className="text-gradient">Your Build.</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: '2rem', padding: '0 2rem' }}>
              SpecZone is the ultimate marketplace for PC enthusiasts. Discover premium components, compare benchmarks, and build your dream rig today.
            </p>
            <div className="hero-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Link to="/shop" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>Shop Now</Link>
              <Link to="/builder" className="btn btn-outline" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>PC Builder</Link>
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

        {/* Featured Products */}
        <h2 className="section-title">Trending Components</h2>
        <div className="product-grid">
          {trendingProducts.length > 0 ? (
            trendingProducts.map((product) => (
              <div
                key={product.id}
                className="product-card"
                onClick={() => handleCardClick(product)}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ height: '200px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 'var(--border-radius-sm)', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.title}
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 'var(--border-radius-sm)' }}
                    />
                  ) : (
                    <Monitor size={64} color="var(--text-muted)" />
                  )}
                </div>
                <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{product.title}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <Star size={16} color="var(--warning)" fill="var(--warning)" />
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>4.5 (0 Reviews)</span>
                </div>
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                    Rs. {parseFloat(product.price).toLocaleString('en-IN')}
                  </span>
                  <button
                    className="btn btn-outline"
                    style={{ padding: '0.4rem 0.8rem' }}
                    onClick={(e) => handleAddToCart(e, product)}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              No products available right now.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
