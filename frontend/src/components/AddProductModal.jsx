import React, { useState } from 'react';
import './AddProductModal.css';
import { createProduct } from '../api/products'; // Fixed import

export default function AddProductModal({ isOpen, onClose, onSaved }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

      // Use the correct API function
      await createProduct({ name, price: parseFloat(price), stock: parseInt(stock) });
      
      // Reset form
      setName('');
      setPrice('');
      setStock('');
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

          <div className="modal-buttons">
            <button type="submit" disabled={loading || !name.trim() || !price || !stock} className="save-btn">
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
