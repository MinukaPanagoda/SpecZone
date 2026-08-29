import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = async () => {
    if (!user || user.role !== 'buyer') {
      setWishlistItems([]);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`http://localhost/SpecZone/backend/api/wishlist.php?action=get&buyer_id=${user.id}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setWishlistItems(data);
      }
    } catch (err) {
      console.error("Error fetching wishlist:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => String(item.product_id) === String(productId));
  };

  const toggleWishlist = async (productId) => {
    if (!user || user.role !== 'buyer') {
      alert("Please login as a buyer to save items to your wishlist.");
      return false;
    }

    try {
      const res = await fetch('http://localhost/SpecZone/backend/api/wishlist.php?action=toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buyer_id: user.id, product_id: productId })
      });

      if (res.ok) {
        await fetchWishlist();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error toggling wishlist:", err);
      return false;
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!user) return;

    try {
      const res = await fetch('http://localhost/SpecZone/backend/api/wishlist.php?action=remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buyer_id: user.id, product_id: productId })
      });

      if (res.ok) {
        setWishlistItems(prev => prev.filter(item => String(item.product_id) !== String(productId)));
      }
    } catch (err) {
      console.error("Error removing from wishlist:", err);
    }
  };

  const wishlistCount = wishlistItems.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        loading,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        fetchWishlist,
        wishlistCount
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
