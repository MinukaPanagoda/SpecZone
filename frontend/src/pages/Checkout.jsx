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
  AlertCircle,
  Building2,
  Upload,
  Image as ImageIcon,
  Copy,
  Trash2,
  FileCheck
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
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' or 'bank_transfer'
  const [slipImage, setSlipImage] = useState(null); // base64 string
  const [slipPreview, setSlipPreview] = useState(null);
  const [slipFileName, setSlipFileName] = useState('');
  const [slipFileSize, setSlipFileSize] = useState('');
  const [copiedAccount, setCopiedAccount] = useState(null);

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

  const handleSlipFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Slip image size must be less than 5MB.');
      return;
    }

    // Check type
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    setError('');
    setSlipFileName(file.name);
    setSlipFileSize((file.size / 1024).toFixed(1) + ' KB');

    const reader = new FileReader();
    reader.onloadend = () => {
      setSlipPreview(reader.result);
      setSlipImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveSlip = () => {
    setSlipImage(null);
    setSlipPreview(null);
    setSlipFileName('');
    setSlipFileSize('');
  };

  const copyToClipboard = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedAccount(id);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  // Group unique sellers from cart items for bank details
  const uniqueSellers = Object.values(
    cartItems.reduce((acc, item) => {
      const sId = item.seller_id || 0;
      if (!acc[sId]) {
        acc[sId] = {
          seller_id: sId,
          seller_name: item.seller_name || 'Verified Merchant',
          shop_name: item.shop_name || 'Storefront',
          bank_name: item.bank_name || 'Bank of Ceylon',
          bank_account_number: item.bank_account_number || '7890123456',
          bank_account_name: item.bank_account_name || (item.seller_name || 'SpecZone Seller'),
          bank_branch: item.bank_branch || 'Colombo Main Branch',
          totalAmount: 0
        };
      }
      acc[sId].totalAmount += (item.price * item.quantity);
      return acc;
    }, {})
  );

  const validateCheckoutForm = () => {
    if (!shipping.fullName || !shipping.address || !shipping.city || !shipping.phone) {
      setError('Please fill in all required shipping details.');
      return false;
    }
    if (paymentMethod === 'bank_transfer' && !slipImage) {
      setError('Please upload a photo or screenshot of your bank deposit / transfer slip.');
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
          payment_method: paymentMethod,
          payment_ref: paymentMethod === 'bank_transfer' ? 'BANK_TRANSFER' : 'COD',
          slip_image: paymentMethod === 'bank_transfer' ? slipImage : null,
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
        }, 2600);
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
    <div className="container" style={{ padding: '4rem 1rem', maxWidth: '1080px', minHeight: '80vh' }}>
      
      {/* Checkout Header */}
      <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.4rem', margin: '0 0 0.5rem 0', fontWeight: '800' }}>
          Secure Checkout
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: 0 }}>
          Confirm your delivery address and choose your preferred payment method
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
                <span style={{ fontSize: '0.75rem', background: 'rgba(0, 240, 255, 0.1)', color: 'var(--accent-primary)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(0, 240, 255, 0.2)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Check size={12} /> Autofilled from Profile
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
              {/* Cash on Delivery Option */}
              <div
                onClick={() => setPaymentMethod('cod')}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  padding: '1.25rem',
                  borderRadius: '10px',
                  border: `2px solid ${paymentMethod === 'cod' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.08)'}`,
                  background: paymentMethod === 'cod' ? 'rgba(0, 240, 255, 0.08)' : 'rgba(255,255,255,0.02)',
                  boxShadow: paymentMethod === 'cod' ? '0 0 20px rgba(0, 240, 255, 0.12)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: paymentMethod === 'cod' ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: paymentMethod === 'cod' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    flexShrink: 0
                  }}
                >
                  <DollarSign size={20} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '1.05rem', color: '#fff' }}>
                      Cash on Delivery (COD)
                    </div>
                    {paymentMethod === 'cod' && (
                      <span style={{ fontSize: '0.75rem', background: 'rgba(0, 255, 150, 0.15)', color: 'var(--success)', padding: '0.2rem 0.6rem', borderRadius: '20px', fontWeight: 'bold', border: '1px solid rgba(0, 255, 150, 0.3)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <CheckCircle2 size={12} /> Selected
                      </span>
                    )}
                  </div>

                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
                    Pay with physical cash directly to the delivery courier at your doorstep upon receiving the items.
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--success)', fontSize: '0.78rem', fontWeight: '500' }}>
                    <ShieldCheck size={14} /> Zero advance payment required. Safe delivery.
                  </div>
                </div>
              </div>

              {/* Direct Bank Transfer & Slip Option */}
              <div
                onClick={() => setPaymentMethod('bank_transfer')}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  padding: '1.25rem',
                  borderRadius: '10px',
                  border: `2px solid ${paymentMethod === 'bank_transfer' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.08)'}`,
                  background: paymentMethod === 'bank_transfer' ? 'rgba(0, 240, 255, 0.08)' : 'rgba(255,255,255,0.02)',
                  boxShadow: paymentMethod === 'bank_transfer' ? '0 0 20px rgba(0, 240, 255, 0.12)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: paymentMethod === 'bank_transfer' ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: paymentMethod === 'bank_transfer' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    flexShrink: 0
                  }}
                >
                  <Building2 size={20} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '1.05rem', color: '#fff' }}>
                      Direct Bank Transfer / Slip Upload
                    </div>
                    {paymentMethod === 'bank_transfer' && (
                      <span style={{ fontSize: '0.75rem', background: 'rgba(0, 240, 255, 0.15)', color: 'var(--accent-primary)', padding: '0.2rem 0.6rem', borderRadius: '20px', fontWeight: 'bold', border: '1px solid rgba(0, 240, 255, 0.3)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <CheckCircle2 size={12} /> Selected
                      </span>
                    )}
                  </div>

                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
                    Deposit or transfer money to the vendor's bank account and upload your deposit slip or transaction receipt.
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-primary)', fontSize: '0.78rem', fontWeight: '500' }}>
                    <FileCheck size={14} /> Verified directly by the vendor before shipment.
                  </div>
                </div>
              </div>

              {/* Bank Transfer Details & Upload Section */}
              {paymentMethod === 'bank_transfer' && (
                <div
                  style={{
                    marginTop: '1rem',
                    padding: '1.5rem',
                    borderRadius: '10px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(0, 240, 255, 0.25)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.4rem',
                    animation: 'fadeIn 0.25s ease'
                  }}
                >
                  {/* Seller Bank Details Card(s) */}
                  <div>
                    <h4 style={{ margin: '0 0 0.8rem 0', fontSize: '0.95rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Building2 size={16} /> Merchant Bank Account Details
                    </h4>
                    <p style={{ margin: '0 0 1rem 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      Please transfer the exact amount to the following bank account before uploading your receipt slip:
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                      {uniqueSellers.map(s => (
                        <div
                          key={s.seller_id}
                          style={{
                            padding: '1rem',
                            borderRadius: '8px',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.08)'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 'bold', color: '#fff', fontSize: '0.9rem' }}>
                              {s.shop_name || s.seller_name}
                            </span>
                            <span style={{ fontWeight: 'bold', color: 'var(--accent-primary)', fontSize: '0.9rem' }}>
                              Amount: Rs. {s.totalAmount.toLocaleString('en-IN')}
                            </span>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.6rem', fontSize: '0.82rem' }}>
                            <div>
                              <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem' }}>Bank Name</span>
                              <strong style={{ color: '#fff' }}>{s.bank_name}</strong>
                            </div>
                            <div>
                              <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem' }}>Account Number</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <strong style={{ color: '#fff', fontFamily: 'monospace', fontSize: '0.95rem' }}>
                                  {s.bank_account_number}
                                </strong>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(s.bank_account_number, s.seller_id);
                                  }}
                                  title="Copy Account Number"
                                  style={{
                                    background: 'rgba(0, 240, 255, 0.1)',
                                    border: '1px solid rgba(0, 240, 255, 0.3)',
                                    color: 'var(--accent-primary)',
                                    borderRadius: '4px',
                                    padding: '0.2rem 0.4rem',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.2rem',
                                    fontSize: '0.7rem'
                                  }}
                                >
                                  {copiedAccount === s.seller_id ? (
                                    <><Check size={11} /> Copied</>
                                  ) : (
                                    <><Copy size={11} /> Copy</>
                                  )}
                                </button>
                              </div>
                            </div>
                            <div>
                              <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem' }}>Account Holder</span>
                              <strong style={{ color: '#fff' }}>{s.bank_account_name}</strong>
                            </div>
                            <div>
                              <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem' }}>Branch</span>
                              <strong style={{ color: '#fff' }}>{s.bank_branch}</strong>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bank Slip Upload Dropzone */}
                  <div>
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Upload size={16} color="var(--accent-primary)" /> Upload Payment / Deposit Slip *
                    </h4>
                    <p style={{ margin: '0 0 0.8rem 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Upload a clear photo or screenshot of the transaction receipt (JPG, PNG, WEBP, max 5MB).
                    </p>

                    {!slipPreview ? (
                      <label
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.75rem',
                          padding: '2rem 1.5rem',
                          borderRadius: '10px',
                          border: '2px dashed rgba(0, 240, 255, 0.35)',
                          background: 'rgba(0, 240, 255, 0.03)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          textAlign: 'center'
                        }}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const file = e.dataTransfer?.files?.[0];
                          if (file) {
                            handleSlipFileChange({ target: { files: [file] } });
                          }
                        }}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleSlipFileChange}
                          style={{ display: 'none' }}
                        />
                        <div
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: 'rgba(0, 240, 255, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--accent-primary)'
                          }}
                        >
                          <Upload size={24} />
                        </div>
                        <div>
                          <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold', fontSize: '0.9rem' }}>
                            Click to browse
                          </span>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}> or drag and drop your slip image</span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                          PNG, JPG, JPEG, WEBP up to 5MB
                        </span>
                      </label>
                    ) : (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          padding: '0.9rem 1.2rem',
                          borderRadius: '8px',
                          background: 'rgba(0, 255, 150, 0.08)',
                          border: '1px solid rgba(0, 255, 150, 0.3)',
                          flexWrap: 'wrap'
                        }}
                      >
                        <div
                          style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '6px',
                            overflow: 'hidden',
                            border: '1px solid rgba(255,255,255,0.2)',
                            flexShrink: 0,
                            position: 'relative'
                          }}
                        >
                          <img
                            src={slipPreview}
                            alt="Slip preview"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>

                        <div style={{ flex: 1, minWidth: '160px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--success)', fontWeight: 'bold', fontSize: '0.88rem' }}>
                            <CheckCircle2 size={16} /> Slip Attached
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '240px' }}>
                            {slipFileName || 'payment_slip.jpg'}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                            {slipFileSize}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleRemoveSlip}
                          style={{
                            background: 'rgba(255, 51, 102, 0.15)',
                            border: '1px solid rgba(255, 51, 102, 0.3)',
                            color: 'var(--danger)',
                            borderRadius: '6px',
                            padding: '0.4rem 0.8rem',
                            fontSize: '0.8rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
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
                <span style={{ color: paymentMethod === 'bank_transfer' ? 'var(--accent-primary)' : 'var(--success)', fontWeight: 'bold' }}>
                  {paymentMethod === 'bank_transfer' ? 'Bank Transfer (Slip Attached)' : 'Cash on Delivery (COD)'}
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
                  <>Submit Order with Bank Slip <ArrowRight size={18} /></>
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
              maxWidth: '460px',
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
              {paymentMethod === 'bank_transfer' ? 'Order Placed & Slip Submitted!' : 'Order Placed Successfully!'}
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
              {paymentMethod === 'bank_transfer'
                ? 'Your bank deposit slip has been submitted to the seller for review. You can track the verification status in your Orders tab.'
                : 'Payment method: Cash on Delivery (COD). Please have cash ready upon parcel delivery. Redirecting to your Orders dashboard...'}
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
                  animation: 'orderRedirectProgress 2.6s linear forwards'
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
