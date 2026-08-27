import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Truck, CheckCircle } from 'lucide-react';

const Checkout = () => {
  const { cartItems, getCartTotal, fetchCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [shipping, setShipping] = useState({
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    phone: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'buyer') {
      navigate('/login');
    }
    if (cartItems.length === 0 && !success) {
      navigate('/cart');
    }
    
    // Prefill name if available
    if (user && !shipping.fullName) {
      setShipping(prev => ({ ...prev, fullName: `${user.first_name} ${user.last_name}` }));
    }
  }, [user, cartItems, navigate, success]);

  const handleChange = (e) => {
    setShipping({ ...shipping, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`http://localhost/SpecZone/backend/api/checkout.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buyer_id: user.id, shipping_details: shipping })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setSuccess(true);
        await fetchCart(); // this will clear the local cart context
      } else {
        setError(data.message || 'Failed to place order.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container checkout-success" style={{ padding: '5rem 1rem', textAlign: 'center' }}>
        <CheckCircle className="checkout-success-icon" size={80} color="var(--success)" style={{ margin: '0 auto 1.5rem' }} />
        <h2 className="checkout-success-heading" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Order Placed Successfully!</h2>
        <p className="checkout-success-text" style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '1.1rem' }}>
          Thank you for your purchase, {shipping.fullName}. Your components are getting ready to ship.
        </p>
        <button className="btn btn-primary checkout-success-btn" onClick={() => navigate('/buyer/dashboard')} style={{ padding: '0.8rem 2rem' }}>
          Go to My Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <h2 style={{ marginBottom: '2rem', fontSize: '2rem' }}>Checkout</h2>

      {error && (
        <div className="alert alert-error" style={{ padding: '1rem', marginBottom: '1.5rem', borderRadius: '8px', background: 'rgba(255,50,50,0.1)', color: '#ff6b6b' }}>
          {error}
        </div>
      )}
      
      <div className="checkout-layout">
        
        {/* Shipping Form */}
        <div className="glass-panel checkout-shipping">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>
            <Truck size={20} color="var(--accent-primary)" /> Shipping Details
          </h3>
          
          <form id="checkout-form" onSubmit={handlePlaceOrder}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" name="fullName" className="form-control" value={shipping.fullName} onChange={handleChange} required />
            </div>
            
            <div className="form-group">
              <label className="form-label">Address</label>
              <textarea name="address" className="form-control" value={shipping.address} onChange={handleChange} required rows="3"></textarea>
            </div>
            
            <div className="checkout-city-postal">
              <div className="form-group">
                <label className="form-label">City</label>
                <input type="text" name="city" className="form-control" value={shipping.city} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Postal Code</label>
                <input type="text" name="postalCode" className="form-control" value={shipping.postalCode} onChange={handleChange} required />
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input type="tel" name="phone" className="form-control" value={shipping.phone} onChange={handleChange} required />
            </div>

            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '2rem 0 1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>
              <CreditCard size={20} color="var(--accent-primary)" /> Payment Method
            </h3>
            
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}>
                <input type="radio" name="payment" defaultChecked style={{ accentColor: 'var(--accent-primary)' }} />
                <span>Cash on Delivery (Pay when you receive the items)</span>
              </label>
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>Order Summary</h3>
            
            <div style={{ maxHeight: '250px', overflowY: 'auto', marginBottom: '1rem', paddingRight: '0.5rem' }}>
              {cartItems.map(item => (
                <div key={item.cart_id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', fontSize: '0.9rem' }}>
                  <div style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '1rem' }}>
                    {item.quantity}x {item.title}
                  </div>
                  <div style={{ fontWeight: 'bold' }}>Rs. {(item.price * item.quantity).toLocaleString('en-IN')}</div>
                </div>
              ))}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              <span>Subtotal</span>
              <span>Rs. {getCartTotal().toLocaleString('en-IN')}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              <span>Shipping</span>
              <span style={{ color: 'var(--success)' }}>Free</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '1.2rem', fontWeight: 'bold' }}>
              <span>Total</span>
              <span style={{ color: 'var(--accent-primary)' }}>Rs. {getCartTotal().toLocaleString('en-IN')}</span>
            </div>
            
            <button 
              type="submit"
              form="checkout-form"
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '1.5rem', padding: '1rem', fontSize: '1.1rem' }}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Place Order Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
