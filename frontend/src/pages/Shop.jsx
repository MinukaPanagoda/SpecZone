import React, { useState, useEffect } from 'react';
import { Filter, Star, Search, Image as ImageIcon } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Shop = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch products
    fetch('http://localhost/Spec%20Zone/backend/api/products.php?action=read')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProducts(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching products:", err);
        setLoading(false);
      });

    // Fetch categories
    fetch('http://localhost/Spec%20Zone/backend/api/categories.php')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCategories(data);
        }
      })
      .catch(err => console.error("Error fetching categories:", err));
  }, []);
  return (
    <div className="container">
      <div className="shop-layout">
        {/* Sidebar Filters */}
        <aside className="shop-sidebar glass-panel" style={{ padding: '2rem', height: 'fit-content' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
            <Filter size={20} />
            <h3 style={{ margin: 0 }}>Filters</h3>
          </div>

          <div className="filter-group">
            <h4>Categories</h4>
            {categories.map(cat => (
              <label key={cat.id} className="filter-label">
                <input type="checkbox" value={cat.id} /> {cat.name}
              </label>
            ))}
          </div>

          <div className="filter-group">
            <h4>Price Range</h4>
            <label className="filter-label"><input type="radio" name="price" /> Under Rs. 50,000</label>
            <label className="filter-label"><input type="radio" name="price" /> Rs. 50,000 - 100,000</label>
            <label className="filter-label"><input type="radio" name="price" /> Rs. 100,000 - 200,000</label>
            <label className="filter-label"><input type="radio" name="price" /> Over Rs. 200,000</label>
          </div>
          
          <button className="btn btn-primary" style={{ width: '100%' }}>Apply Filters</button>
        </aside>

        {/* Main Content */}
        <main className="shop-main">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ margin: 0 }}>All Components</h2>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input type="text" placeholder="Search..." className="form-control" style={{ paddingLeft: '2.5rem', width: '250px' }} />
              </div>
              <select className="form-control" style={{ width: 'auto' }}>
                <option>Sort by: Popularity</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest Arrivals</option>
              </select>
            </div>
          </div>

          <div className="product-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
            {loading ? (
              <p>Loading products...</p>
            ) : products.length === 0 ? (
              <p>No products available yet.</p>
            ) : (
              products.map((product) => (
                <div className="product-card" key={product.id}>
                  <Link to={`/product/${product.id}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ position: 'relative', height: '200px', backgroundColor: 'rgba(0,0,0,0.3)', borderTopLeftRadius: '10px', borderTopRightRadius: '10px', overflow: 'hidden' }}>
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }} />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                          <ImageIcon size={48} color="var(--text-secondary)" />
                        </div>
                      )}
                      {product.stock <= 0 && (
                        <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--danger)', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                          Out of Stock
                        </div>
                      )}
                    </div>
                  </Link>
                  
                  <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                      {product.category_name}
                    </div>
                    
                    <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', lineHeight: '1.3' }}>{product.name}</h3>
                    </Link>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '1rem' }}>
                    <Star size={16} color="var(--warning)" fill="var(--warning)" />
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>--</span>
                  </div>
                  
                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>Rs. {parseFloat(product.price).toLocaleString('en-IN')}</span>
                    {(!user || user.role === 'buyer') && (
                      <button 
                        className="btn btn-outline" 
                        style={{ padding: '0.4rem 0.8rem' }}
                        onClick={() => {
                          if(!user) alert("Please login first to add to cart!");
                          else addToCart(product.id, 1);
                        }}
                      >
                        Cart
                      </button>
                    )}
                  </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Shop;
