import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import SellerSidebar from '../components/SellerSidebar';
import { 
  Package, 
  Edit, 
  Trash2, 
  Plus, 
  Menu, 
  X, 
  Check, 
  Save, 
  DollarSign, 
  Layers,
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react';

const SellerProducts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editFormData, setEditFormData] = useState({
    price: '',
    stock: '',
    title: ''
  });
  const [editLoading, setEditLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

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

  useEffect(() => {
    if (!user || user.role !== 'seller') {
      navigate('/login');
      return;
    }

    fetchProducts();
  }, [user, navigate]);

  // Open Edit Modal
  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setEditFormData({
      price: product.price,
      stock: product.stock,
      title: product.title,
      image_url: product.image_url || '',
      description: product.description || ''
    });
    setEditModalOpen(true);
  };

  // Submit Edit Form
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    setEditLoading(true);
    try {
      const res = await fetch('http://localhost/SpecZone/backend/api/products.php?action=update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingProduct.id,
          seller_id: user.id,
          title: editFormData.title,
          price: parseFloat(editFormData.price),
          stock: parseInt(editFormData.stock),
          image_url: editFormData.image_url,
          description: editFormData.description
        })
      });

      const data = await res.json();
      if (res.ok) {
        showToast('✓ Product details updated successfully!');
        setEditModalOpen(false);
        setEditingProduct(null);
        fetchProducts(); // Refresh list
      } else {
        alert(data.message || 'Failed to update product.');
      }
    } catch (err) {
      console.error("Error updating product:", err);
      alert('Error updating product. Please try again.');
    } finally {
      setEditLoading(false);
    }
  };

  // Delete Product
  const handleDelete = async (productId, productTitle) => {
    if (!window.confirm(`Are you sure you want to remove "${productTitle}" from your store?`)) {
      return;
    }

    try {
      const res = await fetch('http://localhost/SpecZone/backend/api/products.php?action=delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: productId,
          seller_id: user.id
        })
      });

      if (res.ok) {
        showToast(`✓ Removed "${productTitle}" successfully.`);
        fetchProducts();
      } else {
        alert('Failed to delete product.');
      }
    } catch (err) {
      console.error("Error deleting product:", err);
      alert('Error deleting product.');
    }
  };

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
          <div>
            <h2 style={{ fontSize: '2rem', margin: 0 }}>My Products</h2>
            <p style={{ color: 'var(--text-secondary)', margin: '0.3rem 0 0 0', fontSize: '0.95rem' }}>
              Manage your store inventory, update prices, and adjust real-time stock levels.
            </p>
          </div>
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
                    <th style={{ padding: '1.2rem 1rem' }}>Price (Rs.)</th>
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
                          <img src={product.image_url || 'https://via.placeholder.com/50'} alt={product.title} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px' }} />
                          <div>
                            <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{product.title}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>SKU / ID: #{product.id}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                        {product.category_name}
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--accent-primary)', fontSize: '1.05rem' }}>
                        Rs. {parseFloat(product.price).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 'bold' }}>
                        {product.stock} units
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ 
                          padding: '0.3rem 0.65rem', 
                          borderRadius: '20px', 
                          fontSize: '0.78rem', 
                          fontWeight: 'bold',
                          textTransform: 'uppercase',
                          background: product.stock > 0 ? 'rgba(0, 255, 150, 0.15)' : 'rgba(255, 51, 102, 0.15)',
                          color: product.stock > 0 ? 'var(--success)' : 'var(--danger)',
                          border: `1px solid ${product.stock > 0 ? 'rgba(0, 255, 150, 0.3)' : 'rgba(255, 51, 102, 0.3)'}`
                        }}>
                          {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                          <button 
                            className="btn btn-outline" 
                            style={{ 
                              padding: '0.45rem 0.8rem', 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '0.35rem',
                              fontSize: '0.85rem',
                              color: 'var(--accent-primary)',
                              borderColor: 'rgba(0, 240, 255, 0.3)'
                            }} 
                            onClick={() => handleOpenEdit(product)}
                            title="Edit Price & Stock"
                          >
                            <Edit size={15} /> Edit
                          </button>
                          <button 
                            className="btn btn-outline" 
                            style={{ padding: '0.45rem', border: 'none', color: 'var(--danger)', opacity: 0.8 }} 
                            onClick={() => handleDelete(product.id, product.title)}
                            title="Delete Product"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Edit Product Modal (Fully Responsive & Vertically Scrollable) */}
      {editModalOpen && editingProduct && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1200,
            padding: '1.5rem 1rem',
            overflowY: 'auto',
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={() => setEditModalOpen(false)}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '560px',
              maxHeight: 'calc(100vh - 3rem)',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: '14px',
              border: '1px solid rgba(0, 240, 255, 0.45)',
              boxShadow: '0 0 45px rgba(0, 240, 255, 0.25)',
              background: 'linear-gradient(145deg, rgba(18, 22, 32, 0.98), rgba(12, 16, 24, 0.99))',
              position: 'relative',
              overflow: 'hidden',
              margin: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Pinned Header */}
            <div style={{ padding: '1.4rem 1.8rem 1.1rem 1.8rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(0, 240, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', flexShrink: 0 }}>
                  <Edit size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Update Product</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ID: #{editingProduct.id} • {editingProduct.category_name}</span>
                </div>
              </div>

              {/* Close button */}
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '0.4rem',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 0.2s'
                }}
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <div style={{ padding: '1.5rem 1.8rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                
                {/* Product Mini Preview */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem 1rem', background: 'rgba(0,0,0,0.4)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <img src={editFormData.image_url || editingProduct.image_url || 'https://via.placeholder.com/50'} alt={editingProduct.title} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{editFormData.title || editingProduct.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Current: Rs. {parseFloat(editingProduct.price).toLocaleString('en-IN')} | Stock: {editingProduct.stock}</div>
                  </div>
                </div>

                {/* Product Title */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.85rem' }}>Product Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                    required
                  />
                </div>

                {/* Image URL */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.85rem' }}>Product Image URL</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <div style={{ padding: '0.6rem', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', display: 'flex', alignItems: 'center' }}>
                      <ImageIcon size={18} color="var(--text-secondary)" />
                    </div>
                    <input
                      type="url"
                      className="form-control"
                      placeholder="https://example.com/image.jpg"
                      value={editFormData.image_url}
                      onChange={(e) => setEditFormData({ ...editFormData, image_url: e.target.value })}
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.85rem' }}>Product Description</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Provide product overview, warranty information, and key highlights..."
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  ></textarea>
                </div>

                {/* Price & Stock in 2 columns */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 'bold' }}>
                      Unit Price (Rs.) *
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      value={editFormData.price}
                      onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                      required
                      min="0"
                      step="0.01"
                      style={{ fontSize: '1.05rem', fontWeight: 'bold' }}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: 'bold' }}>
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      value={editFormData.stock}
                      onChange={(e) => setEditFormData({ ...editFormData, stock: e.target.value })}
                      required
                      min="0"
                      style={{ fontSize: '1.05rem', fontWeight: 'bold' }}
                    />
                  </div>
                </div>

                {/* Quick stock shortcuts */}
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Quick stock adjust:</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {[+5, +10, +25, +50].map((num) => (
                      <button
                        key={num}
                        type="button"
                        className="btn btn-outline"
                        style={{ padding: '0.25rem 0.6rem', fontSize: '0.78rem', borderRadius: '4px' }}
                        onClick={() => setEditFormData(prev => ({ ...prev, stock: Math.max(0, parseInt(prev.stock || 0) + num) }))}
                      >
                        +{num}
                      </button>
                    ))}
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.78rem', borderRadius: '4px', color: 'var(--danger)', borderColor: 'rgba(255,51,102,0.3)' }}
                      onClick={() => setEditFormData(prev => ({ ...prev, stock: 0 }))}
                    >
                      Set Out of Stock
                    </button>
                  </div>
                </div>

              </div>

              {/* Pinned Footer Actions */}
              <div style={{ padding: '1rem 1.8rem', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '1rem', justifyContent: 'flex-end', background: 'rgba(0,0,0,0.35)', flexShrink: 0 }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setEditModalOpen(false)}
                  style={{ padding: '0.65rem 1.4rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={editLoading}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.6rem' }}
                >
                  <Save size={17} />
                  {editLoading ? 'Saving...' : 'Update Product'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(10, 25, 20, 0.95)',
            border: '1px solid var(--success)',
            color: 'var(--success)',
            padding: '0.9rem 1.6rem',
            borderRadius: '10px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6), 0 0 15px rgba(0, 230, 118, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            zIndex: 1300,
            fontWeight: 'bold',
            fontSize: '0.95rem',
            animation: 'fadeIn 0.2s ease-out',
            maxWidth: '90vw',
            textAlign: 'center'
          }}
        >
          <Check size={18} /> {toastMessage}
        </div>
      )}

    </div>
  );
};

export default SellerProducts;
