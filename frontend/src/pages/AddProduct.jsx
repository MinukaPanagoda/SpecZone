import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Save, Image as ImageIcon, Menu, ChevronDown, Plus, Trash2, Zap, Gamepad2, Sparkles, Cpu } from 'lucide-react';
import SellerSidebar from '../components/SellerSidebar';
import { getCategoryFields } from '../utils/categorySpecs';

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
    image_url: ''
  });

  // Dynamic specs object keyed by standard field key (e.g., { Cores: '6 Cores', Socket: 'LGA1700', 'Power Usage (TDP)': '65W' })
  const [categorySpecs, setCategorySpecs] = useState({});
  // Optional extra custom specs
  const [extraSpecs, setExtraSpecs] = useState([]);

  useEffect(() => {
    if (!user || user.role !== 'seller') {
      navigate('/login');
    }

    fetch('http://localhost/SpecZone/backend/api/categories.php')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCategories(data);
          if (data.length > 0) {
            setFormData(prev => ({ ...prev, category_id: data[0].id }));
            // Initialize specs for first category
            initCategorySpecs(data[0].name);
          }
        }
      })
      .catch(err => console.error("Error fetching categories:", err));
  }, [user, navigate]);

  const initCategorySpecs = (catName) => {
    const fields = getCategoryFields(catName);
    const initial = {};
    fields.forEach(f => {
      initial[f.key] = '';
    });
    setCategorySpecs(initial);
    setExtraSpecs([]);
  };

  const handleCategorySelect = (cat) => {
    setFormData(prev => ({ ...prev, category_id: cat.id }));
    setCategoryDropdownOpen(false);
    initCategorySpecs(cat.name);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCategorySpecChange = (key, val) => {
    setCategorySpecs(prev => ({
      ...prev,
      [key]: val
    }));
  };

  const addExtraSpec = () => {
    setExtraSpecs(prev => [...prev, { key: '', value: '' }]);
  };

  const removeExtraSpec = (index) => {
    setExtraSpecs(prev => prev.filter((_, i) => i !== index));
  };

  const handleExtraSpecChange = (index, field, val) => {
    setExtraSpecs(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
  };

  const currentCategoryName = categories.find(cat => String(cat.id) === String(formData.category_id))?.name || '';
  const currentCategoryFields = getCategoryFields(currentCategoryName);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: 'info', message: 'Adding product...' });

    // Build specs object from non-empty category specs and extra specs
    const specsObject = {};
    Object.entries(categorySpecs).forEach(([k, v]) => {
      if (typeof v === 'string' && v.trim()) {
        specsObject[k] = v.trim();
      }
    });

    extraSpecs.forEach(item => {
      if (item.key.trim() && item.value.trim()) {
        specsObject[item.key.trim()] = item.value.trim();
      }
    });

    try {
      const response = await fetch('http://localhost/SpecZone/backend/api/products.php?action=create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          specs: JSON.stringify(specsObject),
          seller_id: user.id
        })
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: '✓ Product and category specifications added successfully!' });
        setFormData({
          name: '',
          description: '',
          price: '',
          stock: '',
          category_id: categories.length > 0 ? categories[0].id : '',
          image_url: ''
        });
        if (categories.length > 0) {
          initCategorySpecs(categories[0].name);
        }
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

        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ margin: 0, fontSize: '2rem' }}>Add Product</h2>
            <p style={{ color: 'var(--text-secondary)', margin: '0.3rem 0 0 0', fontSize: '0.95rem' }}>
              Fill in product details and category-specific hardware specifications for buyer comparison.
            </p>
          </div>
        
          {status.message && (
            <div className={`alert ${status.type === 'error' ? 'alert-error' : status.type === 'success' ? 'alert-success' : 'alert-info'}`} style={{ padding: '1rem', marginBottom: '1.5rem', borderRadius: '8px', background: status.type === 'error' ? 'rgba(255,50,50,0.1)' : 'rgba(50,255,50,0.1)', color: status.type === 'error' ? '#ff6b6b' : '#51cf66' }}>
              {status.message}
            </div>
          )}

          <div className="glass-panel" style={{ padding: '2rem' }}>
            <form onSubmit={handleSubmit}>
              
              {/* Product Name */}
              <div className="form-group">
                <label className="form-label">Product Name / Model *</label>
                <input 
                  type="text" 
                  name="name" 
                  className="form-control" 
                  value={formData.name} 
                  onChange={handleChange} 
                  placeholder="e.g. Intel Core i5-12400F Processor / NVIDIA RTX 4070 / Corsair Vengeance 32GB" 
                  required 
                />
              </div>

              {/* Price & Stock */}
              <div className="seller-two-col">
                <div className="form-group">
                  <label className="form-label">Price (Rs.) *</label>
                  <input type="number" name="price" className="form-control" value={formData.price} onChange={handleChange} required min="0" step="0.01" placeholder="e.g. 45000" />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock Quantity *</label>
                  <input type="number" name="stock" className="form-control" value={formData.stock} onChange={handleChange} required min="0" placeholder="e.g. 10" />
                </div>
              </div>

              {/* Category Dropdown */}
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
                      position: 'relative'
                    }}
                  >
                    {currentCategoryName || 'Select Category'}
                    <ChevronDown
                      size={18}
                      style={{
                        position: 'absolute',
                        right: '1rem',
                        top: '50%',
                        transform: `translateY(-50%) rotate(${categoryDropdownOpen ? 180 : 0}deg)`,
                        color: 'var(--text-secondary)',
                        pointerEvents: 'none'
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
                        zIndex: 1000,
                        maxHeight: '220px',
                        overflowY: 'auto'
                      }}
                    >
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => handleCategorySelect(cat)}
                          style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            background: String(cat.id) === String(formData.category_id) ? 'rgba(0, 240, 255, 0.1)' : 'transparent',
                            color: String(cat.id) === String(formData.category_id) ? 'var(--accent-primary)' : 'var(--text-primary)',
                            border: 'none',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontSize: '0.95rem'
                          }}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Dynamic Category Technical Specifications */}
              <div style={{ marginTop: '1.8rem', marginBottom: '1.8rem', padding: '1.5rem', background: 'rgba(0, 0, 0, 0.35)', borderRadius: '10px', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Sparkles size={18} /> {currentCategoryName ? `${currentCategoryName} Specifications` : 'Technical Specifications'}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: '0.2rem 0 0 0' }}>
                      Fill in relevant hardware specs below. These specs power the <strong>Buyer Comparison Tool</strong> automatically.
                    </p>
                  </div>
                </div>

                {/* Category-Specific Form Fields Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                  {currentCategoryFields.map((field) => {
                    const isPower = field.isPower;
                    const isFps = field.isFps;
                    const labelColor = isPower ? '#ffb703' : isFps ? 'var(--accent-primary)' : 'var(--text-secondary)';

                    return (
                      <div key={field.key} className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.85rem', color: labelColor, fontWeight: isPower || isFps ? 'bold' : 'normal', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          {isPower && <Zap size={14} />}
                          {isFps && <Gamepad2 size={14} />}
                          {field.label}
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder={field.placeholder}
                          value={categorySpecs[field.key] || ''}
                          onChange={(e) => handleCategorySpecChange(field.key, e.target.value)}
                          style={{
                            fontSize: '0.9rem',
                            borderColor: isPower ? 'rgba(255, 180, 0, 0.3)' : isFps ? 'rgba(0, 240, 255, 0.3)' : 'var(--border-color)'
                          }}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Extra custom specs */}
                {extraSpecs.length > 0 && (
                  <div style={{ marginTop: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Additional Custom Specs:</div>
                    {extraSpecs.map((item, idx) => (
                      <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr auto', gap: '0.6rem', alignItems: 'center' }}>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Feature Name (e.g. Warranty)"
                          value={item.key}
                          onChange={(e) => handleExtraSpecChange(idx, 'key', e.target.value)}
                          style={{ fontSize: '0.85rem' }}
                        />
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Value (e.g. 3 Years)"
                          value={item.value}
                          onChange={(e) => handleExtraSpecChange(idx, 'value', e.target.value)}
                          style={{ fontSize: '0.85rem' }}
                        />
                        <button
                          type="button"
                          onClick={() => removeExtraSpec(idx)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.3rem' }}
                          title="Remove custom spec"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={addExtraSpec}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.82rem', cursor: 'pointer', marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: 0 }}
                >
                  <Plus size={14} /> + Add Additional Custom Spec
                </button>
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea name="description" className="form-control" value={formData.description} onChange={handleChange} rows="3" placeholder="Provide product overview and key highlights..."></textarea>
              </div>

              {/* Image URL */}
              <div className="form-group">
                <label className="form-label">Image URL</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <div style={{ padding: '0.7rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
                    <ImageIcon size={18} color="var(--text-secondary)" />
                  </div>
                  <input type="url" name="image_url" className="form-control" value={formData.image_url} onChange={handleChange} placeholder="https://example.com/image.jpg" />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.8rem', fontSize: '1rem', cursor: 'pointer', marginTop: '1.5rem' }}>
                <Save size={18} />
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
