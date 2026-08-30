import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { 
  Scale, 
  ShoppingCart, 
  Star, 
  Package, 
  ExternalLink, 
  Check, 
  AlertTriangle,
  ArrowRight,
  Sparkles
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

  // When category changes, auto-select first two items in that category
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
    if (!prod || !prod.specifications) return {};
    if (typeof prod.specifications === 'object') return prod.specifications;
    try {
      return JSON.parse(prod.specifications);
    } catch {
      return {};
    }
  };

  const specsA = parseSpecs(productA);
  const specsB = parseSpecs(productB);

  // Extract all unique spec keys
  const allSpecKeys = Array.from(
    new Set([...Object.keys(specsA), ...Object.keys(specsB)])
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
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)', background: 'rgba(0, 240, 255, 0.1)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.8rem' }}>
          <Scale size={16} /> Component Comparison Hub
        </div>
        <h1 style={{ fontSize: '2.5rem', margin: '0 0 0.8rem 0' }}>Compare Hardware Specs</h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto', fontSize: '1rem' }}>
          Select any two PC components to compare real-world specifications, pricing, seller ratings, and stock side-by-side.
        </p>
      </div>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '2.5rem' }}>
        <button
          type="button"
          className="btn"
          style={{
            padding: '0.5rem 1.2rem',
            fontSize: '0.9rem',
            borderRadius: '20px',
            background: selectedCategory === 'all' ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.05)',
            color: selectedCategory === 'all' ? '#000' : 'var(--text-primary)',
            border: selectedCategory === 'all' ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
            fontWeight: selectedCategory === 'all' ? 'bold' : 'normal',
            cursor: 'pointer'
          }}
          onClick={() => handleCategoryChange('all')}
        >
          All Components ({products.length})
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
                padding: '0.5rem 1.2rem',
                fontSize: '0.9rem',
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
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2.5rem', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '1.5rem', alignItems: 'center' }}>
          
          {/* Dropdown 1 */}
          <div>
            <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
              Component 1 (Left)
            </label>
            <select
              className="form-control"
              value={productAId}
              onChange={(e) => setProductAId(e.target.value)}
              style={{ fontSize: '0.95rem', cursor: 'pointer', background: 'rgba(0,0,0,0.5)' }}
            >
              <option value="">-- Choose First Component --</option>
              {filteredProducts.map(p => (
                <option key={p.id} value={p.id} disabled={String(p.id) === String(productBId)}>
                  {p.title} (Rs. {parseFloat(p.price).toLocaleString('en-IN')})
                </option>
              ))}
            </select>
          </div>

          {/* VS Badge */}
          <div style={{
            width: '45px',
            height: '45px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            color: '#000',
            fontWeight: '900',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(0, 240, 255, 0.4)',
            marginTop: '1.3rem'
          }}>
            VS
          </div>

          {/* Dropdown 2 */}
          <div>
            <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--accent-secondary)' }}>
              Component 2 (Right)
            </label>
            <select
              className="form-control"
              value={productBId}
              onChange={(e) => setProductBId(e.target.value)}
              style={{ fontSize: '0.95rem', cursor: 'pointer', background: 'rgba(0,0,0,0.5)' }}
            >
              <option value="">-- Choose Second Component --</option>
              {filteredProducts.map(p => (
                <option key={p.id} value={p.id} disabled={String(p.id) === String(productAId)}>
                  {p.title} (Rs. {parseFloat(p.price).toLocaleString('en-IN')})
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Comparison Display */}
      {(!productA && !productB) ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <Scale size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3>Select Components to Compare</h3>
          <p>Please choose two components from the dropdown menus above to view the side-by-side comparison.</p>
        </div>
      ) : (
        <div>
          
          {/* Side-by-Side Product Header Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
            
            {/* Card A */}
            <div className="glass-panel" style={{ padding: '1.8rem', border: '1px solid rgba(0, 240, 255, 0.3)', display: 'flex', flexDirection: 'column' }}>
              {productA ? (
                <>
                  <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.2rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', overflow: 'hidden' }}>
                    {productA.image_url ? (
                      <img src={productA.image_url} alt={productA.title} style={{ maxHeight: '160px', maxWidth: '100%', objectFit: 'contain' }} />
                    ) : (
                      <Package size={48} color="var(--text-secondary)" />
                    )}
                  </div>

                  <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', textTransform: 'uppercase', fontWeight: 'bold' }}>
                    {productA.category_name}
                  </span>
                  <h3 style={{ fontSize: '1.3rem', margin: '0.4rem 0 0.8rem 0', lineHeight: '1.3' }}>{productA.title}</h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                      Rs. {parseFloat(productA.price).toLocaleString('en-IN')}
                    </span>
                    <span style={{
                      background: productA.stock_quantity > 0 ? 'rgba(0, 255, 150, 0.15)' : 'rgba(255, 51, 102, 0.15)',
                      color: productA.stock_quantity > 0 ? 'var(--success)' : 'var(--danger)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold'
                    }}>
                      {productA.stock_quantity > 0 ? `In Stock (${productA.stock_quantity})` : 'Out of Stock'}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.2rem' }}>
                    Sold by: <strong>{productA.shop_name || productA.seller_name}</strong>
                    {isSellerFlagged(productA) && (
                      <span style={{ color: 'var(--warning)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', marginLeft: '0.4rem' }}>
                        <AlertTriangle size={12} /> (Low Rated Seller)
                      </span>
                    )}
                  </div>

                  <div style={{ marginTop: 'auto', display: 'flex', gap: '0.8rem' }}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.7rem' }}
                      disabled={productA.stock_quantity <= 0}
                      onClick={() => handleAddToCart(productA)}
                    >
                      <ShoppingCart size={16} /> Add to Cart
                    </button>
                    <Link
                      to={`/product/${productA.id}`}
                      className="btn btn-outline"
                      style={{ padding: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      title="View Details"
                    >
                      <ExternalLink size={16} />
                    </Link>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', margin: 'auto' }}>
                  Please select Component 1 from above.
                </div>
              )}
            </div>

            {/* Card B */}
            <div className="glass-panel" style={{ padding: '1.8rem', border: '1px solid rgba(255, 0, 128, 0.3)', display: 'flex', flexDirection: 'column' }}>
              {productB ? (
                <>
                  <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.2rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', overflow: 'hidden' }}>
                    {productB.image_url ? (
                      <img src={productB.image_url} alt={productB.title} style={{ maxHeight: '160px', maxWidth: '100%', objectFit: 'contain' }} />
                    ) : (
                      <Package size={48} color="var(--text-secondary)" />
                    )}
                  </div>

                  <span style={{ fontSize: '0.8rem', color: 'var(--accent-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>
                    {productB.category_name}
                  </span>
                  <h3 style={{ fontSize: '1.3rem', margin: '0.4rem 0 0.8rem 0', lineHeight: '1.3' }}>{productB.title}</h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--accent-secondary)' }}>
                      Rs. {parseFloat(productB.price).toLocaleString('en-IN')}
                    </span>
                    <span style={{
                      background: productB.stock_quantity > 0 ? 'rgba(0, 255, 150, 0.15)' : 'rgba(255, 51, 102, 0.15)',
                      color: productB.stock_quantity > 0 ? 'var(--success)' : 'var(--danger)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold'
                    }}>
                      {productB.stock_quantity > 0 ? `In Stock (${productB.stock_quantity})` : 'Out of Stock'}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.2rem' }}>
                    Sold by: <strong>{productB.shop_name || productB.seller_name}</strong>
                    {isSellerFlagged(productB) && (
                      <span style={{ color: 'var(--warning)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', marginLeft: '0.4rem' }}>
                        <AlertTriangle size={12} /> (Low Rated Seller)
                      </span>
                    )}
                  </div>

                  <div style={{ marginTop: 'auto', display: 'flex', gap: '0.8rem' }}>
                    <button
                      type="button"
                      className="btn"
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.7rem', background: 'var(--accent-secondary)', color: '#fff', border: 'none' }}
                      disabled={productB.stock_quantity <= 0}
                      onClick={() => handleAddToCart(productB)}
                    >
                      <ShoppingCart size={16} /> Add to Cart
                    </button>
                    <Link
                      to={`/product/${productB.id}`}
                      className="btn btn-outline"
                      style={{ padding: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      title="View Details"
                    >
                      <ExternalLink size={16} />
                    </Link>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', margin: 'auto' }}>
                  Please select Component 2 from above.
                </div>
              )}
            </div>

          </div>

          {/* Detailed Specifications Table */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Sparkles size={20} color="var(--accent-primary)" /> Side-by-Side Specifications
            </h2>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid rgba(255, 255, 255, 0.1)', textAlign: 'left' }}>
                    <th style={{ padding: '1rem', width: '30%', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.8rem' }}>Feature / Spec</th>
                    <th style={{ padding: '1rem', width: '35%', color: 'var(--accent-primary)' }}>{productA?.title || 'Component 1'}</th>
                    <th style={{ padding: '1rem', width: '35%', color: 'var(--accent-secondary)' }}>{productB?.title || 'Component 2'}</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Basic rows */}
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', background: 'rgba(255, 255, 255, 0.02)' }}>
                    <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Price</td>
                    <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                      {productA ? `Rs. ${parseFloat(productA.price).toLocaleString('en-IN')}` : '-'}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--accent-secondary)' }}>
                      {productB ? `Rs. ${parseFloat(productB.price).toLocaleString('en-IN')}` : '-'}
                    </td>
                  </tr>

                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Category</td>
                    <td style={{ padding: '1rem' }}>{productA?.category_name || '-'}</td>
                    <td style={{ padding: '1rem' }}>{productB?.category_name || '-'}</td>
                  </tr>

                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', background: 'rgba(255, 255, 255, 0.02)' }}>
                    <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Customer Rating</td>
                    <td style={{ padding: '1rem' }}>
                      {productA?.avg_rating > 0 ? `⭐ ${productA.avg_rating} / 10 (${productA.review_count || 0} reviews)` : 'No ratings yet'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {productB?.avg_rating > 0 ? `⭐ ${productB.avg_rating} / 10 (${productB.review_count || 0} reviews)` : 'No ratings yet'}
                    </td>
                  </tr>

                  {/* Dynamic Spec rows from JSON specifications */}
                  {allSpecKeys.length > 0 ? (
                    allSpecKeys.map((key, idx) => (
                      <tr
                        key={key}
                        style={{
                          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                          background: idx % 2 === 1 ? 'rgba(255, 255, 255, 0.02)' : 'transparent'
                        }}
                      >
                        <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>{key}</td>
                        <td style={{ padding: '1rem' }}>{specsA[key] || '-'}</td>
                        <td style={{ padding: '1rem' }}>{specsB[key] || '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No additional technical specifications recorded in database for these components.
                      </td>
                    </tr>
                  )}
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
            top: '20px',
            right: '20px',
            background: 'rgba(10, 25, 20, 0.95)',
            border: '1px solid var(--success)',
            color: 'var(--success)',
            padding: '0.9rem 1.4rem',
            borderRadius: '8px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            zIndex: 1300,
            fontWeight: 'bold',
            fontSize: '0.95rem',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <Check size={18} /> {toastMessage}
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
