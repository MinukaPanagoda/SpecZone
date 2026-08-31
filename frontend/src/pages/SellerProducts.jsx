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
  Image as ImageIcon,
  Sparkles
} from 'lucide-react';

const CATEGORY_SPEC_TEMPLATES = {
  cpu: [
    { key: 'Brand', value: '', placeholder: 'e.g. Intel / AMD' },
    { key: 'Cores', value: '', placeholder: 'e.g. 6 Cores' },
    { key: 'Threads', value: '', placeholder: 'e.g. 12 Threads' },
    { key: 'Base Clock', value: '', placeholder: 'e.g. 2.5 GHz' },
    { key: 'Boost Clock', value: '', placeholder: 'e.g. 4.4 GHz' },
    { key: 'Socket', value: '', placeholder: 'e.g. LGA1700 / AM5' },
    { key: 'Power Usage (TDP)', value: '', placeholder: 'e.g. 65W / 125W' },
    { key: 'Estimated Gaming FPS', value: '', placeholder: 'e.g. 140 FPS (Avg 1080p Ultra)' },
  ],
  gpu: [
    { key: 'Brand', value: '', placeholder: 'e.g. NVIDIA / AMD / ASUS / MSI' },
    { key: 'VRAM', value: '', placeholder: 'e.g. 8GB GDDR6 / 12GB GDDR6X / 24GB' },
    { key: 'Boost Clock', value: '', placeholder: 'e.g. 1777 MHz / 2520 MHz' },
    { key: 'Power Usage (TDP)', value: '', placeholder: 'e.g. 170W / 285W / 450W' },
    { key: 'Estimated Gaming FPS', value: '', placeholder: 'e.g. 95 FPS (1080p Ultra) / 75 FPS (1440p)' },
    { key: 'Memory Interface', value: '', placeholder: 'e.g. 128-bit / 192-bit / 384-bit' },
    { key: 'Recommended PSU', value: '', placeholder: 'e.g. 550W / 750W / 1000W' },
    { key: 'Ray Tracing', value: '', placeholder: 'e.g. Supported / 3rd Gen RT' },
  ],
  storage: [
    { key: 'Capacity', value: '', placeholder: 'e.g. 1TB / 2TB / 500GB' },
    { key: 'Form Factor', value: '', placeholder: 'e.g. M.2 2280 NVMe / 2.5" SATA' },
    { key: 'Interface', value: '', placeholder: 'e.g. PCIe 4.0 x4 / SATA III' },
    { key: 'Read Speed', value: '', placeholder: 'e.g. 7000 MB/s' },
    { key: 'Write Speed', value: '', placeholder: 'e.g. 5000 MB/s' },
    { key: 'Power Usage', value: '', placeholder: 'e.g. 6W (Active) / 0.5W (Idle)' },
  ],
  ram: [
    { key: 'Capacity', value: '', placeholder: 'e.g. 16GB (2x8GB) / 32GB (2x16GB)' },
    { key: 'Memory Type', value: '', placeholder: 'e.g. DDR4 / DDR5' },
    { key: 'Speed', value: '', placeholder: 'e.g. 3200 MHz / 6000 MHz' },
    { key: 'Latency (CAS)', value: '', placeholder: 'e.g. CL16 / CL30' },
    { key: 'Voltage', value: '', placeholder: 'e.g. 1.35V' },
  ],
  motherboard: [
    { key: 'Chipset', value: '', placeholder: 'e.g. Intel B660 / AMD B550 / X670' },
    { key: 'Socket', value: '', placeholder: 'e.g. LGA1700 / AM5' },
    { key: 'Form Factor', value: '', placeholder: 'e.g. ATX / Micro-ATX' },
    { key: 'Memory Slots', value: '', placeholder: 'e.g. 4x DDR4 / 4x DDR5' },
    { key: 'Max Power Support', value: '', placeholder: 'e.g. 14+2 Power Phases' },
  ],
  psu: [
    { key: 'Wattage', value: '', placeholder: 'e.g. 650W / 750W / 850W / 1000W' },
    { key: 'Efficiency', value: '', placeholder: 'e.g. 80 Plus Gold / Bronze / Platinum' },
    { key: 'Modularity', value: '', placeholder: 'e.g. Fully Modular / Semi-Modular' },
    { key: 'Power Output Rating', value: '', placeholder: 'e.g. Continuous 750W Peak 850W' },
  ],
  cooling: [
    { key: 'Cooler Type', value: '', placeholder: 'e.g. 240mm AIO Liquid / Air Cooler' },
    { key: 'TDP Cooling Capacity', value: '', placeholder: 'e.g. 250W TDP' },
    { key: 'Fan Speed', value: '', placeholder: 'e.g. 800 - 2000 RPM' },
    { key: 'Noise Level', value: '', placeholder: 'e.g. 28 dBA' },
    { key: 'Socket Support', value: '', placeholder: 'e.g. LGA1700 / AM5 / AM4' },
  ],
  cases: [
    { key: 'Form Factor Support', value: '', placeholder: 'e.g. ATX / Micro-ATX / ITX' },
    { key: 'Max GPU Length', value: '', placeholder: 'e.g. 380mm' },
    { key: 'Max PSU Length', value: '', placeholder: 'e.g. 200mm' },
    { key: 'Included Fans', value: '', placeholder: 'e.g. 3x 120mm ARGB' },
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
  if (lower.includes('cool')) return 'cooling';
  if (lower.includes('case')) return 'cases';
  return null;
};

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
    title: '',
    image_url: '',
    description: ''
  });
  const [editPowerUsage, setEditPowerUsage] = useState('');
  const [editGamingFps, setEditGamingFps] = useState('');
  const [editBrand, setEditBrand] = useState('');
  const [editMainSpec, setEditMainSpec] = useState('');
  const [editExtraSpecs, setEditExtraSpecs] = useState([]);
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
      stock: product.stock ?? product.stock_quantity ?? 0,
      title: product.title,
      image_url: product.image_url || '',
      description: product.description || ''
    });

    // Parse specs
    let specsObj = {};
    if (product.specs && typeof product.specs === 'object') {
      specsObj = product.specs;
    } else if (typeof product.specifications === 'string') {
      try {
        specsObj = JSON.parse(product.specifications);
      } catch {
        specsObj = {};
      }
    }

    let power = '';
    let fps = '';
    let brandVal = '';
    let mainSpecVal = '';
    const extra = [];

    Object.entries(specsObj).forEach(([k, v]) => {
      const lower = k.toLowerCase().trim();
      if (/^(power|tdp|wattage|consumption|energy)/i.test(lower)) {
        power = String(v);
      } else if (/(fps|framerate|frame rate|gaming performance|gaming fps|estimated gaming)/i.test(lower)) {
        fps = String(v);
      } else if (lower === 'brand' || lower === 'manufacturer') {
        brandVal = String(v);
      } else if (lower === 'specification' || lower === 'key specification' || lower === 'vram' || lower === 'socket' || lower === 'capacity') {
        if (!mainSpecVal) {
          mainSpecVal = `${k}: ${v}`;
        } else {
          extra.push({ key: k, value: String(v) });
        }
      } else {
        extra.push({ key: k, value: String(v) });
      }
    });

    setEditPowerUsage(power);
    setEditGamingFps(fps);
    setEditBrand(brandVal);
    setEditMainSpec(mainSpecVal);
    setEditExtraSpecs(extra);

    setEditModalOpen(true);
  };

  const handleEditExtraSpecChange = (index, field, val) => {
    setEditExtraSpecs(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
  };

  const addEditExtraSpec = () => {
    setEditExtraSpecs(prev => [...prev, { key: '', value: '' }]);
  };

  const removeEditExtraSpec = (index) => {
    setEditExtraSpecs(prev => prev.filter((_, i) => i !== index));
  };

  // Submit Edit Form
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    setEditLoading(true);

    // Build specs object
    const specsObject = {};
    if (editPowerUsage.trim()) {
      specsObject['Power Usage (TDP)'] = editPowerUsage.trim();
    }
    if (editGamingFps.trim()) {
      specsObject['Estimated Gaming FPS'] = editGamingFps.trim();
    }
    if (editBrand.trim()) {
      specsObject['Brand'] = editBrand.trim();
    }
    if (editMainSpec.trim()) {
      specsObject['Specification'] = editMainSpec.trim();
    }
    editExtraSpecs.forEach(item => {
      if (item.key.trim() && item.value.trim()) {
        specsObject[item.key.trim()] = item.value.trim();
      }
    });

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
          description: editFormData.description,
          specs: JSON.stringify(specsObject)
        })
      });

      const data = await res.json();
      if (res.ok) {
        showToast('✓ Product updated successfully!');
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

                {/* Technical Specifications & Comparison Fields */}
                <div style={{ marginTop: '0.5rem', padding: '1.2rem', background: 'rgba(0, 0, 0, 0.35)', borderRadius: '10px', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
                  <h4 style={{ margin: '0 0 0.8rem 0', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-primary)' }}>
                    <Sparkles size={16} /> Comparison Specs (Power & Gaming)
                  </h4>

                  <div className="seller-two-col">
                    {/* Power Usage Field */}
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.82rem', color: '#ffb703', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Zap size={14} /> Power Usage / TDP
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. 170W or 65W"
                        value={editPowerUsage}
                        onChange={(e) => setEditPowerUsage(e.target.value)}
                        style={{ fontSize: '0.85rem', padding: '0.5rem 0.7rem' }}
                      />
                    </div>

                    {/* Gaming FPS Field */}
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.82rem', color: 'var(--accent-primary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Gamepad2 size={14} /> Estimated Gaming FPS
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. 95 FPS or 140 FPS"
                        value={editGamingFps}
                        onChange={(e) => setEditGamingFps(e.target.value)}
                        style={{ fontSize: '0.85rem', padding: '0.5rem 0.7rem' }}
                      />
                    </div>
                  </div>

                  <div className="seller-two-col" style={{ marginTop: '0.8rem' }}>
                    {/* Brand Field */}
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.82rem' }}>
                        Brand / Manufacturer
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. NVIDIA / Intel / Corsair"
                        value={editBrand}
                        onChange={(e) => setEditBrand(e.target.value)}
                        style={{ fontSize: '0.85rem', padding: '0.5rem 0.7rem' }}
                      />
                    </div>

                    {/* Main Spec Field */}
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.82rem' }}>
                        Key Spec / Memory
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. 12GB GDDR6 / LGA1700"
                        value={editMainSpec}
                        onChange={(e) => setEditMainSpec(e.target.value)}
                        style={{ fontSize: '0.85rem', padding: '0.5rem 0.7rem' }}
                      />
                    </div>
                  </div>

                  {/* Extra custom specs */}
                  {editExtraSpecs.length > 0 && (
                    <div style={{ marginTop: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {editExtraSpecs.map((item, idx) => (
                        <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr auto', gap: '0.5rem', alignItems: 'center' }}>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Feature"
                            value={item.key}
                            onChange={(e) => handleEditExtraSpecChange(idx, 'key', e.target.value)}
                            style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem' }}
                          />
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Value"
                            value={item.value}
                            onChange={(e) => handleEditExtraSpecChange(idx, 'value', e.target.value)}
                            style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem' }}
                          />
                          <button
                            type="button"
                            onClick={() => removeEditExtraSpec(idx)}
                            style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.2rem' }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={addEditExtraSpec}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.8rem', cursor: 'pointer', marginTop: '0.6rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: 0 }}
                  >
                    <Plus size={13} /> + Add Another Spec
                  </button>
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
