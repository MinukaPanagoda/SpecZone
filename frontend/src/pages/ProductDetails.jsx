import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, Star, ShieldCheck, Truck, Package, ArrowLeft, Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 10, comment: '' });
  const [reviewLoading, setReviewLoading] = useState(false);

  const [isResponsive, setIsResponsive] = useState(() => window.innerWidth <= 900);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`http://localhost/SpecZone/backend/api/reviews.php?action=read&product_id=${id}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setReviews(data);
      }
    } catch (err) {
      console.error("Failed to load reviews:", err);
    }
  };

  useEffect(() => {
    fetch(`http://localhost/SpecZone/backend/api/products.php?action=read_single&id=${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.id) {
          setProduct(data);
          fetchReviews();
        } else {
          setError('Product not found.');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Error loading product details.');
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    const handleResize = () => {
      setIsResponsive(window.innerWidth <= 900);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) return <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>Loading product details...</div>;
  if (error || !product) return <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center', color: 'var(--danger)' }}>{error}</div>;

  const handleAddToCart = () => {
    if (!user) {
      alert("Please login first to add to cart!");
      return;
    }
    addToCart(product.id, quantity);
    alert('Added to cart successfully!');
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user || user.role !== 'buyer') return;
    
    setReviewLoading(true);
    try {
      const res = await fetch('http://localhost/SpecZone/backend/api/reviews.php?action=create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          buyer_id: user.id,
          rating: newReview.rating,
          comment: newReview.comment
        })
      });
      if (res.ok) {
        setNewReview({ rating: 10, comment: '' });
        setShowReviewForm(false);
        fetchReviews(); // refresh the list
      }
    } catch (err) {
      console.error("Error submitting review:", err);
    } finally {
      setReviewLoading(false);
    }
  };

  const getRatingColor = (rating) => {
    if (rating <= 4) return 'var(--danger)'; // Red
    if (rating <= 7) return 'var(--warning)'; // Yellow
    return 'var(--success)'; // Green
  };

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + parseInt(r.rating), 0) / reviews.length).toFixed(1) 
    : 0;

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      
      <button 
        onClick={() => navigate(-1)} 
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: '2rem', fontSize: '1rem' }}
      >
        <ArrowLeft size={20} /> Back to Shop
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: isResponsive ? '1fr' : '1fr 1fr', gap: isResponsive ? '2rem' : '4rem', marginBottom: '4rem' }}>
        
        {/* Left: Image Gallery */}
        <div className="glass-panel" style={{ padding: isResponsive ? '1rem' : '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: isResponsive ? '260px' : '400px' }}>
          {product.image_url ? (
            <img src={product.image_url} alt={product.title} style={{ maxWidth: '100%', maxHeight: isResponsive ? '260px' : '400px', width: '100%', height: 'auto', objectFit: 'contain', borderRadius: '8px' }} />
          ) : (
            <div style={{ color: 'var(--text-secondary)' }}>No Image Available</div>
          )}
        </div>

        {/* Right: Product Info */}
        <div>
          <div style={{ color: 'var(--accent-primary)', fontWeight: 'bold', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem' }}>
            {product.category_name}
          </div>
          <h1 style={{ fontSize: isResponsive ? '1.8rem' : '2.5rem', marginBottom: '1rem', lineHeight: '1.2' }}>{product.title}</h1>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: reviews.length > 0 ? getRatingColor(avgRating) : 'var(--text-secondary)' }}>
              <Star size={18} fill="currentColor" />
              <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                {reviews.length > 0 ? `${avgRating}/10` : 'No Ratings'}
              </span>
            </div>
            <span>|</span>
            <span>{reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}</span>
            <span>|</span>
            <span>Seller: {product.seller_name}</span>
          </div>

          <div style={{ fontSize: isResponsive ? '1.8rem' : '2.5rem', fontWeight: 'bold', color: 'var(--accent-primary)', marginBottom: '1.5rem' }}>
            Rs. {parseFloat(product.price).toLocaleString('en-IN')}
          </div>

          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '2rem' }}>
            {product.description || "No description provided for this product."}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: isResponsive ? '1rem' : '1.5rem', marginBottom: '2.5rem', padding: '1.5rem 0', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
              <Package size={20} color="var(--accent-primary)" />
              {product.stock > 0 ? <span style={{ color: 'var(--success)' }}>In Stock ({product.stock})</span> : <span style={{ color: 'var(--danger)' }}>Out of Stock</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
              <ShieldCheck size={20} color="var(--accent-primary)" />
              Genuine Product
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
              <Truck size={20} color="var(--accent-primary)" />
              Fast Delivery
            </div>
          </div>

          {(!user || user.role === 'buyer') && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', padding: '0.2rem' }}>
                <button 
                  style={{ background: 'none', border: 'none', color: 'white', padding: '0.8rem 1rem', cursor: 'pointer' }}
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                >-</button>
                <span style={{ padding: '0 1rem', fontWeight: 'bold' }}>{quantity}</span>
                <button 
                  style={{ background: 'none', border: 'none', color: 'white', padding: '0.8rem 1rem', cursor: 'pointer' }}
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                >+</button>
              </div>
              <button 
                className="btn btn-primary" 
                style={{ flex: isResponsive ? '1 1 100%' : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '1.1rem' }}
                disabled={product.stock <= 0}
                onClick={handleAddToCart}
              >
                <ShoppingCart size={20} /> Add to Cart
              </button>

              <button
                type="button"
                className="btn btn-outline"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.8rem 1.2rem',
                  color: isInWishlist(product.id) ? 'var(--danger)' : 'var(--text-primary)',
                  borderColor: isInWishlist(product.id) ? 'var(--danger)' : 'var(--border-color)',
                  backgroundColor: isInWishlist(product.id) ? 'rgba(255, 51, 102, 0.1)' : 'transparent'
                }}
                onClick={() => toggleWishlist(product.id)}
                title={isInWishlist(product.id) ? "In Wishlist" : "Add to Wishlist"}
              >
                <Heart size={20} fill={isInWishlist(product.id) ? 'var(--danger)' : 'none'} />
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Specifications Section */}
      <div style={{ marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{ width: '4px', height: '24px', background: 'var(--accent-primary)', borderRadius: '4px' }}></div>
          Technical Specifications
        </h2>
        <div className="glass-panel" style={{ padding: '2rem' }}>
          {product.specs && Object.keys(product.specs).length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: isResponsive ? '1fr' : '1fr 1fr', gap: '0' }}>
              {Object.entries(product.specs).map(([key, value], index) => (
                <div key={key} style={{ 
                  display: isResponsive ? 'block' : 'flex', 
                  padding: '1rem', 
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  background: index % 4 === 0 || index % 4 === 3 ? 'rgba(0,0,0,0.2)' : 'transparent'
                }}>
                  <div style={{ width: isResponsive ? '100%' : '40%', color: 'var(--text-secondary)', fontWeight: 'bold', marginBottom: isResponsive ? '0.3rem' : 0 }}>{key}</div>
                  <div style={{ width: isResponsive ? '100%' : '60%' }}>{value}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: 'var(--text-secondary)' }}>No detailed specifications available for this product.</div>
          )}
        </div>
      </div>

      {/* Customer Reviews */}
      <div>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{ width: '4px', height: '24px', background: 'var(--accent-primary)', borderRadius: '4px' }}></div>
          Customer Reviews
        </h2>

        {reviews.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <Star size={48} color="rgba(255,255,255,0.1)" style={{ margin: '0 auto 1rem' }} />
            <h3>No Reviews Yet</h3>
            <p style={{ marginTop: '0.5rem' }}>Be the first to review this product!</p>
            {(!user || user.role === 'buyer') && !showReviewForm && (
              <button className="btn btn-outline" style={{ marginTop: '1.5rem' }} onClick={() => setShowReviewForm(true)}>Write a Review</button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {(!user || user.role === 'buyer') && !showReviewForm && (
              <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
                <button className="btn btn-outline" onClick={() => setShowReviewForm(true)}>Write a Review</button>
              </div>
            )}
            
            {reviews.map(review => (
              <div key={review.id} className="glass-panel" style={{ padding: '1.5rem', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '1rem' }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.3rem 0' }}>{review.buyer_name}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ 
                    display: 'flex', alignItems: 'center', gap: '0.3rem', 
                    color: getRatingColor(review.rating), fontWeight: 'bold', fontSize: '1.2rem'
                  }}>
                    <Star size={20} fill="currentColor" /> {review.rating}/10
                  </div>
                </div>
                <p style={{ margin: 0, lineHeight: '1.5', color: 'var(--text-secondary)' }}>{review.comment}</p>
              </div>
            ))}
          </div>
        )}

        {/* Review Form */}
        {showReviewForm && (
          <div className="glass-panel" style={{ padding: '2rem', marginTop: '2rem', borderTop: '2px solid var(--accent-primary)' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Write Your Review</h3>
            {user ? (
              <form onSubmit={handleSubmitReview}>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Rating (0 to 10)</span>
                    <span style={{ color: getRatingColor(newReview.rating), fontWeight: 'bold' }}>{newReview.rating}/10</span>
                  </label>
                  <input 
                    type="range" 
                    min="0" max="10" 
                    className="form-control" 
                    value={newReview.rating} 
                    onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value) })}
                    style={{ accentColor: getRatingColor(newReview.rating) }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Your Review</label>
                  <textarea 
                    className="form-control" 
                    rows="4" 
                    placeholder="What did you like or dislike about this product?"
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    required
                  ></textarea>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-outline" style={isResponsive ? { flex: '1 1 100%' } : undefined} onClick={() => setShowReviewForm(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={isResponsive ? { flex: '1 1 100%' } : undefined} disabled={reviewLoading}>
                    {reviewLoading ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                Please <a href="/login" style={{ color: 'var(--accent-primary)' }}>login</a> to write a review.
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};

export default ProductDetails;
