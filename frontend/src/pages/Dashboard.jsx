import React from 'react';
import Navbar from '../components/Navbar'; // ✅ import Navbar

export default function Dashboard() {
  return (
    <div>
      <Navbar />

      <div style={{ padding: '20px' }}>
        <h1>Welcome to your Dashboard</h1>
        <p>This is your main admin page.</p>
        {/* You can add sidebar, stats, charts, etc. here later */}
      </div>
    </div>
  );
}
