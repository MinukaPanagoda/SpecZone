import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!user || user.role !== 'buyer') {
      setCartItems([]);
      return;
    }
    try {
      const res = await fetch(`http://localhost/SpecZone/backend/api/cart.php?action=get&buyer_id=${user.id}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setCartItems(data);
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (product_id, quantity = 1) => {
    if (!user || user.role !== 'buyer') {
      alert("Please login as a buyer to add items to cart.");
      return false;
    }
    
    try {
      const res = await fetch(`http://localhost/SpecZone/backend/api/cart.php?action=add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buyer_id: user.id, product_id, quantity })
      });
      if (res.ok) {
        await fetchCart(); // Refresh cart
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error adding to cart:", err);
      return false;
    }
  };

  const updateQuantity = async (cart_id, quantity) => {
    try {
      const res = await fetch(`http://localhost/SpecZone/backend/api/cart.php?action=update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buyer_id: user.id, cart_id, quantity })
      });
      if (res.ok) {
        await fetchCart();
      }
    } catch (err) {
      console.error("Error updating cart:", err);
    }
  };

  const removeFromCart = async (cart_id) => {
    try {
      const res = await fetch(`http://localhost/SpecZone/backend/api/cart.php?action=remove`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buyer_id: user.id, cart_id })
      });
      if (res.ok) {
        await fetchCart();
      }
    } catch (err) {
      console.error("Error removing from cart:", err);
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, updateQuantity, removeFromCart, fetchCart, getCartTotal, getCartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
