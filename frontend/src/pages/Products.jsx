import React, { useEffect, useState } from 'react';
import { fetchProducts, deleteProduct } from '../api/products';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import ProductModal from '../components/ProductModal'; // For editing products
import AddProductModal from '../components/AddProductModal'; // For adding new products
import './Products.css';
import './AdminDashboard.css'; // Reuse dashboard styles

export default function Products() {
  const { success, error: showError } = useNotification();
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
      // Handle different response formats
      const productsData = Array.isArray(res.data) 
        ? res.data 
        : (res.data?.data || res.data?.products || []);
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setProducts([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    // Refresh products every 5 seconds for real-time updates
    const interval = setInterval(loadProducts, 5000);
    return () => clearInterval(interval);
  }, []);

  // Delete product
  const handleDelete = async (id, productName) => {
    try {
      await deleteProduct(id);
      loadProducts();
      success(`Product "${productName}" deleted successfully`);
    } catch (err) {
      console.error('Failed to delete product:', err);
      showError(err.response?.data?.message || 'Failed to delete product. Please try again.');
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
    <div className="dashboard-container">
      <Sidebar user={user} />
      <div className="main-content">
        <Topbar />
        
        <div className="products-section">
          {/* Header with Add Product button */}
          <div className="products-header">
            <h2>Product Management</h2>
            {user.role === 'admin' && (
              <button onClick={openAddModal} className="add-product-btn">
                Add Product
              </button>
            )}
          </div>

          {/* Product Table */}
          {loading ? (
            <div className="loading-state">
              <div className="loader"></div>
              <p>Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <p>No products found. Add your first product to get started!</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id}>
                    <td>{p.name}</td>
                    <td>${parseFloat(p.price || 0).toFixed(2)}</td>
                    <td>
                      <span className={`stock-badge ${p.stock === 0 ? 'out-of-stock' : p.stock < 10 ? 'low-stock' : 'in-stock'}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td>
                      {user.role === 'admin' && (
                        <>
                          <button onClick={() => openEditModal(p)} className="edit-btn">
                            Edit
                          </button>
                          <button onClick={() => handleDelete(p._id, p.name)} className="delete-btn">
                            Delete
                          </button>
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
      </div>
    </div>
  );
}
