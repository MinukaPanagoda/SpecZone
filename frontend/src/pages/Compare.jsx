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
  AlertTriangle,
  Sparkles,
  Zap,
  Gamepad2
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
    // Fetch products
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

    // Fetch categories
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

  const getFpsSpec = (specs) => {
    if (!specs || typeof specs !== 'object') return null;
    const keys = Object.keys(specs);
    const foundKey = keys.find(k => /(fps|framerate|frame rate|gaming performance|gaming fps|estimated gaming)/i.test(k.trim()));
    if (!foundKey) return null;
    const raw = String(specs[foundKey]);
    return { key: foundKey, raw, num: extractNumeric(raw) };
  };

  const powerA = getPowerSpec(specsA);
  const powerB = getPowerSpec(specsB);
  const fpsA = getFpsSpec(specsA);
  const fpsB = getFpsSpec(specsB);

  // Extract all other unique spec keys (excluding power and fps since they have special rows)
  const allSpecKeys = Array.from(
    new Set([...Object.keys(specsA), ...Object.keys(specsB)])
  ).filter(k => 
    !/^(power|tdp|wattage|consumption|energy|max power)/i.test(k.trim()) &&
    !/(fps|framerate|frame rate|gaming performance|gaming fps|estimated gaming)/i.test(k.trim())
  );

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
    showToast(`✓ Added "${product.title}" to cart!`);
  };

  if (loading) {
    return <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>Loading comparison tool...</div>;
  }

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)', background: 'rgba(0, 240, 255, 0.1)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.6rem' }}>
          <Scale size={16} /> Component Comparison
        </div>
        <h1 style={{ fontSize: '2.2rem', margin: '0 0 0.5rem 0' }}>Compare Components</h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', fontSize: '0.95rem' }}>
          Compare PC components side-by-side with <strong>Power Usage (TDP)</strong>, <strong>Gaming FPS</strong>, and pricing.
        </p>
      </div>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '2rem' }}>
        <button
          type="button"
          className="btn"
          style={{
            padding: '0.45rem 1rem',
            fontSize: '0.85rem',
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
                padding: '0.45rem 1rem',
                fontSize: '0.85rem',
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
      <div className="glass-panel" style={{ padding: '1.2rem 1.5rem', marginBottom: '2rem', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '1.2rem', alignItems: 'center' }}>
          
          {/* Dropdown 1 */}
          <div>
            <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--accent-primary)', marginBottom: '0.3rem' }}>
              Component 1 (Left)
            </label>
            <select
              className="form-control"
              value={productAId}
              onChange={(e) => setProductAId(e.target.value)}
              style={{ fontSize: '0.9rem', cursor: 'pointer', background: 'rgba(0,0,0,0.5)' }}
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
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            color: '#000',
            fontWeight: '900',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 12px rgba(0, 240, 255, 0.3)',
            marginTop: '1.1rem'
          }}>
            VS
          </div>

          {/* Dropdown 2 */}
          <div>
            <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--accent-secondary)', marginBottom: '0.3rem' }}>
              Component 2 (Right)
            </label>
            <select
              className="form-control"
              value={productBId}
              onChange={(e) => setProductBId(e.target.value)}
              style={{ fontSize: '0.9rem', cursor: 'pointer', background: 'rgba(0,0,0,0.5)' }}
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
          <Scale size={42} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3>Select Components to Compare</h3>
          <p>Please choose two components from the dropdown menus above.</p>
        </div>
      ) : (
        <div>
          
          {/* Side-by-Side Product Header Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            
            {/* Card A */}
            <div className="glass-panel" style={{ padding: '1.5rem', border: '1px solid rgba(0, 240, 255, 0.3)', display: 'flex', flexDirection: 'column' }}>
              {productA ? (
                <>
                  <div style={{ height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', overflow: 'hidden' }}>
                    {productA.image_url ? (
                      <img src={productA.image_url} alt={productA.title} style={{ maxHeight: '135px', maxWidth: '100%', objectFit: 'contain' }} />
                    ) : (
                      <Package size={42} color="var(--text-secondary)" />
                    )}
                  </div>

                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', textTransform: 'uppercase', fontWeight: 'bold' }}>
                    {productA.category_name}
                  </span>
                  <h3 style={{ fontSize: '1.2rem', margin: '0.3rem 0 0.6rem 0' }}>{productA.title}</h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                      Rs. {parseFloat(productA.price).toLocaleString('en-IN')}
                    </span>
                    <span style={{
                      background: (productA.stock ?? productA.stock_quantity) > 0 ? 'rgba(0, 255, 150, 0.15)' : 'rgba(255, 51, 102, 0.15)',
                      color: (productA.stock ?? productA.stock_quantity) > 0 ? 'var(--success)' : 'var(--danger)',
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}>
                      {(productA.stock ?? productA.stock_quantity) > 0 ? `In Stock (${productA.stock ?? productA.stock_quantity})` : 'Out of Stock'}
                    </span>
                  </div>

                  {/* Quick Power & FPS badges */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    {powerA && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(255, 180, 0, 0.12)', color: '#ffb703', border: '1px solid rgba(255, 180, 0, 0.25)', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 'bold' }}>
                        <Zap size={13} /> {powerA.raw}
                      </span>
                    )}
                    {fpsA && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(0, 240, 255, 0.12)', color: 'var(--accent-primary)', border: '1px solid rgba(0, 240, 255, 0.25)', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 'bold' }}>
                        <Gamepad2 size={13} /> {fpsA.raw}
                      </span>
                    )}
                  </div>

                  <div style={{ marginTop: 'auto', display: 'flex', gap: '0.6rem' }}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.6rem', fontSize: '0.9rem' }}
                      disabled={(productA.stock ?? productA.stock_quantity) <= 0}
                      onClick={() => handleAddToCart(productA)}
                    >
                      <ShoppingCart size={15} /> Add to Cart
                    </button>
                    <Link
                      to={`/product/${productA.id}`}
                      className="btn btn-outline"
                      style={{ padding: '0.6rem 0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      title="View Details"
                    >
                      <ExternalLink size={15} />
                    </Link>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', margin: 'auto' }}>
                  Please select Component 1.
                </div>
              )}
            </div>

            {/* Card B */}
            <div className="glass-panel" style={{ padding: '1.5rem', border: '1px solid rgba(255, 0, 128, 0.3)', display: 'flex', flexDirection: 'column' }}>
              {productB ? (
                <>
                  <div style={{ height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', overflow: 'hidden' }}>
                    {productB.image_url ? (
                      <img src={productB.image_url} alt={productB.title} style={{ maxHeight: '135px', maxWidth: '100%', objectFit: 'contain' }} />
                    ) : (
                      <Package size={42} color="var(--text-secondary)" />
                    )}
                  </div>

                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>
                    {productB.category_name}
                  </span>
                  <h3 style={{ fontSize: '1.2rem', margin: '0.3rem 0 0.6rem 0' }}>{productB.title}</h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--accent-secondary)' }}>
                      Rs. {parseFloat(productB.price).toLocaleString('en-IN')}
                    </span>
                    <span style={{
                      background: (productB.stock ?? productB.stock_quantity) > 0 ? 'rgba(0, 255, 150, 0.15)' : 'rgba(255, 51, 102, 0.15)',
                      color: (productB.stock ?? productB.stock_quantity) > 0 ? 'var(--success)' : 'var(--danger)',
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}>
                      {(productB.stock ?? productB.stock_quantity) > 0 ? `In Stock (${productB.stock ?? productB.stock_quantity})` : 'Out of Stock'}
                    </span>
                  </div>

                  {/* Quick Power & FPS badges */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    {powerB && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(255, 180, 0, 0.12)', color: '#ffb703', border: '1px solid rgba(255, 180, 0, 0.25)', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 'bold' }}>
                        <Zap size={13} /> {powerB.raw}
                      </span>
                    )}
                    {fpsB && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(255, 0, 128, 0.12)', color: 'var(--accent-secondary)', border: '1px solid rgba(255, 0, 128, 0.25)', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 'bold' }}>
                        <Gamepad2 size={13} /> {fpsB.raw}
                      </span>
                    )}
                  </div>

                  <div style={{ marginTop: 'auto', display: 'flex', gap: '0.6rem' }}>
                    <button
                      type="button"
                      className="btn"
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.6rem', background: 'var(--accent-secondary)', color: '#fff', border: 'none', fontSize: '0.9rem' }}
                      disabled={(productB.stock ?? productB.stock_quantity) <= 0}
                      onClick={() => handleAddToCart(productB)}
                    >
                      <ShoppingCart size={15} /> Add to Cart
                    </button>
                    <Link
                      to={`/product/${productB.id}`}
                      className="btn btn-outline"
                      style={{ padding: '0.6rem 0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      title="View Details"
                    >
                      <ExternalLink size={15} />
                    </Link>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', margin: 'auto' }}>
                  Please select Component 2.
                </div>
              )}
            </div>

          </div>

          {/* Simple Side-by-Side Comparison Table */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} color="var(--accent-primary)" /> Specifications Comparison
            </h2>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid rgba(255, 255, 255, 0.1)', textAlign: 'left' }}>
                    <th style={{ padding: '0.8rem 1rem', width: '30%', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.78rem' }}>Feature</th>
                    <th style={{ padding: '0.8rem 1rem', width: '35%', color: 'var(--accent-primary)' }}>{productA?.title || 'Component 1'}</th>
                    <th style={{ padding: '0.8rem 1rem', width: '35%', color: 'var(--accent-secondary)' }}>{productB?.title || 'Component 2'}</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Price */}
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', background: 'rgba(255, 255, 255, 0.02)' }}>
                    <td style={{ padding: '0.8rem 1rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Price</td>
                    <td style={{ padding: '0.8rem 1rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                      {productA ? `Rs. ${parseFloat(productA.price).toLocaleString('en-IN')}` : '-'}
                    </td>
                    <td style={{ padding: '0.8rem 1rem', fontWeight: 'bold', color: 'var(--accent-secondary)' }}>
                      {productB ? `Rs. ${parseFloat(productB.price).toLocaleString('en-IN')}` : '-'}
                    </td>
                  </tr>

                  {/* ⚡ Power Usage (TDP) */}
                  <tr style={{ borderBottom: '1px solid rgba(255, 180, 0, 0.2)', background: 'rgba(255, 180, 0, 0.05)' }}>
                    <td style={{ padding: '0.8rem 1rem', fontWeight: 'bold', color: '#ffb703', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Zap size={15} /> Power Usage (TDP)
                    </td>
                    <td style={{ padding: '0.8rem 1rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                      {powerA ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                          {powerA.raw}
                          {powerA.num && powerB?.num && powerA.num < powerB.num && (
                            <span style={{ fontSize: '0.72rem', background: 'rgba(0, 255, 150, 0.15)', color: 'var(--success)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                              ✓ Lower Power
                            </span>
                          )}
                        </span>
                      ) : '-'}
                    </td>
                    <td style={{ padding: '0.8rem 1rem', fontWeight: 'bold', color: 'var(--accent-secondary)' }}>
                      {powerB ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                          {powerB.raw}
                          {powerB.num && powerA?.num && powerB.num < powerA.num && (
                            <span style={{ fontSize: '0.72rem', background: 'rgba(0, 255, 150, 0.15)', color: 'var(--success)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                              ✓ Lower Power
                            </span>
                          )}
                        </span>
                      ) : '-'}
                    </td>
                  </tr>

                  {/* 🎮 Gaming FPS */}
                  <tr style={{ borderBottom: '1px solid rgba(0, 240, 255, 0.2)', background: 'rgba(0, 240, 255, 0.05)' }}>
                    <td style={{ padding: '0.8rem 1rem', fontWeight: 'bold', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Gamepad2 size={15} /> Estimated Gaming FPS
                    </td>
                    <td style={{ padding: '0.8rem 1rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                      {fpsA ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                          {fpsA.raw}
                          {fpsA.num && fpsB?.num && fpsA.num > fpsB.num && (
                            <span style={{ fontSize: '0.72rem', background: 'rgba(0, 240, 255, 0.15)', color: 'var(--accent-primary)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                              ✓ Higher FPS
                            </span>
                          )}
                        </span>
                      ) : '-'}
                    </td>
                    <td style={{ padding: '0.8rem 1rem', fontWeight: 'bold', color: 'var(--accent-secondary)' }}>
                      {fpsB ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                          {fpsB.raw}
                          {fpsB.num && fpsA?.num && fpsB.num > fpsA.num && (
                            <span style={{ fontSize: '0.72rem', background: 'rgba(255, 0, 128, 0.15)', color: 'var(--accent-secondary)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                              ✓ Higher FPS
                            </span>
                          )}
                        </span>
                      ) : '-'}
                    </td>
                  </tr>

                  {/* Category */}
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '0.8rem 1rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Category</td>
                    <td style={{ padding: '0.8rem 1rem' }}>{productA?.category_name || '-'}</td>
                    <td style={{ padding: '0.8rem 1rem' }}>{productB?.category_name || '-'}</td>
                  </tr>

                  {/* Rating */}
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', background: 'rgba(255, 255, 255, 0.02)' }}>
                    <td style={{ padding: '0.8rem 1rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Rating</td>
                    <td style={{ padding: '0.8rem 1rem' }}>
                      {productA?.avg_rating > 0 ? `⭐ ${productA.avg_rating}/10 (${productA.review_count || 0})` : 'No ratings'}
                    </td>
                    <td style={{ padding: '0.8rem 1rem' }}>
                      {productB?.avg_rating > 0 ? `⭐ ${productB.avg_rating}/10 (${productB.review_count || 0})` : 'No ratings'}
                    </td>
                  </tr>

                  {/* Additional Specs */}
                  {allSpecKeys.map((key, idx) => (
                    <tr
                      key={key}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        background: idx % 2 === 1 ? 'rgba(255, 255, 255, 0.02)' : 'transparent'
                      }}
                    >
                      <td style={{ padding: '0.8rem 1rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>{key}</td>
                      <td style={{ padding: '0.8rem 1rem' }}>{specsA[key] || '-'}</td>
                      <td style={{ padding: '0.8rem 1rem' }}>{specsB[key] || '-'}</td>
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
            showToast(`✓ Added "${pendingWarningProduct.title}" to cart!`);
            setPendingWarningProduct(null);
          }
        }}
        product={pendingWarningProduct}
      />

    </div>
  );
};

export default Compare;


