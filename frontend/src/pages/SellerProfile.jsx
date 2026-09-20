import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SellerSidebar from '../components/SellerSidebar';
import { 
  Store, User, Phone, MapPin, ShieldCheck, AlertTriangle, 
  Lock, Save, Shield, Menu, CheckCircle2, AlertCircle 
} from 'lucide-react';

const SellerProfile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Profile data
  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    postal_code: user?.postal_code || user?.postalCode || '',
    shop_name: user?.shop_name || '',
    is_verified: false,
    warning_count: 0
  });

  const [loading, setLoading] = useState(true);
  const [profileUpdating, setProfileUpdating] = useState(false);
  const [profileStatus, setProfileStatus] = useState({ type: '', message: '' });

  // Password data
  const [pwdData, setPwdData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [pwdUpdating, setPwdUpdating] = useState(false);
  const [pwdStatus, setPwdStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    if (!user || user.role !== 'seller') {
      navigate('/login');
      return;
    }

    // Fetch freshest seller profile
    fetch(`http://localhost/SpecZone/backend/api/profile.php?action=get_profile&user_id=${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.profile) {
          setProfileData({
            first_name: data.profile.first_name || '',
            last_name: data.profile.last_name || '',
            email: data.profile.email || '',
            phone: data.profile.phone || data.profile.shop_phone || '',
            address: data.profile.address || data.profile.shop_address || '',
            city: data.profile.city || '',
            postal_code: data.profile.postal_code || '',
            shop_name: data.profile.shop_name || '',
            is_verified: data.profile.is_verified || false,
            warning_count: data.profile.warning_count || 0
          });
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching seller profile:", err);
        setLoading(false);
      });
  }, [user, navigate]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileStatus({ type: '', message: '' });

    if (/\d/.test(profileData.first_name.trim()) || /\d/.test(profileData.last_name.trim())) {
      setProfileStatus({ type: 'error', message: 'Name cannot contain numbers or digits. Please enter letters only.' });
      return;
    }

    setProfileUpdating(true);
    try {
      const res = await fetch('http://localhost/SpecZone/backend/api/profile.php?action=update_profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          first_name: profileData.first_name.trim(),
          last_name: profileData.last_name.trim(),
          phone: profileData.phone.trim(),
          address: profileData.address.trim(),
          city: profileData.city.trim(),
          postal_code: profileData.postal_code.trim(),
          shop_name: profileData.shop_name.trim(),
          role: 'seller'
        })
      });
      const data = await res.json();

      if (res.ok) {
        setProfileStatus({ type: 'success', message: 'Store and profile settings updated successfully!' });
        if (updateUser) {
          updateUser({
            first_name: profileData.first_name.trim(),
            last_name: profileData.last_name.trim(),
            phone: profileData.phone.trim(),
            address: profileData.address.trim(),
            city: profileData.city.trim(),
            postal_code: profileData.postal_code.trim(),
            shop_name: profileData.shop_name.trim()
          });
        }
      } else {
        setProfileStatus({ type: 'error', message: data.message || 'Failed to update profile.' });
      }
    } catch (err) {
      console.error(err);
      setProfileStatus({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setProfileUpdating(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdStatus({ type: '', message: '' });

    if (pwdData.new_password !== pwdData.confirm_password) {
      setPwdStatus({ type: 'error', message: 'New passwords do not match!' });
      return;
    }

    if (pwdData.new_password.length < 8) {
      setPwdStatus({ type: 'error', message: 'New password must be at least 8 characters long.' });
      return;
    }
    if (!/[A-Z]/.test(pwdData.new_password)) {
      setPwdStatus({ type: 'error', message: 'New password must contain at least one capital letter (A-Z).' });
      return;
    }
    if (!/[a-z]/.test(pwdData.new_password)) {
      setPwdStatus({ type: 'error', message: 'New password must contain at least one simple letter (a-z).' });
      return;
    }
    if (!/\d/.test(pwdData.new_password)) {
      setPwdStatus({ type: 'error', message: 'New password must contain at least one number (0-9).' });
      return;
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(pwdData.new_password)) {
      setPwdStatus({ type: 'error', message: 'New password must contain at least one special character (!@#$%^&*).' });
      return;
    }

    setPwdUpdating(true);
    try {
      const res = await fetch('http://localhost/SpecZone/backend/api/profile.php?action=change_password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          current_password: pwdData.current_password,
          new_password: pwdData.new_password
        })
      });
      const data = await res.json();

      if (res.ok) {
        setPwdStatus({ type: 'success', message: 'Password changed successfully!' });
        setPwdData({ current_password: '', new_password: '', confirm_password: '' });
      } else {
        setPwdStatus({ type: 'error', message: data.message || 'Failed to change password.' });
      }
    } catch (err) {
      console.error(err);
      setPwdStatus({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setPwdUpdating(false);
    }
  };

  const pwd = pwdData.new_password;
  const hasPwdMinLength = pwd.length >= 8;
  const hasPwdUppercase = /[A-Z]/.test(pwd);
  const hasPwdLowercase = /[a-z]/.test(pwd);
  const hasPwdNumber = /\d/.test(pwd);
  const hasPwdSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(pwd);

  return (
    <div className="dashboard-layout" style={{ minHeight: '100vh' }}>
      <SellerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && <div className="seller-dashboard-overlay" onClick={() => setSidebarOpen(false)} />}

      <main className="dashboard-content seller-dashboard-content">
        <div className="seller-mobile-header">
          <button className="seller-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <Menu size={24} />
          </button>
          <span className="seller-mobile-title">Store & Profile</span>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', margin: 0 }}>Store & Profile Settings</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '0.3rem 0 0 0' }}>Manage your merchant profile, store contact information, and security</p>
        </div>

        {/* Merchant Status Card */}
        <div className="glass-panel" style={{ padding: '1.5rem 2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(0, 240, 255, 0.12)',
              border: '2px solid var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary)'
            }}>
              <Store size={32} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.4rem' }}>{profileData.shop_name || `${profileData.first_name}'s PC Store`}</h3>
              <p style={{ margin: '0.2rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Owner: {profileData.first_name} {profileData.last_name} ({profileData.email})
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              background: profileData.is_verified ? 'rgba(0, 230, 118, 0.12)' : 'rgba(255, 171, 0, 0.12)',
              border: `1px solid ${profileData.is_verified ? 'var(--success)' : 'var(--warning)'}`,
              color: profileData.is_verified ? 'var(--success)' : 'var(--warning)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.85rem',
              fontWeight: 'bold'
            }}>
              <ShieldCheck size={16} />
              {profileData.is_verified ? 'Verified Merchant' : 'Pending Verification'}
            </div>

            {profileData.warning_count > 0 && (
              <div style={{
                padding: '0.4rem 0.8rem',
                borderRadius: '6px',
                background: 'rgba(255, 51, 102, 0.12)',
                border: '1px solid var(--danger)',
                color: 'var(--danger)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.85rem',
                fontWeight: 'bold'
              }}>
                <AlertTriangle size={16} />
                {profileData.warning_count} Warning{profileData.warning_count > 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>

        {/* Form Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
          
          {/* 1. Store & Personal Info */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
              <Store size={22} color="var(--accent-primary)" />
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Store Information</h3>
            </div>

            {profileStatus.message && (
              <div style={{
                padding: '0.8rem 1rem',
                marginBottom: '1.5rem',
                borderRadius: 'var(--border-radius-sm)',
                backgroundColor: profileStatus.type === 'error' ? 'rgba(255, 51, 102, 0.1)' : 'rgba(0, 230, 118, 0.1)',
                border: `1px solid ${profileStatus.type === 'error' ? 'var(--danger)' : 'var(--success)'}`,
                color: profileStatus.type === 'error' ? 'var(--danger)' : 'var(--success)',
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                {profileStatus.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                <span>{profileStatus.message}</span>
              </div>
            )}

            <form onSubmit={handleProfileUpdate}>
              <div className="form-group">
                <label className="form-label">Shop / Store Display Name</label>
                <input 
                  type="text"
                  className="form-control"
                  value={profileData.shop_name}
                  onChange={(e) => setProfileData({ ...profileData, shop_name: e.target.value })}
                  placeholder="e.g. Apex Hardware Store"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Seller First Name</label>
                  <input 
                    type="text" 
                    className="form-control"
                    value={profileData.first_name}
                    onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                    pattern="^[^\d]+$"
                    title="First name cannot contain numbers"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Seller Last Name</label>
                  <input 
                    type="text" 
                    className="form-control"
                    value={profileData.last_name}
                    onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                    pattern="^[^\d]+$"
                    title="Last name cannot contain numbers"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Account Email (Read Only)</label>
                <input 
                  type="email" 
                  className="form-control"
                  value={profileData.email}
                  disabled
                  style={{ opacity: 0.6, cursor: 'not-allowed' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Phone size={14} color="var(--accent-primary)" /> Store Contact Phone
                    </span>
                  </label>
                  <input 
                    type="tel" 
                    className="form-control"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    placeholder="e.g. +94 11 234 5678"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <MapPin size={14} color="var(--accent-primary)" /> City / Town
                    </span>
                  </label>
                  <input 
                    type="text" 
                    className="form-control"
                    value={profileData.city}
                    onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                    placeholder="e.g. Colombo, Kandy"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <MapPin size={14} color="var(--accent-primary)" /> Store / Pickup Address
                    </span>
                  </label>
                  <input 
                    type="text"
                    className="form-control"
                    value={profileData.address}
                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                    placeholder="e.g. No 100, Galle Road"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Postal Code</label>
                  <input 
                    type="text" 
                    className="form-control"
                    value={profileData.postal_code}
                    onChange={(e) => setProfileData({ ...profileData, postal_code: e.target.value })}
                    placeholder="e.g. 00400"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}
                disabled={profileUpdating}
              >
                <Save size={16} /> {profileUpdating ? 'Saving Store Settings...' : 'Save Store Settings'}
              </button>
            </form>
          </div>

          {/* 2. Change Password */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
              <Lock size={22} color="var(--accent-primary)" />
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Change Password</h3>
            </div>

            {pwdStatus.message && (
              <div style={{
                padding: '0.8rem 1rem',
                marginBottom: '1.5rem',
                borderRadius: 'var(--border-radius-sm)',
                backgroundColor: pwdStatus.type === 'error' ? 'rgba(255, 51, 102, 0.1)' : 'rgba(0, 230, 118, 0.1)',
                border: `1px solid ${pwdStatus.type === 'error' ? 'var(--danger)' : 'var(--success)'}`,
                color: pwdStatus.type === 'error' ? 'var(--danger)' : 'var(--success)',
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                {pwdStatus.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                <span>{pwdStatus.message}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input 
                  type="password" 
                  className="form-control"
                  placeholder="••••••••"
                  value={pwdData.current_password}
                  onChange={(e) => setPwdData({ ...pwdData, current_password: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <input 
                  type="password" 
                  className="form-control"
                  placeholder="Enter strong password"
                  value={pwdData.new_password}
                  onChange={(e) => setPwdData({ ...pwdData, new_password: e.target.value })}
                  required
                />
                {/* Live Password Checklist */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.4rem', marginTop: '0.6rem', fontSize: '0.78rem' }}>
                  <span style={{ color: hasPwdMinLength ? 'var(--success)' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: hasPwdMinLength ? '600' : 'normal' }}>
                    {hasPwdMinLength ? '✓' : '○'} Min. 8 Chars
                  </span>
                  <span style={{ color: hasPwdUppercase ? 'var(--success)' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: hasPwdUppercase ? '600' : 'normal' }}>
                    {hasPwdUppercase ? '✓' : '○'} Capital (A-Z)
                  </span>
                  <span style={{ color: hasPwdLowercase ? 'var(--success)' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: hasPwdLowercase ? '600' : 'normal' }}>
                    {hasPwdLowercase ? '✓' : '○'} Simple (a-z)
                  </span>
                  <span style={{ color: hasPwdNumber ? 'var(--success)' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: hasPwdNumber ? '600' : 'normal' }}>
                    {hasPwdNumber ? '✓' : '○'} Number (0-9)
                  </span>
                  <span style={{ color: hasPwdSpecial ? 'var(--success)' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: hasPwdSpecial ? '600' : 'normal' }}>
                    {hasPwdSpecial ? '✓' : '○'} Special (!@#$)
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input 
                  type="password" 
                  className="form-control"
                  placeholder="Re-enter new password"
                  value={pwdData.confirm_password}
                  onChange={(e) => setPwdData({ ...pwdData, confirm_password: e.target.value })}
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}
                disabled={pwdUpdating}
              >
                <Shield size={16} /> {pwdUpdating ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          </div>

        </div>
      </main>
    </div>
  );
};

export default SellerProfile;
