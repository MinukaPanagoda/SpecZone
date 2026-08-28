import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import SellerSidebar from '../components/SellerSidebar';
import { Package, Edit, Trash2, Plus, Menu } from 'lucide-react';

const SellerProducts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'seller') {
      navigate('/login');
      return;
    }

    const fetchProducts = async () => {
      try {
        const res = await fetch(`http://localhost/SpecZone/backend/api/products.php?action=read&seller_id=${user.id}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setProducts(data);
        }
      } catch (err) {
        console.error("Error fetching seller products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [user, navigate]);

  return (
    <div className="dashboard-layout" style={{ minHeight: '100vh' }}>
      <SellerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && <div className="seller-dashboard-overlay" onClick={() => setSidebarOpen(false)} />}
      <main className="dashboard-content seller-dashboard-content">
        <div className="seller-mobile-header">
          <button className="seller-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <Menu size={24} />
          </button>
          <span className="seller-mobile-title">My Products</span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', margin: 0 }}>My Products</h2>
          <Link to="/seller/add-product" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={20} /> Add New Product
          </Link>
        </div>
        
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>Loading products...</div>
          ) : products.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <Package size={48} style={{ opacity: 0.5, margin: '0 auto 1rem' }} />
              <h3>No Products Yet</h3>
              <p>You haven't added any products to your store.</p>
              <Link to="/seller/add-product" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
                Start Selling
              </Link>
            </div>
          ) : (
            <div style={{ overflowX: 'auto', width: '100%' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '760px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <th style={{ padding: '1.2rem 1rem' }}>Product</th>
                  <th style={{ padding: '1.2rem 1rem' }}>Category</th>
                  <th style={{ padding: '1.2rem 1rem' }}>Price</th>
                  <th style={{ padding: '1.2rem 1rem' }}>Stock</th>
                  <th style={{ padding: '1.2rem 1rem' }}>Status</th>
                  <th style={{ padding: '1.2rem 1rem', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <img src={product.image_url || 'https://via.placeholder.com/50'} alt={product.title} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                        <div>
                          <div style={{ fontWeight: 'bold' }}>{product.title}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ID: #{product.id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                      {product.category_name}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>
                      Rs. {parseFloat(product.price).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {product.stock}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        padding: '0.3rem 0.6rem', 
                        borderRadius: '20px', 
                        fontSize: '0.8rem', 
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        background: product.stock > 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: product.stock > 0 ? 'var(--success)' : 'var(--danger)'
                      }}>
                        {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                        <button className="btn btn-outline" style={{ padding: '0.4rem', border: 'none', color: 'var(--text-secondary)' }} title="Edit">
                          <Edit size={18} />
                        </button>
                        <button className="btn btn-outline" style={{ padding: '0.4rem', border: 'none', color: 'var(--danger)' }} title="Delete">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )                )}
              </tbody>
            </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SellerProducts;
