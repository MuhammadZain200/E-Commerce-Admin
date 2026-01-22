import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import StaffDashboard from './pages/StaffDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import ProtectedRoute from './components/ProtectedRoute';

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

        {/* Products route - accessible to all authenticated users */}
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <Products />
            </ProtectedRoute>
          }
        />

        {/* Orders route - accessible to all authenticated users */}
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />

        {/* Optional: root route redirect to login */}
        <Route path="/" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
