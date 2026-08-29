import React from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, Plus, Minus, Image as ImageIcon } from 'lucide-react';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <ShoppingBag size={64} color="var(--text-secondary)" style={{ margin: '0 auto 1.5rem', opacity: 0.5 }} />
        <h2 style={{ marginBottom: '1rem' }}>Your Cart is Empty</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Looks like you haven't added any products to your cart yet.</p>
        <Link to="/shop" className="btn btn-primary" style={{ display: 'inline-flex', padding: '0.8rem 2rem' }}>
          Continue Shopping
        </Link>
      </div>
    );
  }

  const hasOutOfStock = cartItems.some(item => parseInt(item.stock_quantity) <= 0 || parseInt(item.quantity) > parseInt(item.stock_quantity));

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <h2 style={{ marginBottom: '2rem', fontSize: '2rem' }}>Shopping Cart</h2>
      
      <div className="cart-layout">
        
        {/* Cart Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {cartItems.map((item) => {
            const isOutOfStock = parseInt(item.stock_quantity) <= 0;
            return (
              <div key={item.cart_id} className="glass-panel cart-item" style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', border: isOutOfStock ? '1px solid rgba(255, 51, 102, 0.4)' : undefined }}>
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                ) : (
                  <div style={{ width: '100px', height: '100px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ImageIcon size={32} color="var(--text-secondary)" />
                  </div>
                )}
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{item.title}</h3>
                    {isOutOfStock && (
                      <span style={{ background: 'var(--danger)', color: 'white', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                        Out of Stock
                      </span>
                    )}
                  </div>

                  <p style={{ color: 'var(--accent-primary)', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    Rs. {parseFloat(item.price).toLocaleString('en-IN')}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.2rem', borderRadius: '4px' }}>
                      <button 
                        style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '0.2rem' }}
                        onClick={() => {
                          if(item.quantity > 1) updateQuantity(item.cart_id, item.quantity - 1);
                        }}
                      >
                        <Minus size={16} />
                      </button>
                      <span style={{ minWidth: '30px', textAlign: 'center' }}>{item.quantity}</span>
                      <button 
                        style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '0.2rem' }}
                        onClick={() => {
                          if(item.quantity < item.stock_quantity) updateQuantity(item.cart_id, item.quantity + 1);
                          else alert('Maximum available stock reached!');
                        }}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <button 
                      style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.9rem' }}
                      onClick={() => removeFromCart(item.cart_id)}
                    >
                      <Trash2 size={16} /> Remove
                    </button>
                  </div>
                </div>
                
                <div className="cart-item-total" style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '1.2rem' }}>
                  Rs. {(item.price * item.quantity).toLocaleString('en-IN')}
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>Order Summary</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              <span>Subtotal ({cartItems.length} items)</span>
              <span>Rs. {getCartTotal().toLocaleString('en-IN')}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              <span>Shipping</span>
              <span style={{ color: 'var(--success)' }}>Free</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '1.2rem', fontWeight: 'bold' }}>
              <span>Total</span>
              <span style={{ color: 'var(--accent-primary)' }}>Rs. {getCartTotal().toLocaleString('en-IN')}</span>
            </div>
            
            <button 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '1.5rem', padding: '0.8rem', fontSize: '1.1rem' }}
              disabled={hasOutOfStock}
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout
            </button>

            {hasOutOfStock && (
              <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '0.8rem', textAlign: 'center', margin: '0.8rem 0 0 0' }}>
                Please remove Out of Stock item(s) to proceed.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
