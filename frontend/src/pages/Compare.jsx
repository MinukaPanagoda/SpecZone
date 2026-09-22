import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { 
  Scale, 
  ShoppingCart, 
  Package, 
  ExternalLink, 
  Check, 
  Sparkles,
  Zap,
  Gamepad2,
  Cpu,
  HardDrive,
  Activity,
  Briefcase,
  Monitor,
  Flame,
  Star
} from 'lucide-react';
import SellerWarningModal from '../components/SellerWarningModal';

const Compare = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [productAId, setProductAId] = useState('');
  const [productBId, setProductBId] = useState('');
  const [loading, setLoading] = useState(true);

  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [pendingWarningProduct, setPendingWarningProduct] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  useEffect(() => {
    fetch('http://localhost/SpecZone/backend/api/products.php?action=read')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProducts(data);
          if (data.length >= 2) {
            setProductAId(String(data[0].id));
            setProductBId(String(data[1].id));
          } else if (data.length === 1) {
            setProductAId(String(data[0].id));
          }
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching products:", err);
        setLoading(false);
      });

    fetch('http://localhost/SpecZone/backend/api/categories.php')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCategories(data);
        }
      })
      .catch(err => console.error("Error fetching categories:", err));
  }, []);

  // Filter products by category
  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => String(p.category_id) === String(selectedCategory));

  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId);
    const inCat = catId === 'all' ? products : products.filter(p => String(p.category_id) === String(catId));
    if (inCat.length >= 2) {
      setProductAId(String(inCat[0].id));
      setProductBId(String(inCat[1].id));
    } else if (inCat.length === 1) {
      setProductAId(String(inCat[0].id));
      setProductBId('');
    } else {
      setProductAId('');
      setProductBId('');
    }
  };

  const productA = products.find(p => String(p.id) === String(productAId));
  const productB = products.find(p => String(p.id) === String(productBId));

  // Parse specifications JSON
  const parseSpecs = (prod) => {
    if (!prod) return {};
    if (prod.specs && typeof prod.specs === 'object') return prod.specs;
    if (!prod.specifications) return {};
    if (typeof prod.specifications === 'object') return prod.specifications;
    try {
      return JSON.parse(prod.specifications);
    } catch {
      return {};
    }
  };

  const specsA = parseSpecs(productA);
  const specsB = parseSpecs(productB);

  const extractNumeric = (val) => {
    if (!val) return null;
    const match = String(val).match(/(\d+(\.\d+)?)/);
    return match ? parseFloat(match[1]) : null;
  };

  const getPowerSpec = (specs) => {
    if (!specs || typeof specs !== 'object') return null;
    const keys = Object.keys(specs);
    const foundKey = keys.find(k => /^(power|tdp|wattage|consumption|energy|max power)/i.test(k.trim()));
    if (!foundKey) return null;
    const raw = String(specs[foundKey]);
    return { key: foundKey, raw, num: extractNumeric(raw) };
  };

  const powerA = getPowerSpec(specsA);
  const powerB = getPowerSpec(specsB);

  // Purpose Category Heuristic
  const getUsageCategory = (product) => {
    if (!product) return { title: 'General Use', color: 'var(--accent-primary)' };
    const title = (product.title || '').toLowerCase();
    const price = parseFloat(product.price || 0);

    if (title.includes('4090') || title.includes('4080') || title.includes('7900') || title.includes('7800x3d') || title.includes('14900k') || title.includes('x3d')) {
      return { title: 'Extreme AAA Gaming & VR', color: '#ff007f' };
    }
    if (title.includes('i9') || title.includes('ryzen 9') || title.includes('i7') || title.includes('32gb') || title.includes('64gb') || price >= 180000) {
      return { title: '4K Video Editing & 3D Workstation', color: '#ffb703' };
    }
    if (title.includes('i5') || title.includes('ryzen 5') || title.includes('4060') || title.includes('3060') || title.includes('16gb') || price >= 50000) {
      return { title: '1080p/1440p Gaming & Coding', color: 'var(--accent-primary)' };
    }
    return { title: 'Office Productivity & Browsing', color: 'var(--success)' };
  };

  // Component Benchmark Metric (Unified single key metric per component)
  const getBenchmarkMetric = (product, specs) => {
    if (!product) return null;
    const cat = (product.category_name || '').toLowerCase();
    const title = (product.title || '').toLowerCase();

    // CPU Performance
    if (cat.includes('processor') || cat.includes('cpu') || title.includes('intel') || title.includes('ryzen')) {
      let score = 12000;
      if (title.includes('14900') || title.includes('7950x')) score = 38000;
      else if (title.includes('13700') || title.includes('7900')) score = 30000;
      else if (title.includes('7800x3d')) score = 18500;
      else if (title.includes('12400') || title.includes('5600')) score = 12500;
      else if (title.includes('i3') || title.includes('ryzen 3')) score = 7500;
      return {
        label: 'Cinebench Multi-Core Benchmark',
        value: `${score.toLocaleString()} pts`,
        score: score,
        max: 40000,
        unit: 'pts',
        icon: Cpu,
        color: '#00f0ff'
      };
    }

    // GPU Performance (FPS)
    if (cat.includes('graphics') || cat.includes('gpu') || title.includes('rtx') || title.includes('radeon') || title.includes('rx ')) {
      let fps = 100;
      if (title.includes('4090')) fps = 210;
      else if (title.includes('4080') || title.includes('7900')) fps = 175;
      else if (title.includes('4070') || title.includes('7800') || title.includes('3080')) fps = 145;
      else if (title.includes('4060') || title.includes('3060')) fps = 110;
      else if (title.includes('1660') || title.includes('1650')) fps = 70;
      return {
        label: 'Gaming Benchmark (1440p Avg FPS)',
        value: `${fps} FPS`,
        score: fps,
        max: 240,
        unit: 'FPS',
        icon: Gamepad2,
        color: '#ff007f'
      };
    }

    // SSD Read Speed
    if (cat.includes('storage') || cat.includes('ssd') || cat.includes('nvme')) {
      let speed = extractNumeric(specs?.['Read Speed'] || specs?.['Sequential Read']) || 3500;
      if (title.includes('990') || title.includes('980 pro') || title.includes('gen 4') || title.includes('kc3000')) speed = 7450;
      else if (title.includes('gen 5')) speed = 10000;
      else if (title.includes('sata')) speed = 550;
      return {
        label: 'Sequential Read Speed Benchmark',
        value: `${speed.toLocaleString()} MB/s`,
        score: speed,
        max: 8000,
        unit: 'MB/s',
        icon: HardDrive,
        color: '#ffb703'
      };
    }

    return null;
  };

  const usageA = getUsageCategory(productA);
  const usageB = getUsageCategory(productB);
  const benchA = getBenchmarkMetric(productA, specsA);
  const benchB = getBenchmarkMetric(productB, specsB);

  // Extract all other unique spec keys (excluding power)
  const allSpecKeys = Array.from(
    new Set([...Object.keys(specsA), ...Object.keys(specsB)])
  ).filter(k => !/^(power|tdp|wattage|consumption|energy|max power)/i.test(k.trim()));

  const isSellerFlagged = (product) => {
    if (!product) return false;
    const sRating = parseFloat(product.avg_rating || product.seller_avg_rating || 0);
    const sWarn = parseInt(product.seller_warning_count || 0);
    const sComp = parseInt(product.seller_complaint_count || 0);
    return (sRating > 0 && sRating < 5) || sWarn > 0 || sComp >= 2;
  };

  const handleAddToCart = (product) => {
    if (!user) {
      showToast('Please login to add components to cart.');
      return;
    }
    if (isSellerFlagged(product)) {
      setPendingWarningProduct(product);
      setWarningModalOpen(true);
      return;
    }
    addToCart(product.id, 1);
    showToast(`Added "${product.title}" to cart!`);
  };

  if (loading) {
    return <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>Loading comparison tool...</div>;
  }

  return (
    <div className="container" style={{ padding: '2rem 1rem', maxWidth: '1100px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)', background: 'rgba(0, 240, 255, 0.1)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.6rem' }}>
          <Scale size={16} /> Component Comparison & Benchmarks
        </div>
        <h1 style={{ fontSize: '2rem', margin: '0 0 0.4rem 0' }}>Compare Components</h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '550px', margin: '0 auto', fontSize: '0.9rem' }}>
          Compare PC components side-by-side with <strong>Performance Benchmarks</strong>, <strong>Power (TDP)</strong>, and technical specifications.
        </p>
      </div>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1.8rem' }}>
        <button
          type="button"
          className="btn"
          style={{
            padding: '0.4rem 0.9rem',
            fontSize: '0.82rem',
            borderRadius: '20px',
            background: selectedCategory === 'all' ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.05)',
            color: selectedCategory === 'all' ? '#000' : 'var(--text-primary)',
            border: selectedCategory === 'all' ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
            fontWeight: selectedCategory === 'all' ? 'bold' : 'normal',
            cursor: 'pointer'
          }}
          onClick={() => handleCategoryChange('all')}
        >
          All ({products.length})
        </button>

        {categories.map(cat => {
          const count = products.filter(p => String(p.category_id) === String(cat.id)).length;
          const isSelected = String(selectedCategory) === String(cat.id);
          return (
            <button
              key={cat.id}
              type="button"
              className="btn"
              style={{
                padding: '0.4rem 0.9rem',
                fontSize: '0.82rem',
                borderRadius: '20px',
                background: isSelected ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.05)',
                color: isSelected ? '#000' : 'var(--text-primary)',
                border: isSelected ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                fontWeight: isSelected ? 'bold' : 'normal',
                cursor: 'pointer'
              }}
              onClick={() => handleCategoryChange(cat.id)}
            >
              {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Selectors Bar */}
      <div className="glass-panel" style={{ padding: '1rem 1.2rem', marginBottom: '1.8rem', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '1rem', alignItems: 'center' }}>
          
          {/* Dropdown 1 */}
          <div>
            <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 'bold', color: 'var(--accent-primary)', marginBottom: '0.2rem' }}>
              Component 1 (Left)
            </label>
            <select
              className="form-control"
              value={productAId}
              onChange={(e) => setProductAId(e.target.value)}
              style={{ fontSize: '0.85rem', cursor: 'pointer', background: 'rgba(0,0,0,0.5)' }}
            >
              <option value="">-- Select Component --</option>
              {filteredProducts.map(p => (
                <option key={p.id} value={p.id} disabled={String(p.id) === String(productBId)}>
                  {p.title} (Rs. {parseFloat(p.price).toLocaleString('en-IN')})
                </option>
              ))}
            </select>
          </div>

          {/* VS Badge */}
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            color: '#000',
            fontWeight: '900',
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '0.9rem'
          }}>
            VS
          </div>

          {/* Dropdown 2 */}
          <div>
            <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 'bold', color: 'var(--accent-secondary)', marginBottom: '0.2rem' }}>
              Component 2 (Right)
            </label>
            <select
              className="form-control"
              value={productBId}
              onChange={(e) => setProductBId(e.target.value)}
              style={{ fontSize: '0.85rem', cursor: 'pointer', background: 'rgba(0,0,0,0.5)' }}
            >
              <option value="">-- Select Component --</option>
              {filteredProducts.map(p => (
                <option key={p.id} value={p.id} disabled={String(p.id) === String(productAId)}>
                  {p.title} (Rs. {parseFloat(p.price).toLocaleString('en-IN')})
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Comparison Content */}
      {(!productA && !productB) ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <Scale size={36} style={{ margin: '0 auto 0.8rem', opacity: 0.5 }} />
          <h3>Select Components to Compare</h3>
          <p style={{ fontSize: '0.9rem' }}>Please choose two components from the dropdown menus above.</p>
        </div>
      ) : (
        <div>
          
          {/* Side-by-Side Product Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.2rem', marginBottom: '1.5rem' }}>
            
            {/* Card A */}
            <div className="glass-panel" style={{ padding: '1.2rem', border: '1px solid rgba(0, 240, 255, 0.3)', display: 'flex', flexDirection: 'column' }}>
              {productA ? (
                <>
                  <div style={{ height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.8rem', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', overflow: 'hidden' }}>
                    {productA.image_url ? (
                      <img src={productA.image_url} alt={productA.title} style={{ maxHeight: '115px', maxWidth: '100%', objectFit: 'contain' }} />
                    ) : (
                      <Package size={36} color="var(--text-secondary)" />
                    )}
                  </div>

                  <span style={{ fontSize: '0.72rem', color: 'var(--accent-primary)', textTransform: 'uppercase', fontWeight: 'bold' }}>
                    {productA.category_name}
                  </span>
                  <h3 style={{ fontSize: '1.05rem', margin: '0.2rem 0 0.4rem 0' }}>{productA.title}</h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                      Rs. {parseFloat(productA.price).toLocaleString('en-IN')}
                    </span>
                    <span style={{
                      background: (productA.stock ?? productA.stock_quantity) > 0 ? 'rgba(0, 255, 150, 0.15)' : 'rgba(255, 51, 102, 0.15)',
                      color: (productA.stock ?? productA.stock_quantity) > 0 ? 'var(--success)' : 'var(--danger)',
                      padding: '0.1rem 0.4rem',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 'bold'
                    }}>
                      {(productA.stock ?? productA.stock_quantity) > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>

                  <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', padding: '0.5rem', fontSize: '0.85rem' }}
                      disabled={(productA.stock ?? productA.stock_quantity) <= 0}
                      onClick={() => handleAddToCart(productA)}
                    >
                      <ShoppingCart size={14} /> Add to Cart
                    </button>
                    <Link
                      to={`/product/${productA.id}`}
                      className="btn btn-outline"
                      style={{ padding: '0.5rem 0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      title="View Details"
                    >
                      <ExternalLink size={14} />
                    </Link>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', margin: 'auto', fontSize: '0.85rem' }}>
                  Please select Component 1.
                </div>
              )}
            </div>

            {/* Card B */}
            <div className="glass-panel" style={{ padding: '1.2rem', border: '1px solid rgba(255, 0, 128, 0.3)', display: 'flex', flexDirection: 'column' }}>
              {productB ? (
                <>
                  <div style={{ height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.8rem', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', overflow: 'hidden' }}>
                    {productB.image_url ? (
                      <img src={productB.image_url} alt={productB.title} style={{ maxHeight: '115px', maxWidth: '100%', objectFit: 'contain' }} />
                    ) : (
                      <Package size={36} color="var(--text-secondary)" />
                    )}
                  </div>

                  <span style={{ fontSize: '0.72rem', color: 'var(--accent-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>
                    {productB.category_name}
                  </span>
                  <h3 style={{ fontSize: '1.05rem', margin: '0.2rem 0 0.4rem 0' }}>{productB.title}</h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--accent-secondary)' }}>
                      Rs. {parseFloat(productB.price).toLocaleString('en-IN')}
                    </span>
                    <span style={{
                      background: (productB.stock ?? productB.stock_quantity) > 0 ? 'rgba(0, 255, 150, 0.15)' : 'rgba(255, 51, 102, 0.15)',
                      color: (productB.stock ?? productB.stock_quantity) > 0 ? 'var(--success)' : 'var(--danger)',
                      padding: '0.1rem 0.4rem',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 'bold'
                    }}>
                      {(productB.stock ?? productB.stock_quantity) > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>

                  <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      className="btn"
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', padding: '0.5rem', background: 'var(--accent-secondary)', color: '#fff', border: 'none', fontSize: '0.85rem' }}
                      disabled={(productB.stock ?? productB.stock_quantity) <= 0}
                      onClick={() => handleAddToCart(productB)}
                    >
                      <ShoppingCart size={14} /> Add to Cart
                    </button>
                    <Link
                      to={`/product/${productB.id}`}
                      className="btn btn-outline"
                      style={{ padding: '0.5rem 0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      title="View Details"
                    >
                      <ExternalLink size={14} />
                    </Link>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', margin: 'auto', fontSize: '0.85rem' }}>
                  Please select Component 2.
                </div>
              )}
            </div>

          </div>

          {/* Unified Clean Comparison & Benchmark Matrix Table */}
          <div className="glass-panel" style={{ padding: '1.2rem', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.15rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkles size={16} color="var(--accent-primary)" /> Side-by-Side Comparison Matrix
            </h2>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid rgba(255, 255, 255, 0.1)', textAlign: 'left' }}>
                    <th style={{ padding: '0.7rem 0.8rem', width: '28%', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.75rem' }}>Attribute</th>
                    <th style={{ padding: '0.7rem 0.8rem', width: '36%', color: 'var(--accent-primary)' }}>{productA?.title || 'Component 1'}</th>
                    <th style={{ padding: '0.7rem 0.8rem', width: '36%', color: 'var(--accent-secondary)' }}>{productB?.title || 'Component 2'}</th>
                  </tr>
                </thead>
                <tbody>
                  
                  {/* Price Row */}
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', background: 'rgba(255, 255, 255, 0.02)' }}>
                    <td style={{ padding: '0.7rem 0.8rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Price</td>
                    <td style={{ padding: '0.7rem 0.8rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                      {productA ? `Rs. ${parseFloat(productA.price).toLocaleString('en-IN')}` : '-'}
                    </td>
                    <td style={{ padding: '0.7rem 0.8rem', fontWeight: 'bold', color: 'var(--accent-secondary)' }}>
                      {productB ? `Rs. ${parseFloat(productB.price).toLocaleString('en-IN')}` : '-'}
                    </td>
                  </tr>

                  {/* Power Usage (TDP) Row */}
                  <tr style={{ borderBottom: '1px solid rgba(255, 180, 0, 0.15)', background: 'rgba(255, 180, 0, 0.03)' }}>
                    <td style={{ padding: '0.7rem 0.8rem', fontWeight: 'bold', color: '#ffb703', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Zap size={14} /> Power Draw (TDP)
                    </td>
                    <td style={{ padding: '0.7rem 0.8rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                      {powerA ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          {powerA.raw}
                          {powerA.num && powerB?.num && powerA.num < powerB.num && (
                            <span style={{ fontSize: '0.7rem', background: 'rgba(0, 255, 150, 0.15)', color: 'var(--success)', padding: '0.1rem 0.35rem', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                              <Check size={11} /> Lower Power
                            </span>
                          )}
                        </span>
                      ) : '-'}
                    </td>
                    <td style={{ padding: '0.7rem 0.8rem', fontWeight: 'bold', color: 'var(--accent-secondary)' }}>
                      {powerB ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          {powerB.raw}
                          {powerB.num && powerA?.num && powerB.num < powerA.num && (
                            <span style={{ fontSize: '0.7rem', background: 'rgba(0, 255, 150, 0.15)', color: 'var(--success)', padding: '0.1rem 0.35rem', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                              <Check size={11} /> Lower Power
                            </span>
                          )}
                        </span>
                      ) : '-'}
                    </td>
                  </tr>

                  {/* Benchmark Performance Meter Row */}
                  {(benchA || benchB) && (
                    <tr style={{ borderBottom: '1px solid rgba(0, 240, 255, 0.2)', background: 'rgba(0, 240, 255, 0.04)' }}>
                      <td style={{ padding: '0.7rem 0.8rem', fontWeight: 'bold', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Activity size={14} /> Benchmark Score
                      </td>
                      <td style={{ padding: '0.7rem 0.8rem' }}>
                        {benchA ? (
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.2rem', color: 'var(--accent-primary)' }}>
                              <span>{benchA.value}</span>
                              {benchB && benchA.score > benchB.score && (
                                <span style={{ color: 'var(--success)', fontSize: '0.72rem' }}>+{Math.round(((benchA.score - benchB.score) / benchB.score) * 100)}% Faster</span>
                              )}
                            </div>
                            <div style={{ background: 'rgba(255, 255, 255, 0.1)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${Math.min(100, (benchA.score / benchA.max) * 100)}%`, height: '100%', background: 'var(--accent-primary)', borderRadius: '3px' }}></div>
                            </div>
                          </div>
                        ) : '-'}
                      </td>
                      <td style={{ padding: '0.7rem 0.8rem' }}>
                        {benchB ? (
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.2rem', color: 'var(--accent-secondary)' }}>
                              <span>{benchB.value}</span>
                              {benchA && benchB.score > benchA.score && (
                                <span style={{ color: 'var(--accent-secondary)', fontSize: '0.72rem' }}>+{Math.round(((benchB.score - benchA.score) / benchA.score) * 100)}% Faster</span>
                              )}
                            </div>
                            <div style={{ background: 'rgba(255, 255, 255, 0.1)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${Math.min(100, (benchB.score / benchB.max) * 100)}%`, height: '100%', background: 'var(--accent-secondary)', borderRadius: '3px' }}></div>
                            </div>
                          </div>
                        ) : '-'}
                      </td>
                    </tr>
                  )}

                  {/* Recommended Use-Case Category */}
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '0.7rem 0.8rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Recommended For</td>
                    <td style={{ padding: '0.7rem 0.8rem' }}>
                      {productA ? (
                        <span style={{ color: usageA.color, fontWeight: 'bold', fontSize: '0.82rem' }}>{usageA.title}</span>
                      ) : '-'}
                    </td>
                    <td style={{ padding: '0.7rem 0.8rem' }}>
                      {productB ? (
                        <span style={{ color: usageB.color, fontWeight: 'bold', fontSize: '0.82rem' }}>{usageB.title}</span>
                      ) : '-'}
                    </td>
                  </tr>

                  {/* Rating */}
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', background: 'rgba(255, 255, 255, 0.02)' }}>
                    <td style={{ padding: '0.7rem 0.8rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Rating</td>
                    <td style={{ padding: '0.7rem 0.8rem' }}>
                      {productA?.avg_rating > 0 ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Star size={13} color="var(--warning)" fill="var(--warning)" /> {productA.avg_rating}/10 ({productA.review_count || 0})
                        </span>
                      ) : 'No ratings'}
                    </td>
                    <td style={{ padding: '0.7rem 0.8rem' }}>
                      {productB?.avg_rating > 0 ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Star size={13} color="var(--warning)" fill="var(--warning)" /> {productB.avg_rating}/10 ({productB.review_count || 0})
                        </span>
                      ) : 'No ratings'}
                    </td>
                  </tr>

                  {/* Technical Specs Rows */}
                  {allSpecKeys.map((key, idx) => (
                    <tr
                      key={key}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        background: idx % 2 === 1 ? 'rgba(255, 255, 255, 0.02)' : 'transparent'
                      }}
                    >
                      <td style={{ padding: '0.7rem 0.8rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>{key}</td>
                      <td style={{ padding: '0.7rem 0.8rem' }}>{specsA[key] || '-'}</td>
                      <td style={{ padding: '0.7rem 0.8rem' }}>{specsB[key] || '-'}</td>
                    </tr>
                  ))}

                </tbody>
              </table>
            </div>
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
            padding: '0.8rem 1.4rem',
            borderRadius: '8px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            zIndex: 1300,
            fontWeight: 'bold',
            fontSize: '0.9rem',
            maxWidth: '90vw'
          }}
        >
          <Check size={16} /> {toastMessage}
        </div>
      )}

      {/* Seller Warning Modal */}
      <SellerWarningModal
        isOpen={warningModalOpen}
        onClose={() => {
          setWarningModalOpen(false);
          setPendingWarningProduct(null);
        }}
        onConfirm={() => {
          if (pendingWarningProduct) {
            addToCart(pendingWarningProduct.id, 1);
            showToast(`Added "${pendingWarningProduct.title}" to cart!`);
            setPendingWarningProduct(null);
          }
        }}
        product={pendingWarningProduct}
      />

    </div>
  );
};

export default Compare;
