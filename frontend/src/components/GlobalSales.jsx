import React from 'react';

export default function GlobalSales() {
  const salesData = [
    { country: 'USA', flag: '🇺🇸', sales: '2.920', percentage: '53.23%' },
    { country: 'Germany', flag: '🇩🇪', sales: '1.300', percentage: '20.43%' },
    { country: 'Australia', flag: '🇦🇺', sales: '760', percentage: '10.35%' },
    { country: 'United Kingdom', flag: '🇬🇧', sales: '690', percentage: '7.87%' },
    { country: 'Romania', flag: '🇷🇴', sales: '600', percentage: '5.94%' },
    { country: 'Brasil', flag: '🇧🇷', sales: '550', percentage: '4.34%' },
  ];

  return (
    <div className="global-sales-section">
      <div className="section-header">
        <h2>Global Sales by Top Locations</h2>
        <p>All products that were shipped</p>
      </div>
      
      <div className="global-sales-content">
        <div className="sales-table-container">
          <table className="sales-table">
            <thead>
              <tr>
                <th>Country</th>
                <th>Sales</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {salesData.map((item, index) => (
                <tr key={index}>
                  <td>
                    <span className="country-flag">{item.flag}</span>
                    <span className="country-name">{item.country}</span>
                  </td>
                  <td className="sales-value">{item.sales}</td>
                  <td className="sales-percentage">{item.percentage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="world-map-container">
          <div className="map-controls">
            <button className="map-zoom-btn">+</button>
            <button className="map-zoom-btn">-</button>
          </div>
          <div className="world-map">
            <svg viewBox="0 0 1000 500" className="map-svg">
              {/* Simplified world map representation */}
              <path d="M 200 150 L 250 140 L 280 160 L 270 200 L 240 210 L 210 200 Z" fill="#e0e0e0" stroke="#ccc" strokeWidth="1"/>
              <path d="M 150 200 L 200 190 L 220 210 L 210 250 L 180 260 L 150 240 Z" fill="#e0e0e0" stroke="#ccc" strokeWidth="1"/>
              <path d="M 300 180 L 350 170 L 380 190 L 370 230 L 340 240 L 310 230 Z" fill="#d0d0d0" stroke="#999" strokeWidth="1"/>
              <path d="M 500 200 L 550 190 L 570 210 L 560 250 L 530 260 L 500 240 Z" fill="#d0d0d0" stroke="#999" strokeWidth="1"/>
              <path d="M 700 220 L 750 210 L 770 230 L 760 270 L 730 280 L 700 260 Z" fill="#d0d0d0" stroke="#999" strokeWidth="1"/>
              <path d="M 400 250 L 450 240 L 470 260 L 460 300 L 430 310 L 400 290 Z" fill="#d0d0d0" stroke="#999" strokeWidth="1"/>
              <path d="M 600 270 L 650 260 L 670 280 L 660 320 L 630 330 L 600 310 Z" fill="#d0d0d0" stroke="#999" strokeWidth="1"/>
              {/* USA highlight */}
              <path d="M 200 150 L 250 140 L 280 160 L 270 200 L 240 210 L 210 200 Z" fill="#666" opacity="0.6"/>
              {/* Germany highlight */}
              <path d="M 300 180 L 350 170 L 380 190 L 370 230 L 340 240 L 310 230 Z" fill="#666" opacity="0.5"/>
              {/* Australia highlight */}
              <path d="M 700 220 L 750 210 L 770 230 L 760 270 L 730 280 L 700 260 Z" fill="#666" opacity="0.4"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

