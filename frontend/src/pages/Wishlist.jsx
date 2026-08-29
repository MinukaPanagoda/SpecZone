import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart, Star, Image as ImageIcon } from 'lucide-react';

const Wishlist = () => {
  const { wishlistItems, removeFromWishlist, loading } = useWishlist();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="container" style={{ padding: '5rem 1rem', textAlign: 'center' }}>
        <Heart size={64} color="var(--accent-primary)" style={{ margin: '0 auto 1.5rem', opacity: 0.6 }} />
        <h2 style={{ marginBottom: '1rem', fontSize: '2rem' }}>Sign in to View Your Wishlist</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.1rem' }}>
          Keep track of components and rigs you want to buy later by signing into your account.
        </p>
        <Link to="/login" className="btn btn-primary" style={{ display: 'inline-flex', padding: '0.8rem 2.5rem' }}>
          Sign In
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container" style={{ padding: '5rem 1rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>Loading your saved components...</p>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="container" style={{ padding: '5rem 1rem', textAlign: 'center' }}>
        <Heart size={64} color="var(--text-secondary)" style={{ margin: '0 auto 1.5rem', opacity: 0.4 }} />
        <h2 style={{ marginBottom: '1rem', fontSize: '2rem' }}>Your Wishlist is Empty</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.1rem' }}>
          Explore our collection of high-performance components and save your favorites here.
        </p>
        <Link to="/shop" className="btn btn-primary" style={{ display: 'inline-flex', padding: '0.8rem 2rem' }}>
          Explore Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', margin: 0 }}>My Wishlist</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.3rem 0 0 0' }}>
            {wishlistItems.length} {wishlistItems.length === 1 ? 'saved item' : 'saved items'}
          </p>
        </div>
        <Link to="/shop" className="btn btn-outline" style={{ padding: '0.6rem 1.4rem' }}>
          Continue Shopping
        </Link>
      </div>

      <div className="product-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
        {wishlistItems.map((item) => (
          <div className="product-card" key={item.product_id} style={{ position: 'relative' }}>
            {/* Remove Button on Top Right */}
            <button
              type="button"
              onClick={() => removeFromWishlist(item.product_id)}
              aria-label="Remove from wishlist"
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                zIndex: 10,
                background: 'rgba(0, 0, 0, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: 'var(--danger)',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.background = 'rgba(255, 51, 102, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.65)';
              }}
            >
              <Trash2 size={16} />
            </button>

            {/* Product Image */}
            <Link to={`/product/${item.product_id}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ position: 'relative', height: '200px', backgroundColor: 'rgba(0,0,0,0.3)', borderTopLeftRadius: '10px', borderTopRightRadius: '10px', overflow: 'hidden' }}>
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <ImageIcon size={48} color="var(--text-secondary)" />
                  </div>
                )}
                {item.stock <= 0 && (
                  <div style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'var(--danger)', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    Out of Stock
                  </div>
                )}
              </div>
            </Link>

            {/* Product Details */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
              {item.category_name && (
                <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: '600' }}>
                  {item.category_name}
                </div>
              )}

              <Link to={`/product/${item.product_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', lineHeight: '1.3' }}>{item.title}</h3>
              </Link>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '1.2rem' }}>
                <Star size={16} color="var(--warning)" fill="var(--warning)" />
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  {item.review_count > 0 ? `${item.avg_rating} (${item.review_count})` : 'No reviews'}
                </span>
              </div>

              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                  Rs. {parseFloat(item.price).toLocaleString('en-IN')}
                </span>

                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                  disabled={item.stock <= 0}
                  onClick={() => {
                    addToCart(item.product_id, 1);
                    alert("Added to Cart!");
                  }}
                >
                  <ShoppingCart size={16} /> Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
