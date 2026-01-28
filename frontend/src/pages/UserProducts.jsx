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
  
  // Guard to prevent duplicate API calls on mount/re-render
  // Prevents React StrictMode from causing double calls in development
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // Only fetch once on mount - guard prevents duplicate calls
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await getCategories();
      if (response.success) {
        setCategories(response.data.categories || []);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
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
