import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import StaffDashboard from './pages/StaffDashboard';
import AdminDashboard from './pages/AdminDashboard';
import RoleProtectedRoute from './components/RoleProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Role-based dashboards */}
        <Route
          path="/dashboard/user"
          element={
            <RoleProtectedRoute allowedRoles={['user']}>
              <UserDashboard />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/dashboard/staff"
          element={
            <RoleProtectedRoute allowedRoles={['staff']}>
              <StaffDashboard />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/dashboard/admin"
          element={
            <RoleProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </RoleProtectedRoute>
          }
        />

        {/* Optional: root route redirect to login */}
        <Route path="/" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
