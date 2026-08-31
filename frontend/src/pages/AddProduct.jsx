import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Save, Image as ImageIcon, Menu, ChevronDown, Plus, Trash2, Zap, Gamepad2, Sparkles } from 'lucide-react';
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
    image_url: ''
  });

  // Direct, simple performance & spec fields
  const [powerUsage, setPowerUsage] = useState('');
  const [gamingFps, setGamingFps] = useState('');
  const [brand, setBrand] = useState('');
  const [mainSpec, setMainSpec] = useState('');
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
          }
        }
      })
      .catch(err => console.error("Error fetching categories:", err));
  }, [user, navigate]);

  const handleCategorySelect = (cat) => {
    setFormData(prev => ({ ...prev, category_id: cat.id }));
    setCategoryDropdownOpen(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: 'info', message: 'Adding product...' });

    // Build simple specs object
    const specsObject = {};
    if (powerUsage.trim()) {
      specsObject['Power Usage (TDP)'] = powerUsage.trim();
    }
    if (gamingFps.trim()) {
      specsObject['Estimated Gaming FPS'] = gamingFps.trim();
    }
    if (brand.trim()) {
      specsObject['Brand'] = brand.trim();
    }
    if (mainSpec.trim()) {
      specsObject['Specification'] = mainSpec.trim();
    }
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
        setStatus({ type: 'success', message: '✓ Product added successfully!' });
        setFormData({
          name: '',
          description: '',
          price: '',
          stock: '',
          category_id: categories.length > 0 ? categories[0].id : '',
          image_url: ''
        });
        setPowerUsage('');
        setGamingFps('');
        setBrand('');
        setMainSpec('');
        setExtraSpecs([]);
      } else {
        setStatus({ type: 'error', message: data.message || 'Failed to add product.' });
      }
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', message: 'An error occurred. Please try again.' });
    }
  };

  const currentCategoryName = categories.find(cat => String(cat.id) === String(formData.category_id))?.name || '';

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
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ margin: 0, fontSize: '2rem' }}>Add Product</h2>
            <p style={{ color: 'var(--text-secondary)', margin: '0.3rem 0 0 0', fontSize: '0.95rem' }}>
              Fill in product information and comparison specs below.
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
                  placeholder="e.g. NVIDIA GeForce RTX 4070 / Intel Core i5-13400F" 
                  required 
                />
              </div>

              {/* Price & Stock */}
              <div className="seller-two-col">
                <div className="form-group">
                  <label className="form-label">Price (Rs.) *</label>
                  <input type="number" name="price" className="form-control" value={formData.price} onChange={handleChange} required min="0" step="0.01" placeholder="e.g. 185000" />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock Quantity *</label>
                  <input type="number" name="stock" className="form-control" value={formData.stock} onChange={handleChange} required min="0" placeholder="e.g. 5" />
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

              {/* Simple Comparison & Performance Specs (Easy Inputs) */}
              <div style={{ marginTop: '1.8rem', marginBottom: '1.8rem', padding: '1.4rem', background: 'rgba(0, 0, 0, 0.3)', borderRadius: '10px', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={17} /> Comparison Specs (Power & Gaming Performance)
                </h3>

                <div className="seller-two-col">
                  {/* Power Usage Field */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.85rem', color: '#ffb703', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Zap size={15} /> Power Usage / TDP (Optional)
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 170W or 65W"
                      value={powerUsage}
                      onChange={(e) => setPowerUsage(e.target.value)}
                    />
                  </div>

                  {/* Gaming FPS Field */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Gamepad2 size={15} /> Estimated Gaming FPS (Optional)
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 95 FPS or 140 FPS"
                      value={gamingFps}
                      onChange={(e) => setGamingFps(e.target.value)}
                    />
                  </div>
                </div>

                <div className="seller-two-col" style={{ marginTop: '1rem' }}>
                  {/* Brand Field */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>
                      Brand / Manufacturer (Optional)
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. NVIDIA / Intel / Corsair"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                    />
                  </div>

                  {/* Main Spec Field */}
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>
                      Key Spec / Memory (Optional)
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 12GB GDDR6 / LGA1700 / 1TB NVMe"
                      value={mainSpec}
                      onChange={(e) => setMainSpec(e.target.value)}
                    />
                  </div>
                </div>

                {/* Extra custom specs */}
                {extraSpecs.length > 0 && (
                  <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {extraSpecs.map((item, idx) => (
                      <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr auto', gap: '0.6rem', alignItems: 'center' }}>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Feature (e.g. Interface)"
                          value={item.key}
                          onChange={(e) => handleExtraSpecChange(idx, 'key', e.target.value)}
                          style={{ fontSize: '0.85rem' }}
                        />
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Value (e.g. PCIe 4.0)"
                          value={item.value}
                          onChange={(e) => handleExtraSpecChange(idx, 'value', e.target.value)}
                          style={{ fontSize: '0.85rem' }}
                        />
                        <button
                          type="button"
                          onClick={() => removeExtraSpec(idx)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.3rem' }}
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
                  style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.82rem', cursor: 'pointer', marginTop: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: 0 }}
                >
                  <Plus size={14} /> + Add Another Spec
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

