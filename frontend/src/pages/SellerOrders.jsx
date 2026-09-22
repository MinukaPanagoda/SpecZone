import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import SellerSidebar from '../components/SellerSidebar';
import {
  Package,
  Truck,
  CheckCircle,
  Menu,
  Clock,
  CheckCircle2,
  DollarSign,
  Building2,
  FileCheck,
  AlertCircle,
  AlertTriangle,
  Eye,
  X,
  XCircle,
  ExternalLink,
  ShieldCheck,
  Phone,
  MapPin
} from 'lucide-react';

const SellerOrders = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Bank slip modal state
  const [slipModalOpen, setSlipModalOpen] = useState(false);
  const [selectedSlipItem, setSelectedSlipItem] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'seller') {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = () => {
    setLoading(true);
    fetch(`http://localhost/SpecZone/backend/api/orders.php?action=read_seller&seller_id=${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setOrders(data);
          // If a slip modal is open, update selectedSlipItem from refreshed data
          if (selectedSlipItem) {
            const updated = data.find(i => i.item_id === selectedSlipItem.item_id);
            if (updated) setSelectedSlipItem(updated);
          }
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching seller orders:", err);
        setLoading(false);
      });
  };

  const handleStatusChange = async (itemId, newStatus) => {
    try {
      const res = await fetch(`http://localhost/SpecZone/backend/api/orders.php?action=update_item_status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seller_id: user.id,
          item_id: itemId,
          status: newStatus
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Order status updated successfully!", "success");
        fetchOrders();
      } else {
        showToast(data.message || "Failed to update status", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error updating status", "error");
    }
  };

  const handleSlipReview = async (decision) => {
    if (!selectedSlipItem) return;

    if (decision === 'rejected' && !rejectReason.trim()) {
      showToast("Please provide a reason for rejecting the payment slip.", "warning");
      return;
    }

    setReviewing(true);

    try {
      const res = await fetch(`http://localhost/SpecZone/backend/api/orders.php?action=review_slip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seller_id: user.id,
          item_id: selectedSlipItem.item_id,
          decision: decision,
          reject_reason: decision === 'rejected' ? rejectReason.trim() : ''
        })
      });

      const data = await res.json();

      if (res.ok) {
        showToast(
          decision === 'approved'
            ? "Payment slip approved! You can now ship the package."
            : "Payment slip marked as rejected. The buyer has been notified to re-upload.",
          decision === 'approved' ? "success" : "warning"
        );
        setIsRejecting(false);
        setRejectReason('');
        setSlipModalOpen(false);
        fetchOrders();
      } else {
        showToast(data.message || "Failed to review slip", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error reviewing payment slip", "error");
    } finally {
      setReviewing(false);
    }
  };

  const openSlipModal = (item) => {
    setSelectedSlipItem(item);
    setIsRejecting(false);
    setRejectReason(item.payment_reject_reason || '');
    setSlipModalOpen(true);
  };

  const getStatusColor = (status) => {
    if (status === 'delivered') return 'var(--success)';
    if (status === 'shipped') return 'var(--warning)';
    return 'var(--text-secondary)';
  };

  return (
    <div className="dashboard-layout">
      <SellerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="dashboard-main">
        {/* Mobile Header */}
        <div className="mobile-page-header">
          <button 
            type="button" 
            className="mobile-menu-toggle"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu size={24} />
          </button>
          <h2>Manage Orders</h2>
        </div>

        <div className="dashboard-content">
          <div className="dashboard-header desktop-only-header">
            <div>
              <h1 className="page-title">Manage Orders</h1>
              <p className="page-subtitle">Track fulfillment, verify bank deposit slips, and manage shipments</p>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="empty-state">
              <Package size={48} className="empty-icon" />
              <h3>No Orders Found</h3>
              <p>You have not received any orders for your products yet.</p>
            </div>
          ) : (
            <div className="glass-panel" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '780px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '1rem' }}>Order ID</th>
                  <th style={{ padding: '1rem' }}>Product</th>
                  <th style={{ padding: '1rem' }}>Buyer Details</th>
                  <th style={{ padding: '1rem' }}>Payment & Slip</th>
                  <th style={{ padding: '1rem' }}>Total</th>
                  <th style={{ padding: '1rem' }}>Shipment</th>
                  <th style={{ padding: '1rem', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(item => {
                  const isBank = item.payment_method === 'bank_transfer';
                  const isApproved = item.payment_status === 'approved';
                  const isRejected = item.payment_status === 'rejected';
                  const isUnderReview = item.payment_status === 'under_review';
                  const canShip = !isBank || isApproved;

                  return (
                    <tr key={item.item_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem', fontWeight: 'bold' }}>#{item.order_id}</td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: '500' }}>{item.product_title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          Qty: {item.quantity} × Rs. {parseFloat(item.unit_price).toLocaleString('en-IN')}
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: '500' }}>{item.buyer_name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{item.buyer_email}</div>
                        {item.buyer_phone && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.2rem' }}>
                            <Phone size={11} /> {item.buyer_phone}
                          </div>
                        )}
                        {item.buyer_address && (
                          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', marginTop: '0.15rem' }}>
                            {item.buyer_address}, {item.buyer_city}
                          </div>
                        )}
                      </td>

                      {/* Payment & Bank Slip Column */}
                      <td style={{ padding: '1rem' }}>
                        {/* Payment Method Badge */}
                        <div style={{ marginBottom: '0.4rem' }}>
                          {!isBank ? (
                            <span style={{
                              padding: '0.2rem 0.55rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              background: 'rgba(0, 240, 255, 0.1)',
                              color: 'var(--accent-primary)',
                              border: '1px solid rgba(0, 240, 255, 0.25)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}>
                              <DollarSign size={11} /> COD
                            </span>
                          ) : (
                            <span style={{
                              padding: '0.2rem 0.55rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              background: 'rgba(168, 85, 247, 0.12)',
                              color: '#c084fc',
                              border: '1px solid rgba(168, 85, 247, 0.25)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}>
                              <Building2 size={11} /> Bank Transfer
                            </span>
                          )}
                        </div>

                        {/* Slip Status & Modal Trigger */}
                        {isBank && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', alignItems: 'flex-start' }}>
                            {isApproved && (
                              <span style={{
                                padding: '0.15rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.72rem',
                                fontWeight: 'bold',
                                background: 'rgba(0, 255, 150, 0.15)',
                                color: 'var(--success)',
                                border: '1px solid rgba(0, 255, 150, 0.3)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                              }}>
                                <CheckCircle2 size={11} /> Slip Verified
                              </span>
                            )}
                            {isUnderReview && (
                              <span style={{
                                padding: '0.15rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.72rem',
                                fontWeight: 'bold',
                                background: 'rgba(255, 180, 0, 0.15)',
                                color: 'var(--warning)',
                                border: '1px solid rgba(255, 180, 0, 0.35)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                              }}>
                                <AlertCircle size={11} /> Slip Awaiting Review
                              </span>
                            )}
                            {isRejected && (
                              <span style={{
                                padding: '0.15rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.72rem',
                                fontWeight: 'bold',
                                background: 'rgba(255, 51, 102, 0.15)',
                                color: 'var(--danger)',
                                border: '1px solid rgba(255, 51, 102, 0.3)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                              }}>
                                <AlertTriangle size={11} /> Slip Rejected
                              </span>
                            )}
                            {item.payment_status === 'pending_slip' && (
                              <span style={{
                                padding: '0.15rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.72rem',
                                fontWeight: 'bold',
                                background: 'rgba(255, 255, 255, 0.08)',
                                color: 'var(--text-secondary)',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                              }}>
                                <Clock size={11} /> Awaiting Slip
                              </span>
                            )}

                            {/* Verify / View Slip Button */}
                            {item.payment_slip_url && (
                              <button
                                type="button"
                                onClick={() => openSlipModal(item)}
                                style={{
                                  background: isUnderReview ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255,255,255,0.06)',
                                  border: `1px solid ${isUnderReview ? 'var(--accent-primary)' : 'rgba(255,255,255,0.15)'}`,
                                  color: isUnderReview ? 'var(--accent-primary)' : '#fff',
                                  padding: '0.25rem 0.55rem',
                                  borderRadius: '5px',
                                  fontSize: '0.74rem',
                                  fontWeight: '600',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                  cursor: 'pointer',
                                  marginTop: '0.15rem'
                                }}
                              >
                                <Eye size={12} /> {isUnderReview ? 'Verify Slip' : 'View Slip'}
                              </button>
                            )}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '1rem', color: 'var(--accent-primary)' }}>
                          Rs. {(item.quantity * item.unit_price).toLocaleString('en-IN')}
                        </div>
                        <div style={{ marginTop: '0.3rem' }}>
                          {item.payout_status === 'paid' ? (
                            <span style={{ 
                              padding: '0.15rem 0.5rem', 
                              borderRadius: '4px', 
                              fontSize: '0.72rem', 
                              fontWeight: 'bold',
                              background: 'rgba(0, 255, 150, 0.15)',
                              color: 'var(--success)',
                              border: '1px solid rgba(0, 255, 150, 0.3)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }} title={`Paid via ${item.payout_ref || 'Bank Transfer'}`}>
                              <CheckCircle2 size={11} /> Payout Released
                            </span>
                          ) : (
                            <span style={{ 
                              padding: '0.15rem 0.5rem', 
                              borderRadius: '4px', 
                              fontSize: '0.72rem', 
                              fontWeight: 'bold',
                              background: 'rgba(255, 180, 0, 0.15)',
                              color: 'var(--warning)',
                              border: '1px solid rgba(255, 180, 0, 0.3)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}>
                              <Clock size={11} /> In Escrow
                            </span>
                          )}
                        </div>
                      </td>

                      <td style={{ padding: '1rem' }}>
                        <span style={{ 
                          padding: '0.3rem 0.6rem', 
                          borderRadius: '20px', 
                          fontSize: '0.78rem', 
                          fontWeight: 'bold',
                          textTransform: 'uppercase',
                          background: 'rgba(255,255,255,0.1)',
                          color: getStatusColor(item.status),
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}>
                          {item.status === 'delivered' ? (
                            <><CheckCircle2 size={12} /> Received</>
                          ) : item.status === 'shipped' ? (
                            <><Truck size={12} /> Shipped</>
                          ) : (
                            <><Clock size={12} /> Pending</>
                          )}
                        </span>
                      </td>

                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        {item.status === 'pending' && (
                          canShip ? (
                            <button 
                              className="btn btn-primary" 
                              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: '0 auto' }}
                              onClick={() => handleStatusChange(item.item_id, 'shipped')}
                            >
                              <Truck size={14} /> Ship Package
                            </button>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                              <button
                                className="btn"
                                disabled
                                style={{
                                  padding: '0.4rem 0.8rem',
                                  fontSize: '0.8rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.4rem',
                                  margin: '0 auto',
                                  opacity: 0.45,
                                  cursor: 'not-allowed',
                                  background: 'rgba(255,255,255,0.08)',
                                  color: 'var(--text-secondary)',
                                  border: '1px solid rgba(255,255,255,0.1)'
                                }}
                                title="Bank transfer payment slip must be verified before shipping."
                              >
                                <Truck size={14} /> Ship Package
                              </button>
                              <span style={{ fontSize: '0.68rem', color: 'var(--warning)' }}>
                                Slip verification required
                              </span>
                            </div>
                          )
                        )}
                        {item.status === 'shipped' && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                            <Truck size={14} /> In Transit
                          </div>
                        )}
                        {item.status === 'delivered' && (
                          <div style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                            <CheckCircle2 size={13} /> Delivered
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          )}
        </div>
      </main>

      {/* Bank Slip Verification Modal */}
      {slipModalOpen && selectedSlipItem && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.82)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '1rem',
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={() => {
            if (!reviewing) setSlipModalOpen(false);
          }}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '620px',
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: '1.8rem',
              borderRadius: '16px',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              boxShadow: '0 0 35px rgba(0, 0, 0, 0.6)',
              background: 'linear-gradient(145deg, rgba(18, 24, 38, 0.98), rgba(10, 14, 22, 0.98))',
              animation: 'popupScaleIn 0.25s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.2rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.8rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Building2 size={20} color="var(--accent-primary)" />
                  <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Bank Payment Slip Verification</h3>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Order #{selectedSlipItem.order_id} &bull; {selectedSlipItem.product_title}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSlipModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '0.3rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Order & Payment Summary info */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '0.8rem',
              padding: '0.9rem',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              marginBottom: '1.2rem',
              fontSize: '0.82rem'
            }}>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.72rem' }}>Expected Amount</span>
                <strong style={{ color: 'var(--accent-primary)', fontSize: '0.95rem' }}>
                  Rs. {(selectedSlipItem.quantity * selectedSlipItem.unit_price).toLocaleString('en-IN')}
                </strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.72rem' }}>Buyer Name</span>
                <strong style={{ color: '#fff' }}>{selectedSlipItem.buyer_name}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.72rem' }}>Buyer Phone</span>
                <strong style={{ color: '#fff' }}>{selectedSlipItem.buyer_phone || 'N/A'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.72rem' }}>Current Status</span>
                <strong style={{
                  color: selectedSlipItem.payment_status === 'approved' ? 'var(--success)' : selectedSlipItem.payment_status === 'rejected' ? 'var(--danger)' : 'var(--warning)',
                  textTransform: 'uppercase',
                  fontSize: '0.8rem'
                }}>
                  {selectedSlipItem.payment_status.replace('_', ' ')}
                </strong>
              </div>
            </div>

            {/* Existing Rejection Notice */}
            {selectedSlipItem.payment_status === 'rejected' && selectedSlipItem.payment_reject_reason && (
              <div style={{
                padding: '0.8rem 1rem',
                borderRadius: '8px',
                background: 'rgba(255, 51, 102, 0.12)',
                border: '1px solid var(--danger)',
                color: '#fff',
                fontSize: '0.84rem',
                marginBottom: '1.2rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.6rem'
              }}>
                <AlertTriangle size={16} color="var(--danger)" style={{ flexShrink: 0, marginTop: '0.15rem' }} />
                <div>
                  <strong style={{ color: 'var(--danger)', display: 'block' }}>Previously Rejected</strong>
                  <span style={{ color: 'var(--text-secondary)' }}>Reason: </span>{selectedSlipItem.payment_reject_reason}
                </div>
              </div>
            )}

            {/* Slip Image Viewer */}
            <div style={{ marginBottom: '1.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#fff' }}>Deposit / Transfer Slip Image</span>
                {selectedSlipItem.payment_slip_url && (
                  <a
                    href={selectedSlipItem.payment_slip_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none' }}
                  >
                    <ExternalLink size={12} /> Open Full Size
                  </a>
                )}
              </div>

              {selectedSlipItem.payment_slip_url ? (
                <div
                  style={{
                    maxHeight: '340px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.12)',
                    background: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <img
                    src={selectedSlipItem.payment_slip_url}
                    alt="Payment Slip Receipt"
                    style={{ maxWidth: '100%', maxHeight: '340px', objectFit: 'contain' }}
                  />
                </div>
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                  No slip image has been uploaded yet.
                </div>
              )}
            </div>

            {/* Rejection Form Input */}
            {isRejecting && (
              <div style={{
                padding: '1rem',
                borderRadius: '8px',
                background: 'rgba(255, 51, 102, 0.08)',
                border: '1px solid rgba(255, 51, 102, 0.3)',
                marginBottom: '1.2rem',
                animation: 'fadeIn 0.2s ease'
              }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--danger)', marginBottom: '0.4rem' }}>
                  Reason for Rejection *
                </label>
                <textarea
                  rows="2"
                  className="form-control"
                  placeholder="e.g. Reference number illegible / transferred Rs. 15,000 instead of Rs. 20,000 / bank account does not match"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  style={{ width: '100%', resize: 'vertical', fontSize: '0.85rem' }}
                />
                <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.8rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    onClick={() => setIsRejecting(false)}
                    disabled={reviewing}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn"
                    style={{
                      background: 'var(--danger)',
                      borderColor: 'var(--danger)',
                      color: '#fff',
                      padding: '0.4rem 0.9rem',
                      fontSize: '0.8rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                    onClick={() => handleSlipReview('rejected')}
                    disabled={reviewing}
                  >
                    <XCircle size={14} /> {reviewing ? 'Rejecting...' : 'Confirm Rejection'}
                  </button>
                </div>
              </div>
            )}

            {/* Actions Bar */}
            {!isRejecting && (
              <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setSlipModalOpen(false)}
                  disabled={reviewing}
                >
                  Close
                </button>

                <button
                  type="button"
                  className="btn"
                  style={{
                    background: 'rgba(255, 51, 102, 0.15)',
                    border: '1px solid var(--danger)',
                    color: 'var(--danger)',
                    padding: '0.6rem 1.2rem',
                    fontSize: '0.88rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    cursor: 'pointer',
                    borderRadius: '8px',
                    fontWeight: '600'
                  }}
                  onClick={() => setIsRejecting(true)}
                  disabled={reviewing}
                >
                  <XCircle size={16} /> Reject Slip
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  style={{
                    padding: '0.6rem 1.4rem',
                    fontSize: '0.88rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    cursor: 'pointer',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    background: 'linear-gradient(135deg, #00ff96, #00b4d8)',
                    color: '#000',
                    border: 'none'
                  }}
                  onClick={() => handleSlipReview('approved')}
                  disabled={reviewing || selectedSlipItem.payment_status === 'approved'}
                >
                  <CheckCircle2 size={16} /> {selectedSlipItem.payment_status === 'approved' ? 'Already Approved' : 'Approve Payment Slip'}
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default SellerOrders;
