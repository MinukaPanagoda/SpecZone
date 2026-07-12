import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Builder from './pages/Builder';
import Login from './pages/Login';
import Register from './pages/Register';
import BuyerDashboard from './pages/BuyerDashboard';
import SellerDashboard from './pages/SellerDashboard';
import AddProduct from './pages/AddProduct';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';

// App Component

const AppLayout = () => {
  const location = useLocation();
  const isSellerRoute = location.pathname.startsWith('/seller');
  const isBuyerRoute = location.pathname.startsWith('/buyer');

  return (
    <>
      {!isSellerRoute && <Navbar />}
      <div className={isSellerRoute ? "" : "page-content"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/builder" element={<Builder />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
          <Route path="/seller/dashboard" element={<SellerDashboard />} />
          <Route path="/seller/add-product" element={<AddProduct />} />
        </Routes>
      </div>
      {!isSellerRoute && (
        <div style={isBuyerRoute ? { marginLeft: '260px' } : {}}>
          <Footer />
        </div>
      )}
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppLayout />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
