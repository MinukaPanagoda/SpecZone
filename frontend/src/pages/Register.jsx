import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'buyer'
  });
  
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost/Spec%20Zone/backend/api/auth.php?action=register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          password: formData.password,
          role: formData.role
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: 'Account created successfully! Redirecting to login...' });
        setFormData({ firstName: '', lastName: '', email: '', password: '', role: 'buyer' });
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        setStatus({ type: 'error', message: data.message || 'Registration failed' });
      }
    } catch (error) {
      console.error('Error:', error);
      setStatus({ type: 'error', message: 'Network error. Please make sure XAMPP Apache is running.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container auth-container" style={{ padding: '2rem 0' }}>
      <div className="glass-panel auth-card" style={{ maxWidth: '600px' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', textAlign: 'center' }}>
          Create an Account
        </h2>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '2rem' }}>
          Join SpecZone to start building and buying
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

        <form onSubmit={handleRegister}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input type="text" name="firstName" className="form-control" value={formData.firstName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input type="text" name="lastName" className="form-control" value={formData.lastName} onChange={handleChange} required />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} required />
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" name="password" className="form-control" value={formData.password} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label">I am a...</label>
            <select name="role" className="form-control" value={formData.role} onChange={handleChange} style={{ cursor: 'pointer' }}>
              <option value="buyer">Buyer (Looking to buy parts or build PCs)</option>
              <option value="seller">Seller (Looking to sell components)</option>
            </select>
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Register Now'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>Sign In here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
