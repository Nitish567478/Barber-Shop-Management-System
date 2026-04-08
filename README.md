# Barber Shop Management System

A comprehensive full-stack web application for managing barber shop operations including appointments, billing, employee management, and customer relations.

## Project Overview

This project aims to digitize barber shop operations by providing:
- Customer appointment booking system
- Employee/Barber management
- Service management with pricing
- Appointment scheduling and tracking
- Billing and invoice generation
- Business analytics and reports
- User authentication and authorization

## Tech Stack

- **Frontend:** React.js with Vite, Redux Toolkit, Tailwind CSS
- **Backend:** Node.js + Express.js
- **Database:** MongoDB (with PostgreSQL as alternative)
- **Authentication:** JWT (JSON Web Tokens)
- **API:** RESTful API

## Project Structure

```
Barabar Shop Management System/
├── client/                  # React Frontend
├── server/                  # Node.js Backend
├── database/               # Database schemas and migrations
├── docs/                   # Project documentation
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher) or PostgreSQL
- npm or yarn

### Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the server directory:
```
MONGO_URI=mongodb://localhost:27017/barber_shop
JWT_SECRET=your_jwt_secret_key
PORT=5000
NODE_ENV=development
```

Run the server:
```bash
npm start
```

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

## Features

### Customer Module
- User registration and authentication
- Browse services and pricing
- Book appointments
- View appointment history
- Cancel/reschedule appointments
- Receive booking confirmations

### Admin Module
- Dashboard with analytics
- Manage barbers/employees
- Manage services
- View and manage appointments
- Generate invoices
- View business reports
- Customer management

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Appointments
- `GET /api/appointments` - Get all appointments
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Cancel appointment

### Services
- `GET /api/services` - Get all services
- `POST /api/services` - Create service (admin)
- `PUT /api/services/:id` - Update service (admin)

### Barbers
- `GET /api/barbers` - Get all barbers
- `POST /api/barbers` - Add barber (admin)

### Billing
- `GET /api/invoices` - Get invoices
- `POST /api/invoices` - Generate invoice

## Database Schema

### Users
- id, name, email, password, phone, role, createdAt, updatedAt

### Services
- id, name, description, price, duration, createdAt, updatedAt

### Barbers
- id, name, email, phone, specialization, availability, createdAt, updatedAt

### Appointments
- id, userId, barberId, serviceId, appointmentDate, appointmentTime, status, createdAt, updatedAt

### Billing
- id, appointmentId, amount, paymentMethod, paymentStatus, invoiceDate, createdAt, updatedAt

## Future Enhancements

- SMS/Email notifications
- Payment gateway integration
- Calendar view for appointments
- Customer feedback/ratings
- Advanced analytics
- Mobile app
- Real-time notifications

## License

MIT License

## Contact

For more information, visit the project documentation in the `docs` folder.
