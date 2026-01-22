import React, { useState, useEffect } from 'react';
import { updateProduct } from '../api/products';
import './ProductModal.css';

export default function ProductModal({ isOpen, onClose, onSaved, product }) {
  const [form, setForm] = useState({ name: '', price: '', stock: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If editing, populate form
  useEffect(() => {
    if (product) {
      setForm({ 
        name: product.name || '', 
        price: product.price || '', 
        stock: product.stock || '' 
      });
    } else {
      setForm({ name: '', price: '', stock: '' });
    }
    setError(''); // Clear error when modal opens/closes
  }, [product, isOpen]);

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
        await updateProduct(product._id, { 
          ...form, 
          price: Number(form.price), 
          stock: Number(form.stock) 
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
