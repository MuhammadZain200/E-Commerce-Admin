import React, { useState, useEffect } from 'react';
import { updateProduct } from '../api/products';
import { getCategories, getSubCategories } from '../api/categories';
import './ProductModal.css';

export default function ProductModal({ isOpen, onClose, onSaved, product }) {
  const [form, setForm] = useState({ 
    name: '', 
    price: '', 
    stock: '',
    categoryId: '',
    subCategoryId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Category and subcategory data
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Load categories when modal opens
  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  // Load subcategories when category changes
  useEffect(() => {
    if (form.categoryId) {
      loadSubCategories(form.categoryId);
    } else {
      setSubCategories([]);
    }
  }, [form.categoryId]);

  // If editing, populate form
  useEffect(() => {
    if (product) {
      const categoryId = product.categoryId?._id || product.categoryId || '';
      const subCategoryId = product.subCategoryId?._id || product.subCategoryId || '';
      
      setForm({ 
        name: product.name || '', 
        price: product.price || '', 
        stock: product.stock || '',
        categoryId: categoryId,
        subCategoryId: subCategoryId
      });
      
      // Load subcategories for the product's category
      if (categoryId) {
        loadSubCategories(categoryId);
      }
    } else {
      setForm({ name: '', price: '', stock: '', categoryId: '', subCategoryId: '' });
    }
    setError(''); // Clear error when modal opens/closes
  }, [product, isOpen]);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const res = await getCategories(true); // Only active categories
      if (res.data?.success) {
        setCategories(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
      setError('Failed to load categories. Please refresh the page.');
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadSubCategories = async (catId) => {
    try {
      const res = await getSubCategories({ categoryId: catId, activeOnly: true });
      if (res.data?.success) {
        setSubCategories(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load subcategories:', err);
      setError('Failed to load subcategories. Please refresh the page.');
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (product) {
        // Validate required fields
        if (!form.categoryId) {
          setError('Category is required');
          setLoading(false);
          return;
        }
        if (!form.subCategoryId) {
          setError('Subcategory is required');
          setLoading(false);
          return;
        }
        
        await updateProduct(product._id, { 
          ...form, 
          price: Number(form.price), 
          stock: Number(form.stock),
          categoryId: form.categoryId,
          subCategoryId: form.subCategoryId
        });
        onSaved(); // refresh table
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="product-modal-overlay" onClick={handleOverlayClick}>
      <div className="product-modal-container">
        <button 
          className="product-modal-close" 
          onClick={onClose}
          type="button"
          aria-label="Close modal"
        >
          ×
        </button>
        
        <div className="product-modal-header">
          <h2>Edit Product</h2>
        </div>

        {error && <div className="product-modal-error">{error}</div>}

        <form onSubmit={handleSubmit} className="product-modal-form">
          <div className="product-modal-form-group">
            <label htmlFor="product-name">Name</label>
            <input
              type="text"
              id="product-name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter product name"
              required
            />
          </div>

          <div className="product-modal-form-group">
            <label htmlFor="product-price">Price</label>
            <input
              type="number"
              id="product-price"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="Enter price"
              required
              min={0}
              step="0.01"
            />
          </div>

          <div className="product-modal-form-group">
            <label htmlFor="product-stock">Stock</label>
            <input
              type="number"
              id="product-stock"
              name="stock"
              value={form.stock}
              onChange={handleChange}
              placeholder="Enter stock quantity"
              required
              min={0}
            />
          </div>

          <div className="product-modal-form-group">
            <label htmlFor="product-category">
              Category <span className="required">*</span>
            </label>
            {loadingCategories ? (
              <div style={{ padding: '0.5rem', color: '#666' }}>Loading categories...</div>
            ) : (
              <select
                id="product-category"
                name="categoryId"
                value={form.categoryId}
                onChange={handleChange}
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="product-modal-form-group">
            <label htmlFor="product-subcategory">
              Subcategory <span className="required">*</span>
            </label>
            <select
              id="product-subcategory"
              name="subCategoryId"
              value={form.subCategoryId}
              onChange={handleChange}
              required
              disabled={!form.categoryId || subCategories.length === 0}
            >
              <option value="">
                {!form.categoryId 
                  ? 'Select a category first' 
                  : subCategories.length === 0 
                  ? 'No subcategories available' 
                  : 'Select a subcategory'}
              </option>
              {subCategories.map((subCategory) => (
                <option key={subCategory._id} value={subCategory._id}>
                  {subCategory.name}
                </option>
              ))}
            </select>
          </div>

          <div className="product-modal-buttons">
            <button
              type="button"
              onClick={onClose}
              className="product-modal-btn product-modal-btn-cancel"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="product-modal-btn product-modal-btn-save"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
