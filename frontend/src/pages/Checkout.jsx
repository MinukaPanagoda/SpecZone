import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, 
  Truck, 
  CheckCircle2, 
  Building2, 
  DollarSign, 
  Copy, 
  Check, 
  Printer, 
  ShoppingBag, 
  ArrowRight,
  PackageCheck,
  ShieldCheck
} from 'lucide-react';

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
  
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' | 'bank_transfer'
  const [bankRef, setBankRef] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [orderSnapshot, setOrderSnapshot] = useState(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'buyer') {
      navigate('/login');
    }
    if (cartItems.length === 0 && !success && !showSuccessPopup) {
      navigate('/cart');
    }
    
    // Prefill name if available
    if (user && !shipping.fullName) {
      setShipping(prev => ({ ...prev, fullName: `${user.first_name || ''} ${user.last_name || ''}`.trim() }));
    }
  }, [user, cartItems, navigate, success, showSuccessPopup]);

  const handleChange = (e) => {
    setShipping({ ...shipping, [e.target.name]: e.target.value });
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText('80092341556701');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePlaceOrder = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    setError('');

    if (!shipping.fullName || !shipping.address || !shipping.city || !shipping.phone) {
      setError('Please fill in all required shipping details.');
      return;
    }

    if (paymentMethod === 'bank_transfer' && !bankRef.trim()) {
      setError('Please enter your Bank Transfer Reference / Transaction ID before submitting.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`http://localhost/SpecZone/backend/api/checkout.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          buyer_id: user.id, 
          payment_method: paymentMethod,
          payment_ref: bankRef,
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

  // SUCCESS / FINISHING RECEIPT VIEW
  if (success && orderSnapshot) {
    return (
      <div className="container" style={{ padding: '3rem 1rem', maxWidth: '750px', margin: '0 auto' }}>
        <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: '12px', border: '1px solid rgba(0, 240, 255, 0.25)', position: 'relative' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              background: 'rgba(0, 255, 150, 0.15)',
              border: '2px solid var(--success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.2rem',
              color: 'var(--success)'
            }}>
              <CheckCircle2 size={40} />
            </div>
            <h1 style={{ fontSize: '2.2rem', margin: '0 0 0.5rem 0' }}>Order Confirmed!</h1>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '1rem' }}>
              Thank you, <strong>{orderSnapshot.shipping.fullName}</strong>. Your hardware order has been successfully placed.
            </p>
          </div>

          {/* Order Meta Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(0, 0, 0, 0.4)',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            gap: '0.8rem'
          }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>Order Reference</span>
              <strong style={{ fontSize: '1.1rem', color: 'var(--accent-primary)' }}>#ORD-{orderSnapshot.orderId}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>Placed Date</span>
              <span style={{ fontSize: '0.95rem' }}>{orderSnapshot.date}</span>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>Status</span>
              <span style={{
                background: 'rgba(0, 255, 150, 0.15)',
                color: 'var(--success)',
                padding: '0.2rem 0.6rem',
                borderRadius: '4px',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                textTransform: 'uppercase'
              }}>
                Confirmed
              </span>
            </div>
          </div>

          {/* Delivery Timeline Tracker */}
          <div style={{ marginBottom: '2rem', background: 'rgba(255, 255, 255, 0.03)', padding: '1.2rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PackageCheck size={18} color="var(--accent-primary)" /> Fulfillment & Delivery Progress
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.8rem', textAlign: 'center' }}>
              <div style={{ background: 'rgba(0, 240, 255, 0.1)', padding: '0.7rem', borderRadius: '6px', border: '1px solid var(--accent-primary)' }}>
                <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold', fontSize: '0.85rem' }}>1. Order Placed ✓</span>
              </div>
              <div style={{ background: 'rgba(0, 240, 255, 0.1)', padding: '0.7rem', borderRadius: '6px', border: '1px solid var(--accent-primary)' }}>
                <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold', fontSize: '0.85rem' }}>2. Payment Logged ✓</span>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '0.7rem', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>3. Seller Packing</span>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '0.7rem', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>4. Out for Delivery</span>
              </div>
            </div>
          </div>

          {/* Payment Method Notice Card */}
          <div style={{
            background: orderSnapshot.paymentMethod === 'bank_transfer' ? 'rgba(0, 240, 255, 0.08)' : 'rgba(0, 255, 150, 0.08)',
            border: `1px solid ${orderSnapshot.paymentMethod === 'bank_transfer' ? 'var(--accent-primary)' : 'var(--success)'}`,
            padding: '1.2rem',
            borderRadius: '8px',
            marginBottom: '2rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              {orderSnapshot.paymentMethod === 'bank_transfer' ? (
                <>
                  <Building2 size={20} color="var(--accent-primary)" />
                  <strong style={{ color: 'var(--accent-primary)', fontSize: '1.05rem' }}>
                    Payment Method: Direct Bank Transfer
                  </strong>
                </>
              ) : (
                <>
                  <DollarSign size={20} color="var(--success)" />
                  <strong style={{ color: 'var(--success)', fontSize: '1.05rem' }}>
                    Payment Method: Cash on Delivery (COD)
                  </strong>
                </>
              )}
            </div>

            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              {orderSnapshot.paymentMethod === 'bank_transfer' ? (
                <>
                  Transaction Reference <strong>"{orderSnapshot.bankRef}"</strong> has been recorded. Our billing team is verifying with Commercial Bank and scheduling your order for dispatch.
                </>
              ) : (
                <>
                  Please keep exact cash of <strong>Rs. {orderSnapshot.total.toLocaleString('en-IN')}</strong> ready for courier handover when items arrive at your address in <strong>{orderSnapshot.shipping.city}</strong>.
                </>
              )}
            </p>
          </div>

          {/* Items Summary Table */}
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.5rem' }}>
              Purchased Components ({orderSnapshot.items.length})
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {orderSnapshot.items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flex: 1, paddingRight: '1rem' }}>
                    {item.image_url && (
                      <img src={item.image_url} alt={item.title} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', background: 'rgba(0,0,0,0.3)' }} />
                    )}
                    <div>
                      <span style={{ fontWeight: '500' }}>{item.title}</span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'block' }}>Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <div style={{ fontWeight: 'bold' }}>
                    Rs. {(parseFloat(item.price) * item.quantity).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}

              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '0.8rem', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  <span>Subtotal</span>
                  <span>Rs. {orderSnapshot.total.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  <span>Shipping Delivery Fee</span>
                  <span style={{ color: 'var(--success)' }}>FREE</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                  <span>Grand Total</span>
                  <span>Rs. {orderSnapshot.total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Address Details */}
          <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '1.2rem', borderRadius: '8px', marginBottom: '2rem', fontSize: '0.9rem' }}>
            <h5 style={{ margin: '0 0 0.6rem 0', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
              Delivery Destination
            </h5>
            <p style={{ margin: '0 0 0.3rem 0', fontWeight: 'bold', fontSize: '1rem' }}>{orderSnapshot.shipping.fullName}</p>
            <p style={{ margin: '0 0 0.3rem 0', color: 'var(--text-secondary)' }}>{orderSnapshot.shipping.address}, {orderSnapshot.shipping.city} ({orderSnapshot.shipping.postalCode})</p>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Phone: {orderSnapshot.shipping.phone}</p>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-outline"
              style={{ flex: 1, minWidth: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              onClick={() => window.print()}
            >
              <Printer size={18} /> Print Receipt
            </button>
            <button
              type="button"
              className="btn btn-primary"
              style={{ flex: 1.5, minWidth: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              onClick={() => navigate('/buyer/dashboard')}
            >
              <ShoppingBag size={18} /> View in My Dashboard
            </button>
          </div>

        </div>
      </div>
    );
  }

  // CHECKOUT FORM VIEW
  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <h2 style={{ marginBottom: '2rem', fontSize: '2rem' }}>Checkout & Payment</h2>

      {error && (
        <div className="alert alert-error" style={{ padding: '1rem', marginBottom: '1.5rem', borderRadius: '8px', background: 'rgba(255,50,50,0.1)', color: '#ff6b6b', border: '1px solid rgba(255,50,50,0.2)' }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handlePlaceOrder}>
        <div className="checkout-layout">
          
          {/* Shipping & Payment Form */}
          <div className="glass-panel checkout-shipping">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>
              <Truck size={20} color="var(--accent-primary)" /> 1. Shipping Details
            </h3>
            
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input 
                type="text" 
                name="fullName" 
                className="form-control" 
                value={shipping.fullName} 
                onChange={handleChange} 
                required 
                placeholder="Recipient's Full Name" 
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Delivery Address *</label>
              <textarea 
                name="address" 
                className="form-control" 
                value={shipping.address} 
                onChange={handleChange} 
                required 
                rows="3" 
                placeholder="Street address, apartment, suite, etc."
              ></textarea>
            </div>
            
            <div className="checkout-city-postal">
              <div className="form-group">
                <label className="form-label">City / Town *</label>
                <input 
                  type="text" 
                  name="city" 
                  className="form-control" 
                  value={shipping.city} 
                  onChange={handleChange} 
                  required 
                  placeholder="e.g. Colombo, Kandy" 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Postal Code</label>
                <input 
                  type="text" 
                  name="postalCode" 
                  className="form-control" 
                  value={shipping.postalCode} 
                  onChange={handleChange} 
                  placeholder="e.g. 00100" 
                />
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Contact Phone Number *</label>
              <input 
                type="tel" 
                name="phone" 
                className="form-control" 
                value={shipping.phone} 
                onChange={handleChange} 
                required 
                placeholder="e.g. 077 123 4567" 
              />
            </div>

            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '2rem 0 1.2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>
              <CreditCard size={20} color="var(--accent-primary)" /> 2. Payment Method
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              
              {/* Option 1: Cash on Delivery */}
              <label 
                style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '0.9rem', 
                  padding: '1.2rem', 
                  borderRadius: '8px', 
                  border: `1px solid ${paymentMethod === 'cod' ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                  background: paymentMethod === 'cod' ? 'rgba(0, 240, 255, 0.07)' : 'rgba(0,0,0,0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: paymentMethod === 'cod' ? '0 0 15px rgba(0, 240, 255, 0.1)' : 'none'
                }}
              >
                <input 
                  type="radio" 
                  name="payment" 
                  value="cod"
                  checked={paymentMethod === 'cod'} 
                  onChange={() => setPaymentMethod('cod')}
                  style={{ marginTop: '0.3rem', accentColor: 'var(--accent-primary)' }} 
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.05rem' }}>
                      <DollarSign size={18} color="var(--accent-primary)" /> Cash on Delivery (COD)
                    </div>
                    {paymentMethod === 'cod' && (
                      <span style={{ fontSize: '0.75rem', background: 'rgba(0, 255, 150, 0.15)', color: 'var(--success)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 'bold' }}>
                        Selected
                      </span>
                    )}
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    Pay in cash directly to the courier upon physical delivery at your doorstep.
                  </p>
                </div>
              </label>

              {/* Option 2: Direct Bank Transfer */}
              <label 
                style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '0.9rem', 
                  padding: '1.2rem', 
                  borderRadius: '8px', 
                  border: `1px solid ${paymentMethod === 'bank_transfer' ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                  background: paymentMethod === 'bank_transfer' ? 'rgba(0, 240, 255, 0.07)' : 'rgba(0,0,0,0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: paymentMethod === 'bank_transfer' ? '0 0 15px rgba(0, 240, 255, 0.1)' : 'none'
                }}
              >
                <input 
                  type="radio" 
                  name="payment" 
                  value="bank_transfer"
                  checked={paymentMethod === 'bank_transfer'} 
                  onChange={() => setPaymentMethod('bank_transfer')}
                  style={{ marginTop: '0.3rem', accentColor: 'var(--accent-primary)' }} 
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.05rem' }}>
                      <Building2 size={18} color="var(--accent-primary)" /> Direct Bank Transfer / Deposit
                    </div>
                    {paymentMethod === 'bank_transfer' && (
                      <span style={{ fontSize: '0.75rem', background: 'rgba(0, 240, 255, 0.15)', color: 'var(--accent-primary)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 'bold' }}>
                        Selected
                      </span>
                    )}
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    Transfer amount to SpecZone bank account and enter your deposit / reference number.
                  </p>
                </div>
              </label>

            </div>

            {/* Bank Transfer Sub-panel */}
            {paymentMethod === 'bank_transfer' && (
              <div className="glass-panel" style={{ padding: '1.3rem', marginBottom: '1.5rem', border: '1px solid rgba(0, 240, 255, 0.3)', background: 'rgba(0, 0, 0, 0.45)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Building2 size={16} /> Official SpecZone Bank Account
                  </h4>
                  <button
                    type="button"
                    onClick={handleCopyAccount}
                    className="btn btn-outline"
                    style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                  >
                    {copied ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}
                    {copied ? 'Copied Acc No!' : 'Copy Account'}
                  </button>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.6rem', marginBottom: '1.2rem', background: 'rgba(255,255,255,0.03)', padding: '0.8rem', borderRadius: '6px' }}>
                  <div><strong>Bank:</strong> Commercial Bank of Ceylon</div>
                  <div><strong>Branch:</strong> Colombo Super Branch</div>
                  <div><strong>Account Name:</strong> SpecZone Technologies</div>
                  <div><strong>Account No:</strong> <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>8009 2341 5567 01</span></div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>
                    Bank Transfer Reference / Transaction ID <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. TXN-984210 or Deposit Slip Number"
                    value={bankRef}
                    onChange={(e) => setBankRef(e.target.value)}
                    style={{
                      borderColor: bankRef.trim() ? 'var(--success)' : undefined,
                      boxShadow: bankRef.trim() ? '0 0 10px rgba(0, 255, 150, 0.15)' : undefined
                    }}
                  />
                  {bankRef.trim() ? (
                    <small style={{ color: 'var(--success)', fontSize: '0.8rem', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Check size={14} /> Reference attached: {bankRef.trim()}
                    </small>
                  ) : (
                    <small style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.3rem', display: 'block' }}>
                      Enter the reference code from your online bank transfer or bank deposit slip.
                    </small>
                  )}
                </div>
              </div>
            )}

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
                <span>Payment Type</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>
                  {paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 'Cash on Delivery'}
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
                ) : paymentMethod === 'bank_transfer' ? (
                  <>Confirm & Submit Bank Order <ArrowRight size={18} /></>
                ) : (
                  <>Confirm Order (Pay on Delivery) <ArrowRight size={18} /></>
                )}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                <ShieldCheck size={14} color="var(--success)" /> 100% Secure Checkout & Genuine Components
              </div>
            </div>
          </div>

        </div>
      </form>

      {/* Small React Order Success Popup */}
      {showSuccessPopup && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.78)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '1.2rem',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '420px',
              padding: '2.2rem 1.8rem',
              borderRadius: '16px',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              boxShadow: '0 0 35px rgba(0, 240, 255, 0.2)',
              background: 'linear-gradient(145deg, rgba(18, 22, 34, 0.98), rgba(10, 14, 22, 0.98))',
              textAlign: 'center',
              position: 'relative',
              animation: 'popupScaleIn 0.25s ease-out'
            }}
          >
            {/* Animated Success Badge Icon */}
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(0, 230, 118, 0.15)',
                border: '2px solid var(--success)',
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
              Redirecting to your Orders dashboard...
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
