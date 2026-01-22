import React, { useEffect, useState } from 'react';
import { fetchProducts, toggleProductStatus } from '../api/products';
import { useAuth } from '../context/AuthContext';
import ProductModal from '../components/ProductModal'; // For editing products
import AddProductModal from '../components/AddProductModal'; // For adding new products
import './Products.css';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const { user } = useAuth();

  // Load products from backend
  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetchProducts();
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Toggle product active/inactive
  const handleToggle = async (id) => {
    try {
      await toggleProductStatus(id);
      loadProducts();
    } catch (err) {
      console.error('Failed to toggle product:', err);
    }
  };

  // Open Add Product modal
  const openAddModal = () => {
    setIsAddModalOpen(true);
  };

  // Open Edit Product modal
  const openEditModal = (product) => {
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };

  return (
    <div className="products-section">
      {/* Header with Add Product button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Product Management</h2>
        {user.role === 'admin' && (
          <button onClick={openAddModal} className="add-product-btn">
            Add Product
          </button>
        )}
      </div>

      {/* Product Table */}
      {loading ? (
        <p>Loading products...</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td>{p.name}</td>
                <td>${p.price}</td>
                <td>{p.stock}</td>
                <td>{p.isActive ? 'Active' : 'Inactive'}</td>
                <td>
                  {user.role === 'admin' && (
                    <>
                      <button onClick={() => openEditModal(p)} className="edit-btn">
                        Edit
                      </button>
                      {p.isActive ? (
                        <button onClick={() => handleToggle(p._id)} className="disable-btn">
                          Disable
                        </button>
                      ) : (
                        <button onClick={() => handleToggle(p._id)} className="enable-btn">
                          Enable
                        </button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSaved={loadProducts}
      />

      {/* Edit Product Modal */}
      {editingProduct && (
        <ProductModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSaved={loadProducts}
          product={editingProduct}
        />
      )}
    </div>
  );
}
