import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Save, Image as ImageIcon, Menu, ChevronDown } from 'lucide-react';
import SellerSidebar from '../components/SellerSidebar';

const AddProduct = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
    image_url: '',
    specs: '{}'
  });

  useEffect(() => {
    // Redirect if not seller
    if (!user || user.role !== 'seller') {
      navigate('/login');
    }

    // Fetch categories
    fetch('http://localhost/SpecZone/backend/api/categories.php')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCategories(data);
          if (data.length > 0) {
            setFormData(prev => ({ ...prev, category_id: data[0].id }));
          }
        }
      })
      .catch(err => console.error("Error fetching categories:", err));
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: 'info', message: 'Adding product...' });

    try {
      const response = await fetch('http://localhost/SpecZone/backend/api/products.php?action=create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          seller_id: user.id
        })
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: 'Product added successfully!' });
        setFormData({
          name: '',
          description: '',
          price: '',
          stock: '',
          category_id: categories.length > 0 ? categories[0].id : '',
          image_url: '',
          specs: '{}'
        });
      } else {
        setStatus({ type: 'error', message: data.message || 'Failed to add product.' });
      }
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', message: 'An error occurred. Please try again.' });
    }
  };

  return (
    <div className="dashboard-layout" style={{ minHeight: '100vh' }}>
      <SellerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && <div className="seller-dashboard-overlay" onClick={() => setSidebarOpen(false)} />}
      <div className="dashboard-content seller-dashboard-content">
        <div className="seller-mobile-header">
          <button className="seller-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <Menu size={24} />
          </button>
          <span className="seller-mobile-title">Add Product</span>
        </div>

        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ marginBottom: '2rem' }}>Add New Product</h2>
        
        {status.message && (
          <div className={`alert ${status.type === 'error' ? 'alert-error' : status.type === 'success' ? 'alert-success' : 'alert-info'}`} style={{ padding: '1rem', marginBottom: '1.5rem', borderRadius: '8px', background: status.type === 'error' ? 'rgba(255,50,50,0.1)' : 'rgba(50,255,50,0.1)', color: status.type === 'error' ? '#ff6b6b' : '#51cf66' }}>
            {status.message}
          </div>
        )}

        <div className="glass-panel" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="seller-two-col">
              <div className="form-group">
                <label className="form-label">Price (Rs.) *</label>
                <input type="number" name="price" className="form-control" value={formData.price} onChange={handleChange} required min="0" step="0.01" />
              </div>
              <div className="form-group">
                <label className="form-label">Stock Quantity *</label>
                <input type="number" name="stock" className="form-control" value={formData.stock} onChange={handleChange} required min="0" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Category *</label>
            
              <div style={{ position: 'relative', width: '100%', zIndex: categoryDropdownOpen ? 100 : 1 }}>
                <button
                  type="button"
                  className="form-control"
                  aria-haspopup="listbox"
                  aria-expanded={categoryDropdownOpen}
                  onClick={() => setCategoryDropdownOpen(prev => !prev)}
                  style={{
                    minHeight: '42px',
                    padding: '0.75rem 2.75rem 0.75rem 1rem',
                    background: 'var(--bg-secondary)',
                    color: formData.category_id ? 'var(--text-primary)' : 'var(--text-secondary)',
                    border: `1px solid ${categoryDropdownOpen ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                    borderRadius: 'var(--border-radius-sm)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    position: 'relative',
                    transition: 'all var(--transition-fast)',
                    boxShadow: categoryDropdownOpen ? '0 0 10px rgba(0, 240, 255, 0.1)' : 'none'
                  }}
                >
                  {categories.find(cat => String(cat.id) === String(formData.category_id))?.name || 'Select Category'}
            
                  <ChevronDown
                    size={18}
                    style={{
                      position: 'absolute',
                      right: '1rem',
                      top: '50%',
                      transform: `translateY(-50%) rotate(${categoryDropdownOpen ? 180 : 0}deg)`,
                      color: 'var(--text-secondary)',
                      pointerEvents: 'none',
                      transition: 'transform var(--transition-fast)'
                    }}
                  />
                </button>
            
                {categoryDropdownOpen && (
                  <div
                    role="listbox"
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 0.4rem)',
                      left: 0,
                      right: 0,
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--border-radius-md)',
                      boxShadow: '0 12px 30px rgba(0, 0, 0, 0.45)',
                      overflow: 'hidden',
                      zIndex: 1000,
                      maxHeight: '240px',
                      overflowY: 'auto'
                    }}
                  >
                    {categories.map((cat, index) => {
                      const isSelected = String(cat.id) === String(formData.category_id);
            
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              category_id: cat.id
                            }));
                            setCategoryDropdownOpen(false);
                          }}
                          style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            background: isSelected
                              ? 'rgba(0, 240, 255, 0.1)'
                              : 'transparent',
                            color: isSelected
                              ? 'var(--accent-primary)'
                              : 'var(--text-primary)',
                            border: 'none',
                            borderBottom: index < categories.length - 1
                              ? '1px solid rgba(255, 255, 255, 0.05)'
                              : 'none',
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontFamily: 'inherit',
                            fontSize: '1rem',
                            transition: 'background var(--transition-fast), color var(--transition-fast)'
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.background = 'rgba(0, 240, 255, 0.08)';
                              e.currentTarget.style.color = 'var(--accent-primary)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = 'var(--text-primary)';
                            }
                          }}
                        >
                          {cat.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea name="description" className="form-control" value={formData.description} onChange={handleChange} rows="4"></textarea>
            </div>

            <div className="form-group">
              <label className="form-label">Image URL</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
                  <ImageIcon size={20} color="var(--text-secondary)" />
                </div>
                <input type="url" name="image_url" className="form-control" value={formData.image_url} onChange={handleChange} placeholder="https://example.com/image.jpg" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Specifications (JSON format)</label>
              <textarea name="specs" className="form-control" value={formData.specs} onChange={handleChange} rows="3" placeholder='{"Brand": "Intel", "Socket": "LGA1700", "Cores": "12"}' style={{ fontFamily: 'monospace' }}></textarea>
              <small style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', display: 'block' }}>Optional: Provide technical specs as a valid JSON object.</small>
            </div>

            <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
              <Save size={20} />
              Save Product
            </button>
          </form>
        </div>
      </div>
      </div>
    </div>
  );
};

export default AddProduct;
