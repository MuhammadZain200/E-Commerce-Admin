import React, { useState } from 'react';
import './AddProductModal.css';
import { createProduct } from '../api/products'; // Fixed import

export default function AddProductModal({ isOpen, onClose, onSaved }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null; // Don't render modal if closed

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Use the correct API function
      await createProduct({ name, price: parseFloat(price), stock: parseInt(stock) });
      
      // Reset form
      setName('');
      setPrice('');
      setStock('');

      // Refresh product list in parent
      onSaved();

      // Close modal
      onClose();
    } catch (err) {
      console.error('Failed to add product:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2>Add New Product</h2>
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

          <div className="modal-buttons">
            <button type="submit" disabled={loading} className="save-btn">
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
