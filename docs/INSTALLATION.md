# Installation & Setup Guide

## Prerequisites

- Node.js v16 or higher
- MongoDB v4.4 or higher (or MongoDB Atlas account)
- npm or yarn

## Backend Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Environment Configuration

Create a `.env` file in the `server` directory:

```env
MONGO_URI=mongodb://localhost:27017/barber_shop
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Environment Variables Explained:**
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT token generation (use a strong random string)
- `PORT`: Backend server port
- `NODE_ENV`: Development or production environment
- `FRONTEND_URL`: Frontend application URL for CORS

### 3. Start MongoDB

**Local MongoDB:**
```bash
mongod
```

**Or use MongoDB Atlas:**
- Replace `MONGO_URI` with your MongoDB Atlas connection string

### 4. Run the Server

Development (with auto-reload):
```bash
npm run dev
```

Production:
```bash
npm start
```

The server will start on `http://localhost:5000`

---

## Frontend Setup

### 1. Install Dependencies

```bash
cd client
npm install
```

### 2. Create Environment File

Create a `.env.local` file in the `client` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Start Development Server

```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

---

## Project Structure

```
server/
├── src/
│   ├── config/           # Database and app configuration
│   ├── controllers/      # Business logic
│   ├── middleware/       # Auth and error handling
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── validators/      # Input validation
│   ├── utils/           # Helper functions
│   └── server.js        # Main server file
├── .env.example
├── package.json
└── README.md

client/
├── src/
│   ├── components/      # React components
│   ├── context/        # React context (Auth)
│   ├── pages/          # Page components
│   ├── services/       # API service calls
│   ├── styles/         # CSS/Tailwind styles
│   ├── App.jsx
│   └── main.jsx
├── public/
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "9876543210"
}
```

#### Login User
```
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

### Services Endpoints

#### Get All Services
```
GET /services
```

#### Create Service (Admin)
```
POST /services
Authorization: Bearer token
Content-Type: application/json

{
  "name": "Haircut",
  "description": "Professional haircut",
  "price": 300,
  "duration": 30,
  "category": "haircut"
}
```

### Appointments Endpoints

#### Book Appointment
```
POST /appointments
Authorization: Bearer token
Content-Type: application/json

{
  "barberId": "barber_id",
  "serviceId": "service_id",
  "appointmentDate": "2024-01-15",
  "appointmentTime": "14:30",
  "notes": "Please use mild shampoo"
}
```

#### Get My Appointments
```
GET /appointments/my-appointments
Authorization: Bearer token
```

#### Cancel Appointment
```
DELETE /appointments/:id
Authorization: Bearer token
```

### Invoices Endpoints

#### Get My Invoices
```
GET /invoices/my-invoices
Authorization: Bearer token
```

#### Get All Invoices (Admin)
```
GET /invoices
Authorization: Bearer token (admin user)
```

---

## Testing the Application

### 1. Register a Customer
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123",
    "phone": "9876543210"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

### 3. Get Services
```bash
curl http://localhost:5000/api/services
```

---

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check MONGO_URI in .env file
- If using MongoDB Atlas, ensure IP is whitelisted

### CORS Error
- Update FRONTEND_URL in server .env
- Ensure frontend URL matches the CORS origin

### Port Already in Use
```bash
# Kill process on port 5000 (Unix/Mac)
lsof -ti:5000 | xargs kill -9

# Kill process on port 5000 (Windows)
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Authentication Issues
- Ensure JWT_SECRET is set in .env
- Check token expiration time
- Clear browser localStorage and try again

---

## Next Steps

1. Create admin user account
2. Add services via admin panel
3. Register barbers in the system
4. Setup payment gateway integration
5. Configure email notifications
6. Deploy to production

---

## Support

For issues or questions, refer to the API documentation or contact the development team.
