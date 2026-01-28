# E-Commerce Admin Dashboard

A full-stack e-commerce administration system with role-based access control, order management, and inventory tracking.

## 📋 Table of Contents

- [Architecture](#architecture)
- [Features](#features)
- [Role Logic](#role-logic)
- [Order Flow](#order-flow)
- [Edge Cases Handled](#edge-cases-handled)
- [Tech Stack](#tech-stack)
- [Setup & Installation](#setup--installation)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)

## 🏗️ Architecture

### Backend Architecture

The backend follows a **MVC (Model-View-Controller)** pattern:

```
server/
├── models/          # Mongoose schemas (User, Product, Order)
├── controllers/     # Business logic handlers
├── routes/          # API route definitions
├── middleware/      # Authentication & authorization
└── scripts/         # Utility scripts (seeders)
```

**Key Design Decisions:**
- **MongoDB** with Mongoose for data persistence
- **JWT-based authentication** for stateless sessions
- **Role-based middleware** for route protection
- **Atomic transactions** for stock management
- **RESTful API** design

### Frontend Architecture

The frontend uses **React** with a component-based structure:

```
frontend/src/
├── components/      # Reusable UI components
├── pages/           # Route-level page components
├── context/         # React Context (Auth)
├── api/             # API client functions
└── App.jsx          # Main router
```

**Key Design Decisions:**
- **Context API** for global state (authentication)
- **Protected Routes** for role-based access
- **Axios** for HTTP requests with interceptors
- **Component composition** for reusability

## ✨ Features

### Core Features

1. **User Authentication & Authorization**
   - JWT-based authentication
   - Role-based access control (Admin, User)
   - Protected routes and API endpoints

2. **Product Management**
   - CRUD operations for products
   - Stock tracking with low stock warnings
   - Active/inactive product status
   - Price and inventory management

3. **Order Management**
   - Create orders with multiple items
   - Order status workflow (created → paid → packed → shipped → delivered)
   - Payment status tracking
   - Date-wise order filtering and grouping

4. **Stock Management**
   - Atomic stock updates using MongoDB transactions
   - Automatic rollback on errors
   - Stock validation before order creation
   - Low stock alerts (< 10 units)

5. **Dashboard**
   - Real-time statistics (orders, products, revenue)
   - Low stock product alerts
   - Recent products overview
   - Order summaries

## 🔐 Role Logic

### Roles

The system defines two roles:

- **Admin**
- **User**

Admins manage products, stock, and all orders. Users can browse products, manage their cart, and place and view their own orders.

### Implementation Details

**Backend Middleware:**
- `authMiddleware.js` - Validates JWT tokens
- `roleMiddleware.js` - Checks user roles for route access

**Frontend Protection:**
- `ProtectedRoute.jsx` - Requires authentication
- `RoleProtectedRoute.jsx` - Requires specific role(s)

**API Protection:**
- All routes except `/api/auth/*` require authentication
- Admin routes check for `role === 'admin'`

## 📦 Order Flow

### Order Lifecycle

```
1. CREATED
   ↓ (User/Admin creates order)
2. PAID
   ↓ (Stock is decremented atomically)
3. PACKED
   ↓ (Order is prepared for shipment)
4. SHIPPED
   ↓ (Order is in transit)
5. DELIVERED
   ↓ (Final state - no further transitions)
```

### Stock Management Flow

**When Order Status Changes to "PAID":**

1. **Transaction Start** - MongoDB session begins
2. **Stock Validation** - Check all products have sufficient stock
3. **Atomic Update** - Bulk write operation with stock condition
4. **Order Update** - Update order status and payment status
5. **Transaction Commit** - All changes saved or rolled back

**Error Handling:**
- If any product lacks stock → Transaction aborted, stock unchanged
- If any error occurs → Transaction rolled back automatically
- User receives clear error message

### Status Transition Rules

```javascript
created → paid (only valid transition from created)
paid → packed
packed → shipped
shipped → delivered
delivered → (no further transitions)
```

**Validation:**
- Invalid transitions return `400 Bad Request`
- Only Admin can update order status
- Delivered orders cannot be modified

## 🛡️ Edge Cases Handled

### 1. Stock Management

**Race Conditions:**
- ✅ Atomic transactions prevent concurrent stock updates
- ✅ Stock checked again before decrementing (double-check pattern)
- ✅ Bulk write with stock condition ensures atomicity

**Insufficient Stock:**
- ✅ Validated at order creation
- ✅ Re-validated before status change to "paid"
- ✅ Clear error messages with available vs requested quantities

**Rollback Scenarios:**
- ✅ Network errors during stock update
- ✅ Product deletion during order processing
- ✅ Database connection failures

### 2. Authentication & Authorization

**Token Expiration:**
- ✅ Frontend redirects to login on 401 responses
- ✅ Token stored in localStorage with expiration check

**Role Validation:**
- ✅ Backend validates role on every protected route
- ✅ Frontend shows/hides features based on role
- ✅ API returns 403 for unauthorized access

**Session Management:**
- ✅ Logout clears token from localStorage
- ✅ Protected routes check authentication state

### 3. Order Management

**Invalid Status Transitions:**
- ✅ Backend validates status transitions
- ✅ Frontend disables invalid action buttons
- ✅ Clear error messages for invalid transitions

**Order Access:**
- ✅ Users can only view their own orders
- ✅ Admin can view all orders
- ✅ Order details populated with product and user info

**Empty States:**
- ✅ Graceful handling of no orders/products
- ✅ User-friendly empty state messages
- ✅ Clear call-to-action buttons

### 4. Product Management

**Product Deletion:**
- ✅ Hard delete option available (Admin only)
- ✅ Validation prevents negative stock/price

**Low Stock Warnings:**
- ✅ Visual indicators in product lists
- ✅ Dashboard alerts for low stock items
- ✅ Threshold: < 10 units

### 5. Error Handling

**Network Errors:**
- ✅ Axios interceptors handle 401/403/500 errors
- ✅ User-friendly error messages
- ✅ Retry mechanisms for failed requests

**Form Validation:**
- ✅ Client-side validation before submission
- ✅ Server-side validation for security
- ✅ Clear error messages for each field

**Loading States:**
- ✅ Button-level loaders during async operations
- ✅ Disabled states prevent double submissions
- ✅ Loading spinners for page-level operations

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **React** - UI library
- **React Router** - Routing
- **Axios** - HTTP client
- **Context API** - State management

## 🚀 Setup & Installation

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

```bash
cd server
npm install

# Create .env file
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000

# Start server
npm start
# or for development
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install

# Start development server
npm start
```

### Database Seeding

```bash
# Seed orders (requires products and users to exist)
cd server
npm run seed:orders
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product (Admin only)
- `GET /api/products/:id` - Get product by ID
- `PATCH /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Orders
- `GET /api/orders` - Get orders (all for Admin, own for User)
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order by ID
- `PATCH /api/orders/:id/status` - Update order status (Admin only)

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## 📁 Project Structure

```
E-Commerce-Admin/
├── server/
│   ├── controllers/     # Business logic
│   ├── models/          # Database schemas
│   ├── routes/          # API routes
│   ├── middleware/      # Auth & role middleware
│   ├── scripts/         # Seed scripts
│   └── server.js        # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── api/         # API client
│   │   ├── context/     # React Context
│   │   └── App.jsx      # Main app
│   └── public/          # Static files
└── README.md            # This file
```

## 🔒 Security Features

1. **Password Hashing** - bcryptjs with salt rounds
2. **JWT Tokens** - Secure token-based authentication
3. **Input Validation** - Server-side validation for all inputs
4. **Role-Based Access** - Middleware protection on routes
5. **Stock Validation** - Prevents overselling with atomic updates
6. **Price Protection** - Server uses product price, not client price

## 📝 Notes

- Stock is only decremented when order status changes to "paid"
- Orders in "created" status don't affect stock
- Delivered orders cannot be modified
- Low stock threshold is set to 10 units
- All timestamps are stored in UTC

## 🤝 Contributing

This is a learning project demonstrating:
- Full-stack development
- Role-based access control
- Atomic database operations
- Error handling and edge cases
- Clean code architecture

---

**Built with ❤️ for learning and demonstration purposes**

