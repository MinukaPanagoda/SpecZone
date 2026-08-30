import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Save, Image as ImageIcon, Menu, ChevronDown, Plus, Trash2, Sparkles, Layers } from 'lucide-react';
import SellerSidebar from '../components/SellerSidebar';

// Standard Hardware Spec Templates for seamless buyer comparisons
const CATEGORY_SPEC_TEMPLATES = {
  cpu: [
    { key: 'Brand', value: '', placeholder: 'e.g. Intel / AMD' },
    { key: 'Cores', value: '', placeholder: 'e.g. 6 Cores' },
    { key: 'Threads', value: '', placeholder: 'e.g. 12 Threads' },
    { key: 'Base Clock', value: '', placeholder: 'e.g. 2.5 GHz' },
    { key: 'Boost Clock', value: '', placeholder: 'e.g. 4.4 GHz' },
    { key: 'Socket', value: '', placeholder: 'e.g. LGA1700 / AM5' },
    { key: 'TDP', value: '', placeholder: 'e.g. 65W' },
  ],
  gpu: [
    { key: 'Brand', value: '', placeholder: 'e.g. NVIDIA / AMD / ASUS' },
    { key: 'VRAM', value: '', placeholder: 'e.g. 8GB GDDR6 / 12GB GDDR6X' },
    { key: 'Boost Clock', value: '', placeholder: 'e.g. 1777 MHz' },
    { key: 'Memory Interface', value: '', placeholder: 'e.g. 128-bit / 192-bit' },
    { key: 'Recommended PSU', value: '', placeholder: 'e.g. 550W / 650W' },
    { key: 'Ray Tracing', value: '', placeholder: 'e.g. Supported / 3rd Gen' },
  ],
  storage: [
    { key: 'Capacity', value: '', placeholder: 'e.g. 1TB / 2TB / 500GB' },
    { key: 'Form Factor', value: '', placeholder: 'e.g. M.2 2280 NVMe / 2.5" SATA' },
    { key: 'Interface', value: '', placeholder: 'e.g. PCIe 4.0 x4 / SATA III' },
    { key: 'Read Speed', value: '', placeholder: 'e.g. 7000 MB/s' },
    { key: 'Write Speed', value: '', placeholder: 'e.g. 5000 MB/s' },
  ],
  ram: [
    { key: 'Capacity', value: '', placeholder: 'e.g. 16GB (2x8GB) / 32GB (2x16GB)' },
    { key: 'Memory Type', value: '', placeholder: 'e.g. DDR4 / DDR5' },
    { key: 'Speed', value: '', placeholder: 'e.g. 3200 MHz / 6000 MHz' },
    { key: 'Latency (CAS)', value: '', placeholder: 'e.g. CL16 / CL30' },
  ],
  motherboard: [
    { key: 'Chipset', value: '', placeholder: 'e.g. Intel B660 / AMD B550' },
    { key: 'Socket', value: '', placeholder: 'e.g. LGA1700 / AM5' },
    { key: 'Form Factor', value: '', placeholder: 'e.g. ATX / Micro-ATX' },
    { key: 'Memory Slots', value: '', placeholder: 'e.g. 4x DDR4 / 4x DDR5' },
  ],
  psu: [
    { key: 'Wattage', value: '', placeholder: 'e.g. 650W / 750W / 850W' },
    { key: 'Efficiency', value: '', placeholder: 'e.g. 80 Plus Gold / Bronze' },
    { key: 'Modularity', value: '', placeholder: 'e.g. Fully Modular / Non-Modular' },
  ]
};

const getCategoryKey = (catName = '') => {
  const lower = catName.toLowerCase();
  if (lower.includes('cpu') || lower.includes('process')) return 'cpu';
  if (lower.includes('gpu') || lower.includes('graphic') || lower.includes('card')) return 'gpu';
  if (lower.includes('storage') || lower.includes('ssd') || lower.includes('hard') || lower.includes('drive')) return 'storage';
  if (lower.includes('ram') || lower.includes('memory')) return 'ram';
  if (lower.includes('motherboard') || lower.includes('board')) return 'motherboard';
  if (lower.includes('psu') || lower.includes('power')) return 'psu';
  return null;
};

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

  // Dynamic Specs Key-Value List
  const [specList, setSpecList] = useState([]);

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
            loadCategoryTemplate(data[0].name);
          }
        }
      })
      .catch(err => console.error("Error fetching categories:", err));
  }, [user, navigate]);

  const loadCategoryTemplate = (catName) => {
    const key = getCategoryKey(catName);
    if (key && CATEGORY_SPEC_TEMPLATES[key]) {
      setSpecList(CATEGORY_SPEC_TEMPLATES[key].map(item => ({ ...item, value: '' })));
    } else {
      setSpecList([
        { key: 'Brand', value: '', placeholder: 'e.g. Corsair' },
        { key: 'Model', value: '', placeholder: 'e.g. Pro Edition' }
      ]);
    }
  };

  const handleCategorySelect = (cat) => {
    setFormData(prev => ({ ...prev, category_id: cat.id }));
    setCategoryDropdownOpen(false);
    loadCategoryTemplate(cat.name);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Spec Changes
  const handleSpecChange = (index, field, val) => {
    setSpecList(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
  };

  const addSpecRow = () => {
    setSpecList(prev => [...prev, { key: '', value: '', placeholder: 'Value' }]);
  };

  const removeSpecRow = (index) => {
    setSpecList(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: 'info', message: 'Adding product...' });

    // Build specs JSON object from filled fields
    const specsObject = {};
    specList.forEach(item => {
      const k = item.key.trim();
      const v = item.value.trim();
      if (k && v) {
        specsObject[k] = v;
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
        setStatus({ type: 'success', message: 'Product and comparison specs added successfully!' });
        setFormData({
          name: '',
          description: '',
          price: '',
          stock: '',
          category_id: categories.length > 0 ? categories[0].id : '',
          image_url: ''
        });
        if (categories.length > 0) {
          loadCategoryTemplate(categories[0].name);
        }
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

        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '2rem' }}>Add New Product</h2>
              <p style={{ color: 'var(--text-secondary)', margin: '0.3rem 0 0 0', fontSize: '0.95rem' }}>
                Fill in component details and specifications. Specs will be automatically used in the Buyer Comparison Tool.
              </p>
            </div>
          </div>
        
          {status.message && (
            <div className={`alert ${status.type === 'error' ? 'alert-error' : status.type === 'success' ? 'alert-success' : 'alert-info'}`} style={{ padding: '1rem', marginBottom: '1.5rem', borderRadius: '8px', background: status.type === 'error' ? 'rgba(255,50,50,0.1)' : 'rgba(50,255,50,0.1)', color: status.type === 'error' ? '#ff6b6b' : '#51cf66' }}>
              {status.message}
            </div>
          )}

          <div className="glass-panel" style={{ padding: '2.5rem' }}>
            <form onSubmit={handleSubmit}>
              
              {/* Product Basic Info */}
              <div className="form-group">
                <label className="form-label">Product Name / Model *</label>
                <input 
                  type="text" 
                  name="name" 
                  className="form-control" 
                  value={formData.name} 
                  onChange={handleChange} 
                  placeholder="e.g. Intel Core i5-12400F Processor / Samsung 980 Pro 1TB NVMe" 
                  required 
                />
              </div>

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
                      position: 'relative',
                      transition: 'all var(--transition-fast)',
                      boxShadow: categoryDropdownOpen ? '0 0 10px rgba(0, 240, 255, 0.1)' : 'none'
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
                            onClick={() => handleCategorySelect(cat)}
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
                <textarea name="description" className="form-control" value={formData.description} onChange={handleChange} rows="3" placeholder="Provide product overview, warranty information, and key highlights..."></textarea>
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

              {/* Visual Technical Specifications Builder */}
              <div style={{ marginTop: '2.5rem', marginBottom: '2rem', padding: '1.5rem', background: 'rgba(0, 0, 0, 0.3)', borderRadius: '10px', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)' }}>
                      <Sparkles size={18} /> Technical Specifications & Comparison Facts
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: '0.2rem 0 0 0' }}>
                      Easy Form: Fill in key facts below. These will power the <strong>Buyer Comparison Tool</strong> automatically.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addSpecRow}
                    className="btn btn-outline"
                    style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                  >
                    <Plus size={14} /> Add Spec Field
                  </button>
                </div>

                {/* Specs List Rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {specList.map((item, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr auto', gap: '0.8rem', alignItems: 'center' }}>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Feature (e.g. Cores / VRAM)"
                        value={item.key}
                        onChange={(e) => handleSpecChange(idx, 'key', e.target.value)}
                        style={{ fontSize: '0.9rem', fontWeight: 'bold', background: 'rgba(0,0,0,0.4)' }}
                      />
                      <input
                        type="text"
                        className="form-control"
                        placeholder={item.placeholder || 'Value (e.g. 6 Cores)'}
                        value={item.value}
                        onChange={(e) => handleSpecChange(idx, 'value', e.target.value)}
                        style={{ fontSize: '0.9rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => removeSpecRow(idx)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--danger)',
                          cursor: 'pointer',
                          padding: '0.4rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: 0.8
                        }}
                        title="Remove specification"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>

                <small style={{ display: 'block', marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                  💡 Empty fields will be automatically skipped. No need to write manual JSON code!
                </small>
              </div>

              <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.8rem', fontSize: '1.05rem', cursor: 'pointer' }}>
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
