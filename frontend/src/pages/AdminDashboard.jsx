import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Users, ShoppingBag, Package, LayoutDashboard, Trash2, LogOut, Star, 
  AlertTriangle, ChevronDown, Menu, X, MessageSquareWarning, CheckCircle, 
  ShieldCheck, ShieldAlert, Layers, Plus, Search, AlertCircle, Store
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [stats, setStats] = useState({
    total_buyers: 0,
    total_sellers: 0,
    total_products: 0,
    total_orders: 0,
    total_categories: 0
  });
  
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // User Management State
  const [filterRole, setFilterRole] = useState('all');
  const [userSearch, setUserSearch] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);

  // Seller Verification State
  const [sellerFilter, setSellerFilter] = useState('all'); // all, verified, unverified, critical
  const [sellerSearch, setSellerSearch] = useState('');

  // Product Moderation State
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');

  // Category Management State
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');
  const [isSubmittingCat, setIsSubmittingCat] = useState(false);

  // Complaints State
  const [complaintFilter, setComplaintFilter] = useState('all'); // all, pending, resolved

  const handleTabChange = (tab, customFilter = null) => {
    if (customFilter) {
      setSellerFilter(customFilter);
    }
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch stats
        const statsRes = await fetch(`http://localhost/SpecZone/backend/api/admin.php?action=stats&admin_id=${user.id}`);
        const statsData = await statsRes.json();
        if (statsData.total_buyers !== undefined) {
          setStats(statsData);
        }

        // Fetch users
        const usersRes = await fetch(`http://localhost/SpecZone/backend/api/admin.php?action=users&admin_id=${user.id}`);
        const usersData = await usersRes.json();
        if (Array.isArray(usersData)) {
          setUsers(usersData);
        }

        // Fetch products
        const productsRes = await fetch(`http://localhost/SpecZone/backend/api/admin.php?action=products&admin_id=${user.id}`);
        const productsData = await productsRes.json();
        if (Array.isArray(productsData)) {
          setProducts(productsData);
        }

        // Fetch categories
        const categoriesRes = await fetch(`http://localhost/SpecZone/backend/api/admin.php?action=categories&admin_id=${user.id}`);
        const categoriesData = await categoriesRes.json();
        if (Array.isArray(categoriesData)) {
          setCategories(categoriesData);
        }

        // Fetch complaints
        const complaintsRes = await fetch(`http://localhost/SpecZone/backend/api/complaints.php?action=read`);
        const complaintsData = await complaintsRes.json();
        if (Array.isArray(complaintsData)) {
          setComplaints(complaintsData);
        }
      } catch (err) {
        console.error("Error fetching admin data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  // Handler: Delete User
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? All associated data will be permanently removed.")) return;

    try {
      const res = await fetch('http://localhost/SpecZone/backend/api/admin.php?action=delete_user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_id: user.id, user_id: userId })
      });
      
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setUsers(users.filter(u => u.id !== userId));
        setStats(prev => ({
          ...prev,
          total_buyers: users.find(u => u.id === userId)?.role === 'buyer' ? prev.total_buyers - 1 : prev.total_buyers,
          total_sellers: users.find(u => u.id === userId)?.role === 'seller' ? prev.total_sellers - 1 : prev.total_sellers
        }));
      } else {
        alert(data.message || "Failed to delete user");
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Error deleting user");
    }
  };

  // Handler: Toggle Seller Verification
  const handleToggleSellerVerify = async (sellerId) => {
    try {
      const res = await fetch('http://localhost/SpecZone/backend/api/admin.php?action=toggle_seller_verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_id: user.id, seller_id: sellerId })
      });

      const data = await res.json();
      if (res.ok) {
        setUsers(users.map(u => {
          if (u.id === sellerId) {
            return { ...u, is_verified: data.is_verified ? 1 : 0 };
          }
          return u;
        }));
        alert(data.message);
      } else {
        alert(data.message || "Failed to update seller verification status.");
      }
    } catch (err) {
      console.error("Error toggling seller verification:", err);
      alert("Error updating seller verification.");
    }
  };

  // Handler: Warn Seller
  const handleWarnSeller = async (sellerId) => {
    if (!window.confirm("Issue a formal warning to this seller for platform policy violation?")) return;

    try {
      const res = await fetch('http://localhost/SpecZone/backend/api/admin.php?action=warn_seller', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_id: user.id, seller_id: sellerId })
      });

      const data = await res.json();
      if (res.ok) {
        setUsers(users.map(u => {
          if (u.id === sellerId) {
            return { ...u, warning_count: data.warning_count };
          }
          return u;
        }));
        alert(data.message);
      } else {
        alert(data.message || "Failed to issue warning.");
      }
    } catch (err) {
      console.error("Error warning seller:", err);
      alert("Error issuing warning.");
    }
  };

  // Handler: Delete Product (Moderation)
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to remove this product from the platform?")) return;

    try {
      const res = await fetch('http://localhost/SpecZone/backend/api/admin.php?action=delete_product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_id: user.id, product_id: productId })
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setProducts(products.filter(p => p.id !== productId));
        setStats(prev => ({ ...prev, total_products: Math.max(0, prev.total_products - 1) }));
      } else {
        alert(data.message || "Failed to remove product.");
      }
    } catch (err) {
      console.error("Error removing product:", err);
      alert("Error removing product.");
    }
  };

  // Handler: Add Category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      alert("Category name is required.");
      return;
    }

    setIsSubmittingCat(true);
    try {
      const res = await fetch('http://localhost/SpecZone/backend/api/admin.php?action=add_category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin_id: user.id,
          name: newCategoryName.trim(),
          description: newCategoryDesc.trim()
        })
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setCategories([...categories, {
          id: data.id,
          name: newCategoryName.trim(),
          description: newCategoryDesc.trim(),
          product_count: 0
        }]);
        setNewCategoryName('');
        setNewCategoryDesc('');
        setStats(prev => ({ ...prev, total_categories: prev.total_categories + 1 }));
      } else {
        alert(data.message || "Failed to add category.");
      }
    } catch (err) {
      console.error("Error adding category:", err);
      alert("Error adding category.");
    } finally {
      setIsSubmittingCat(false);
    }
  };

  // Handler: Delete Category
  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm("Are you sure you want to delete this category? Products in this category may be affected.")) return;

    try {
      const res = await fetch('http://localhost/SpecZone/backend/api/admin.php?action=delete_category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_id: user.id, category_id: categoryId })
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setCategories(categories.filter(c => c.id !== categoryId));
        setStats(prev => ({ ...prev, total_categories: Math.max(0, prev.total_categories - 1) }));
      } else {
        alert(data.message || "Failed to delete category.");
      }
    } catch (err) {
      console.error("Error deleting category:", err);
      alert("Error deleting category.");
    }
  };

  // Handler: Resolve Complaint
  const handleResolveComplaint = async (complaintId) => {
    if (!window.confirm("Mark this dispute as resolved?")) return;

    try {
      const res = await fetch(
        'http://localhost/SpecZone/backend/api/complaints.php?action=resolve',
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ complaint_id: complaintId })
        }
      );

      if (res.ok) {
        setComplaints(
          complaints.map(c =>
            c.id === complaintId
              ? { ...c, status: 'resolved' }
              : c
          )
        );
        alert("Dispute marked as resolved.");
      } else {
        alert("Failed to resolve complaint.");
      }
    } catch (err) {
      console.error(err);
      alert("Error resolving complaint.");
    }
  };

  const pendingComplaintsCount = complaints.filter(c => c.status === 'pending').length;
  const unverifiedSellersCount = users.filter(u => u.role === 'seller' && (!u.is_verified || u.is_verified === 0 || u.is_verified === '0')).length;
  const criticalSellersCount = users.filter(u => u.role === 'seller' && ((u.avg_rating !== null && u.avg_rating <= 4) || (u.warning_count && u.warning_count >= 2))).length;

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 1rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-primary)', marginBottom: '1rem' }}>
          Loading SpecZone Admin Command Center...
        </div>
        <p style={{ color: 'var(--text-secondary)' }}>Synchronizing platform statistics and database records.</p>
      </div>
    );
  }

  return (
    <div className="container dashboard-container admin-dashboard-layout">
      
      {/* Mobile drawer overlay */}
      {sidebarOpen && (
        <div
          className="dashboard-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`dashboard-sidebar glass-panel ${sidebarOpen ? 'open' : ''}`} style={{ padding: '2rem 1rem', display: 'flex', flexDirection: 'column' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            width: '74px', 
            height: '74px', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', 
            margin: '0 auto 1rem', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: '1.8rem', 
            fontWeight: 'bold',
            boxShadow: '0 0 20px rgba(0, 240, 255, 0.3)'
          }}>
            {user?.first_name?.charAt(0)}
          </div>
          <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{user?.first_name} {user?.last_name}</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '700' }}>Platform Administrator</span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <button 
            className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-outline'}`}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.8rem', justifyContent: 'flex-start', padding: '0.75rem 1rem', border: activeTab !== 'overview' ? 'none' : '' }}
            onClick={() => handleTabChange('overview')}
          >
            <LayoutDashboard size={18} /> Overview
          </button>

          <button 
            className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-outline'}`}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.8rem', justifyContent: 'flex-start', padding: '0.75rem 1rem', border: activeTab !== 'users' ? 'none' : '' }}
            onClick={() => handleTabChange('users')}
          >
            <Users size={18} /> Manage Users
          </button>

          <button 
            className={`btn ${activeTab === 'sellers' ? 'btn-primary' : 'btn-outline'}`}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.8rem', justifyContent: 'flex-start', padding: '0.75rem 1rem', border: activeTab !== 'sellers' ? 'none' : '' }}
            onClick={() => handleTabChange('sellers')}
          >
            <ShieldCheck size={18} /> Seller Verification
            {unverifiedSellersCount > 0 && (
              <span style={{ background: 'var(--warning)', color: '#000', padding: '0.1rem 0.5rem', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 'bold', marginLeft: 'auto' }}>
                {unverifiedSellersCount}
              </span>
            )}
          </button>

          <button 
            className={`btn ${activeTab === 'products' ? 'btn-primary' : 'btn-outline'}`}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.8rem', justifyContent: 'flex-start', padding: '0.75rem 1rem', border: activeTab !== 'products' ? 'none' : '' }}
            onClick={() => handleTabChange('products')}
          >
            <Package size={18} /> Product Moderation
          </button>

          <button 
            className={`btn ${activeTab === 'categories' ? 'btn-primary' : 'btn-outline'}`}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.8rem', justifyContent: 'flex-start', padding: '0.75rem 1rem', border: activeTab !== 'categories' ? 'none' : '' }}
            onClick={() => handleTabChange('categories')}
          >
            <Layers size={18} /> Category Management
          </button>

          <button 
            className={`btn ${activeTab === 'disputes' ? 'btn-primary' : 'btn-outline'}`}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.8rem', justifyContent: 'flex-start', padding: '0.75rem 1rem', border: activeTab !== 'disputes' ? 'none' : '' }}
            onClick={() => handleTabChange('disputes')}
          >
            <MessageSquareWarning size={18} /> Disputes & Complaints
            {pendingComplaintsCount > 0 && (
              <span style={{ background: 'var(--danger)', color: 'white', padding: '0.1rem 0.5rem', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 'bold', marginLeft: 'auto' }}>
                {pendingComplaintsCount}
              </span>
            )}
          </button>
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
          <button 
            className="btn btn-outline" 
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.8rem', justifyContent: 'flex-start', padding: '0.75rem 1rem', border: 'none', color: 'var(--danger)' }}
            onClick={() => {
              logout();
              navigate('/');
              setSidebarOpen(false);
            }}
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ minWidth: 0 }}>
        {/* Mobile/tablet top bar */}
        <div className="dashboard-mobile-header">
          <button
            className="dashboard-hamburger"
            aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={sidebarOpen}
            onClick={() => setSidebarOpen((o) => !o)}
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <span className="dashboard-mobile-title">Admin Dashboard</span>
        </div>

        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div>
            <div className="admin-toolbar">
              <div>
                <h2 style={{ margin: 0, fontSize: '1.8rem' }}>Platform Overview</h2>
                <p style={{ color: 'var(--text-secondary)', margin: '0.3rem 0 0 0', fontSize: '0.95rem' }}>
                  Real-time status of users, sellers, products, orders, and hardware categories.
                </p>
              </div>
            </div>

            {/* Stat Cards Grid */}
            <div className="admin-stat-grid">
              <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', borderTop: '4px solid #3b82f6', transition: 'transform 0.2s' }}>
                <Users size={28} color="#3b82f6" style={{ margin: '0 auto 0.75rem' }} />
                <h3 className="admin-stat-number">{stats.total_buyers}</h3>
                <p style={{ color: 'var(--text-secondary)', margin: 0, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', fontWeight: '600' }}>Total Buyers</p>
              </div>

              <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', borderTop: '4px solid #10b981', transition: 'transform 0.2s' }}>
                <Store size={28} color="#10b981" style={{ margin: '0 auto 0.75rem' }} />
                <h3 className="admin-stat-number">{stats.total_sellers}</h3>
                <p style={{ color: 'var(--text-secondary)', margin: 0, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', fontWeight: '600' }}>Active Sellers</p>
              </div>

              <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', borderTop: '4px solid #8b5cf6', transition: 'transform 0.2s' }}>
                <Package size={28} color="#8b5cf6" style={{ margin: '0 auto 0.75rem' }} />
                <h3 className="admin-stat-number">{stats.total_products}</h3>
                <p style={{ color: 'var(--text-secondary)', margin: 0, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', fontWeight: '600' }}>Live Products</p>
              </div>

              <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', borderTop: '4px solid #f59e0b', transition: 'transform 0.2s' }}>
                <ShoppingBag size={28} color="#f59e0b" style={{ margin: '0 auto 0.75rem' }} />
                <h3 className="admin-stat-number">{stats.total_orders}</h3>
                <p style={{ color: 'var(--text-secondary)', margin: 0, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', fontWeight: '600' }}>Total Orders</p>
              </div>

              <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', borderTop: '4px solid #ec4899', transition: 'transform 0.2s' }}>
                <Layers size={28} color="#ec4899" style={{ margin: '0 auto 0.75rem' }} />
                <h3 className="admin-stat-number">{stats.total_categories || categories.length}</h3>
                <p style={{ color: 'var(--text-secondary)', margin: 0, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', fontWeight: '600' }}>Hardware Categories</p>
              </div>
            </div>

            {/* Quick Action & Alerts Banner */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              
              {/* Critical Alerts Card */}
              <div className="glass-panel" style={{ padding: '1.75rem' }}>
                <h3 style={{ margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.2rem' }}>
                  <AlertCircle size={20} color="var(--warning)" /> System Alerts & Action Items
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {pendingComplaintsCount > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid var(--danger)', borderRadius: '4px', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <div style={{ fontWeight: '600', color: 'var(--danger)', fontSize: '0.95rem' }}>{pendingComplaintsCount} Unresolved Dispute(s)</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Buyers waiting for complaint resolution.</div>
                      </div>
                      <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={() => handleTabChange('disputes')}>
                        Review
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--success)', fontSize: '0.9rem' }}>
                      <CheckCircle size={16} /> All buyer disputes and complaints are resolved.
                    </div>
                  )}

                  {unverifiedSellersCount > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'rgba(245, 158, 11, 0.1)', borderLeft: '4px solid var(--warning)', borderRadius: '4px', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <div style={{ fontWeight: '600', color: 'var(--warning)', fontSize: '0.95rem' }}>{unverifiedSellersCount} Unverified Seller(s)</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Sellers pending credential verification.</div>
                      </div>
                      <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderColor: 'var(--warning)', color: 'var(--warning)' }} onClick={() => handleTabChange('sellers')}>
                        Verify
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--success)', fontSize: '0.9rem' }}>
                      <CheckCircle size={16} /> All registered sellers are verified merchants.
                    </div>
                  )}

                  {criticalSellersCount > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.08)', borderLeft: '4px solid var(--danger)', borderRadius: '4px', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <div style={{ fontWeight: '600', color: 'var(--danger)', fontSize: '0.95rem' }}>{criticalSellersCount} Seller(s) with Low Rating/Warnings</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Rating ≤ 4.0 or active warnings recorded.</div>
                      </div>
                      <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={() => handleTabChange('sellers', 'critical')}>
                        Inspect
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Management Shortcuts */}
              <div className="glass-panel" style={{ padding: '1.75rem' }}>
                <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.2rem' }}>Quick Admin Actions</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
                  <button 
                    onClick={() => handleTabChange('users')} 
                    className="btn btn-outline" 
                    style={{ padding: '0.8rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', textAlign: 'center', fontSize: '0.85rem' }}
                  >
                    <Users size={20} color="var(--accent-primary)" />
                    Manage Users
                  </button>

                  <button 
                    onClick={() => handleTabChange('sellers')} 
                    className="btn btn-outline" 
                    style={{ padding: '0.8rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', textAlign: 'center', fontSize: '0.85rem' }}
                  >
                    <ShieldCheck size={20} color="#10b981" />
                    Verify Sellers
                  </button>

                  <button 
                    onClick={() => handleTabChange('products')} 
                    className="btn btn-outline" 
                    style={{ padding: '0.8rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', textAlign: 'center', fontSize: '0.85rem' }}
                  >
                    <Package size={20} color="#8b5cf6" />
                    Moderate Products
                  </button>

                  <button 
                    onClick={() => handleTabChange('categories')} 
                    className="btn btn-outline" 
                    style={{ padding: '0.8rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', textAlign: 'center', fontSize: '0.85rem' }}
                  >
                    <Layers size={20} color="#ec4899" />
                    Categories
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 2. MANAGE USERS TAB */}
        {activeTab === 'users' && (
          <div>
            <div className="admin-toolbar">
              <div>
                <h2 style={{ margin: 0, fontSize: '1.8rem' }}>User Management</h2>
                <p style={{ color: 'var(--text-secondary)', margin: '0.3rem 0 0 0', fontSize: '0.95rem' }}>
                  View, filter, search, and manage registered buyers, sellers, and administrators.
                </p>
              </div>

              {/* Filters & Search Bar */}
              <div className="admin-toolbar-controls">
                {/* Search box */}
                <div style={{ position: 'relative', width: '220px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input
                    type="text"
                    placeholder="Search name/email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="form-control"
                    style={{ paddingLeft: '2.4rem', height: '42px', fontSize: '0.9rem', width: '100%' }}
                  />
                </div>

                {/* Role Filter Dropdown */}
                <div style={{ position: 'relative', width: '210px', zIndex: filterOpen ? 1000 : 'auto' }}>
                  <button
                    type="button"
                    className="form-control"
                    onClick={() => setFilterOpen(!filterOpen)}
                    style={{
                      width: '100%',
                      minHeight: '42px',
                      padding: '0.65rem 2.2rem 0.65rem 1rem',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      textAlign: 'left',
                      position: 'relative'
                    }}
                  >
                    <span>
                      {filterRole === 'all' ? 'All Roles' :
                       filterRole === 'buyer' ? 'Buyers Only' :
                       filterRole === 'seller' ? 'Sellers Only' :
                       'Critical Sellers (≤ 4★)'}
                    </span>
                    <ChevronDown size={16} style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: `translateY(-50%) rotate(${filterOpen ? 180 : 0}deg)`, color: 'var(--text-secondary)' }} />
                  </button>

                  {filterOpen && (
                    <div style={{
                      position: 'absolute',
                      top: 'calc(100% + 4px)',
                      left: 0,
                      width: '100%',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--border-radius-sm)',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
                      zIndex: 1001
                    }}>
                      {[
                        { value: 'all', label: 'All Roles' },
                        { value: 'buyer', label: 'Buyers Only' },
                        { value: 'seller', label: 'Sellers Only' },
                        { value: 'critical_seller', label: 'Critical Sellers (≤ 4★)' }
                      ].map(opt => (
                        <div
                          key={opt.value}
                          onClick={() => { setFilterRole(opt.value); setFilterOpen(false); }}
                          style={{
                            padding: '0.7rem 1rem',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            backgroundColor: filterRole === opt.value ? 'rgba(0, 240, 255, 0.12)' : 'transparent',
                            color: filterRole === opt.value ? 'var(--accent-primary)' : 'var(--text-primary)',
                            borderBottom: '1px solid var(--border-color)'
                          }}
                        >
                          {opt.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="glass-panel" style={{ overflow: 'hidden' }}>
              <div className="admin-table-container">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
                      <th style={{ padding: '1rem 0.8rem', whiteSpace: 'nowrap' }}>ID</th>
                      <th style={{ padding: '1rem 0.8rem', whiteSpace: 'nowrap' }}>Name</th>
                      <th style={{ padding: '1rem 0.8rem' }}>Email</th>
                      <th style={{ padding: '1rem 0.8rem', whiteSpace: 'nowrap' }}>Role</th>
                      <th style={{ padding: '1rem 0.8rem' }}>Seller Info / Rating</th>
                      <th style={{ padding: '1rem 0.8rem', whiteSpace: 'nowrap' }}>Joined Date</th>
                      <th style={{ padding: '1rem 0.8rem', textAlign: 'center', whiteSpace: 'nowrap' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users
                      .filter(u => {
                        // Search filter
                        if (userSearch.trim()) {
                          const query = userSearch.toLowerCase();
                          const fullName = `${u.first_name} ${u.last_name}`.toLowerCase();
                          if (!fullName.includes(query) && !u.email.toLowerCase().includes(query)) return false;
                        }
                        // Role filter
                        if (filterRole === 'all') return true;
                        if (filterRole === 'critical_seller') return u.role === 'seller' && u.avg_rating !== null && u.avg_rating <= 4;
                        return u.role === filterRole;
                      })
                      .map(u => (
                        <tr key={u.id} style={{ 
                          borderTop: '1px solid rgba(255,255,255,0.05)',
                          backgroundColor: (u.role === 'seller' && u.avg_rating !== null && u.avg_rating <= 4) ? 'rgba(239, 68, 68, 0.05)' : 'transparent'
                        }}>
                          <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>#{u.id}</td>
                          <td style={{ padding: '1rem', fontWeight: 'bold' }}>{u.first_name} {u.last_name}</td>
                          <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                          <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                            <span style={{ 
                              display: 'inline-block',
                              padding: '0.3rem 0.6rem', 
                              borderRadius: '20px', 
                              fontSize: '0.8rem', 
                              fontWeight: 'bold',
                              textTransform: 'uppercase',
                              whiteSpace: 'nowrap',
                              background: u.role === 'admin' ? 'rgba(239, 68, 68, 0.2)' : u.role === 'seller' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                              color: u.role === 'admin' ? '#ef4444' : u.role === 'seller' ? '#10b981' : '#3b82f6'
                            }}>
                              {u.role}
                            </span>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            {u.role === 'seller' ? (
                              <div>
                                {u.shop_name && <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>{u.shop_name}</div>}
                                {u.avg_rating !== null ? (
                                  <div style={{ 
                                    display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: 'bold', fontSize: '0.85rem', whiteSpace: 'nowrap',
                                    color: u.avg_rating <= 4 ? 'var(--danger)' : u.avg_rating <= 7 ? 'var(--warning)' : 'var(--success)'
                                  }}>
                                    <Star size={14} fill="currentColor" />
                                    <span>{u.avg_rating}/10</span>
                                    {u.avg_rating <= 4 && <AlertTriangle size={14} color="var(--danger)" title="Low Rating Warning" />}
                                  </div>
                                ) : (
                                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>No Ratings</span>
                                )}
                              </div>
                            ) : (
                              <span style={{ color: 'var(--text-secondary)' }}>-</span>
                            )}
                          </td>
                          <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                            {new Date(u.created_at).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                            {u.id !== user.id ? (
                              <button 
                                onClick={() => handleDeleteUser(u.id)}
                                style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.5rem', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                                title="Delete User Account"
                              >
                                <Trash2 size={18} />
                              </button>
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>Current Admin</span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 3. SELLER VERIFICATION TAB */}
        {activeTab === 'sellers' && (
          <div>
            <div className="admin-toolbar">
              <div>
                <h2 style={{ margin: 0, fontSize: '1.8rem' }}>Seller Verification & Vendor Control</h2>
                <p style={{ color: 'var(--text-secondary)', margin: '0.3rem 0 0 0', fontSize: '0.95rem' }}>
                  Verify merchant credentials, review seller ratings, and issue warnings to prevent platform fraud.
                </p>
              </div>

              {/* Seller Sub-filter & Search */}
              <div className="admin-toolbar-controls">
                <div style={{ position: 'relative', width: '220px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input
                    type="text"
                    placeholder="Search shop/seller..."
                    value={sellerSearch}
                    onChange={(e) => setSellerSearch(e.target.value)}
                    className="form-control"
                    style={{ paddingLeft: '2.4rem', height: '42px', fontSize: '0.9rem', width: '100%' }}
                  />
                </div>

                <div className="admin-filter-scroll">
                  <button
                    className={`btn ${sellerFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}
                    onClick={() => setSellerFilter('all')}
                  >
                    All Sellers
                  </button>
                  <button
                    className={`btn ${sellerFilter === 'unverified' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}
                    onClick={() => setSellerFilter('unverified')}
                  >
                    Pending Verification
                  </button>
                  <button
                    className={`btn ${sellerFilter === 'verified' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}
                    onClick={() => setSellerFilter('verified')}
                  >
                    Verified
                  </button>
                  <button
                    className={`btn ${sellerFilter === 'critical' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}
                    onClick={() => setSellerFilter('critical')}
                  >
                    Critical / Warned
                  </button>
                </div>
              </div>
            </div>

            {/* Sellers Table */}
            <div className="glass-panel" style={{ overflow: 'hidden' }}>
              <div className="admin-table-container">
                <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
                      <th style={{ padding: '0.8rem 0.6rem' }}>Seller / Shop</th>
                      <th style={{ padding: '0.8rem 0.6rem' }}>Contact</th>
                      <th style={{ padding: '0.8rem 0.6rem', whiteSpace: 'nowrap' }}>Rating</th>
                      <th style={{ padding: '0.8rem 0.6rem', whiteSpace: 'nowrap' }}>Warnings</th>
                      <th style={{ padding: '0.8rem 0.6rem', whiteSpace: 'nowrap' }}>Verification Status</th>
                      <th style={{ padding: '0.8rem 0.6rem', textAlign: 'center', whiteSpace: 'nowrap' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users
                      .filter(u => u.role === 'seller')
                      .filter(u => {
                        // Search filter
                        if (sellerSearch.trim()) {
                          const q = sellerSearch.toLowerCase();
                          const name = `${u.first_name} ${u.last_name}`.toLowerCase();
                          const shop = (u.shop_name || '').toLowerCase();
                          if (!name.includes(q) && !shop.includes(q) && !u.email.toLowerCase().includes(q)) return false;
                        }
                        // Tab filter
                        if (sellerFilter === 'verified') return u.is_verified == 1 || u.is_verified === true;
                        if (sellerFilter === 'unverified') return !u.is_verified || u.is_verified == 0;
                        if (sellerFilter === 'critical') return (u.avg_rating !== null && u.avg_rating <= 4) || (u.warning_count && u.warning_count > 0);
                        return true;
                      })
                      .map(s => {
                        const isVerified = s.is_verified == 1 || s.is_verified === true;
                        const warnings = parseInt(s.warning_count || 0);

                        return (
                          <tr key={s.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '0.75rem 0.6rem' }}>
                              <div style={{ fontWeight: 'bold', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                                {s.shop_name || 'Independent Merchant'}
                              </div>
                              <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                                Owner: {s.first_name} {s.last_name} (#{s.id})
                              </div>
                            </td>
                            <td style={{ padding: '0.75rem 0.6rem' }}>
                              <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{s.email}</div>
                              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Joined: {new Date(s.created_at).toLocaleDateString()}</div>
                            </td>
                            <td style={{ padding: '0.75rem 0.6rem', whiteSpace: 'nowrap' }}>
                              {s.avg_rating !== null ? (
                                <div style={{ 
                                  display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: 'bold', fontSize: '0.85rem', whiteSpace: 'nowrap',
                                  color: s.avg_rating <= 4 ? 'var(--danger)' : s.avg_rating <= 7 ? 'var(--warning)' : 'var(--success)'
                                }}>
                                  <Star size={14} fill="currentColor" />
                                  <span>{s.avg_rating}/10</span>
                                </div>
                              ) : (
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>No Ratings</span>
                              )}
                            </td>
                            <td style={{ padding: '0.75rem 0.6rem', whiteSpace: 'nowrap' }}>
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                padding: '0.25rem 0.55rem',
                                borderRadius: '10px',
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                whiteSpace: 'nowrap',
                                background: warnings >= 3 ? 'rgba(239, 68, 68, 0.2)' : warnings > 0 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                                color: warnings >= 3 ? 'var(--danger)' : warnings > 0 ? 'var(--warning)' : 'var(--text-secondary)'
                              }}>
                                {warnings > 0 ? (
                                  <>
                                    <AlertTriangle size={12} color={warnings >= 3 ? 'var(--danger)' : 'var(--warning)'} />
                                    <span>{warnings} Warn{warnings > 1 ? 's' : ''}</span>
                                  </>
                                ) : (
                                  <span>Clean</span>
                                )}
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem 0.6rem', whiteSpace: 'nowrap' }}>
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                padding: '0.25rem 0.55rem',
                                borderRadius: '14px',
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                whiteSpace: 'nowrap',
                                background: isVerified ? 'rgba(0, 230, 118, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                color: isVerified ? 'var(--success)' : 'var(--warning)'
                              }}>
                                {isVerified ? <ShieldCheck size={13} /> : <ShieldAlert size={13} />}
                                <span>{isVerified ? 'Verified' : 'Pending'}</span>
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem 0.6rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                              <div style={{ display: 'inline-flex', gap: '0.35rem', alignItems: 'center', whiteSpace: 'nowrap' }}>
                                {/* Toggle Verification */}
                                <button
                                  onClick={() => handleToggleSellerVerify(s.id)}
                                  className={`btn ${isVerified ? 'btn-outline' : 'btn-primary'}`}
                                  style={{
                                    padding: '0.28rem 0.55rem',
                                    fontSize: '0.75rem',
                                    whiteSpace: 'nowrap',
                                    borderColor: isVerified ? 'var(--warning)' : undefined,
                                    color: isVerified ? 'var(--warning)' : undefined
                                  }}
                                  title={isVerified ? "Revoke Verification" : "Verify Seller"}
                                >
                                  {isVerified ? 'Revoke' : 'Verify'}
                                </button>

                                {/* Issue Warning */}
                                <button
                                  onClick={() => handleWarnSeller(s.id)}
                                  style={{
                                    background: 'rgba(245, 158, 11, 0.1)',
                                    border: '1px solid rgba(245, 158, 11, 0.3)',
                                    color: 'var(--warning)',
                                    padding: '0.28rem 0.45rem',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '0.75rem',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.2rem',
                                    whiteSpace: 'nowrap'
                                  }}
                                  title="Issue Policy Warning"
                                >
                                  <AlertTriangle size={12} /> Warn
                                </button>

                                {/* Delete Seller Account */}
                                <button
                                  onClick={() => handleDeleteUser(s.id)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--danger)',
                                    cursor: 'pointer',
                                    padding: '0.3rem',
                                    borderRadius: '4px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                  title="Remove Seller Account"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 4. PRODUCT MODERATION TAB */}
        {activeTab === 'products' && (
          <div>
            <div className="admin-toolbar">
              <div>
                <h2 style={{ margin: 0, fontSize: '1.8rem' }}>Product Moderation</h2>
                <p style={{ color: 'var(--text-secondary)', margin: '0.3rem 0 0 0', fontSize: '0.95rem' }}>
                  Inspect and moderate active hardware listings across all sellers. Remove counterfeit or policy-violating items.
                </p>
              </div>

              {/* Product Search & Category Filter */}
              <div className="admin-toolbar-controls">
                <div style={{ position: 'relative', width: '220px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input
                    type="text"
                    placeholder="Search product / seller..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="form-control"
                    style={{ paddingLeft: '2.4rem', height: '42px', fontSize: '0.9rem', width: '100%' }}
                  />
                </div>

                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="form-control"
                  style={{ width: '180px', height: '42px', fontSize: '0.9rem' }}
                >
                  <option value="all">All Categories</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Products Table */}
            <div className="glass-panel" style={{ overflow: 'hidden' }}>
              <div className="admin-table-container">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
                      <th style={{ padding: '1rem 0.8rem' }}>Product</th>
                      <th style={{ padding: '1rem 0.8rem', whiteSpace: 'nowrap' }}>Category</th>
                      <th style={{ padding: '1rem 0.8rem' }}>Seller</th>
                      <th style={{ padding: '1rem 0.8rem', whiteSpace: 'nowrap' }}>Price</th>
                      <th style={{ padding: '1rem 0.8rem', whiteSpace: 'nowrap' }}>Stock</th>
                      <th style={{ padding: '1rem 0.8rem', textAlign: 'center', whiteSpace: 'nowrap' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products
                      .filter(p => {
                        // Category filter
                        if (productCategoryFilter !== 'all' && p.category_name !== productCategoryFilter) return false;
                        // Search filter
                        if (productSearch.trim()) {
                          const q = productSearch.toLowerCase();
                          const title = (p.title || '').toLowerCase();
                          const seller = (p.seller_name || '').toLowerCase();
                          if (!title.includes(q) && !seller.includes(q)) return false;
                        }
                        return true;
                      })
                      .map(p => (
                        <tr key={p.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              {p.image_url ? (
                                <img
                                  src={p.image_url}
                                  alt={p.title}
                                  style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)' }}
                                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                              ) : (
                                <div style={{ width: '48px', height: '48px', borderRadius: '6px', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                                  <Package size={22} />
                                </div>
                              )}
                              <div>
                                <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.95rem' }}>{p.title}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Product ID: #{p.id}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                            <span style={{ 
                              display: 'inline-block',
                              padding: '0.25rem 0.6rem', 
                              borderRadius: '12px', 
                              fontSize: '0.8rem', 
                              fontWeight: '600',
                              whiteSpace: 'nowrap',
                              background: 'rgba(139, 92, 246, 0.15)',
                              color: '#a78bfa'
                            }}>
                              {p.category_name || 'Hardware'}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            {p.seller_name || 'Unknown Seller'}
                          </td>
                          <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--accent-primary)', fontSize: '0.95rem', whiteSpace: 'nowrap' }}>
                            LKR {parseFloat(p.price || 0).toLocaleString()}
                          </td>
                          <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                            <span style={{ 
                              color: p.stock_quantity > 0 ? 'var(--text-primary)' : 'var(--danger)',
                              fontWeight: p.stock_quantity > 0 ? 'normal' : 'bold',
                              fontSize: '0.9rem',
                              whiteSpace: 'nowrap'
                            }}>
                              {p.stock_quantity} units
                            </span>
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="btn btn-outline"
                              style={{
                                padding: '0.4rem 0.8rem',
                                fontSize: '0.8rem',
                                borderColor: 'var(--danger)',
                                color: 'var(--danger)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                whiteSpace: 'nowrap'
                              }}
                              title="Remove Product"
                            >
                              <Trash2 size={14} /> Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 5. CATEGORY MANAGEMENT TAB */}
        {activeTab === 'categories' && (
          <div>
            <div className="admin-toolbar">
              <div>
                <h2 style={{ margin: 0, fontSize: '1.8rem' }}>Hardware Category Management</h2>
                <p style={{ color: 'var(--text-secondary)', margin: '0.3rem 0 0 0', fontSize: '0.95rem' }}>
                  Create and organize component categories for the PC Builder, Filter Matrix, and Marketplace.
                </p>
              </div>
            </div>

            <div className="admin-two-column-grid">
              
              {/* Add Category Form */}
              <div className="glass-panel" style={{ padding: '1.75rem' }}>
                <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.3rem' }}>
                  <Plus size={20} color="var(--accent-primary)" /> Add New Category
                </h3>

                <form onSubmit={handleAddCategory} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Category Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Graphics Cards (GPU), Processors (CPU)"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="form-control"
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Description (Optional)</label>
                    <textarea
                      placeholder="Brief summary of hardware specs and component roles..."
                      rows="3"
                      value={newCategoryDesc}
                      onChange={(e) => setNewCategoryDesc(e.target.value)}
                      className="form-control"
                      style={{ width: '100%', resize: 'vertical' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingCat}
                    className="btn btn-primary"
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    <Plus size={18} /> {isSubmittingCat ? 'Creating...' : 'Create Category'}
                  </button>
                </form>
              </div>

              {/* Existing Categories List */}
              <div className="glass-panel" style={{ padding: '1.75rem' }}>
                <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.3rem' }}>
                  <Layers size={20} color="#ec4899" /> Existing Categories ({categories.length})
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '500px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                  {categories.map(cat => (
                    <div
                      key={cat.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem 1.25rem',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: 'var(--border-radius-md)',
                        border: '1px solid var(--border-color)',
                        gap: '1rem'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '1.05rem', color: 'var(--text-primary)' }}>{cat.name}</div>
                        {cat.description && (
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.2rem' }}>{cat.description}</div>
                        )}
                        <span style={{ 
                          display: 'inline-block', 
                          marginTop: '0.4rem', 
                          fontSize: '0.75rem', 
                          padding: '0.15rem 0.5rem', 
                          borderRadius: '10px', 
                          background: 'rgba(0, 240, 255, 0.1)', 
                          color: 'var(--accent-primary)' 
                        }}>
                          {cat.product_count || 0} products linked
                        </span>
                      </div>

                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--danger)',
                          cursor: 'pointer',
                          padding: '0.5rem',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                        title="Delete Category"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 6. DISPUTES & COMPLAINTS TAB */}
        {activeTab === 'disputes' && (
          <div>
            <div className="admin-toolbar">
              <div>
                <h2 style={{ margin: 0, fontSize: '1.8rem' }}>Disputes & Complaints Resolution</h2>
                <p style={{ color: 'var(--text-secondary)', margin: '0.3rem 0 0 0', fontSize: '0.95rem' }}>
                  Arbitrate buyer grievances, counterfeit claims, and delivery disputes between buyers and sellers.
                </p>
              </div>

              {/* Dispute Filter */}
              <div className="admin-filter-scroll">
                <button
                  className={`btn ${complaintFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                  onClick={() => setComplaintFilter('all')}
                >
                  All ({complaints.length})
                </button>
                <button
                  className={`btn ${complaintFilter === 'pending' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                  onClick={() => setComplaintFilter('pending')}
                >
                  Pending ({pendingComplaintsCount})
                </button>
                <button
                  className={`btn ${complaintFilter === 'resolved' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                  onClick={() => setComplaintFilter('resolved')}
                >
                  Resolved ({complaints.length - pendingComplaintsCount})
                </button>
              </div>
            </div>

            {complaints.length === 0 ? (
              <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                <MessageSquareWarning size={48} color="var(--text-secondary)" style={{ margin: '0 auto 1.5rem', opacity: 0.5 }} />
                <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem' }}>No Disputes Recorded</h3>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>There are currently no complaints filed by buyers.</p>
              </div>
            ) : (
              <div className="glass-panel" style={{ overflow: 'hidden' }}>
                <div className="admin-table-container">
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
                        <th style={{ padding: '1rem 0.8rem', whiteSpace: 'nowrap' }}>ID</th>
                        <th style={{ padding: '1rem 0.8rem' }}>Buyer Details</th>
                        <th style={{ padding: '1rem 0.8rem' }}>Seller Details</th>
                        <th style={{ padding: '1rem 0.8rem' }}>Grievance / Reason</th>
                        <th style={{ padding: '1rem 0.8rem', whiteSpace: 'nowrap' }}>Status</th>
                        <th style={{ padding: '1rem 0.8rem', textAlign: 'center', whiteSpace: 'nowrap' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {complaints
                        .filter(c => {
                          if (complaintFilter === 'pending') return c.status === 'pending';
                          if (complaintFilter === 'resolved') return c.status === 'resolved';
                          return true;
                        })
                        .map(c => (
                          <tr key={c.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>#{c.id}</td>
                            <td style={{ padding: '1rem' }}>
                              <div style={{ fontWeight: 'bold' }}>{c.buyer_name}</div>
                              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{c.buyer_email}</div>
                            </td>
                            <td style={{ padding: '1rem' }}>
                              <div style={{ fontWeight: 'bold' }}>{c.seller_name}</div>
                              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{c.seller_email}</div>
                            </td>
                            <td style={{ padding: '1rem', maxWidth: '300px' }}>
                              <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', fontSize: '0.9rem' }}>{c.reason}</div>
                            </td>
                            <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                              <span style={{
                                display: 'inline-block',
                                padding: '0.3rem 0.6rem',
                                borderRadius: '20px',
                                fontSize: '0.8rem',
                                fontWeight: 'bold',
                                textTransform: 'capitalize',
                                whiteSpace: 'nowrap',
                                background: c.status === 'pending' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                                color: c.status === 'pending' ? 'var(--danger)' : 'var(--success)'
                              }}>
                                {c.status}
                              </span>
                            </td>
                            <td style={{ padding: '1rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                              {c.status === 'pending' ? (
                                <button
                                  onClick={() => handleResolveComplaint(c.id)}
                                  style={{
                                    background: 'none',
                                    border: '1px solid var(--success)',
                                    color: 'var(--success)',
                                    cursor: 'pointer',
                                    padding: '0.4rem 0.8rem',
                                    borderRadius: '4px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    fontSize: '0.85rem',
                                    fontWeight: '500',
                                    whiteSpace: 'nowrap',
                                    transition: 'background 0.2s'
                                  }}
                                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'}
                                  onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                                  title="Resolve Complaint"
                                >
                                  <CheckCircle size={14} /> Resolve
                                </button>
                              ) : (
                                <span style={{ color: 'var(--success)', fontWeight: '500', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', whiteSpace: 'nowrap' }}>
                                  <CheckCircle size={14} /> Resolved
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminDashboard;
