import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Heart, Wrench, Settings, Menu, X, Trash2, ShoppingCart, Star, Printer } from 'lucide-react';

const BuyerDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { wishlistItems, removeFromWishlist, wishlistCount } = useWishlist();
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'overview');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportItem, setReportItem] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState(null);

  const handleTab = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location.state]);

  useEffect(() => {
    if (user && user.role === 'buyer') {
      fetch(`http://localhost/SpecZone/backend/api/orders.php?action=read_buyer&buyer_id=${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setOrders(data);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching orders:", err);
          setLoading(false);
        });
    }
  }, [user]);

  const getStatusColor = (status) => {
    if (status === 'delivered') return 'var(--success)';
    if (status === 'shipped') return 'var(--accent-primary)';
    return 'var(--warning)';
  };

  const getOrderPaymentStatus = (order) => {
    if (!order || !order.items || order.items.length === 0) {
      return { text: 'PAYMENT DUE ON DELIVERY (COD)', color: 'var(--warning)', bg: 'rgba(255, 180, 0, 0.15)' };
    }
    const allDelivered = order.items.every(i => i.status === 'delivered');
    if (allDelivered) {
      return { text: 'PAID / COMPLETED', color: 'var(--success)', bg: 'rgba(0, 255, 150, 0.15)' };
    }
    const hasShipped = order.items.some(i => i.status === 'shipped');
    if (hasShipped) {
      return { text: 'DISPATCHED - PAYMENT DUE ON DELIVERY', color: 'var(--accent-primary)', bg: 'rgba(0, 240, 255, 0.15)' };
    }
    return { text: 'PAYMENT DUE ON DELIVERY (COD)', color: 'var(--warning)', bg: 'rgba(255, 180, 0, 0.15)' };
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();

    if (!reportReason.trim() || !reportItem) return;

    try {
      const res = await fetch(
        'http://localhost/SpecZone/backend/api/complaints.php?action=create',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            buyer_id: user.id,
            seller_id: reportItem.seller_id,
            reason: reportReason
          })
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert('Your issue has been reported to the admin. We will review it shortly.');
        setReportModalOpen(false);
        setReportReason('');
        setReportItem(null);
      } else {
        alert(data.message || 'Failed to submit report.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred.');
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Mobile drawer overlay (below navbar, mobile only) */}
      {sidebarOpen && (
        <div
          className="dashboard-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <h3 style={{ marginBottom: '2rem', paddingLeft: '1rem', color: 'var(--text-secondary)' }}>Buyer Panel</h3>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0 1rem' }}>
          <button 
            className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-outline'}`}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.8rem', justifyContent: 'flex-start', padding: '0.8rem 1rem', border: activeTab !== 'overview' ? 'none' : '' }}
            onClick={() => handleTab('overview')}
          >
            <LayoutDashboard size={20} /> Overview
          </button>
          <button 
            className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-outline'}`}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.8rem', justifyContent: 'flex-start', padding: '0.8rem 1rem', border: activeTab !== 'orders' ? 'none' : '' }}
            onClick={() => handleTab('orders')}
          >
            <ShoppingBag size={20} /> My Orders
          </button>
          <button 
            className={`btn ${activeTab === 'wishlist' ? 'btn-primary' : 'btn-outline'}`}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.8rem', justifyContent: 'flex-start', padding: '0.8rem 1rem', border: activeTab !== 'wishlist' ? 'none' : '' }}
            onClick={() => handleTab('wishlist')}
          >
            <Heart size={20} /> My Wishlist ({wishlistCount})
          </button>
          <button className="btn btn-outline" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.8rem', justifyContent: 'flex-start', padding: '0.8rem 1rem', border: 'none', color: 'var(--text-secondary)' }}>
            <Wrench size={20} /> My PC Builds
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="dashboard-content">
        {/* Mobile top bar (below navbar, mobile only) */}
        <div className="dashboard-mobile-header">
          <button
            className="dashboard-hamburger"
            aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={sidebarOpen}
            onClick={() => setSidebarOpen((o) => !o)}
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <span className="dashboard-mobile-title">Buyer Dashboard</span>
        </div>

        {activeTab === 'overview' && (
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Welcome back, {user?.first_name}!</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
              <div className="glass-panel stat-card">
                <div
                  className="stat-icon"
                  style={{
                    flexShrink: 0,
                    width: '48px',
                    height: '48px',
                    minWidth: '48px',
                    minHeight: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ShoppingBag size={24} />
                </div>
                <div className="stat-info">
                  <h3>{orders.length}</h3>
                  <p>Total Orders</p>
                </div>
              </div>
              <div className="glass-panel stat-card" onClick={() => handleTab('wishlist')} style={{ cursor: 'pointer' }}>
                <div
                  className="stat-icon"
                  style={{
                    flexShrink: 0,
                    width: '48px',
                    height: '48px',
                    minWidth: '48px',
                    minHeight: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--danger)'
                  }}
                >
                  <Heart size={24} />
                </div>
                <div className="stat-info">
                  <h3>{wishlistCount}</h3>
                  <p>Saved in Wishlist</p>
                </div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Recent Activity</h3>
              <p style={{ color: 'var(--text-secondary)' }}>You recently placed {orders.length} orders.</p>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>My Orders</h2>
            
            {loading ? (
              <p>Loading orders...</p>
            ) : orders.length === 0 ? (
              <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <ShoppingBag size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <h3>No Orders Yet</h3>
                <p>You haven't placed any orders yet. Start exploring components!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {orders.map(order => (
                  <div key={order.id} className="glass-panel" style={{ overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Order Placed: {new Date(order.created_at).toLocaleDateString()}</span>
                        <h4 style={{ margin: '0.2rem 0 0 0', fontSize: '1.15rem' }}>Order #{order.id}</h4>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button
                          type="button"
                          className="btn btn-outline"
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                          onClick={() => {
                            setSelectedOrderForInvoice(order);
                            setInvoiceModalOpen(true);
                          }}
                        >
                          <Printer size={15} /> Print Invoice
                        </button>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Amount</span>
                          <h4 style={{ margin: '0.2rem 0 0 0', color: 'var(--accent-primary)' }}>Rs. {parseFloat(order.total_amount).toLocaleString('en-IN')}</h4>
                        </div>
                      </div>
                    </div>
                    <div style={{ padding: '1.5rem' }}>
                      {order.items && order.items.map(item => (
                        <div key={item.item_id} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <img src={item.image_url || 'https://via.placeholder.com/60'} alt={item.title} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                          <div style={{ flex: 1 }}>
                            <h5 style={{ margin: '0 0 0.3rem 0', fontSize: '1rem' }}>{item.title}</h5>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Sold by: {item.seller_name} | Qty: {item.quantity}</p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '0.3rem' }}>Rs. {(item.quantity * item.unit_price).toLocaleString('en-IN')}</div>
                            <div style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'flex-end',
                              gap: '0.5rem'
                            }}>
                              <span style={{ 
                                padding: '0.2rem 0.5rem', 
                                borderRadius: '4px', 
                                fontSize: '0.75rem', 
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                background: 'rgba(255,255,255,0.1)',
                                color: getStatusColor(item.status)
                              }}>
                                {item.status}
                              </span>
                              <button
                                type="button"
                                className="btn btn-outline"
                                style={{
                                  padding: '0.2rem 0.6rem',
                                  fontSize: '0.75rem',
                                  color: 'var(--danger)',
                                  borderColor: 'var(--danger)'
                                }}
                                onClick={() => {
                                  setReportItem(item);
                                  setReportModalOpen(true);
                                }}
                              >
                                Report Issue
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'wishlist' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h2 style={{ fontSize: '2rem', margin: 0 }}>My Wishlist</h2>
              <Link to="/shop" className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>
                Browse Shop
              </Link>
            </div>

            {wishlistItems.length === 0 ? (
              <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <Heart size={48} style={{ margin: '0 auto 1rem', opacity: 0.5, color: 'var(--danger)' }} />
                <h3>Your Wishlist is Empty</h3>
                <p style={{ marginBottom: '1.5rem' }}>You haven't saved any components yet. Save products to track them here!</p>
                <Link to="/shop" className="btn btn-primary" style={{ display: 'inline-flex', padding: '0.6rem 1.5rem' }}>
                  Explore Products
                </Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
                {wishlistItems.map(item => (
                  <div key={item.product_id} className="glass-panel" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                    <button
                      type="button"
                      onClick={() => removeFromWishlist(item.product_id)}
                      aria-label="Remove"
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'rgba(0,0,0,0.5)',
                        border: 'none',
                        color: 'var(--danger)',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={15} />
                    </button>

                    <Link to={`/product/${item.product_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <img
                        src={item.image_url || 'https://via.placeholder.com/200'}
                        alt={item.title}
                        style={{ width: '100%', height: '160px', objectFit: 'contain', borderRadius: '6px', marginBottom: '1rem', backgroundColor: 'rgba(0,0,0,0.2)' }}
                      />
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', textTransform: 'uppercase', fontWeight: 'bold' }}>
                        {item.category_name}
                      </span>
                      <h4 style={{ margin: '0.3rem 0 0.5rem 0', fontSize: '1.05rem', lineHeight: '1.3' }}>{item.title}</h4>
                    </Link>

                    <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ fontWeight: 'bold', color: 'var(--accent-primary)', fontSize: '1.1rem' }}>
                        Rs. {parseFloat(item.price).toLocaleString('en-IN')}
                      </span>
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                        disabled={item.stock <= 0}
                        onClick={() => {
                          addToCart(item.product_id, 1);
                          alert("Added to Cart!");
                        }}
                      >
                        <ShoppingCart size={14} /> Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* Report Issue Modal */}
      {reportModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
          onClick={() => {
            setReportModalOpen(false);
            setReportReason('');
            setReportItem(null);
          }}
        >
          <div
            className="glass-panel"
            style={{
              width: '90%',
              maxWidth: '500px',
              padding: '2rem',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--danger)' }}>Report Issue</h3>
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
              Reporting item: <strong>{reportItem?.title}</strong> (Sold by <strong>{reportItem?.seller_name}</strong>)
            </p>
            <form onSubmit={handleReportSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="reportReason">
                  Describe the problem
                </label>
                <textarea
                  id="reportReason"
                  className="form-control"
                  rows={4}
                  placeholder="e.g. Item arrived damaged, or didn't receive the item..."
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setReportModalOpen(false);
                    setReportReason('');
                    setReportItem(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn"
                  style={{ background: 'var(--danger)', borderColor: 'var(--danger)' }}
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Printable Invoice Modal */}
      {invoiceModalOpen && selectedOrderForInvoice && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '1rem'
          }}
          onClick={() => {
            setInvoiceModalOpen(false);
            setSelectedOrderForInvoice(null);
          }}
        >
          <div
            className="glass-panel"
            style={{
              width: '95%',
              maxWidth: '650px',
              padding: '2.5rem',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              background: '#0e1117'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid rgba(255,255,255,0.1)', paddingBottom: '1.2rem', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--accent-primary)' }}>SpecZone</h2>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Official Order Receipt & Tax Invoice</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>INVOICE #{selectedOrderForInvoice.id}</h3>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Date: {new Date(selectedOrderForInvoice.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              <div>
                <strong style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'block', textTransform: 'uppercase' }}>Billed To:</strong>
                <p style={{ margin: '0.3rem 0 0 0', fontWeight: 'bold' }}>{user?.first_name} {user?.last_name}</p>
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{user?.email}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <strong style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'block', textTransform: 'uppercase' }}>Payment Status:</strong>
                {(() => {
                  const payStatus = getOrderPaymentStatus(selectedOrderForInvoice);
                  return (
                    <span style={{ display: 'inline-block', marginTop: '0.3rem', padding: '0.25rem 0.6rem', borderRadius: '4px', background: payStatus.bg, color: payStatus.color, fontWeight: 'bold', fontSize: '0.8rem' }}>
                      {payStatus.text}
                    </span>
                  );
                })()}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '0.6rem 0' }}>Item Description</th>
                    <th style={{ padding: '0.6rem', textAlign: 'center' }}>Qty</th>
                    <th style={{ padding: '0.6rem', textAlign: 'right' }}>Unit Price</th>
                    <th style={{ padding: '0.6rem 0', textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrderForInvoice.items && selectedOrderForInvoice.items.map((item, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.8rem 0' }}>
                        <div style={{ fontWeight: 'bold' }}>{item.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Seller: {item.seller_name}</div>
                      </td>
                      <td style={{ padding: '0.8rem', textAlign: 'center' }}>{item.quantity}</td>
                      <td style={{ padding: '0.8rem', textAlign: 'right' }}>Rs. {parseFloat(item.unit_price).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '0.8rem 0', textAlign: 'right', fontWeight: 'bold' }}>
                        Rs. {(item.quantity * parseFloat(item.unit_price)).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ marginTop: '1rem', borderTop: '2px solid rgba(255,255,255,0.1)', paddingTop: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  <span>Subtotal</span>
                  <span>Rs. {parseFloat(selectedOrderForInvoice.total_amount).toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  <span>Shipping & Handling</span>
                  <span style={{ color: 'var(--success)' }}>FREE</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                  <span>Grand Total</span>
                  <span>Rs. {parseFloat(selectedOrderForInvoice.total_amount).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setInvoiceModalOpen(false);
                  setSelectedOrderForInvoice(null);
                }}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                onClick={() => window.print()}
              >
                <Printer size={16} /> Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyerDashboard;
