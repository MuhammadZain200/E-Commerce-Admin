// File: context/CartContext.jsx
//
// Cart Context - Global cart state management
// Only loads cart for users with 'user' role (not admin or staff)

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCart } from '../api/cart';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth(); // Get user from AuthContext to check role
  const [cartCount, setCartCount] = useState(0);
  const [cart, setCart] = useState(null);

  const loadCart = async () => {
    // Only load cart for users with 'user' role
    if (!user || user.role !== 'user') {
      setCartCount(0);
      setCart(null);
      return;
    }

    try {
      const response = await getCart();
      if (response.success && response.data) {
        setCart(response.data);
        const itemCount = response.data.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
        setCartCount(itemCount);
      }
    } catch (err) {
      // Silently fail - user might not have cart access
      setCartCount(0);
      setCart(null);
    }
  };

  useEffect(() => {
    // Only load cart if user has 'user' role
    if (user && user.role === 'user') {
      loadCart();
      // Refresh cart every 5 seconds for user role only
      const interval = setInterval(loadCart, 5000);
      return () => clearInterval(interval);
    } else {
      // Clear cart for non-user roles (admin, staff, or logged out)
      setCartCount(0);
      setCart(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Re-run when user changes (login/logout/role change)

  const refreshCart = () => {
    loadCart();
  };

  return (
    <CartContext.Provider value={{ cartCount, cart, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

