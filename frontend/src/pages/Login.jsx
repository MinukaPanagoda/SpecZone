import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost/Spec%20Zone/backend/api/auth.php?action=login', {
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
          if (data.user.role === 'seller') {
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
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-control" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
    </div>
  );
};

export default Login;
