import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import UserManagement from './pages/UserManagement';
import Categories from './pages/Categories';
import UserHome from './pages/UserHome';
import UserProducts from './pages/UserProducts';
import UserProductsList from './pages/UserProductsList';
import UserCart from './pages/UserCart';
import Checkout from './pages/Checkout';
import UserOrders from './pages/UserOrders';
import UserProfile from './pages/UserProfile';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import ProtectedRoute from './components/ProtectedRoute';
import NotificationContainer from './components/Notification';

function App() {
  return (
    <BrowserRouter>
      <NotificationContainer />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Role-based dashboards */}
        <Route
          path="/dashboard/user"
          element={
            <RoleProtectedRoute allowedRoles={['user']}>
              <UserProducts />
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

        {/* Analytics route - admin only */}
        <Route
          path="/analytics"
          element={
            <RoleProtectedRoute allowedRoles={['admin']}>
              <Analytics />
            </RoleProtectedRoute>
          }
        />

        {/* Settings route - admin only */}
        <Route
          path="/settings"
          element={
            <RoleProtectedRoute allowedRoles={['admin']}>
              <Settings />
            </RoleProtectedRoute>
          }
        />

        {/* User Management route - admin only */}
        <Route
          path="/users"
          element={
            <RoleProtectedRoute allowedRoles={['admin']}>
              <UserManagement />
            </RoleProtectedRoute>
          }
        />

        {/* Categories Management route - admin only */}
        <Route
          path="/categories"
          element={
            <RoleProtectedRoute allowedRoles={['admin']}>
              <Categories />
            </RoleProtectedRoute>
          }
        />

        {/* User routes - user only */}
        <Route
          path="/user/home"
          element={
            <RoleProtectedRoute allowedRoles={['user']}>
              <UserHome />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/user/products"
          element={
            <RoleProtectedRoute allowedRoles={['user']}>
              <UserProducts />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/user/products-list"
          element={
            <RoleProtectedRoute allowedRoles={['user']}>
              <UserProductsList />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/user/cart"
          element={
            <RoleProtectedRoute allowedRoles={['user']}>
              <UserCart />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <RoleProtectedRoute allowedRoles={['user']}>
              <Checkout />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/user/orders"
          element={
            <RoleProtectedRoute allowedRoles={['user']}>
              <UserOrders />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/user/profile"
          element={
            <RoleProtectedRoute allowedRoles={['user']}>
              <UserProfile />
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
