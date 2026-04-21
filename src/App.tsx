import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Cart from './pages/Cart';
import Admin from './pages/Admin';
import ProductDetail from './pages/ProductDetail';
import Products from './pages/Products';
import Login from './pages/Login';
import Account from './pages/Account';
import Checkout from './pages/Checkout';

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-accent border-t-transparent" />
    </div>
  );
  
  if (!user) return <Login />;
  
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-zinc-50 font-sans">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<AuthWrapper><Home /></AuthWrapper>} />
                <Route path="/products" element={<AuthWrapper><Products /></AuthWrapper>} />
                <Route path="/product/:id" element={<AuthWrapper><ProductDetail /></AuthWrapper>} />
                <Route path="/cart" element={<AuthWrapper><Cart /></AuthWrapper>} />
                <Route path="/checkout" element={<AuthWrapper><Checkout /></AuthWrapper>} />
                <Route path="/account" element={<AuthWrapper><Account /></AuthWrapper>} />
                <Route path="/admin/*" element={<AuthWrapper><Admin /></AuthWrapper>} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
            <footer className="border-t bg-white py-8 mt-20">
            <div className="container mx-auto px-4 text-center">
              <p className="text-sm text-zinc-500">
                &copy; {new Date().getFullYear()} متجري الاحترافي. جميع الحقوق محفوظة.
              </p>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </CartProvider>
  </AuthProvider>
  );
}
