// File: context/CartContext.jsx
//
// Cart Context - Global cart state management
// Only loads cart for users with 'user' role (not admin)

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { getCart } from '../api/cart';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth(); // Get user from AuthContext to check role
  const [cartCount, setCartCount] = useState(0);
  const [cart, setCart] = useState(null);
  
  // Guard to prevent duplicate API calls on mount/re-render
  // Tracks the last user ID we fetched cart for
  const hasFetchedRef = useRef(false);
  const lastFetchedUserIdRef = useRef(null);

  const loadCart = useCallback(async () => {
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
  }, [user]);

  useEffect(() => {
    // Get current user identifier for comparison
    const currentUserId = user?._id || null;
    const currentRole = user?.role || null;
    
    // Only fetch if:
    // 1. This is the first mount (hasFetchedRef.current === false), OR
    // 2. User ID has actually changed (login/logout/switch user)
    // This prevents duplicate calls when user object reference changes but values are the same
    if (!hasFetchedRef.current || lastFetchedUserIdRef.current !== currentUserId) {
      hasFetchedRef.current = true;
      lastFetchedUserIdRef.current = currentUserId;
      
      if (currentRole === 'user') {
        loadCart();
      } else {
        // Clear cart for non-user roles (admin or logged out)
        setCartCount(0);
        setCart(null);
      }
    } else if (currentRole !== 'user') {
      // If role changed from user to non-user, clear cart
      setCartCount(0);
      setCart(null);
    }
  }, [user?._id, user?.role, loadCart]);

  const refreshCart = () => {
    loadCart();
  };

  const updateCartFromData = useCallback((cartData) => {
    if (cartData) {
      setCart(cartData);
      const itemCount = cartData.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
      setCartCount(itemCount);
    }
  }, []);

  return (
    <CartContext.Provider value={{ cartCount, cart, refreshCart, updateCartFromData }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

