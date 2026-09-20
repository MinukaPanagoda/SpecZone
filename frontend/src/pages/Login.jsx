import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { KeyRound, ShieldCheck, Mail, ArrowLeft, CheckCircle2, AlertCircle, X } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Password Recovery State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState(1); // 1: Email, 2: OTP, 3: New Password, 4: Done
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryOtp, setRecoveryOtp] = useState('');
  const [serverOtp, setServerOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [recoveryStatus, setRecoveryStatus] = useState({ type: '', message: '' });
  const [recoveryLoading, setRecoveryLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost/SpecZone/backend/api/auth.php?action=login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: 'Login successful! Welcome back, ' + data.user.first_name });
        
        // Save user data to context and localStorage
        login(data.user);

        // Redirect based on role
        setTimeout(() => {
          if (data.user.role === 'admin') {
            navigate('/admin/dashboard');
          } else if (data.user.role === 'seller') {
            navigate('/seller/dashboard');
          } else {
            navigate('/buyer/dashboard');
          }
        }, 1500);
      } else {
        setStatus({ type: 'error', message: data.message || 'Login failed' });
      }
    } catch (error) {
      console.error('Error:', error);
      setStatus({ type: 'error', message: 'Network error. Please make sure XAMPP Apache is running.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 1: Request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setRecoveryStatus({ type: '', message: '' });
    setRecoveryLoading(true);

    try {
      const response = await fetch('http://localhost/SpecZone/backend/api/auth.php?action=forgot_password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: recoveryEmail.trim() })
      });
      const data = await response.json();

      if (response.ok) {
        setServerOtp(data.demo_otp || '123456');
        setRecoveryStep(2);
        setRecoveryStatus({
          type: 'success',
          message: `OTP sent! (Demo Code: ${data.demo_otp})`
        });
      } else {
        setRecoveryStatus({ type: 'error', message: data.message || 'Failed to request reset.' });
      }
    } catch (err) {
      console.error(err);
      setRecoveryStatus({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setRecoveryLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (recoveryOtp.trim() === serverOtp.trim() || recoveryOtp.trim() === '123456') {
      setRecoveryStatus({ type: '', message: '' });
      setRecoveryStep(3);
    } else {
      setRecoveryStatus({ type: 'error', message: 'Invalid OTP code. Please check and try again.' });
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setRecoveryStatus({ type: '', message: '' });

    if (newPassword !== confirmPassword) {
      setRecoveryStatus({ type: 'error', message: 'Passwords do not match!' });
      return;
    }

    if (newPassword.length < 8) {
      setRecoveryStatus({ type: 'error', message: 'Password must be at least 8 characters long.' });
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setRecoveryStatus({ type: 'error', message: 'Password must contain at least one capital letter (A-Z).' });
      return;
    }
    if (!/[a-z]/.test(newPassword)) {
      setRecoveryStatus({ type: 'error', message: 'Password must contain at least one simple letter (a-z).' });
      return;
    }
    if (!/\d/.test(newPassword)) {
      setRecoveryStatus({ type: 'error', message: 'Password must contain at least one number (0-9).' });
      return;
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(newPassword)) {
      setRecoveryStatus({ type: 'error', message: 'Password must contain at least one special character (!@#$%^&*).' });
      return;
    }

    setRecoveryLoading(true);
    try {
      const response = await fetch('http://localhost/SpecZone/backend/api/auth.php?action=reset_password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: recoveryEmail.trim(),
          new_password: newPassword
        })
      });
      const data = await response.json();

      if (response.ok) {
        setRecoveryStep(4);
        setEmail(recoveryEmail);
      } else {
        setRecoveryStatus({ type: 'error', message: data.message || 'Failed to reset password.' });
      }
    } catch (err) {
      console.error(err);
      setRecoveryStatus({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setRecoveryLoading(false);
    }
  };

  const resetModalState = () => {
    setShowForgotModal(false);
    setRecoveryStep(1);
    setRecoveryEmail('');
    setRecoveryOtp('');
    setServerOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setRecoveryStatus({ type: '', message: '' });
  };

  // Password Checklist for recovery modal
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /\d/.test(newPassword);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(newPassword);

  return (
    <div className="container auth-container">
      <div className="glass-panel auth-card">
        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', textAlign: 'center' }}>
          Welcome Back
        </h2>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '2rem' }}>
          Sign in to access your SpecZone account
        </p>

        {status.message && (
          <div style={{
            padding: '1rem',
            marginBottom: '1.5rem',
            borderRadius: 'var(--border-radius-sm)',
            backgroundColor: status.type === 'error' ? 'rgba(255, 51, 102, 0.1)' : 'rgba(0, 230, 118, 0.1)',
            border: `1px solid ${status.type === 'error' ? 'var(--danger)' : 'var(--success)'}`,
            color: status.type === 'error' ? 'var(--danger)' : 'var(--success)'
          }}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-control" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. buyer@speczone.com"
              required 
            />
          </div>
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label className="form-label" style={{ margin: 0 }}>Password</label>
              <button
                type="button"
                onClick={() => {
                  setRecoveryEmail(email);
                  setShowForgotModal(true);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-primary)',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline'
                }}
              >
                Forgot Password?
              </button>
            </div>
            <input 
              type="password" 
              className="form-control" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required 
            />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>Register here</Link>
        </div>
      </div>

      {/* Forgot / Recover Password Modal */}
      {showForgotModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}
          onClick={resetModalState}
        >
          <div 
            className="glass-panel" 
            style={{
              maxWidth: '480px',
              width: '100%',
              padding: '2rem',
              position: 'relative',
              boxShadow: '0 20px 50px rgba(0, 240, 255, 0.15)',
              border: '1px solid rgba(0, 240, 255, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={resetModalState}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '0.4rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ 
                width: '50px', 
                height: '50px', 
                borderRadius: '50%', 
                background: 'rgba(0, 240, 255, 0.12)', 
                border: '1px solid rgba(0, 240, 255, 0.3)',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 0.8rem',
                color: 'var(--accent-primary)'
              }}>
                <KeyRound size={26} />
              </div>
              <h3 style={{ fontSize: '1.4rem', margin: 0 }}>Password Recovery</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.3rem' }}>
                {recoveryStep === 1 && "Enter your email to receive a 6-digit verification code."}
                {recoveryStep === 2 && "Enter the 6-digit OTP code sent to your email."}
                {recoveryStep === 3 && "Create a secure new password for your account."}
                {recoveryStep === 4 && "Your password has been successfully updated!"}
              </p>
            </div>

            {/* Status Alert */}
            {recoveryStatus.message && (
              <div style={{
                padding: '0.75rem 1rem',
                marginBottom: '1rem',
                borderRadius: 'var(--border-radius-sm)',
                backgroundColor: recoveryStatus.type === 'error' ? 'rgba(255, 51, 102, 0.1)' : 'rgba(0, 230, 118, 0.1)',
                border: `1px solid ${recoveryStatus.type === 'error' ? 'var(--danger)' : 'var(--success)'}`,
                color: recoveryStatus.type === 'error' ? 'var(--danger)' : 'var(--success)',
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                {recoveryStatus.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                <span>{recoveryStatus.message}</span>
              </div>
            )}

            {/* Step 1: Request OTP */}
            {recoveryStep === 1 && (
              <form onSubmit={handleRequestOtp}>
                <div className="form-group">
                  <label className="form-label">Registered Email Address</label>
                  <input 
                    type="email"
                    className="form-control"
                    placeholder="e.g. user@speczone.com"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ width: '100%', marginTop: '1rem' }} 
                  disabled={recoveryLoading}
                >
                  {recoveryLoading ? 'Sending OTP...' : 'Send Verification OTP'}
                </button>
              </form>
            )}

            {/* Step 2: Verify OTP */}
            {recoveryStep === 2 && (
              <form onSubmit={handleVerifyOtp}>
                <div style={{
                  padding: '0.75rem',
                  marginBottom: '1rem',
                  background: 'rgba(0, 240, 255, 0.08)',
                  border: '1px dashed rgba(0, 240, 255, 0.3)',
                  borderRadius: '6px',
                  fontSize: '0.85rem'
                }}>
                  <div style={{ color: 'var(--accent-primary)', fontWeight: '600', marginBottom: '0.2rem' }}>
                    Demo Environment Notice:
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>
                    Your OTP code is <strong style={{ color: '#fff', fontSize: '1.05rem', letterSpacing: '2px' }}>{serverOtp}</strong>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setRecoveryOtp(serverOtp)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-primary)',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      padding: 0,
                      marginTop: '0.4rem',
                      textDecoration: 'underline'
                    }}
                  >
                    Auto-fill OTP
                  </button>
                </div>

                <div className="form-group">
                  <label className="form-label">Enter 6-Digit OTP</label>
                  <input 
                    type="text"
                    className="form-control"
                    placeholder="6-digit code"
                    maxLength={6}
                    value={recoveryOtp}
                    onChange={(e) => setRecoveryOtp(e.target.value)}
                    style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '1.2rem', fontWeight: 'bold' }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1rem' }}>
                  <button 
                    type="button" 
                    className="btn btn-outline" 
                    style={{ flex: 1 }}
                    onClick={() => setRecoveryStep(1)}
                  >
                    Back
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{ flex: 2 }}
                  >
                    Verify Code
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: New Password */}
            {recoveryStep === 3 && (
              <form onSubmit={handleResetPassword}>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input 
                    type="password"
                    className="form-control"
                    placeholder="Enter strong password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  {/* Live Password Checklist */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.3rem', marginTop: '0.5rem', fontSize: '0.74rem' }}>
                    <span style={{ color: hasMinLength ? 'var(--success)' : 'var(--text-secondary)' }}>
                      {hasMinLength ? '✓' : '○'} Min 8 chars
                    </span>
                    <span style={{ color: hasUppercase ? 'var(--success)' : 'var(--text-secondary)' }}>
                      {hasUppercase ? '✓' : '○'} Upper (A-Z)
                    </span>
                    <span style={{ color: hasLowercase ? 'var(--success)' : 'var(--text-secondary)' }}>
                      {hasLowercase ? '✓' : '○'} Lower (a-z)
                    </span>
                    <span style={{ color: hasNumber ? 'var(--success)' : 'var(--text-secondary)' }}>
                      {hasNumber ? '✓' : '○'} Number (0-9)
                    </span>
                    <span style={{ color: hasSpecial ? 'var(--success)' : 'var(--text-secondary)' }}>
                      {hasSpecial ? '✓' : '○'} Special (!@#$)
                    </span>
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '0.8rem' }}>
                  <label className="form-label">Confirm New Password</label>
                  <input 
                    type="password"
                    className="form-control"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ width: '100%', marginTop: '1.2rem' }}
                  disabled={recoveryLoading}
                >
                  {recoveryLoading ? 'Updating Password...' : 'Save New Password'}
                </button>
              </form>
            )}

            {/* Step 4: Success Message */}
            {recoveryStep === 4 && (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <CheckCircle2 size={50} color="var(--success)" style={{ margin: '0 auto 1rem' }} />
                <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Password Reset Complete!</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Your password has been securely updated. You can now log into SpecZone using your new credentials.
                </p>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  style={{ width: '100%' }}
                  onClick={resetModalState}
                >
                  Proceed to Login
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
