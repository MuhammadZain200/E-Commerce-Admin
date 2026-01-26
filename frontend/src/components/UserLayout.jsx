// File: components/UserLayout.jsx
//
// User Layout - Wrapper component for user pages with sidebar, header, footer

import React from 'react';
import UserSidebar from './UserSidebar';
import UserHeader from './UserHeader';
import UserFooter from './UserFooter';
import FloatingCartButton from './FloatingCartButton';
import './UserLayout.css';

export default function UserLayout({ children }) {
  return (
    <div className="user-layout">
      <UserSidebar />
      <div className="user-main-content">
        <UserHeader />
        <main className="user-content-area">
          {children}
        </main>
        <UserFooter />
      </div>
      <FloatingCartButton />
    </div>
  );
}

