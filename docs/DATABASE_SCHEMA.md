# Database Schema

This document describes the MongoDB database schema for the Barber Shop Management System.

## Collections

### 1. Users
Stores user account information for customers, barbers, and admins.

```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  role: String (enum: 'customer', 'admin', 'barber'),
  profilePicture: String (optional),
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- email (unique)
- role

---

### 2. Services
Contains the list of services offered by the barber shop.

```javascript
{
  _id: ObjectId,
  name: String,
  description: String (optional),
  price: Number (min: 0),
  duration: Number (minutes, min: 15),
  category: String (enum: 'haircut', 'shaving', 'coloring', 'treatment', 'grooming', 'other'),
  image: String (optional),
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- category
- isActive

---

### 3. Barbers
Stores barber/staff information and their availability.

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: Users),
  specialization: [String],
  experience: Number (years),
  rating: Number (0-5),
  availability: {
    monday: { start: String (HH:MM), end: String (HH:MM), isWorking: Boolean },
    tuesday: { start: String, end: String, isWorking: Boolean },
    wednesday: { start: String, end: String, isWorking: Boolean },
    thursday: { start: String, end: String, isWorking: Boolean },
    friday: { start: String, end: String, isWorking: Boolean },
    saturday: { start: String, end: String, isWorking: Boolean },
    sunday: { start: String, end: String, isWorking: Boolean }
  },
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- userId
- isActive

---

### 4. Appointments
Tracks all appointments booked in the system.

```javascript
{
  _id: ObjectId,
  customerId: ObjectId (ref: Users),
  barberId: ObjectId (ref: Barbers),
  serviceId: ObjectId (ref: Services),
  appointmentDate: Date,
  appointmentTime: String (HH:MM),
  duration: Number (minutes),
  status: String (enum: 'scheduled', 'completed', 'cancelled', 'no-show'),
  notes: String (optional),
  price: Number,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- customerId
- barberId
- appointmentDate
- status

---

### 5. Invoices
Records billing and payment information for appointments.

```javascript
{
  _id: ObjectId,
  appointmentId: ObjectId (ref: Appointments, unique),
  customerId: ObjectId (ref: Users),
  barberId: ObjectId (ref: Barbers),
  invoiceNumber: String (unique),
  amount: Number,
  paymentMethod: String (enum: 'cash', 'card', 'upi', 'online'),
  paymentStatus: String (enum: 'pending', 'completed', 'failed'),
  invoiceDate: Date,
  notes: String (optional),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- appointmentId (unique)
- customerId
- invoiceNumber (unique)
- paymentStatus

---

## Relationships

```
Users (1) ----< (Many) Appointments
         |
         +---- (1) Barber Profile

Services (1) ----< (Many) Appointments

Barbers (1) ----< (Many) Appointments
        |
        +---- (1) Invoice

Appointments (1) ---- (1) Invoice
```

## Query Examples

### Find all appointments for a customer
```javascript
db.appointments.find({ customerId: ObjectId('...') })
```

### Get barber's schedule for a date
```javascript
db.appointments.find({
  barberId: ObjectId('...'),
  appointmentDate: { 
    $gte: new Date('2024-01-01'),
    $lt: new Date('2024-01-02')
  }
})
```

### Calculate daily revenue
```javascript
db.invoices.aggregate([
  { $match: { 
    paymentStatus: 'completed',
    invoiceDate: { 
      $gte: new Date('2024-01-01'),
      $lt: new Date('2024-01-02')
    }
  }},
  { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
])
```

### Get top services by bookings
```javascript
db.appointments.aggregate([
  { $group: { _id: '$serviceId', count: { $sum: 1 } } },
  { $sort: { count: -1 } },
  { $limit: 10 },
  { $lookup: {
    from: 'services',
    localField: '_id',
    foreignField: '_id',
    as: 'serviceDetails'
  }}
])
```
