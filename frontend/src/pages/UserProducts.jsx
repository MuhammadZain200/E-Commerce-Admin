// File: pages/UserProducts.jsx
//
// User Products Page - Browse by Category
// Shows category cards with product counts

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCategories } from '../api/userProducts';
import UserLayout from '../components/UserLayout';
import './UserProducts.css';

export default function UserProducts() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('All Collections');
  
  // Component-level refs for tracking fetch state
  // These reset when component unmounts, allowing fresh fetch on remount
  const isMountedRef = useRef(true);
  const hasFetchedCategoriesRef = useRef(false);
  const isFetchingCategoriesRef = useRef(false);

  useEffect(() => {
    console.log('[UserProducts] Categories useEffect triggered', {
      hasFetched: hasFetchedCategoriesRef.current,
      isFetching: isFetchingCategoriesRef.current,
      user: user ? { id: user._id, role: user.role } : null,
      timestamp: new Date().toISOString()
    });

    // Guard 1: Already fetched in this mount cycle
    if (hasFetchedCategoriesRef.current) {
      console.log('[UserProducts] Categories API call BLOCKED - already fetched in this mount');
      return;
    }

    // Guard 2: Currently fetching (prevents concurrent calls)
    if (isFetchingCategoriesRef.current) {
      console.log('[UserProducts] Categories API call BLOCKED - fetch in progress');
      return;
    }
    
    console.log('[UserProducts] Categories API call ALLOWED - fetching data');
    hasFetchedCategoriesRef.current = true;
    isFetchingCategoriesRef.current = true;
    isMountedRef.current = true;
    
    loadCategories().finally(() => {
      isFetchingCategoriesRef.current = false;
      console.log('[UserProducts] Categories API call completed');
    });

    // Cleanup: Reset flags on unmount to allow fresh fetch on next mount
    return () => {
      isMountedRef.current = false;
      hasFetchedCategoriesRef.current = false;
      isFetchingCategoriesRef.current = false;
    };
  }, []); // Empty deps: categories API is public, doesn't depend on user/auth

  const loadCategories = async () => {
    console.log('[UserProducts] loadCategories() CALLED - making API request');
    try {
      if (isMountedRef.current) {
        setLoading(true);
      }
      const response = await getCategories();
      console.log('[UserProducts] loadCategories() SUCCESS', {
        categoriesCount: response.data?.categories?.length || 0,
        timestamp: new Date().toISOString()
      });
      // Only update state if component is still mounted
      if (isMountedRef.current && response.success) {
        setCategories(response.data.categories || []);
      }
    } catch (err) {
      console.error('[UserProducts] loadCategories() FAILED:', err);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/user/products-list?category=${categoryId}`);
  };

  const filterButtons = [
    'All Collections',
    'New Arrivals',
    'Limited Edition',
    'Sustainable',
    'Flash Sales',
    'Best Sellers',
    'Brands',
  ];

  const categoryImages = {
    'Electronics': '💻',
    'Fashion': '👕',
    'Home & Living': '🏠',
    'Beauty': '✨',
    'Sports': '⚽',
    'Accessories': '🎒',
  };

  const getCategoryImage = (categoryName) => {
    return categoryImages[categoryName] || '📦';
  };

  const formatProductCount = (count) => {
    return count.toLocaleString();
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="categories-page">
          <div className="loading-state">Loading categories...</div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="categories-page">
        {/* Header Section */}
        <div className="categories-header">
          <h1 className="categories-title">Browse by Category</h1>
          <p className="categories-subtitle">
            Explore our extensive collection organized by lifestyle and preference.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="filter-buttons-section">
          {filterButtons.map((filter) => (
            <button
              key={filter}
              className={`filter-btn ${selectedFilter === filter ? 'active' : ''}`}
              onClick={() => setSelectedFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Category Cards Grid */}
        <div className="category-cards-grid">
          {categories.map((category) => (
            <div
              key={category._id}
              className="category-card"
              onClick={() => handleCategoryClick(category._id)}
            >
              <div className="category-card-image">
                <div className="category-image-placeholder">
                  {getCategoryImage(category.name)}
                </div>
              </div>
              <div className="category-card-content">
                <div className="category-product-count">
                  {formatProductCount(category.productCount || 0)} PRODUCTS
                </div>
                <h3 className="category-card-name">{category.name}</h3>
                <button className="category-explore-btn">
                  Explore →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </UserLayout>
  );
}
