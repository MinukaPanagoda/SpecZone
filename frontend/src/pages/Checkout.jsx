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
  ShieldCheck,
  Lock,
  Smartphone,
  AlertCircle
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
  
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'bank_transfer' | 'cod'
  
  // Card Details State
  const [cardDetails, setCardDetails] = useState({
    cardholderName: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });
  
  // 3D Secure OTP Modal State
  const [show3DSModal, setShow3DSModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpProcessing, setOtpProcessing] = useState(false);
  const [otpError, setOtpError] = useState('');

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
      const name = `${user.first_name || ''} ${user.last_name || ''}`.trim();
      setShipping(prev => ({ ...prev, fullName: name }));
      if (!cardDetails.cardholderName) {
        setCardDetails(prev => ({ ...prev, cardholderName: name.toUpperCase() }));
      }
    }
  }, [user, cartItems, navigate, success, showSuccessPopup]);

  const handleChange = (e) => {
    setShipping({ ...shipping, [e.target.name]: e.target.value });
  };

  // Format Card Number (XXXX XXXX XXXX XXXX)
  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardDetails(prev => ({ ...prev, cardNumber: formatted }));
  };

  // Format Expiry (MM/YY)
  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 2) {
      val = `${val.slice(0, 2)}/${val.slice(2)}`;
    }
    setCardDetails(prev => ({ ...prev, expiry: val }));
  };

  // Format CVV (3-4 digits)
  const handleCvvChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCardDetails(prev => ({ ...prev, cvv: val }));
  };

  // Detect Card Brand
  const getCardBrand = (num) => {
    const clean = num.replace(/\s/g, '');
    if (clean.startsWith('4')) return 'Visa';
    if (/^5[1-5]/.test(clean) || /^2[2-7]/.test(clean)) return 'Mastercard';
    if (/^3[47]/.test(clean)) return 'American Express';
    return 'Credit/Debit Card';
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText('80092341556701');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const validateCheckoutForm = () => {
    if (!shipping.fullName || !shipping.address || !shipping.city || !shipping.phone) {
      setError('Please fill in all required shipping details.');
      return false;
    }

    if (paymentMethod === 'bank_transfer' && !bankRef.trim()) {
      setError('Please enter your Bank Transfer Reference / Transaction ID before submitting.');
      return false;
    }

    if (paymentMethod === 'card') {
      const cleanNum = cardDetails.cardNumber.replace(/\s/g, '');
      if (cleanNum.length < 16) {
        setError('Please enter a valid 16-digit card number.');
        return false;
      }
      if (!cardDetails.cardholderName.trim()) {
        setError('Cardholder name is required.');
        return false;
      }
      if (!cardDetails.expiry || cardDetails.expiry.length < 5) {
        setError('Please enter a valid expiration date (MM/YY).');
        return false;
      }
      if (!cardDetails.cvv || cardDetails.cvv.length < 3) {
        setError('Please enter a valid 3 or 4-digit CVV / CVC code.');
        return false;
      }
    }

    return true;
  };

  const handlePlaceOrder = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    setError('');

    if (!validateCheckoutForm()) return;

    // If online card payment, open 3D Secure modal first
    if (paymentMethod === 'card') {
      setShow3DSModal(true);
      return;
    }

    await executeOrderSubmission();
  };

  const executeOrderSubmission = async (paymentRefData = null) => {
    setLoading(true);

    try {
      const res = await fetch(`http://localhost/SpecZone/backend/api/checkout.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          buyer_id: user.id, 
          payment_method: paymentMethod,
          payment_ref: paymentRefData || bankRef || (paymentMethod === 'card' ? `CARD-${cardDetails.cardNumber.slice(-4)}-3DS` : 'COD'),
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

  // 3D Secure OTP verification handler
  const handleVerify3DS = async (e) => {
    e.preventDefault();
    setOtpError('');

    if (!otpCode || otpCode.length < 4) {
      setOtpError('Please enter the 6-digit OTP code sent to your registered mobile device.');
      return;
    }

    setOtpProcessing(true);

    // Simulate authentic 3D Secure Gateway verification latency
    setTimeout(async () => {
      setOtpProcessing(false);
      setShow3DSModal(false);
      await executeOrderSubmission(`CARD-${cardDetails.cardNumber.slice(-4)}-AUTH-${Math.floor(100000 + Math.random() * 900000)}`);
    }, 1200);
  };

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
              
              {/* Option 1: Credit / Debit Card (Online Payment Gateway) */}
              <label 
                style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '0.9rem', 
                  padding: '1.2rem', 
                  borderRadius: '8px', 
                  border: `1px solid ${paymentMethod === 'card' ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                  background: paymentMethod === 'card' ? 'rgba(0, 240, 255, 0.07)' : 'rgba(0,0,0,0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: paymentMethod === 'card' ? '0 0 15px rgba(0, 240, 255, 0.1)' : 'none'
                }}
              >
                <input 
                  type="radio" 
                  name="payment" 
                  value="card"
                  checked={paymentMethod === 'card'} 
                  onChange={() => setPaymentMethod('card')}
                  style={{ marginTop: '0.3rem', accentColor: 'var(--accent-primary)' }} 
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.05rem' }}>
                      <CreditCard size={18} color="var(--accent-primary)" /> Credit / Debit Card (Online Gateway)
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.7rem', background: 'rgba(255, 255, 255, 0.1)', color: '#fff', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 'bold' }}>
                        VISA
                      </span>
                      <span style={{ fontSize: '0.7rem', background: 'rgba(255, 255, 255, 0.1)', color: '#fff', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 'bold' }}>
                        Mastercard
                      </span>
                      {paymentMethod === 'card' && (
                        <span style={{ fontSize: '0.75rem', background: 'rgba(0, 240, 255, 0.15)', color: 'var(--accent-primary)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 'bold', marginLeft: '0.3rem' }}>
                          Selected
                        </span>
                      )}
                    </div>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    Instant & secure encrypted 256-bit checkout with 3D Secure / OTP authorization.
                  </p>
                </div>
              </label>

              {/* Card Details Form (When Card selected) */}
              {paymentMethod === 'card' && (
                <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '-0.5rem', marginBottom: '0.5rem', border: '1px solid rgba(0, 240, 255, 0.3)', background: 'rgba(0, 0, 0, 0.45)', borderRadius: '8px' }}>
                  
                  {/* Visual Card Preview Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)', fontSize: '0.9rem', fontWeight: 'bold' }}>
                      <Lock size={15} /> 256-Bit SSL Encrypted Card Gateway
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                      Detected: <span style={{ color: '#fff' }}>{getCardBrand(cardDetails.cardNumber)}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                        Cardholder Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="NAME AS PRINTED ON CARD"
                        value={cardDetails.cardholderName}
                        onChange={(e) => setCardDetails({ ...cardDetails, cardholderName: e.target.value.toUpperCase() })}
                        className="form-control"
                        style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                        16-Digit Card Number *
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          required
                          placeholder="4111 2222 3333 4444"
                          value={cardDetails.cardNumber}
                          onChange={handleCardNumberChange}
                          className="form-control"
                          style={{ fontFamily: 'monospace', fontSize: '1rem', letterSpacing: '1px' }}
                        />
                        <CreditCard size={18} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-primary)', opacity: 0.8 }} />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                          Expiration Date *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="MM/YY"
                          value={cardDetails.expiry}
                          onChange={handleExpiryChange}
                          className="form-control"
                          style={{ fontFamily: 'monospace', textAlign: 'center' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                          CVV / CVC *
                        </label>
                        <input
                          type="password"
                          required
                          placeholder="•••"
                          maxLength="4"
                          value={cardDetails.cvv}
                          onChange={handleCvvChange}
                          className="form-control"
                          style={{ fontFamily: 'monospace', textAlign: 'center', letterSpacing: '2px' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                      <ShieldCheck size={14} color="var(--success)" /> Verified by Visa & Mastercard Identity Check 3DS 2.0
                    </div>
                  </div>
                </div>
              )}

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

              {/* Bank Transfer Sub-panel */}
              {paymentMethod === 'bank_transfer' && (
                <div className="glass-panel" style={{ padding: '1.3rem', marginTop: '-0.5rem', marginBottom: '0.5rem', border: '1px solid rgba(0, 240, 255, 0.3)', background: 'rgba(0, 0, 0, 0.45)', borderRadius: '8px' }}>
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

              {/* Option 3: Cash on Delivery */}
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
                <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>
                  {paymentMethod === 'card' ? 'Online Card (3DS Secure)' : paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 'Cash on Delivery'}
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
                ) : paymentMethod === 'card' ? (
                  <>Pay Rs. {getCartTotal().toLocaleString('en-IN')} Now <ArrowRight size={18} /></>
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

      {/* 3D Secure / Verified by Visa Simulator Modal */}
      {show3DSModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2500,
            padding: '1.2rem',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '460px',
              padding: '2rem',
              borderRadius: '16px',
              border: '1px solid rgba(0, 240, 255, 0.4)',
              boxShadow: '0 0 40px rgba(0, 240, 255, 0.25)',
              background: 'linear-gradient(145deg, rgba(16, 20, 32, 0.98), rgba(8, 12, 20, 0.98))',
              position: 'relative',
              animation: 'popupScaleIn 0.25s ease-out'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <ShieldCheck size={24} color="var(--accent-primary)" />
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>3D Secure Authentication</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Verified by Visa / Mastercard ID Check</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShow3DSModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.2rem' }}
              >
                ✕
              </button>
            </div>

            {/* Merchant & Transaction Summary */}
            <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Merchant:</span>
                <strong style={{ color: 'var(--text-primary)' }}>SpecZone PC Store</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Card Number:</span>
                <span style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>•••• •••• •••• {cardDetails.cardNumber.slice(-4)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Amount to Charge:</span>
                <strong style={{ color: 'var(--accent-primary)', fontSize: '1rem' }}>Rs. {getCartTotal().toLocaleString('en-IN')}</strong>
              </div>
            </div>

            <form onSubmit={handleVerify3DS}>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <Smartphone size={32} color="var(--accent-primary)" style={{ margin: '0 auto 0.75rem' }} />
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  A one-time passcode (OTP) has been sent to your registered mobile number <strong>(•••••••{shipping.phone ? shipping.phone.slice(-4) : '4567'})</strong>.
                </p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  For testing, enter code <strong>123456</strong> or click Autofill below.
                </p>
              </div>

              {otpError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1rem', background: 'rgba(239, 68, 68, 0.1)', padding: '0.6rem', borderRadius: '6px' }}>
                  <AlertCircle size={16} /> {otpError}
                </div>
              )}

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <input
                  type="text"
                  maxLength="6"
                  required
                  placeholder="Enter 6-Digit OTP (123456)"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="form-control"
                  style={{
                    textAlign: 'center',
                    fontSize: '1.3rem',
                    letterSpacing: '6px',
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    padding: '0.75rem'
                  }}
                  autoFocus
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setOtpCode('123456')}
                  style={{
                    background: 'rgba(0, 240, 255, 0.1)',
                    border: '1px dashed var(--accent-primary)',
                    color: 'var(--accent-primary)',
                    padding: '0.35rem 0.8rem',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  ⚡ Autofill Demo OTP (123456)
                </button>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ flex: 1, padding: '0.8rem' }}
                  onClick={() => setShow3DSModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={otpProcessing}
                  className="btn btn-primary"
                  style={{ flex: 2, padding: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  {otpProcessing ? 'Authorizing Payment...' : 'Authorize & Pay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
              Payment confirmed via <strong>{paymentMethod === 'card' ? 'Online Card 3D Secure' : paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 'Cash on Delivery'}</strong>. Redirecting to your Orders dashboard...
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
