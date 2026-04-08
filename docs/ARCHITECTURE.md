# System Architecture

## Overview

The Barber Shop Management System follows a modern three-tier architecture:

```
┌──────────────────────────────────────────────────────────┐
│              Presentation Layer (Frontend)               │
│  React.js + Vite + Tailwind CSS (SPA)                    │
└────────────────┬─────────────────────────────────────────┘
                 │ HTTP/REST API (Axios)
                 ↓
┌──────────────────────────────────────────────────────────┐
│            Application Layer (Backend API)               │
│  Node.js + Express.js + Middleware Stack                 │
│  ├─ Authentication (JWT)                                 │
│  ├─ Authorization (Role-based)                           │
│  ├─ Validation & Error Handling                          │
│  └─ Business Logic (Controllers)                         │
└────────────────┬─────────────────────────────────────────┘
                 │ MongoDB Queries
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

## Frontend Architecture

### Component Hierarchy

```
App
├── Router
│   ├── Login (public)
│   ├── Register (public)
│   ├── Dashboard (protected)
│   └── BookAppointment (protected)
```

### Data Flow

```
Component
   │
   ├─→ useAuth() (Context)
   │      └─→ AuthContext
   │
   ├─→ API Service (axios)
   │      └─→ Backend API
   │
   └─→ State Management (useState)
          └─→ Local Component State
```

### Page Structure

```
pages/
├── Login.jsx          - User authentication
├── Register.jsx       - New user registration
├── Dashboard.jsx      - Main user interface
└── BookAppointment.jsx - Appointment booking

components/
└── ProtectedRoute.jsx - Route guard with auth check

context/
├── AuthContext.jsx    - Authentication state and functions
└── (Future: AppContext, NotificationContext)

services/
└── api.js            - Axios instance and API calls

hooks/
└── (Future: useAppointments, useServices)
```

## Backend Architecture

### Request Flow

```
HTTP Request
    ↓
Express Middleware
    ├─ CORS Handler
    ├─ JSON Parser
    └─ Error Handler
    ↓
Route Handler
    ├─ Authentication Middleware (JWT)
    ├─ Authorization Middleware (Roles)
    └─ Route Logic
    ↓
Controller
    ├─ Validation
    ├─ Business Logic
    └─ Database Operations
    ↓
Response
    └─ JSON Response
```

### Module Organization

```
controllers/ - Business Logic Layer
├─ authController.js       - User auth operations
├─ serviceController.js    - Service CRUD
├─ appointmentController.js - Appointment management
├─ barberController.js     - Barber management
└─ invoiceController.js    - Billing operations

models/ - Data Layer
├─ User.js                 - User schema
├─ Service.js              - Service schema
├─ Appointment.js          - Appointment schema
├─ Barber.js               - Barber schema
└─ Invoice.js              - Invoice schema

routes/ - API Routes
├─ authRoutes.js           - /api/auth/*
├─ serviceRoutes.js        - /api/services/*
├─ appointmentRoutes.js    - /api/appointments/*
├─ barberRoutes.js         - /api/barbers/*
└─ invoiceRoutes.js        - /api/invoices/*

middleware/ - Cross-cutting Concerns
├─ auth.js                 - JWT verification & role check
└─ errorHandler.js         - Error handling

validators/ - Input Validation
└─ validators.js           - Schema and input validation

utils/ - Helper Functions
├─ helpers.js              - Password hash, JWT, etc.
└─ constants.js            - App constants

config/ - Configuration
├─ config.js               - Environment variables
└─ database.js             - MongoDB connection
```

## Database Design

### MongoDB Collections

```javascript
// Users Collection
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String (hashed),
  phone: String,
  role: String (enum: 'customer', 'admin', 'barber'),
  timestamps: Date
}

// Services Collection
{
  _id: ObjectId,
  name: String,
  price: Number,
  duration: Number,
  category: String,
  timestamps: Date
}

// Barbers Collection
{
  _id: ObjectId,
  userId: ObjectId → User,
  specialization: [String],
  experience: Number,
  availability: Object,
  timestamps: Date
}

// Appointments Collection
{
  _id: ObjectId,
  customerId: ObjectId → User,
  barberId: ObjectId → Barber,
  serviceId: ObjectId → Service,
  appointmentDate: Date,
  appointmentTime: String,
  status: String,
  timestamps: Date
}

// Invoices Collection
{
  _id: ObjectId,
  appointmentId: ObjectId → Appointment,
  customerId: ObjectId → User,
  amount: Number,
  paymentStatus: String,
  timestamps: Date
}
```

### Relationships

```
User (1) ────← (Many) Appointments
     ↓
   Barber (1) ──← (Many) Appointments
                   ↓
                Service (1)
                   ↓
                Invoice (1)
```

## Authentication Flow

```
1. User enters credentials
   ↓
2. Register/Login API call
   ↓
3. Backend validates credentials
   ├─ Hash password check (bcryptjs)
   └─ Generate JWT token
   ↓
4. Token stored in localStorage
   ↓
5. All subsequent requests include token
   ├─ Bearer token in Authorization header
   └─ Verified by authenticateToken middleware
   ↓
6. Role checked by authorizeRole middleware
   ↓
7. User can access protected routes
```

## Communication Patterns

### REST API Call Example

```
// Frontend (Axios)
POST /api/appointments
{
  barberId: "...",
  serviceId: "...",
  appointmentDate: "2024-01-15",
  appointmentTime: "14:30"
}

        ↓ HTTP Request

// Backend (Express)
router.post('/', authenticateToken, validate, createAppointment)

        ↓ Middleware

// Authentication Check
jwt.verify(token) → req.user = { userId, role }

        ↓ Validation Check

validateAppointment(...) → no errors

        ↓ Controller

appointmentController.createAppointment()
├─ Get service details
├─ Check availability
├─ Create appointment
└─ Save to MongoDB

        ↓ Response

{
  success: true,
  appointment: {
    _id: "...",
    customerId: "...",
    barberId: "...",
    status: "scheduled"
  }
}
```

## Error Handling

```
Error thrown in controller
    ↓
Caught by catch block
    ↓
throw new AppError(message, statusCode)
    ↓
next(error) → passes to error handler
    ↓
errorHandler middleware
    ├─ Log error
    ├─ Determine status code
    └─ Send JSON response
    ↓
Frontend receives error
    ├─ Show error message to user
    └─ Log error to console
```

## Security Architecture

```
Frontend
├─ Token validation
├─ Protected routes
└─ Input sanitization

         ↓

Backend
├─ CORS validation
├─ JWT verification
├─ Role authorization
├─ Input validation
├─ Password hashing
└─ Error logging

         ↓

Database
├─ Connection string in env
├─ MongoDB authentication
└─ No sensitive data in responses
```

## Scalability Considerations

### Horizontal Scaling
- Stateless backend (JWT-based)
- Database layer can be scaled independently
- Load balancer can distribute requests
- Session storage in tokens (not server)

### Vertical Scaling
- Database indexes for query optimization
- Caching layer (Redis) can be added
- CDN for static assets
- Microservices ready structure

### Performance Optimization
- API response caching
- Database query optimization
- Frontend bundle optimization
- Lazy loading components
- Pagination for large datasets

## Future Enhancements

### Microservices Architecture
```
API Gateway
├─ Auth Service
├─ Appointment Service
├─ Payment Service
├─ Notification Service
└─ Analytics Service
    ↓
Message Queue (RabbitMQ/Kafka)
    ↓
Services communicate asynchronously
```

### Real-time Features
```
WebSocket Server
├─ Live booking updates
├─ Notifications
└─ Real-time availability
```

### Advanced Features
```
Cache Layer (Redis)
├─ Session storage
├─ Query caching
└─ Rate limiting

Message Queue
├─ Email notifications
├─ SMS reminders
└─ Report generation
```

## Deployment Architecture

```
Development
└─ Local machine

Staging
├─ GitHub repository
└─ Testing environment

Production
├─ Containerization (Docker)
├─ Orchestration (Kubernetes)
├─ Load Balancing
├─ Auto-scaling
└─ Monitoring & Logging
```

## Performance Metrics

- Frontend JS Bundle: < 250KB (gzipped)
- API Response Time: < 200ms (p95)
- Database Query Time: < 50ms (p95)
- Page Load Time: < 2 seconds
- Uptime Target: 99.5%

---

For implementation details, see [Development Guide](./DEVELOPMENT.md)
