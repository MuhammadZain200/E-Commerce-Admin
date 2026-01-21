import React from 'react';
import Navbar from '../components/Navbar'; // ✅ import Navbar

export default function UserDashboard() {
  return (
    <div>
      <Navbar />

      <div style={{ padding: '20px' }}>
        <h1>Welcome to your Dashboard</h1>
        <p>This is your main user page.</p>
        {/* You can add sidebar, stats, charts, etc. here later */}
      </div>
    </div>
  );
}
