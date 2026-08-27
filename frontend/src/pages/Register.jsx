import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

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

  const [roleOpen, setRoleOpen] = useState(false);
  const [roleFocused, setRoleFocused] = useState(false);
  const [roleHovered, setRoleHovered] = useState(false);

  const roleSelectStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: '42px',
    padding: '0.75rem 2.75rem 0.75rem 1rem',
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    fontSize: '0.95rem',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  };

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost/SpecZone/backend/api/auth.php?action=register', {
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
          
            {/* Custom React Role Dropdown */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                zIndex: roleOpen ? 1000 : 'auto',
              }}
            >
              {/* Dropdown Trigger */}
              <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={roleOpen}
                className="form-control"
                onMouseEnter={() => setRoleHovered(true)}
                onMouseLeave={() => setRoleHovered(false)}
                onFocus={() => setRoleFocused(true)}
                onBlur={() => {
                  if (!roleOpen) {
                    setRoleFocused(false);
                  }
                }}
                onClick={() => {
                  setRoleOpen(prev => !prev);
                  setRoleFocused(true);
                }}
                style={{
                  ...roleSelectStyle,
                  width: '100%',
                  textAlign: 'left',
                  position: 'relative',
                  border: `1px solid ${
                    roleFocused
                      ? 'var(--accent-primary)'
                      : roleHovered
                        ? 'var(--border-highlight)'
                        : 'var(--border-color)'
                  }`,
                }}
              >
                <span>
                  {formData.role === 'buyer'
                    ? 'Buyer (Looking to buy parts or build PCs)'
                    : 'Seller (Looking to sell components)'}
                </span>
          
                <ChevronDown
                  size={16}
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: `translateY(-50%) rotate(${roleOpen ? 180 : 0}deg)`,
                    color: 'var(--text-secondary)',
                    pointerEvents: 'none',
                    transition: 'transform 0.2s ease',
                  }}
                />
              </button>
          
              {/* React-rendered Dropdown Menu */}
              {roleOpen && (
                <div
                  role="listbox"
                  aria-label="Select account role"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 0.4rem)',
                    left: 0,
                    width: '100%',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--border-radius-sm)',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
                    overflow: 'hidden',
                    zIndex: 1001,
                  }}
                >
                  {[
                    {
                      value: 'buyer',
                      label: 'Buyer (Looking to buy parts or build PCs)',
                    },
                    {
                      value: 'seller',
                      label: 'Seller (Looking to sell components)',
                    },
                  ].map(option => {
                    const isSelected = formData.role === option.value;
          
                    return (
                      <div
                        key={option.value}
                        role="option"
                        aria-selected={isSelected}
                        onMouseDown={(event) => {
                          event.preventDefault();
          
                          handleChange({
                            target: {
                              name: 'role',
                              value: option.value,
                            },
                          });
          
                          setRoleOpen(false);
                          setRoleFocused(false);
                        }}
                        style={{
                          padding: '0.8rem 1rem',
                          backgroundColor: isSelected
                            ? 'rgba(0, 240, 255, 0.12)'
                            : 'transparent',
                          color: isSelected
                            ? 'var(--accent-primary)'
                            : 'var(--text-primary)',
                          cursor: 'pointer',
                          fontSize: '0.95rem',
                          transition: 'background-color 0.15s ease, color 0.15s ease',
                          borderBottom:
                            option.value !== 'seller'
                              ? '1px solid var(--border-color)'
                              : 'none',
                        }}
                        onMouseEnter={(event) => {
                          event.currentTarget.style.backgroundColor =
                            'rgba(0, 240, 255, 0.1)';
                          event.currentTarget.style.color =
                            'var(--accent-primary)';
                        }}
                        onMouseLeave={(event) => {
                          event.currentTarget.style.backgroundColor =
                            isSelected
                              ? 'rgba(0, 240, 255, 0.12)'
                              : 'transparent';
                          event.currentTarget.style.color =
                            isSelected
                              ? 'var(--accent-primary)'
                              : 'var(--text-primary)';
                        }}
                      >
                        {option.label}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
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
