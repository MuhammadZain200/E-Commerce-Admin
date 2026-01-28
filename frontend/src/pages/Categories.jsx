// File: pages/Categories.jsx
//
// Categories Management Page - Admin-only page for managing categories and subcategories
// This page was moved from the Products section to Settings for better organization
// Admins can view, add, edit, and soft-delete categories and subcategories

import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getSubCategories,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
} from '../api/categories';
import './Categories.css';

export default function Categories() {
  const { user } = useAuth();
  const { success, error: showError } = useNotification();
  const [loading, setLoading] = useState(true);
  
  // Data state
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  
  // Modal states
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSubCategoryModalOpen, setIsSubCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingSubCategory, setEditingSubCategory] = useState(null);
  
  // Form states
  const [categoryForm, setCategoryForm] = useState({ name: '' });
  const [subCategoryForm, setSubCategoryForm] = useState({ name: '', categoryId: '' });

  // Load all data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, subCategoriesRes] = await Promise.all([
        getCategories(),
        getSubCategories(),
      ]);
      
      if (categoriesRes.data?.success) {
        setCategories(categoriesRes.data.data || []);
      }
      
      if (subCategoriesRes.data?.success) {
        setSubCategories(subCategoriesRes.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
      showError('Failed to load categories. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // CATEGORY HANDLERS
  // ============================================

  const openAddCategoryModal = () => {
    setCategoryForm({ name: '' });
    setEditingCategory(null);
    setIsCategoryModalOpen(true);
  };

  const openEditCategoryModal = (category) => {
    setCategoryForm({ name: category.name });
    setEditingCategory(category);
    setIsCategoryModalOpen(true);
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        // Update existing category
        await updateCategory(editingCategory._id, { name: categoryForm.name });
        success('Category updated successfully');
      } else {
        // Create new category
        await createCategory({ name: categoryForm.name });
        success('Category created successfully');
      }
      setIsCategoryModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Failed to save category:', err);
      showError(err.response?.data?.message || 'Failed to save category. Please try again.');
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Are you sure you want to disable category "${name}"? This will also disable all its subcategories.`)) {
      return;
    }
    
    try {
      await deleteCategory(id);
      success(`Category "${name}" disabled successfully`);
      loadData();
    } catch (err) {
      console.error('Failed to delete category:', err);
      showError(err.response?.data?.message || 'Failed to disable category. Please try again.');
    }
  };

  const handleToggleCategoryStatus = async (category) => {
    try {
      await updateCategory(category._id, { 
        name: category.name,
        isActive: !category.isActive 
      });
      success(`Category ${category.isActive ? 'disabled' : 'enabled'} successfully`);
      loadData();
    } catch (err) {
      console.error('Failed to toggle category status:', err);
      showError(err.response?.data?.message || 'Failed to update category status.');
    }
  };

  // ============================================
  // SUBCATEGORY HANDLERS
  // ============================================

  const openAddSubCategoryModal = () => {
    setSubCategoryForm({ name: '', categoryId: '' });
    setEditingSubCategory(null);
    setIsSubCategoryModalOpen(true);
  };

  const openEditSubCategoryModal = (subCategory) => {
    setSubCategoryForm({ 
      name: subCategory.name, 
      categoryId: subCategory.categoryId._id || subCategory.categoryId 
    });
    setEditingSubCategory(subCategory);
    setIsSubCategoryModalOpen(true);
  };

  const handleSubCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSubCategory) {
        // Update existing subcategory
        await updateSubCategory(editingSubCategory._id, {
          name: subCategoryForm.name,
          categoryId: subCategoryForm.categoryId,
        });
        success('Subcategory updated successfully');
      } else {
        // Create new subcategory
        await createSubCategory({
          name: subCategoryForm.name,
          categoryId: subCategoryForm.categoryId,
        });
        success('Subcategory created successfully');
      }
      setIsSubCategoryModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Failed to save subcategory:', err);
      showError(err.response?.data?.message || 'Failed to save subcategory. Please try again.');
    }
  };

  const handleDeleteSubCategory = async (id, name) => {
    if (!window.confirm(`Are you sure you want to disable subcategory "${name}"?`)) {
      return;
    }
    
    try {
      await deleteSubCategory(id);
      success(`Subcategory "${name}" disabled successfully`);
      loadData();
    } catch (err) {
      console.error('Failed to delete subcategory:', err);
      showError(err.response?.data?.message || 'Failed to disable subcategory. Please try again.');
    }
  };

  const handleToggleSubCategoryStatus = async (subCategory) => {
    try {
      await updateSubCategory(subCategory._id, {
        name: subCategory.name,
        categoryId: subCategory.categoryId._id || subCategory.categoryId,
        isActive: !subCategory.isActive,
      });
      success(`Subcategory ${subCategory.isActive ? 'disabled' : 'enabled'} successfully`);
      loadData();
    } catch (err) {
      console.error('Failed to toggle subcategory status:', err);
      showError(err.response?.data?.message || 'Failed to update subcategory status.');
    }
  };

  // Get subcategories for a specific category
  const getSubCategoriesForCategory = (categoryId) => {
    return subCategories.filter(
      (sub) => (sub.categoryId._id || sub.categoryId) === categoryId
    );
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar user={user} />
        <div className="main-content">
          <Topbar />
          <div className="loading-state">
            <div className="loader"></div>
            <p>Loading categories...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar user={user} />
      <div className="main-content">
        <Topbar />
        <div className="categories-page">
          <div className="categories-header">
            <h1 className="categories-title">📁 Categories & Subcategories</h1>
            <p className="categories-subtitle">
              Manage product categories and subcategories. Disabled items are hidden from users but visible to admins.
            </p>
          </div>

          {/* Categories Section */}
          <div className="categories-section">
            <div className="section-header">
              <h2>Categories</h2>
              <button onClick={openAddCategoryModal} className="btn-primary">
                + Add Category
              </button>
            </div>

            {categories.length === 0 ? (
              <div className="empty-state">
                <p>No categories found. Add your first category to get started!</p>
              </div>
            ) : (
              <div className="categories-grid">
                {categories.map((category) => {
                  const categorySubCategories = getSubCategoriesForCategory(category._id);
                  return (
                    <div 
                      key={category._id} 
                      className={`category-card ${!category.isActive ? 'inactive' : ''}`}
                    >
                      <div className="category-card-header">
                        <h3>{category.name}</h3>
                        <div className="category-actions">
                          <button
                            onClick={() => handleToggleCategoryStatus(category)}
                            className={`btn-toggle ${category.isActive ? 'active' : 'inactive'}`}
                            title={category.isActive ? 'Disable' : 'Enable'}
                          >
                            {category.isActive ? '✓' : '✗'}
                          </button>
                          <button
                            onClick={() => openEditCategoryModal(category)}
                            className="btn-edit"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category._id, category.name)}
                            className="btn-delete"
                            title="Disable"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      <div className="category-status">
                        <span className={`status-badge ${category.isActive ? 'active' : 'inactive'}`}>
                          {category.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                      <div className="subcategories-count">
                        {categorySubCategories.length} subcategory{categorySubCategories.length !== 1 ? 'ies' : ''}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Subcategories Section */}
          <div className="subcategories-section">
            <div className="section-header">
              <h2>Subcategories</h2>
              <button onClick={openAddSubCategoryModal} className="btn-primary">
                + Add Subcategory
              </button>
            </div>

            {subCategories.length === 0 ? (
              <div className="empty-state">
                <p>No subcategories found. Add your first subcategory to get started!</p>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subCategories.map((subCategory) => (
                    <tr key={subCategory._id} className={!subCategory.isActive ? 'inactive-row' : ''}>
                      <td>{subCategory.name}</td>
                      <td>
                        {subCategory.categoryId?.name || 'Unknown'}
                      </td>
                      <td>
                        <span className={`status-badge ${subCategory.isActive ? 'active' : 'inactive'}`}>
                          {subCategory.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => handleToggleSubCategoryStatus(subCategory)}
                            className={`btn-toggle ${subCategory.isActive ? 'active' : 'inactive'}`}
                            title={subCategory.isActive ? 'Disable' : 'Enable'}
                          >
                            {subCategory.isActive ? '✓' : '✗'}
                          </button>
                          <button
                            onClick={() => openEditSubCategoryModal(subCategory)}
                            className="btn-edit"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteSubCategory(subCategory._id, subCategory.name)}
                            className="btn-delete"
                            title="Disable"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Category Modal */}
          {isCategoryModalOpen && (
            <div className="modal-overlay" onClick={() => setIsCategoryModalOpen(false)}>
              <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <h2>{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
                <form onSubmit={handleCategorySubmit}>
                  <div className="form-group">
                    <label>
                      Category Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({ name: e.target.value })}
                      required
                      placeholder="e.g., Electronics"
                      maxLength={100}
                    />
                  </div>
                  <div className="modal-buttons">
                    <button type="submit" className="btn-primary">
                      {editingCategory ? 'Update' : 'Create'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCategoryModalOpen(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Subcategory Modal */}
          {isSubCategoryModalOpen && (
            <div className="modal-overlay" onClick={() => setIsSubCategoryModalOpen(false)}>
              <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <h2>{editingSubCategory ? 'Edit Subcategory' : 'Add Subcategory'}</h2>
                <form onSubmit={handleSubCategorySubmit}>
                  <div className="form-group">
                    <label>
                      Subcategory Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      value={subCategoryForm.name}
                      onChange={(e) => setSubCategoryForm({ ...subCategoryForm, name: e.target.value })}
                      required
                      placeholder="e.g., Laptops"
                      maxLength={100}
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      Category <span className="required">*</span>
                    </label>
                    <select
                      value={subCategoryForm.categoryId}
                      onChange={(e) => setSubCategoryForm({ ...subCategoryForm, categoryId: e.target.value })}
                      required
                    >
                      <option value="">Select a category</option>
                      {categories
                        .filter((cat) => cat.isActive)
                        .map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="modal-buttons">
                    <button type="submit" className="btn-primary">
                      {editingSubCategory ? 'Update' : 'Create'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsSubCategoryModalOpen(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

