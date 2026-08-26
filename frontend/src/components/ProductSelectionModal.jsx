import React, { useState, useEffect } from 'react';
import { X, Search, Image as ImageIcon } from 'lucide-react';

const ProductSelectionModal = ({ isOpen, onClose, onSelect, categoryId, categoryName }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch('http://localhost/SpecZone/backend/api/products.php?action=read')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            // Filter products by the requested category
            // We use case-insensitive string matching or category_id matching depending on how we set up the slots
            const filtered = data.filter(p => {
               if (categoryId) return parseInt(p.category_id) === categoryId;
               if (categoryName) return p.category_name.toLowerCase().includes(categoryName.toLowerCase());
               return true;
            });
            setProducts(filtered);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching products:", err);
          setLoading(false);
        });
    }
  }, [isOpen, categoryId, categoryName]);

  if (!isOpen) return null;

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div className="glass-panel" style={{ 
        width: '90%', maxWidth: '800px', maxHeight: '90vh', 
        display: 'flex', flexDirection: 'column', padding: '1.5rem',
        backgroundColor: 'var(--bg-secondary)'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.5rem' }}>Select {categoryName || 'Component'}</h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
          <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Search products..." 
            className="form-control"
            style={{ paddingLeft: '2.5rem' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Product List */}
        <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.5rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Loading parts...</div>
          ) : filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              No products found in this category. (Make sure sellers have added parts for "{categoryName}").
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {filteredProducts.map(product => (
                <div key={product.id} style={{ 
                  display: 'flex', gap: '1rem', padding: '1rem', 
                  border: '1px solid var(--border-color)', borderRadius: '8px',
                  alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)'
                }}>
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                  ) : (
                    <div style={{ width: '80px', height: '80px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ImageIcon size={24} color="var(--text-secondary)" />
                    </div>
                  )}
                  
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '0.3rem' }}>{product.name}</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                      {product.stock > 0 ? <span style={{ color: 'var(--success)' }}>In Stock ({product.stock})</span> : <span style={{ color: 'var(--danger)' }}>Out of Stock</span>}
                    </p>
                    {product.specs && Object.keys(product.specs).length > 0 && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        {Object.entries(product.specs).slice(0, 3).map(([k, v]) => (
                          <span key={k}><strong>{k}:</strong> {v}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>
                      Rs. {parseFloat(product.price).toLocaleString('en-IN')}
                    </div>
                    <button 
                      className="btn btn-primary"
                      disabled={product.stock <= 0}
                      onClick={() => onSelect(product)}
                      style={{ padding: '0.5rem 1rem' }}
                    >
                      Select
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ProductSelectionModal;
