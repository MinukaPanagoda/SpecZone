import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Builder from './pages/Builder';
import Login from './pages/Login';
import Register from './pages/Register';
import BuyerDashboard from './pages/BuyerDashboard';
import SellerDashboard from './pages/SellerDashboard';
import SellerOrders from './pages/SellerOrders';
import SellerProducts from './pages/SellerProducts';
import SellerAnalytics from './pages/SellerAnalytics';
import AddProduct from './pages/AddProduct';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import ProductDetails from './pages/ProductDetails';
import Compare from './pages/Compare';
import AdminDashboard from './pages/AdminDashboard';

// App Component

const AppLayout = () => {
  const location = useLocation();
  const isSellerRoute = location.pathname.startsWith('/seller');
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isBuyerRoute = location.pathname.startsWith('/buyer');

  return (
    <>
      {(!isSellerRoute && !isAdminRoute) && <Navbar />}
      <div className={(isSellerRoute || isAdminRoute) ? "" : "page-content"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/builder" element={<Builder />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
          <Route path="/seller/dashboard" element={<SellerDashboard />} />
          <Route path="/seller/orders" element={<SellerOrders />} />
          <Route path="/seller/products" element={<SellerProducts />} />
          <Route path="/seller/analytics" element={<SellerAnalytics />} />
          <Route path="/seller/add-product" element={<AddProduct />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </div>
      {(!isSellerRoute && !isAdminRoute) && (
        <div className={isBuyerRoute ? 'buyer-footer-offset' : ''}>
          <Footer />
        </div>
      )}
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <Router>
            <AppLayout />
          </Router>
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
};

export default App;
