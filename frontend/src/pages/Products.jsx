import React, { useEffect, useState, useRef } from 'react';
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
  
  // Component-level ref for tracking mount state
  const isMountedRef = useRef(true);

  // Load products from backend
  const loadProducts = async () => {
    if (!isMountedRef.current) return; // Don't update if unmounted
    
    setLoading(true);
    try {
      const res = await fetchProducts();
      console.log('[Products] API Response:', {
        isArray: Array.isArray(res.data),
        hasData: !!res.data?.data,
        hasProducts: !!res.data?.products,
        dataType: typeof res.data,
        dataKeys: res.data && !Array.isArray(res.data) ? Object.keys(res.data) : null
      });
      
      // Admin API returns array of products directly
      const productsData = Array.isArray(res.data) ? res.data : [];
      
      if (isMountedRef.current) {
        setProducts(productsData);
      }
    } catch (err) {
      console.error('[Products] Failed to fetch products:', err);
      if (isMountedRef.current) {
        setProducts([]); // Set empty array on error
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    loadProducts();

    // Cleanup: Reset mounted flag on unmount
    return () => {
      isMountedRef.current = false;
    };
  }, []); // Load products on mount

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
                  <th>Category</th>
                  <th>Subcategory</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id} className={!p.isActive ? 'inactive-row' : ''}>
                    <td>{p.name}</td>
                    <td>{p.categoryId?.name || 'N/A'}</td>
                    <td>{p.subCategoryId?.name || 'N/A'}</td>
                    <td>${parseFloat(p.price || 0).toFixed(2)}</td>
                    <td>
                      <span className={`stock-badge ${p.stock === 0 ? 'out-of-stock' : p.stock >= 1 && p.stock <= 10 ? 'low-stock' : 'in-stock'}`}>
                        {p.stock === 0 ? 'OUT OF STOCK' : p.stock >= 1 && p.stock <= 10 ? `LOW STOCK (${p.stock})` : p.stock}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${p.isActive ? 'active' : 'inactive'}`}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      {user.role === 'admin' && (
                        <>
                          <button onClick={() => openEditModal(p)} className="edit-btn">
                            Edit
                          </button>
                          {/* Use a product-specific delete button class to avoid conflicts with other pages (e.g., UserCart) */}
                          <button onClick={() => handleDelete(p._id, p.name)} className="product-delete-btn">
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
