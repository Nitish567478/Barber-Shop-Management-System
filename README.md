# 🪒 Barber Shop Management System

<div align="center">

**A comprehensive full-stack web application for managing barber shop operations including appointments, billing, employee management, and customer relations.**

[![React](https://img.shields.io/badge/Frontend-React%2018-61DAFB?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Build%20Tool-Vite-646CFF?logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?logo=nodedotjs)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb)](https://mongodb.com)
[![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens)](https://jwt.io)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Three Dashboard System](#-three-dashboard-system)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Seeding the Database](#-seeding-the-database)
- [Test Accounts](#-test-accounts)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [System Architecture](#-system-architecture)
- [Available Scripts](#-available-scripts)
- [Deployment](#-deployment)
- [Security Features](#-security-features)
- [Performance](#-performance)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [Documentation Index](#-documentation-index)
- [License](#-license)
- [Contact](#-contact)

---

## 🎯 Overview

The **Barber Shop Management System** is a complete digital solution designed to modernize barber shop operations. It bridges the gap between traditional scheduling and modern technology by providing role-based dashboards, real-time analytics, and seamless appointment management.

### What This Project Delivers

- **For Customers**: Easy online booking, appointment tracking, payment history, and profile management
- **For Barbers**: Daily schedules, earnings tracking, performance metrics, and customer insights
- **For Admins**: Complete business analytics, revenue monitoring, staff management, and top-earner rankings

### Quick Stats

| Metric | Value |
|--------|-------|
| **Total Pages** | 15+ |
| **API Endpoints** | 25+ |
| **Database Collections** | 5 |
| **Dashboard Types** | 3 (Customer, Barber, Admin) |
| **Test Accounts** | 7 pre-configured |
| **Documentation Files** | 8 comprehensive guides |

---

## ✨ Key Features

### 👤 Customer Features

- **User Authentication** — Secure JWT-based register/login system
- **Browse Services** — View all available services with pricing and duration
- **Browse Barbers** — Check barber profiles, experience, and specializations
- **Book Appointments** — Select barber, service, date, and time
- **My Appointments** — View all appointments with status filters (All, Scheduled, Completed, Cancelled)
- **My Invoices** — Track payment history with financial statistics
- **Profile Management** — Edit name, email, phone, and preferences
- **Settings** — Notification preferences and account management
- **Help & Support** — FAQ section and contact information

### ✂️ Barber Features

- **Personal Dashboard** — Today's schedule, total appointments, earnings
- **Performance Metrics** — Average rating, customer satisfaction, experience years
- **Upcoming Appointments** — Filtered list of assigned bookings
- **Earnings Tracking** — Real-time revenue calculation from completed services

### 👨‍💼 Admin Features

- **Revenue Analytics** — Total revenue, monthly earnings, collection rates
- **Business Summary** — Completed appointments, pending payments, total customers
- **Top Earning Barbers** — Ranked table of barbers by earnings
- **Staff Management** — Manage barbers, services, and customers
- **Financial Reports** — Payment status tracking and analytics
- **Collection Rate Monitoring** — Payment success percentage

### 🎨 UI/UX Features

- Fully responsive design (mobile, tablet, desktop)
- Modern gradient backgrounds with smooth animations
- Color-coded status badges for appointments and invoices
- Loading states and error handling
- Success/error toast notifications
- Interactive hover effects and transitions
- Role-based navigation menus

---

## 📊 Three Dashboard System

The application automatically detects the user's role and renders the appropriate dashboard:

### 1. Customer Dashboard (`/dashboard`)

Displayed for users with `role: "customer"`.

**Statistics Cards:**
- Total Appointments (all-time)
- Upcoming Appointments (scheduled)
- Completed Appointments
- Total Amount Spent (Rs.)

**Quick Actions:**
- Book Appointment
- My Appointments
- My Invoices
- My Profile
- Services
- Barbers
- Settings
- Help & Support

**Sample Data:**
- Total Appointments: 3
- Upcoming: 2
- Completed: 1
- Total Spent: Rs. 800

### 2. Barber Dashboard (`/dashboard`)

Displayed for users with `role: "barber"`.

**Statistics Cards:**
- Today's Appointments
- Total Appointments (all assignments)
- Completed Appointments
- Total Earnings (Rs.)

**Performance Metrics:**
- Average Rating (stars)
- Customer Satisfaction (%)
- Years of Experience

**Sample Data:**
- Today's Appointments: 0–2
- Total Appointments: 6
- Completed: 3
- Earnings: Rs. 800

### 3. Admin Dashboard (`/dashboard`)

Displayed for users with `role: "admin"`.

**Revenue Stats:**
- Total Revenue (paid invoices only)
- This Month Revenue
- Pending Payments
- Collection Rate (%)

**Business Summary:**
- Total Appointments
- Completed Appointments
- Active Barbers
- Total Customers

**Top 5 Earning Barbers Table:**
- Rank, Name, Experience, Rating, Total Earnings

**Management Quick Links:**
- Manage Barbers
- Manage Customers
- Manage Services
- Financial Reports
- Analytics
- Settings

---

## 🛠 Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2.0 | UI Library |
| Vite | 4.1.0 | Build Tool & Dev Server |
| Tailwind CSS | 3.2.7 | Utility-first CSS |
| React Router DOM | 6.30.3 | Client-side Routing |
| Redux Toolkit | 1.9.1 | State Management |
| Axios | 1.3.0 | HTTP Client |
| Recharts | 3.8.1 | Charts & Graphs |
| Framer Motion | 12.38.0 | Animations |
| React Hot Toast | 2.6.0 | Notifications |
| Lucide React | 1.9.0 | Icons |
| Date-fns | 2.30.0 | Date Formatting |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 16+ | Runtime |
| Express.js | 4.18.2 | Web Framework |
| MongoDB | 5.9.2+ (Mongoose 7.0.0) | Database |
| JSON Web Token | 9.0.0 | Authentication |
| bcryptjs | 2.4.3 | Password Hashing |
| Express Validator | 7.0.0 | Input Validation |
| Nodemailer | 6.9.14 | Email Service |
| CORS | 2.8.5 | Cross-Origin Resource Sharing |
| dotenv | 16.0.3 | Environment Variables |

### Development Tools

| Tool | Purpose |
|------|---------|
| Nodemon | Auto-restart server in dev |
| Concurrently | Run multiple scripts simultaneously |
| PostCSS / Autoprefixer | CSS processing |
| ESLint | Code linting |

---

## 📁 Project Structure

```
Barabar Shop Management System/
│
├── client/                          # React Frontend
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── components/              # Reusable components
│   │   │   ├── AppLayout.jsx
│   │   │   ├── BarberShopLoader.jsx
│   │   │   ├── CookieBanner.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── NotFound.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── RoleBasedRoute.jsx
│   │   ├── context/                 # React Context
│   │   │   └── AuthContext.jsx
│   │   ├── data/                    # Static data
│   │   │   ├── featuredBarbers.js
│   │   │   └── featuredServices.js
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── pages/                   # Page components
│   │   │   ├── AboutUs.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── BarberDashboard.jsx
│   │   │   ├── BarbersPage.jsx
│   │   │   ├── BookAppointment.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── HelpSupportPage.jsx
│   │   │   ├── HomePage.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── MyAppointments.jsx
│   │   │   ├── MyInvoices.jsx
│   │   │   ├── OnlinePaymentSoon.jsx
│   │   │   ├── PrivacyPolicy.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ResetPassword.jsx
│   │   │   ├── ServicesPage.jsx
│   │   │   ├── SettingsPage.jsx
│   │   │   └── TermsConditions.jsx
│   │   ├── services/                # API calls
│   │   │   └── api.js
│   │   ├── styles/                  # Global styles
│   │   │   └── globals.css
│   │   ├── utils/                   # Helper functions
│   │   │   ├── helpers.js
│   │   │   └── objectId.js
│   │   ├── App.jsx                  # Main app component
│   │   └── main.jsx                 # React entry point
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
├── server/                          # Node.js Backend
│   ├── src/
│   │   ├── config/                  # Configuration
│   │   │   ├── config.js
│   │   │   └── database.js
│   │   ├── controllers/             # Business logic
│   │   │   ├── appointmentController.js
│   │   │   ├── authController.js
│   │   │   ├── barberController.js
│   │   │   ├── couponController.js
│   │   │   ├── invoiceController.js
│   │   │   ├── reportController.js
│   │   │   └── serviceController.js
│   │   ├── middleware/              # Auth & error handling
│   │   │   ├── auth.js
│   │   │   └── errorHandler.js
│   │   ├── models/                  # MongoDB schemas
│   │   │   ├── Appointment.js
│   │   │   ├── Barber.js
│   │   │   ├── Coupon.js
│   │   │   ├── Invoice.js
│   │   │   ├── Report.js
│   │   │   ├── Service.js
│   │   │   └── User.js
│   │   ├── routes/                  # API routes
│   │   │   ├── appointmentRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   ├── barberRoutes.js
│   │   │   ├── couponRoutes.js
│   │   │   ├── invoiceRoutes.js
│   │   │   ├── reportRoutes.js
│   │   │   └── serviceRoutes.js
│   │   ├── utils/                   # Helper functions
│   │   │   ├── bookingReminders.js
│   │   │   ├── email.js
│   │   │   ├── ensureAdminUser.js
│   │   │   ├── ensureDefaultServices.js
│   │   │   ├── helpers.js
│   │   │   └── seedDatabase.js
│   │   ├── validators/              # Input validation
│   │   │   └── validators.js
│   │   └── server.js                # Main server file
│   ├── .gitignore
│   └── package.json
│
├── docs/                            # Documentation
│   ├── API.md                       # Complete API reference
│   ├── ARCHITECTURE.md              # System architecture
│   ├── DATABASE_SCHEMA.md           # Database design
│   ├── DEVELOPMENT.md               # Development guide
│   ├── INDEX.md                     # Doc index
│   ├── INSTALLATION.md              # Detailed setup
│   ├── PROJECT_SUMMARY.md           # Project overview
│   ├── QUICKSTART.md                # Quick setup guide
│   └── REQUIREMENTS.md              # Requirements
│
├── database/                        # Database info
├── .gitignore
├── package.json                     # Root workspace config (concurrently)
├── README.md                        # This file
└── TODO.md                          # Task tracking
```

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** — v16.0.0 or higher ([Download](https://nodejs.org/))
- **npm** — v8.0.0 or higher (comes with Node.js)
- **MongoDB** — v4.4 or higher ([Download](https://www.mongodb.com/try/download/community))
  - Or a [MongoDB Atlas](https://www.mongodb.com/atlas) cloud account
- **Git** — For cloning the repository

### Verify Installation

```bash
node -v      # Should print v16.x.x or higher
npm -v       # Should print 8.x.x or higher
mongod --version  # Should print v4.4.x or higher
```

---

## 🚀 Installation & Setup

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd "Barabar Shop Management System"
```

### Step 2: Install Root Dependencies

```bash
npm install
```

This installs `concurrently` and `react-helmet-async` used for workspace orchestration.

### Step 3: Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/barber_shop
# For MongoDB Atlas, use:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/barber_shop

# Authentication
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# CORS
FRONTEND_URL=http://localhost:5173

# Email (optional — for notifications)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### Step 4: Frontend Setup

```bash
cd client
npm install
```

Create a `.env.local` file in the `client` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

### Step 5: Start MongoDB

**Local MongoDB:**
```bash
mongod
```

**Or ensure your MongoDB Atlas cluster is running.**

### Step 6: Run the Development Servers

**Option A: Run both concurrently (recommended)**

From the root directory:
```bash
npm run dev
```

This starts both the backend (port 5000) and frontend (port 5173) simultaneously.

**Option B: Run individually**

Terminal 1 — Backend:
```bash
cd server
npm run dev
```

Terminal 2 — Frontend:
```bash
cd client
npm run dev
```

**Expected Output:**
- Server running at `http://localhost:5000`
- Client running at `http://localhost:5173`

---

## 🌱 Seeding the Database

The project includes a comprehensive seed script to populate the database with test data for immediate testing.

### Run the Seed Endpoint

```bash
curl -X POST http://localhost:5000/api/seed
```

Or use your browser / Postman:
```
POST http://localhost:5000/api/seed
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Database seeded successfully with dummy data",
  "testAccounts": {
    "admin": { "email": "admin@barbershop.com", "password": "password123" },
    "barber": { "email": "ali@barbershop.com", "password": "password123" },
    "customer": { "email": "ahmed@email.com", "password": "password123" }
  }
}
```

### What Gets Created

| Collection | Count | Details |
|------------|-------|---------|
| Users | 7 | 1 Admin, 3 Barbers, 3 Customers |
| Services | 7 | Haircuts, shaves, coloring, combos |
| Barbers | 3 | With experience, ratings, availability |
| Appointments | 6 | 3 Scheduled, 3 Completed |
| Invoices | 5 | 2 Paid, 3 Pending |

**⚠️ Important:** The seed endpoint is for development only. Remove or protect it before deploying to production.

---

## 👥 Test Accounts

After seeding, use these credentials to test each role:

| Role | Email | Password | Dashboard Access |
|------|-------|----------|------------------|
| **Admin** | `admin@barbershop.com` | `password123` | Admin Dashboard — Revenue, analytics, all data |
| **Barber** | `ali@barbershop.com` | `password123` | Barber Dashboard — Schedule, earnings, performance |
| **Barber** | `hassan@barbershop.com` | `password123` | Barber Dashboard |
| **Barber** | `bilal@barbershop.com` | `password123` | Barber Dashboard |
| **Customer** | `ahmed@email.com` | `password123` | Customer Dashboard — Appointments, invoices, bookings |
| **Customer** | `ali@email.com` | `password123` | Customer Dashboard |
| **Customer** | `fatima@email.com` | `password123` | Customer Dashboard |

### Quick Testing Checklist

- [ ] Seed database via `/api/seed`
- [ ] Login as **Customer** → See booking stats and quick actions
- [ ] Login as **Barber** → See today's schedule and earnings
- [ ] Login as **Admin** → See revenue, top barbers, business metrics
- [ ] Test public pages without login: `/services`, `/barbers`, `/help`

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Endpoints Overview

#### 🔐 Authentication (`/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Register new user |
| POST | `/auth/login` | No | User login |
| GET | `/auth/profile` | Yes | Get user profile |
| PUT | `/auth/profile` | Yes | Update user profile |
| POST | `/auth/forgot-password` | No | Request password reset |
| POST | `/auth/reset-password` | No | Reset password with token |

#### 📅 Appointments (`/appointments`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/appointments` | Yes | Admin | Get all appointments |
| GET | `/appointments/my-appointments` | Yes | Any | Get user's appointments |
| POST | `/appointments` | Yes | Customer | Book new appointment |
| GET | `/appointments/:id` | Yes | Any | Get appointment by ID |
| PUT | `/appointments/:id` | Yes | Admin/Barber | Update appointment |
| DELETE | `/appointments/:id` | Yes | Any | Cancel appointment |

#### 💈 Services (`/services`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/services` | No | — | Get all services |
| GET | `/services/:id` | No | — | Get service by ID |
| POST | `/services` | Yes | Admin | Create service |
| PUT | `/services/:id` | Yes | Admin | Update service |
| DELETE | `/services/:id` | Yes | Admin | Delete service |

#### ✂️ Barbers (`/barbers`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/barbers` | No | — | Get all barbers |
| GET | `/barbers/:id` | No | — | Get barber by ID |
| GET | `/barbers/:id/availability` | No | — | Check availability |
| POST | `/barbers` | Yes | Admin | Add barber |
| PUT | `/barbers/:id` | Yes | Admin | Update barber |

#### 💰 Invoices (`/invoices`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/invoices` | Yes | Admin | Get all invoices |
| GET | `/invoices/my-invoices` | Yes | Any | Get user's invoices |
| GET | `/invoices/:id` | Yes | Any | Get invoice by ID |
| POST | `/invoices` | Yes | Admin | Create invoice |
| PUT | `/invoices/:id` | Yes | Admin | Update payment status |
| GET | `/invoices/stats/revenue` | Yes | Admin | Get revenue statistics |

#### 📊 Reports (`/reports`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/reports` | Yes | Admin | Get business reports |
| GET | `/reports/summary` | Yes | Admin | Get summary stats |

#### 🎫 Coupons (`/coupons`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/coupons` | Yes | Admin | Get all coupons |
| POST | `/coupons` | Yes | Admin | Create coupon |
| PUT | `/coupons/:id` | Yes | Admin | Update coupon |
| DELETE | `/coupons/:id` | Yes | Admin | Delete coupon |

#### 🌱 Seed (`/seed`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/seed` | No | Seed database with dummy data |

### Error Response Format

```json
{
  "success": false,
  "status": 400,
  "message": "Error description here"
}
```

**Status Codes:**
- `200` — OK
- `201` — Created
- `400` — Bad Request
- `401` — Unauthorized (missing/invalid token)
- `403` — Forbidden (insufficient permissions)
- `404` — Not Found
- `409` — Conflict
- `500` — Internal Server Error

> **📖 Full API Documentation:** See [`docs/API.md`](./docs/API.md) for detailed request/response schemas and examples.

---

## 🗄 Database Schema

The application uses **MongoDB** with **Mongoose ODM**. Below are the main collections:

### 1. Users
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed with bcrypt),
  phone: String,
  role: String (enum: 'customer', 'admin', 'barber'),
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Services
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  price: Number,
  duration: Number (minutes),
  category: String (enum: 'haircut', 'shaving', 'coloring', 'treatment', 'grooming', 'other'),
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 3. Barbers
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  specialization: [String],
  experience: Number (years),
  rating: Number (0-5),
  availability: {
    monday: { start: String, end: String, isWorking: Boolean },
    tuesday: { ... },
    wednesday: { ... },
    thursday: { ... },
    friday: { ... },
    saturday: { ... },
    sunday: { ... }
  },
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 4. Appointments
```javascript
{
  _id: ObjectId,
  customerId: ObjectId (ref: User),
  barberId: ObjectId (ref: Barber),
  serviceId: ObjectId (ref: Service),
  appointmentDate: Date,
  appointmentTime: String (HH:MM),
  duration: Number,
  status: String (enum: 'scheduled', 'completed', 'cancelled', 'no-show'),
  notes: String,
  price: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### 5. Invoices
```javascript
{
  _id: ObjectId,
  appointmentId: ObjectId (ref: Appointment, unique),
  customerId: ObjectId (ref: User),
  barberId: ObjectId (ref: Barber),
  invoiceNumber: String (unique),
  amount: Number,
  paymentMethod: String (enum: 'cash', 'card', 'upi', 'online'),
  paymentStatus: String (enum: 'pending', 'completed', 'failed'),
  invoiceDate: Date,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Relationships

```
User (1) ────< (Many) Appointments
  │
  └── (1) Barber Profile

Service (1) ────< (Many) Appointments

Barber (1) ────< (Many) Appointments
       │
       └── (1) Invoice

Appointment (1) ──── (1) Invoice
```

> **📖 Detailed Schema:** See [`docs/DATABASE_SCHEMA.md`](./docs/DATABASE_SCHEMA.md)

---

## 🏗 System Architecture

The application follows a modern **Three-Tier Architecture**:

```
┌──────────────────────────────────────────────────────────┐
│              Presentation Layer (Frontend)               │
│  React.js + Vite + Tailwind CSS (SPA)                   │
│  ├─ React Router v6 (routing)                           │
│  ├─ Redux Toolkit (state management)                    │
│  ├─ Axios (HTTP client)                                 │
│  └─ Recharts (data visualization)                       │
└────────────────────┬─────────────────────────────────────┘
                     │ HTTP/REST API (JSON)
                     ↓
┌──────────────────────────────────────────────────────────┐
│            Application Layer (Backend API)               │
│  Node.js + Express.js + Middleware Stack                 │
│  ├─ Authentication (JWT + bcrypt)                        │
│  ├─ Authorization (Role-based RBAC)                      │
│  ├─ Validation (express-validator)                       │
│  ├─ Error Handling (centralized)                         │
│  └─ Business Logic (Controllers)                         │
└────────────────────┬─────────────────────────────────────┘
                     │ MongoDB Queries (Mongoose)
                     ↓
┌──────────────────────────────────────────────────────────┐
│              Data Layer (Database)                        │
│  MongoDB (NoSQL Document Database)                        │
│  ├─ Users Collection                                      │
│  ├─ Services Collection                                   │
│  ├─ Appointments Collection                               │
│  ├─ Barbers Collection                                    │
│  └─ Invoices Collection                                   │
└──────────────────────────────────────────────────────────┘
```

### Authentication Flow

```
1. User enters credentials (Register/Login)
         ↓
2. Backend validates & hashes password (bcryptjs)
         ↓
3. JWT token generated & sent to client
         ↓
4. Token stored in localStorage
         ↓
5. All API requests include Bearer token header
         ↓
6. authenticateToken middleware validates JWT
         ↓
7. authorizeRole middleware checks permissions
         ↓
8. Protected route/resource accessed
```

> **📖 Architecture Details:** See [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)

---

##
