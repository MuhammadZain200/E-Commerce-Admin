import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

export default function Sidebar({ user }) {
  const [activeMenu, setActiveMenu] = useState(null);

  const toggleMenu = (menu) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  const menuItems = [
    { name: 'DASHBOARD', icon: '📊', path: `/dashboard/${user.role}` },
    { name: 'PRODUCTS', icon: '📦', path: '/products' },
    { name: 'ORDERS', icon: '🛒', path: '/orders', disabled: true }, // Will be enabled in Step 3
    { name: 'ANALYTICS', icon: '📈', submenu: true },
    { name: 'SETTINGS', icon: '⚙️', submenu: true },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-square">EA</div>
        <div className="brand-text">E-COMMERCE ADMIN</div>
      </div>
      
      <div className="sidebar-user">
        <div className="user-avatar">
          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div className="user-info">
          <div className="user-name">{user.name || 'User'}</div>
        </div>
        <span className="dropdown-arrow">▼</span>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item, index) => (
          <div key={index} className="nav-item-wrapper">
            {item.disabled ? (
              <div className="nav-item disabled">
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-text">{item.name}</span>
                <span className="coming-soon">Soon</span>
              </div>
            ) : item.path ? (
              <NavLink 
                to={item.path} 
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-text">{item.name}</span>
                {item.submenu && <span className="dropdown-arrow">▼</span>}
              </NavLink>
            ) : (
              <div 
                className={`nav-item ${activeMenu === item.name ? 'active' : ''}`}
                onClick={() => toggleMenu(item.name)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-text">{item.name}</span>
                <span className="dropdown-arrow">▼</span>
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}
