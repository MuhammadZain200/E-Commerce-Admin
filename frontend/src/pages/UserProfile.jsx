// File: pages/UserProfile.jsx
//
// User Profile Page - Users can manage their account information and security

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { updateProfile, changePassword } from '../api/userProfile';
import UserLayout from '../components/UserLayout';
import './UserProfile.css';

export default function UserProfile() {
  const { user, updateUser } = useAuth();
  const { success, error: showError } = useNotification();
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // General Information state
  const [generalInfo, setGeneralInfo] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // Initialize form data from user
  useEffect(() => {
    if (user) {
      setGeneralInfo({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleGeneralInfoChange = (field, value) => {
    setGeneralInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveGeneralInfo = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const response = await updateProfile({
        name: generalInfo.name,
        email: generalInfo.email,
        phone: generalInfo.phone,
      });

      if (response.success) {
        // Update auth context with new user data
        updateUser(response.user);
        success('Profile updated successfully!');
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError('New password and confirm password do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showError('New password must be at least 6 characters');
      return;
    }

    try {
      setChangingPassword(true);
      const response = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (response.success) {
        success('Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <UserLayout>
      <div className="user-profile-page">
        <div className="profile-header">
          <h1 className="profile-title">User Profile</h1>
          <p className="profile-subtitle">
            Manage your account information and preferences.
          </p>
        </div>

        <div className="profile-content">
          {/* General Information Card */}
          <div className="profile-card">
            <div className="card-header">
              <span className="card-icon">👤</span>
              <h2 className="card-title">General Information</h2>
            </div>
            <form onSubmit={handleSaveGeneralInfo}>
              <div className="profile-picture-section">
                <div className="profile-picture-wrapper">
                  <div className="profile-picture">
                    {(user?.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <button type="button" className="edit-picture-btn">
                    ✏️
                  </button>
                </div>
                <div className="picture-info">
                  <div className="picture-label">Profile Picture</div>
                  <div className="picture-hint">JPG, GIF or PNG. Max size of 800K</div>
                  <button type="button" className="upload-link">
                    Upload New
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>FULL NAME</label>
                <input
                  type="text"
                  value={generalInfo.name}
                  onChange={(e) => handleGeneralInfoChange('name', e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="form-group">
                <label>EMAIL ADDRESS</label>
                <input
                  type="email"
                  value={generalInfo.email}
                  onChange={(e) => handleGeneralInfoChange('email', e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="form-group">
                <label>PHONE NUMBER</label>
                <input
                  type="tel"
                  value={generalInfo.phone}
                  onChange={(e) => handleGeneralInfoChange('phone', e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <button type="submit" className="save-btn" disabled={saving}>
                {saving ? 'Saving...' : '💾 Save Changes'}
              </button>
            </form>
          </div>

          {/* Account Security Card */}
          <div className="profile-card">
            <div className="card-header">
              <span className="card-icon">🛡️</span>
              <h2 className="card-title">Account Security</h2>
            </div>
            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label>CURRENT PASSWORD</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                  placeholder="Enter current password"
                  required
                />
              </div>

              <div className="form-group">
                <label>NEW PASSWORD</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  placeholder="Enter new password"
                  required
                />
              </div>

              <div className="form-group">
                <label>CONFIRM PASSWORD</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  placeholder="Confirm new password"
                  required
                />
              </div>

              <button type="submit" className="save-btn" disabled={changingPassword}>
                {changingPassword ? 'Changing...' : '💾 Save Changes'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}

