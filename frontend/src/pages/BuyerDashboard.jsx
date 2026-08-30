import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Heart, Wrench, Menu, X, Trash2, ShoppingCart, Printer, CheckCircle2, AlertTriangle, Plus, Play, ArrowRight } from 'lucide-react';

const BuyerDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { wishlistItems, removeFromWishlist, wishlistCount } = useWishlist();
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'overview');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedBuilds, setSavedBuilds] = useState([]);
  const [loadingBuilds, setLoadingBuilds] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportItem, setReportItem] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState(null);
  const [reportStatusModal, setReportStatusModal] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });
  const [submittingReport, setSubmittingReport] = useState(false);

  const handleTab = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location.state]);

  const fetchOrders = () => {
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
  };

  const fetchBuilds = async () => {
    if (user && user.role === 'buyer') {
      setLoadingBuilds(true);
      try {
        const res = await fetch(`http://localhost/SpecZone/backend/api/builds.php?action=read&buyer_id=${user.id}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setSavedBuilds(data);
        }
      } catch (err) {
        console.error("Error fetching saved builds:", err);
      } finally {
        setLoadingBuilds(false);
      }
    }
  };

  useEffect(() => {
    if (user && user.role === 'buyer') {
      fetchOrders();
      fetchBuilds();
    }
  }, [user]);

  const handleDeleteBuild = async (buildId) => {
    if (!window.confirm("Are you sure you want to delete this saved build configuration?")) return;
    try {
      const res = await fetch(`http://localhost/SpecZone/backend/api/builds.php?action=delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyer_id: user.id,
          build_id: buildId
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSavedBuilds(prev => prev.filter(b => b.id !== buildId));
      } else {
        alert(data.message || "Failed to delete build.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLoadBuild = (build) => {
    const parts = {
      'Processors (CPU)': null,
      'Motherboards': null,
      'Memory (RAM)': null,
      'Graphics Cards (GPU)': null,
      'Storage (SSD/HDD)': null,
      'Power Supplies (PSU)': null,
      'Cases': null
    };

    if (build.items && Array.isArray(build.items)) {
      build.items.forEach(item => {
        const cat = (item.category_name || '').toLowerCase();
        for (const slot of Object.keys(parts)) {
          const slotLower = slot.toLowerCase();
          if (
            ((cat.includes('processor') || cat.includes('cpu')) && slotLower.includes('cpu')) ||
            ((cat.includes('motherboard') || cat.includes('board')) && slotLower.includes('motherboard')) ||
            ((cat.includes('memory') || cat.includes('ram')) && slotLower.includes('ram')) ||
            ((cat.includes('graphic') || cat.includes('gpu')) && slotLower.includes('gpu')) ||
            ((cat.includes('storage') || cat.includes('ssd') || cat.includes('hdd')) && slotLower.includes('storage')) ||
            ((cat.includes('power') || cat.includes('psu')) && slotLower.includes('psu')) ||
            (cat.includes('case') && slotLower.includes('case'))
          ) {
            parts[slot] = {
              id: item.product_id,
              title: item.title,
              price: item.price,
              specs: item.specs,
              image_url: item.image_url
            };
            break;
          }
        }
      });
    }

    navigate('/builder', { state: { loadBuildParts: parts } });
  };

  const handleAddAllBuildToCart = async (build) => {
    if (!build.items || build.items.length === 0) return;
    for (const item of build.items) {
      await addToCart(item.product_id, 1);
    }
    navigate('/cart');
  };

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

    setSubmittingReport(true);

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
        setReportModalOpen(false);
        setReportReason('');
        setReportItem(null);
        setReportStatusModal({
          isOpen: true,
          type: 'success',
          title: 'Issue Reported Successfully!',
          message: 'Your issue has been reported to the admin. We will review it shortly.'
        });
      } else {
        setReportStatusModal({
          isOpen: true,
          type: 'error',
          title: 'Report Submission Failed',
          message: data.message || 'Failed to submit report. Please try again.'
        });
      }
    } catch {
      setReportStatusModal({
        isOpen: true,
        type: 'error',
        title: 'Connection Error',
        message: 'An error occurred while submitting your report. Please try again.'
      });
    } finally {
      setSubmittingReport(false);
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
          <button 
            className={`btn ${activeTab === 'builds' ? 'btn-primary' : 'btn-outline'}`}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.8rem', justifyContent: 'flex-start', padding: '0.8rem 1rem', border: activeTab !== 'builds' ? 'none' : '' }}
            onClick={() => handleTab('builds')}
          >
            <Wrench size={20} /> My PC Builds ({savedBuilds.length})
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
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
              <div className="glass-panel stat-card" onClick={() => handleTab('orders')} style={{ cursor: 'pointer' }}>
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
              <div className="glass-panel stat-card" onClick={() => handleTab('builds')} style={{ cursor: 'pointer' }}>
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
                    color: 'var(--accent-primary)'
                  }}
                >
                  <Wrench size={24} />
                </div>
                <div className="stat-info">
                  <h3>{savedBuilds.length}</h3>
                  <p>Saved PC Builds</p>
                </div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Recent Activity</h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                You have <strong>{orders.length}</strong> active orders, <strong>{wishlistCount}</strong> saved wishlist items, and <strong>{savedBuilds.length}</strong> custom PC configurations.
              </p>
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
            <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>My Wishlist</h2>
            
            {wishlistItems.length === 0 ? (
              <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <Heart size={48} style={{ margin: '0 auto 1rem', opacity: 0.5, color: 'var(--danger)' }} />
                <h3>Your Wishlist is Empty</h3>
                <p>Save components you're interested in while browsing the shop.</p>
                <Link to="/shop" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
                  Explore Products
                </Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {wishlistItems.map(item => (
                  <div key={item.product_id} className="glass-panel product-card" style={{ display: 'flex', flexDirection: 'column', padding: '1rem', position: 'relative' }}>
                    
                    {/* Delete Icon Button */}
                    <button
                      type="button"
                      onClick={() => removeFromWishlist(item.product_id)}
                      title="Remove from wishlist"
                      style={{
                        position: 'absolute',
                        top: '0.75rem',
                        right: '0.75rem',
                        background: 'rgba(255, 51, 102, 0.15)',
                        border: '1px solid rgba(255, 51, 102, 0.3)',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        color: 'var(--danger)',
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
                        onClick={() => addToCart(item.product_id, 1)}
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

        {/* My PC Builds Tab */}
        {activeTab === 'builds' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h2 style={{ fontSize: '2rem', margin: 0 }}>My Saved PC Builds</h2>
              <button 
                type="button" 
                className="btn btn-primary" 
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                onClick={() => navigate('/builder')}
              >
                <Plus size={18} /> New PC Build
              </button>
            </div>

            {loadingBuilds ? (
              <p>Loading your saved configurations...</p>
            ) : savedBuilds.length === 0 ? (
              <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <Wrench size={48} style={{ margin: '0 auto 1rem', opacity: 0.5, color: 'var(--accent-primary)' }} />
                <h3 style={{ color: '#ffffff', marginBottom: '0.5rem' }}>No Saved PC Builds Yet</h3>
                <p style={{ maxWidth: '460px', margin: '0 auto 1.5rem', lineHeight: '1.5' }}>
                  Use our Custom PC Builder to choose compatible processors, motherboards, GPUs, and parts, then save your build here.
                </p>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                  onClick={() => navigate('/builder')}
                >
                  <Wrench size={18} /> Launch Custom PC Builder
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
                {savedBuilds.map(build => (
                  <div key={build.id} className="glass-panel" style={{ overflow: 'hidden', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
                    {/* Header */}
                    <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
                          <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#ffffff' }}>{build.build_name}</h3>
                          <span style={{ fontSize: '0.75rem', background: 'rgba(0, 240, 255, 0.1)', color: 'var(--accent-primary)', padding: '0.15rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
                            {build.item_count} Components
                          </span>
                        </div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          Saved on: {new Date(build.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', flexWrap: 'wrap' }}>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>Estimated Build Total</span>
                          <span style={{ fontSize: '1.35rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                            Rs. {parseFloat(build.total_price).toLocaleString('en-IN')}
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: '0.6rem' }}>
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}
                            onClick={() => handleLoadBuild(build)}
                            title="Load parts in Builder"
                          >
                            <Play size={15} color="var(--accent-primary)" /> Edit in Builder
                          </button>
                          <button
                            type="button"
                            className="btn btn-primary"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}
                            onClick={() => handleAddAllBuildToCart(build)}
                          >
                            <ShoppingCart size={15} /> Add All to Cart
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{ padding: '0.5rem', borderColor: 'var(--danger)', color: 'var(--danger)' }}
                            onClick={() => handleDeleteBuild(build.id)}
                            title="Delete Build"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Components List */}
                    <div style={{ padding: '1.2rem 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                      {build.items && build.items.map((item, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.8rem',
                            background: 'rgba(0, 0, 0, 0.25)',
                            padding: '0.8rem',
                            borderRadius: '8px',
                            border: '1px solid rgba(255, 255, 255, 0.04)'
                          }}
                        >
                          <img
                            src={item.image_url || 'https://via.placeholder.com/50'}
                            alt={item.title}
                            style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: '4px', background: 'rgba(0,0,0,0.3)', flexShrink: 0 }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <span style={{ fontSize: '0.72rem', color: 'var(--accent-primary)', display: 'block', textTransform: 'uppercase', fontWeight: '600' }}>
                              {item.category_name}
                            </span>
                            <span style={{ fontSize: '0.88rem', fontWeight: '500', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.title}>
                              {item.title}
                            </span>
                            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                              Rs. {parseFloat(item.price).toLocaleString('en-IN')}
                            </span>
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
                  style={{ background: 'var(--danger)', borderColor: 'var(--danger)', opacity: submittingReport ? 0.7 : 1, cursor: submittingReport ? 'not-allowed' : 'pointer' }}
                  disabled={submittingReport}
                >
                  {submittingReport ? 'Submitting Report...' : 'Submit Report'}
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

      {/* Small React Feedback Popup (Success / Error for Report Issue) */}
      {reportStatusModal.isOpen && (
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
          onClick={() => setReportStatusModal(prev => ({ ...prev, isOpen: false }))}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '420px',
              padding: '2.2rem 1.8rem',
              borderRadius: '16px',
              border: `1px solid ${reportStatusModal.type === 'success' ? 'rgba(0, 230, 118, 0.35)' : 'rgba(255, 51, 102, 0.4)'}`,
              boxShadow: `0 0 35px ${reportStatusModal.type === 'success' ? 'rgba(0, 230, 118, 0.2)' : 'rgba(255, 51, 102, 0.2)'}`,
              background: 'linear-gradient(145deg, rgba(18, 22, 34, 0.98), rgba(10, 14, 22, 0.98))',
              textAlign: 'center',
              position: 'relative',
              animation: 'popupScaleIn 0.25s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Animated Status Badge Icon */}
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: reportStatusModal.type === 'success' ? 'rgba(0, 230, 118, 0.15)' : 'rgba(255, 51, 102, 0.15)',
                border: `2px solid ${reportStatusModal.type === 'success' ? 'var(--success)' : 'var(--danger)'}`,
                color: reportStatusModal.type === 'success' ? 'var(--success)' : 'var(--danger)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.2rem',
                boxShadow: `0 0 25px ${reportStatusModal.type === 'success' ? 'rgba(0, 230, 118, 0.3)' : 'rgba(255, 51, 102, 0.3)'}`
              }}
            >
              {reportStatusModal.type === 'success' ? (
                <CheckCircle2 size={36} />
              ) : (
                <AlertTriangle size={36} />
              )}
            </div>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 'bold', margin: '0 0 0.5rem 0', color: '#ffffff' }}>
              {reportStatusModal.title}
            </h3>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.5', margin: '0 0 1.5rem 0' }}>
              {reportStatusModal.message}
            </p>

            <button
              type="button"
              className={reportStatusModal.type === 'success' ? 'btn btn-primary' : 'btn'}
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                borderRadius: '8px',
                ...(reportStatusModal.type !== 'success' ? { background: 'var(--danger)', borderColor: 'var(--danger)', color: '#ffffff' } : {})
              }}
              onClick={() => setReportStatusModal(prev => ({ ...prev, isOpen: false }))}
            >
              {reportStatusModal.type === 'success' ? 'Understood & Close' : 'Dismiss'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyerDashboard;
