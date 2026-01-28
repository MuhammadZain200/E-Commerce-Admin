import React, { useState, useEffect } from 'react';
import './AddProductModal.css';
import { createProduct } from '../api/products';
import { getCategories, getSubCategories } from '../api/categories';

export default function AddProductModal({ isOpen, onClose, onSaved }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subCategoryId, setSubCategoryId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Category and subcategory data
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Load categories and subcategories when modal opens
  useEffect(() => {
    if (isOpen) {
      loadCategories();
    } else {
      // Reset form when modal closes
      setName('');
      setPrice('');
      setStock('');
      setCategoryId('');
      setSubCategoryId('');
      setError(null);
    }
  }, [isOpen]);

  // Load subcategories when category changes
  useEffect(() => {
    if (categoryId) {
      loadSubCategories(categoryId);
      setSubCategoryId(''); // Reset subcategory when category changes
    } else {
      setSubCategories([]);
      setSubCategoryId('');
    }
  }, [categoryId]);

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

  if (!isOpen) return null; // Don't render modal if closed

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Validate inputs
      if (!name.trim()) {
        setError('Product name is required');
        setLoading(false);
        return;
      }
      if (parseFloat(price) <= 0) {
        setError('Price must be greater than 0');
        setLoading(false);
        return;
      }
      if (parseInt(stock) < 0) {
        setError('Stock cannot be negative');
        setLoading(false);
        return;
      }
      if (!categoryId) {
        setError('Category is required');
        setLoading(false);
        return;
      }
      if (!subCategoryId) {
        setError('Subcategory is required');
        setLoading(false);
        return;
      }

      // Use the correct API function
      await createProduct({ 
        name, 
        price: parseFloat(price), 
        stock: parseInt(stock),
        categoryId,
        subCategoryId
      });
      
      // Reset form
      setName('');
      setPrice('');
      setStock('');
      setCategoryId('');
      setSubCategoryId('');
      setError(null);

      // Refresh product list in parent
      onSaved();

      // Close modal
      onClose();
    } catch (err) {
      console.error('Failed to add product:', err);
      setError(err.response?.data?.message || 'Failed to create product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2>Add New Product</h2>
        {error && (
          <div className="error-message" style={{ 
            padding: '10px', 
            marginBottom: '15px', 
            backgroundColor: '#fee', 
            color: '#c33', 
            borderRadius: '4px',
            border: '1px solid #fcc'
          }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="modal-form">
          <label>
            Product Name:
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label>
            Price:
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </label>
          <label>
            Stock:
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
            />
          </label>

          <label>
            Category <span className="required">*</span>:
            {loadingCategories ? (
              <div style={{ padding: '0.5rem', color: '#666' }}>Loading categories...</div>
            ) : (
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
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
          </label>

          <label>
            Subcategory <span className="required">*</span>:
            <select
              value={subCategoryId}
              onChange={(e) => setSubCategoryId(e.target.value)}
              required
              disabled={!categoryId || subCategories.length === 0}
            >
              <option value="">
                {!categoryId 
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
          </label>

          <div className="modal-buttons">
            <button 
              type="submit" 
              disabled={loading || !name.trim() || !price || !stock || !categoryId || !subCategoryId || loadingCategories} 
              className="save-btn"
            >
              {loading ? (
                <>
                  <span className="btn-spinner" style={{
                    display: 'inline-block',
                    width: '12px',
                    height: '12px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white',
                    borderRadius: '50%',
                    animation: 'spin 0.6s linear infinite',
                    marginRight: '8px'
                  }}></span>
                  Saving...
                </>
              ) : 'Save'}
            </button>
            <button type="button" onClick={onClose} disabled={loading} className="cancel-btn">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
