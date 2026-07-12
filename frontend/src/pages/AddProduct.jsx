import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Save, Image as ImageIcon } from 'lucide-react';
import SellerSidebar from '../components/SellerSidebar';

const AddProduct = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState({ type: '', message: '' });
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
    image_url: '',
    specs: '{}'
  });

  useEffect(() => {
    // Redirect if not seller
    if (!user || user.role !== 'seller') {
      navigate('/login');
    }

    // Fetch categories
    fetch('http://localhost/Spec%20Zone/backend/api/categories.php')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCategories(data);
          if (data.length > 0) {
            setFormData(prev => ({ ...prev, category_id: data[0].id }));
          }
        }
      })
      .catch(err => console.error("Error fetching categories:", err));
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: 'info', message: 'Adding product...' });

    try {
      const response = await fetch('http://localhost/Spec%20Zone/backend/api/products.php?action=create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          seller_id: user.id
        })
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: 'Product added successfully!' });
        setFormData({
          name: '',
          description: '',
          price: '',
          stock: '',
          category_id: categories.length > 0 ? categories[0].id : '',
          image_url: '',
          specs: '{}'
        });
      } else {
        setStatus({ type: 'error', message: data.message || 'Failed to add product.' });
      }
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', message: 'An error occurred. Please try again.' });
    }
  };

  return (
    <div className="dashboard-layout" style={{ minHeight: '100vh' }}>
      <SellerSidebar />
      <div className="dashboard-content">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ marginBottom: '2rem' }}>Add New Product</h2>
        
        {status.message && (
          <div className={`alert ${status.type === 'error' ? 'alert-error' : status.type === 'success' ? 'alert-success' : 'alert-info'}`} style={{ padding: '1rem', marginBottom: '1.5rem', borderRadius: '8px', background: status.type === 'error' ? 'rgba(255,50,50,0.1)' : 'rgba(50,255,50,0.1)', color: status.type === 'error' ? '#ff6b6b' : '#51cf66' }}>
            {status.message}
          </div>
        )}

        <div className="glass-panel" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Price (Rs.) *</label>
                <input type="number" name="price" className="form-control" value={formData.price} onChange={handleChange} required min="0" step="0.01" />
              </div>
              <div className="form-group">
                <label className="form-label">Stock Quantity *</label>
                <input type="number" name="stock" className="form-control" value={formData.stock} onChange={handleChange} required min="0" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Category *</label>
              <select name="category_id" className="form-control" value={formData.category_id} onChange={handleChange} required>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea name="description" className="form-control" value={formData.description} onChange={handleChange} rows="4"></textarea>
            </div>

            <div className="form-group">
              <label className="form-label">Image URL</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
                  <ImageIcon size={20} color="var(--text-secondary)" />
                </div>
                <input type="url" name="image_url" className="form-control" value={formData.image_url} onChange={handleChange} placeholder="https://example.com/image.jpg" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Specifications (JSON format)</label>
              <textarea name="specs" className="form-control" value={formData.specs} onChange={handleChange} rows="3" placeholder='{"Brand": "Intel", "Socket": "LGA1700", "Cores": "12"}' style={{ fontFamily: 'monospace' }}></textarea>
              <small style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', display: 'block' }}>Optional: Provide technical specs as a valid JSON object.</small>
            </div>

            <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
              <Save size={20} />
              Save Product
            </button>
          </form>
        </div>
      </div>
      </div>
    </div>
  );
};

export default AddProduct;
