# API Reference

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### 1. Register User
**Endpoint:** `POST /auth/register`

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "9876543210"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGc...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

---

### 2. Login User
**Endpoint:** `POST /auth/login`

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGc...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

---

### 3. Get User Profile
**Endpoint:** `GET /auth/profile`
**Auth:** Required

**Response (200):**
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "role": "customer",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 4. Update User Profile
**Endpoint:** `PUT /auth/profile`
**Auth:** Required

**Body:**
```json
{
  "name": "Jane Doe",
  "phone": "9876543211"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": { ... }
}
```

---

## Services Endpoints

### 1. Get All Services
**Endpoint:** `GET /services`

**Query Parameters:**
- None

**Response (200):**
```json
{
  "success": true,
  "count": 5,
  "services": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Haircut",
      "description": "Professional haircut",
      "price": 300,
      "duration": 30,
      "category": "haircut",
      "isActive": true
    }
  ]
}
```

---

### 2. Get Service by ID
**Endpoint:** `GET /services/:id`

**Response (200):**
```json
{
  "success": true,
  "service": { ... }
}
```

---

### 3. Create Service (Admin Only)
**Endpoint:** `POST /services`
**Auth:** Required (Admin)

**Body:**
```json
{
  "name": "Premium Haircut",
  "description": "Premium haircut with styling",
  "price": 500,
  "duration": 45,
  "category": "haircut"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Service created successfully",
  "service": { ... }
}
```

---

### 4. Update Service (Admin Only)
**Endpoint:** `PUT /services/:id`
**Auth:** Required (Admin)

**Body:**
```json
{
  "price": 350,
  "duration": 35
}
```

---

### 5. Delete Service (Admin Only)
**Endpoint:** `DELETE /services/:id`
**Auth:** Required (Admin)

---

## Appointments Endpoints

### 1. Get All Appointments (Admin Only)
**Endpoint:** `GET /appointments`
**Auth:** Required (Admin)

---

### 2. Get My Appointments
**Endpoint:** `GET /appointments/my-appointments`
**Auth:** Required

---

### 3. Book Appointment
**Endpoint:** `POST /appointments`
**Auth:** Required

**Body:**
```json
{
  "barberId": "507f1f77bcf86cd799439011",
  "serviceId": "507f1f77bcf86cd799439012",
  "appointmentDate": "2024-01-15",
  "appointmentTime": "14:30",
  "notes": "Please use mild shampoo"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Appointment booked successfully",
  "appointment": {
    "_id": "507f1f77bcf86cd799439013",
    "customerId": "507f1f77bcf86cd799439011",
    "barberId": "507f1f77bcf86cd799439012",
    "serviceId": "507f1f77bcf86cd799439014",
    "appointmentDate": "2024-01-15T00:00:00.000Z",
    "appointmentTime": "14:30",
    "duration": 30,
    "status": "scheduled",
    "price": 300
  }
}
```

---

### 4. Get Appointment by ID
**Endpoint:** `GET /appointments/:id`
**Auth:** Required

---

### 5. Update Appointment (Admin Only)
**Endpoint:** `PUT /appointments/:id`
**Auth:** Required (Admin)

**Body:**
```json
{
  "status": "completed",
  "notes": "Service completed successfully"
}
```

---

### 6. Cancel Appointment
**Endpoint:** `DELETE /appointments/:id`
**Auth:** Required

**Response (200):**
```json
{
  "success": true,
  "message": "Appointment cancelled successfully",
  "appointment": { ... }
}
```

---

## Barbers Endpoints

### 1. Get All Barbers
**Endpoint:** `GET /barbers`

---

### 2. Get Barber by ID
**Endpoint:** `GET /barbers/:id`

---

### 3. Get Barber Availability
**Endpoint:** `GET /barbers/:id/availability`

---

### 4. Add Barber (Admin Only)
**Endpoint:** `POST /barbers`
**Auth:** Required (Admin)

**Body:**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "specialization": ["haircut", "shaving"],
  "experience": 5
}
```

---

### 5. Update Barber (Admin Only)
**Endpoint:** `PUT /barbers/:id`
**Auth:** Required (Admin)

**Body:**
```json
{
  "specialization": ["haircut", "shaving", "coloring"],
  "experience": 6,
  "availability": { ... }
}
```

---

## Invoices Endpoints

### 1. Get All Invoices (Admin Only)
**Endpoint:** `GET /invoices`
**Auth:** Required (Admin)

---

### 2. Get My Invoices
**Endpoint:** `GET /invoices/my-invoices`
**Auth:** Required

---

### 3. Get Invoice by ID
**Endpoint:** `GET /invoices/:id`
**Auth:** Required

---

### 4. Create Invoice (Admin Only)
**Endpoint:** `POST /invoices`
**Auth:** Required (Admin)

**Body:**
```json
{
  "appointmentId": "507f1f77bcf86cd799439013",
  "paymentMethod": "cash",
  "notes": "No discount applied"
}
```

---

### 5. Update Invoice Payment Status (Admin Only)
**Endpoint:** `PUT /invoices/:id`
**Auth:** Required (Admin)

**Body:**
```json
{
  "paymentStatus": "completed",
  "paymentMethod": "card"
}
```

---

### 6. Get Revenue Statistics (Admin Only)
**Endpoint:** `GET /invoices/stats/revenue`
**Auth:** Required (Admin)

**Response (200):**
```json
{
  "success": true,
  "totalRevenue": 15000,
  "monthlyRevenue": [
    {
      "_id": { "year": 2024, "month": 1 },
      "total": 5000
    }
  ]
}
```

---

## Error Responses

### 400 - Bad Request
```json
{
  "success": false,
  "status": 400,
  "message": "Invalid input data"
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "status": 401,
  "message": "Access token required"
}
```

### 403 - Forbidden
```json
{
  "success": false,
  "status": 403,
  "message": "Forbidden: Insufficient permissions"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "status": 404,
  "message": "Resource not found"
}
```

### 409 - Conflict
```json
{
  "success": false,
  "status": 409,
  "message": "Barber is not available at this time"
}
```

### 500 - Server Error
```json
{
  "success": false,
  "status": 500,
  "message": "Internal Server Error"
}
```

---

## Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Server Error

---

## Rate Limiting

Currently, no rate limiting is implemented. Consider adding it for production.

---

## Pagination

Pagination is not yet implemented. Consider adding support for:
- `limit` - Number of records per page (default: 10)
- `skip` - Number of records to skip (default: 0)
- `sort` - Sort order (ascending/descending)

---

## Filtering & Searching

Advanced filtering and search capabilities are available for certain endpoints:
- Appointments can be filtered by status, date range, barber, customer
- Services can be filtered by category
- Invoices can be filtered by payment status

---

## Webhooks

Webhooks are not currently implemented. Consider adding them for:
- Appointment reminders
- Payment confirmations
- New bookings notifications
