import React from 'react';

export default function StatsCard({ title, value, icon, color, subtitle, action }) {
  return (
    <div className="stats-card">
      <div className="stats-card-icon" style={{ backgroundColor: color }}>
        {icon}
      </div>
      <div className="stats-card-content">
        <div className="stats-card-title">{title}</div>
        <div className="stats-card-value">{value}</div>
        {subtitle && (
          <div className="stats-card-subtitle">
            {subtitle.icon && <span className="subtitle-icon">{subtitle.icon}</span>}
            {subtitle.text}
          </div>
        )}
        {action && (
          <div className="stats-card-action">
            {action.icon && <span className="action-icon">{action.icon}</span>}
            {action.text}
          </div>
        )}
      </div>
    </div>
  );
}
