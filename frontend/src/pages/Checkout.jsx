import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Truck,
  CheckCircle2,
  DollarSign,
  Check,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Package,
  AlertCircle
} from 'lucide-react';

const Checkout = () => {
  const { cartItems, getCartTotal, fetchCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [shipping, setShipping] = useState({
    fullName: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '',
    address: user?.address || '',
    city: user?.city || '',
    postalCode: user?.postal_code || user?.postalCode || '',
    phone: user?.phone || ''
  });

  const [hasAutofilled, setHasAutofilled] = useState(false);
  const paymentMethod = 'cod'; // Only Cash on Delivery supported

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'buyer') {
      navigate('/login');
      return;
    }
    if (cartItems.length === 0 && !success && !showSuccessPopup) {
      navigate('/cart');
      return;
    }

    // Prefill from current auth user context
    const name = `${user.first_name || ''} ${user.last_name || ''}`.trim();
    setShipping(prev => ({
      fullName: prev.fullName || name,
      phone: prev.phone || user.phone || '',
      address: prev.address || user.address || '',
      city: prev.city || user.city || '',
      postalCode: prev.postalCode || user.postal_code || user.postalCode || ''
    }));

    // Fetch freshest profile from database to ensure fresh autofill
    if (user.id) {
      fetch(`http://localhost/SpecZone/backend/api/profile.php?action=get_profile&user_id=${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.profile) {
            const p = data.profile;
            const pName = `${p.first_name || ''} ${p.last_name || ''}`.trim();
            setShipping(prev => ({
              fullName: prev.fullName || pName || name,
              phone: prev.phone || p.phone || '',
              address: prev.address || p.address || '',
              city: prev.city || p.city || '',
              postalCode: prev.postalCode || p.postal_code || ''
            }));
            if (p.phone || p.address || p.city || p.postal_code) {
              setHasAutofilled(true);
            }
          }
        })
        .catch(err => console.error("Error autofilling checkout profile:", err));
    }
  }, [user, cartItems, navigate, success, showSuccessPopup]);

  const handleChange = (e) => {
    setShipping({ ...shipping, [e.target.name]: e.target.value });
  };

  const validateCheckoutForm = () => {
    if (!shipping.fullName || !shipping.address || !shipping.city || !shipping.phone) {
      setError('Please fill in all required shipping details.');
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    setError('');

    if (!validateCheckoutForm()) return;

    setLoading(true);

    try {
      const res = await fetch(`http://localhost/SpecZone/backend/api/checkout.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyer_id: user.id,
          payment_method: 'cod',
          payment_ref: 'COD',
          shipping_details: shipping
        })
      });

      const data = await res.json();

      if (res.ok) {
        setPlacedOrderId(data.order_id || null);
        setShowSuccessPopup(true);
        await fetchCart(); // clears the local cart context

        setTimeout(() => {
          navigate('/buyer/dashboard', { state: { tab: 'orders' } });
        }, 2200);
      } else {
        setError(data.message || 'Failed to place order.');
      }
    } catch {
      setError('An error occurred while connecting to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '4rem 1rem', maxWidth: '1000px', minHeight: '80vh' }}>
      
      {/* Checkout Header */}
      <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.4rem', margin: '0 0 0.5rem 0', fontWeight: '800' }}>
          Secure Checkout
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: 0 }}>
          Confirm your delivery address and finalize your order with Cash on Delivery
        </p>
      </div>

      {error && (
        <div style={{
          padding: '1rem 1.25rem',
          marginBottom: '2rem',
          borderRadius: '8px',
          backgroundColor: 'rgba(255, 51, 102, 0.12)',
          border: '1px solid var(--danger)',
          color: 'var(--danger)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
          
          {/* Shipping & Payment Column */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            
            {/* Step 1: Shipping Details */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontSize: '1.25rem' }}>
                <Truck size={20} color="var(--accent-primary)" /> 1. Shipping Details
              </h3>
              {hasAutofilled && (
                <span style={{ fontSize: '0.75rem', background: 'rgba(0, 240, 255, 0.1)', color: 'var(--accent-primary)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
                  ✓ Autofilled from Profile
                </span>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '2.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                  Full Recipient Name *
                </label>
                <input
                  type="text"
                  required
                  name="fullName"
                  placeholder="e.g. John Doe"
                  value={shipping.fullName}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                  Phone Number (For Delivery Confirmation) *
                </label>
                <input
                  type="tel"
                  required
                  name="phone"
                  placeholder="e.g. +94 77 123 4567"
                  value={shipping.phone}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                  Delivery Street Address *
                </label>
                <textarea
                  required
                  name="address"
                  rows="3"
                  placeholder="e.g. No 45/A, Lotus Avenue, Galle Road"
                  value={shipping.address}
                  onChange={handleChange}
                  className="form-control"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                    City / Town *
                  </label>
                  <input
                    type="text"
                    required
                    name="city"
                    placeholder="e.g. Colombo, Kandy"
                    value={shipping.city}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    placeholder="e.g. 00400"
                    value={shipping.postalCode}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Payment Method */}
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '2rem 0 1.2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>
              <DollarSign size={20} color="var(--accent-primary)" /> 2. Payment Method
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Cash on Delivery Only Option */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  padding: '1.4rem',
                  borderRadius: '10px',
                  border: '1px solid var(--accent-primary)',
                  background: 'rgba(0, 240, 255, 0.08)',
                  boxShadow: '0 0 20px rgba(0, 240, 255, 0.12)'
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: 'rgba(0, 240, 255, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-primary)',
                    flexShrink: 0
                  }}
                >
                  <DollarSign size={22} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#fff' }}>
                      Cash on Delivery (COD)
                    </div>
                    <span style={{ fontSize: '0.75rem', background: 'rgba(0, 255, 150, 0.15)', color: 'var(--success)', padding: '0.2rem 0.6rem', borderRadius: '20px', fontWeight: 'bold', border: '1px solid rgba(0, 255, 150, 0.3)' }}>
                      ✓ Guaranteed Delivery
                    </span>
                  </div>

                  <p style={{ margin: '0 0 0.6rem 0', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    Pay in cash directly to the delivery courier upon physical handover and inspection at your doorstep.
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', fontSize: '0.8rem', fontWeight: '500' }}>
                    <ShieldCheck size={15} /> Zero advance payment required. Safe and trusted delivery.
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Order Summary Column */}
          <div>
            <div className="glass-panel" style={{ padding: '1.5rem', position: 'sticky', top: '2rem' }}>
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>
                Order Summary
              </h3>

              <div style={{ maxHeight: '250px', overflowY: 'auto', marginBottom: '1rem', paddingRight: '0.5rem' }}>
                {cartItems.map(item => (
                  <div key={item.cart_id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', fontSize: '0.9rem' }}>
                    <div style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '1rem' }}>
                      <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>{item.quantity}x</span> {item.title}
                    </div>
                    <div style={{ fontWeight: 'bold' }}>Rs. {(item.price * item.quantity).toLocaleString('en-IN')}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', color: 'var(--text-secondary)' }}>
                <span>Subtotal</span>
                <span>Rs. {getCartTotal().toLocaleString('en-IN')}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', color: 'var(--text-secondary)' }}>
                <span>Delivery Shipping</span>
                <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>Free</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', borderTop: '1px dashed rgba(255,255,255,0.08)', paddingTop: '0.8rem' }}>
                <span>Payment Method</span>
                <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>
                  Cash on Delivery (COD)
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '1.2rem', fontWeight: 'bold' }}>
                <span>Total Amount</span>
                <span style={{ color: 'var(--accent-primary)' }}>Rs. {getCartTotal().toLocaleString('en-IN')}</span>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '1.5rem', padding: '1rem', fontSize: '1.05rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer' }}
                disabled={loading}
              >
                {loading ? (
                  'Processing Order...'
                ) : (
                  <>Confirm & Place Order (COD) <ArrowRight size={18} /></>
                )}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                <ShieldCheck size={14} color="var(--success)" /> 100% Genuine Hardware & Buyer Protection
              </div>
            </div>
          </div>

        </div>
      </form>

      {/* Order Success Popup Modal */}
      {showSuccessPopup && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '1rem',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '440px',
              padding: '2.5rem 2rem',
              textAlign: 'center',
              borderRadius: '16px',
              border: '1px solid rgba(0, 230, 118, 0.4)',
              boxShadow: '0 0 35px rgba(0, 230, 118, 0.25)',
              background: 'linear-gradient(145deg, rgba(20, 26, 38, 0.98), rgba(10, 14, 22, 0.98))',
              animation: 'popupScaleIn 0.3s ease-out'
            }}
          >
            {/* Success Icon */}
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'rgba(0, 230, 118, 0.15)',
                color: 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.2rem',
                boxShadow: '0 0 25px rgba(0, 230, 118, 0.3)'
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 'bold', margin: '0 0 0.5rem 0', color: '#ffffff' }}>
              Order Placed Successfully!
            </h3>

            {placedOrderId && (
              <div style={{
                display: 'inline-block',
                background: 'rgba(0, 240, 255, 0.1)',
                border: '1px solid rgba(0, 240, 255, 0.25)',
                borderRadius: '20px',
                padding: '0.2rem 0.8rem',
                fontSize: '0.85rem',
                color: 'var(--accent-primary)',
                fontWeight: '600',
                marginBottom: '0.8rem'
              }}>
                Order Ref: #{placedOrderId}
              </div>
            )}

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.5', margin: '0 0 1.2rem 0' }}>
              Payment method: <strong>Cash on Delivery (COD)</strong>. Please have cash ready upon parcel delivery. Redirecting to your Orders dashboard...
            </p>

            {/* Smooth Progress Bar */}
            <div style={{
              width: '100%',
              height: '4px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '2px',
              overflow: 'hidden',
              marginBottom: '1.2rem'
            }}>
              <div
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--accent-primary), var(--success))',
                  animation: 'orderRedirectProgress 2.2s linear forwards'
                }}
              />
            </div>

            <button
              type="button"
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                borderRadius: '8px'
              }}
              onClick={() => navigate('/buyer/dashboard', { state: { tab: 'orders' } })}
            >
              <ShoppingBag size={16} /> Go to Orders Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
