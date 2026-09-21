import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { KeyRound, ShieldCheck, Mail, ArrowLeft, CheckCircle2, AlertCircle, X, Copy, Check, Inbox, ChevronDown, ChevronRight } from 'lucide-react';

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
  const [showEmailToast, setShowEmailToast] = useState(false);
  const [isEmailOpened, setIsEmailOpened] = useState(false);
  const [copiedOtp, setCopiedOtp] = useState(false);

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
        const otpCode = data.demo_otp || '123456';
        setServerOtp(otpCode);
        setRecoveryStep(2);
        setIsEmailOpened(false);
        setShowEmailToast(true);
        setRecoveryStatus({
          type: 'success',
          message: 'Verification code simulated to your inbox!'
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
    setShowEmailToast(false);
    setIsEmailOpened(false);
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
      {/* --- IN-APP SIMULATED EMAIL TOAST (DEMO OTP) --- */}
      {showEmailToast && (
        <div 
          className="glass-panel"
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 99999,
            width: isEmailOpened ? '400px' : '360px',
            maxWidth: 'calc(100vw - 32px)',
            padding: isEmailOpened ? '1.2rem' : '0.9rem 1.1rem',
            borderRadius: '12px',
            border: isEmailOpened ? '1px solid var(--accent-primary)' : '1px solid rgba(0, 240, 255, 0.4)',
            background: 'rgba(10, 15, 29, 0.96)',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.7), 0 0 20px rgba(0, 240, 255, 0.2)',
            backdropFilter: 'blur(16px)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            animation: 'fadeIn 0.3s ease'
          }}
        >
          {!isEmailOpened ? (
            /* --- 1. COLLAPSED: NEW EMAIL ARRIVAL NOTIFICATION --- */
            <div 
              onClick={() => setIsEmailOpened(true)}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.8rem' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(0, 240, 255, 0.12)',
                  border: '1px solid rgba(0, 240, 255, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-primary)',
                  flexShrink: 0
                }}>
                  <Mail size={20} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.15rem' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 'bold', color: '#fff' }}>New Email Received</span>
                    <span style={{
                      fontSize: '0.68rem',
                      background: 'rgba(0, 240, 255, 0.18)',
                      color: 'var(--accent-primary)',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      fontWeight: '600'
                    }}>
                      Inbox
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    SpecZone Security • Password Reset Code
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--accent-primary)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: '500' }}>
                    Click to open & view code <ChevronRight size={12} />
                  </div>
                </div>
              </div>

              <button 
                onClick={(e) => { e.stopPropagation(); setShowEmailToast(false); }} 
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                title="Dismiss Notification"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            /* --- 2. EXPANDED: FULL SIMULATED EMAIL VIEWER --- */
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)', fontSize: '0.86rem', fontWeight: 'bold' }}>
                  <Inbox size={16} />
                  <span>SpecZone Mail Client</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button 
                    onClick={() => setIsEmailOpened(false)} 
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.2rem',
                      padding: '2px 4px'
                    }}
                    title="Minimize Email"
                  >
                    <ChevronDown size={14} /> Minimize
                  </button>
                  <button 
                    onClick={() => setShowEmailToast(false)} 
                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '2px' }}
                    title="Close"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.45', marginBottom: '0.8rem', background: 'rgba(255,255,255,0.02)', padding: '0.6rem 0.8rem', borderRadius: '6px' }}>
                <div><strong style={{ color: 'var(--text-primary)' }}>From:</strong> SpecZone Security &lt;security@speczone.com&gt;</div>
                <div><strong style={{ color: 'var(--text-primary)' }}>To:</strong> {recoveryEmail}</div>
                <div><strong style={{ color: 'var(--text-primary)' }}>Subject:</strong> Password Reset Verification Code</div>
              </div>

              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 0.8rem 0', lineHeight: '1.4' }}>
                Hello, we received a request to reset your SpecZone password. Use the verification code below:
              </p>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(0, 240, 255, 0.08)',
                border: '1px dashed rgba(0, 240, 255, 0.35)',
                borderRadius: '8px',
                padding: '0.6rem 0.9rem',
                marginBottom: '0.6rem'
              }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>One-Time Password (OTP)</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 'bold', letterSpacing: '4px', color: 'var(--accent-primary)', fontFamily: 'monospace' }}>
                    {serverOtp}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setRecoveryOtp(serverOtp);
                    setCopiedOtp(true);
                    setTimeout(() => setCopiedOtp(false), 2000);
                  }}
                  className="btn btn-outline"
                  style={{
                    padding: '0.4rem 0.8rem',
                    fontSize: '0.78rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    borderColor: copiedOtp ? 'var(--success)' : 'var(--accent-primary)',
                    color: copiedOtp ? 'var(--success)' : 'var(--accent-primary)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {copiedOtp ? <Check size={14} /> : <Copy size={14} />}
                  {copiedOtp ? 'Applied!' : 'Auto-fill'}
                </button>
              </div>

              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textAlign: 'center', opacity: 0.8 }}>
                Security Notice: This OTP code is valid for 10 minutes.
              </div>
            </div>
          )}
        </div>
      )}

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
                <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '1.2rem', lineHeight: '1.5' }}>
                  A 6-digit verification code has been simulated to <strong style={{ color: 'var(--accent-primary)' }}>{recoveryEmail}</strong>. Check the top simulated email inbox or paste the code below.
                </p>

                <div className="form-group">
                  <label className="form-label">Enter 6-Digit OTP</label>
                  <input 
                    type="text"
                    className="form-control"
                    placeholder="••••••"
                    maxLength={6}
                    value={recoveryOtp}
                    onChange={(e) => setRecoveryOtp(e.target.value)}
                    style={{ textAlign: 'center', letterSpacing: '6px', fontSize: '1.3rem', fontWeight: 'bold', fontFamily: 'monospace' }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.2rem' }}>
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
