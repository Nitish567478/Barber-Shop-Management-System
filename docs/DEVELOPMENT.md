# Development Guide

## Project Overview

The Barber Shop Management System is a full-stack web application built with the MERN stack (MongoDB, Express, React, Node.js). It enables customers to book appointments online and helps shop owners manage operations efficiently.

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** JWT (JSON Web Tokens)
- **Package Manager:** npm

## Folder Structure

### Backend (`server/`)

```
server/
├── src/
│   ├── config/
│   │   ├── config.js          # Environment configuration
│   │   └── database.js        # MongoDB connection
│   ├── controllers/           # Business logic
│   │   ├── authController.js
│   │   ├── serviceController.js
│   │   ├── appointmentController.js
│   │   ├── barberController.js
│   │   └── invoiceController.js
│   ├── middleware/
│   │   ├── auth.js           # JWT verification & role authorization
│   │   └── errorHandler.js   # Centralized error handling
│   ├── models/               # MongoDB schemas
│   │   ├── User.js
│   │   ├── Service.js
│   │   ├── Appointment.js
│   │   ├── Barber.js
│   │   └── Invoice.js
│   ├── routes/               # API route definitions
│   │   ├── authRoutes.js
│   │   ├── serviceRoutes.js
│   │   ├── appointmentRoutes.js
│   │   ├── barberRoutes.js
│   │   └── invoiceRoutes.js
│   ├── utils/
│   │   └── helpers.js        # Utility functions
│   ├── validators/
│   │   └── validators.js     # Input validation
│   └── server.js             # Main server file
├── .env.example
├── package.json
└── README.md
```

### Frontend (`client/`)

```
client/
├── src/
│   ├── components/           # Reusable components
│   │   └── ProtectedRoute.jsx
│   ├── context/              # React Context
│   │   └── AuthContext.jsx
│   ├── pages/                # Page components
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   └── BookAppointment.jsx
│   ├── services/             # API calls
│   │   └── api.js
│   ├── styles/               # Global styles
│   │   └── globals.css
│   ├── App.jsx               # Main app component
│   └── main.jsx              # React entry point
├── public/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env.example
└── package.json
```

## Development Workflow

### 1. Starting Development

**Terminal 1 - Backend:**
```bash
cd server
npm install
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm install
npm run dev
```

**Terminal 3 - MongoDB (if local):**
```bash
mongod
```

### 2. Making Backend Changes

1. Edit files in `server/src/`
2. Server auto-restarts with nodemon
3. Test endpoints using curl or Postman

### 3. Making Frontend Changes

1. Edit files in `client/src/`
2. Vite hot-reloads automatically
3. Check browser console for errors

## Coding Standards

### Backend

**File naming:** camelCase with suffix
- `userController.js`
- `authRoutes.js`
- `errorHandler.js`

**Function naming:** camelCase, descriptive
```javascript
export const getUserAppointments = async (req, res, next) => { ... }
export const createInvoice = async (req, res, next) => { ... }
```

**Error handling:** Use AppError class
```javascript
if (!user) {
  throw new AppError('User not found', 404);
}
```

**Async/Await:** Use for all async operations
```javascript
try {
  const result = await Model.findById(id);
  res.json(result);
} catch (error) {
  next(error);
}
```

### Frontend

**Component naming:** PascalCase
```javascript
const BookAppointment = () => { ... }
const Dashboard = () => { ... }
```

**Hooks:** Use React Hooks for state management
```javascript
const [state, setState] = useState(initialValue);
const { data } = useAuth();
```

**Props destructuring:**
```javascript
const UserCard = ({ name, email, onDelete }) => { ... }
```

**CSS classes:** Tailwind utilities
```jsx
<div className="flex items-center justify-between p-4 bg-white rounded-lg">
  ...
</div>
```

## Common Tasks

### Adding a New API Endpoint

1. **Create controller function** in `server/src/controllers/`
2. **Add validation** in `server/src/validators/`
3. **Create route** in `server/src/routes/`
4. **Add to router** in main server file
5. **Test with curl/Postman**

Example:
```javascript
// controllers/userController.js
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

// routes/userRoutes.js
router.get('/', authenticateToken, authorizeRole('admin'), getAllUsers);
```

### Adding a New Page Component

1. Create `client/src/pages/YourPage.jsx`
2. Add route in `App.jsx`
3. Link from navigation
4. Call API from `services/api.js`

Example:
```javascript
// App.jsx
<Route path="/your-page" element={<YourPage />} />

// YourPage.jsx
import { useEffect, useState } from 'react';
import { yourAPI } from '../services/api';

const YourPage = () => {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      const response = await yourAPI.getAll();
      setData(response.data);
    };
    fetchData();
  }, []);
  
  return <div>{ ... }</div>;
};
```

### Adding Authentication to Routes

```javascript
// Backend: Protect route with JWT
router.post('/', authenticateToken, controller);

// Admin only
router.delete('/:id', authenticateToken, authorizeRole('admin'), controller);

// Frontend: Use ProtectedRoute
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

## Database Queries

### Common MongoDB Operations

**Find all documents:**
```javascript
const results = await Model.find();
```

**Find with filters:**
```javascript
const results = await Model.find({ status: 'active' });
```

**Find and populate references:**
```javascript
const results = await Appointment.find()
  .populate('customerId', 'name email')
  .populate('serviceId', 'name price');
```

**Update document:**
```javascript
const updated = await Model.findByIdAndUpdate(
  id,
  { field: value },
  { new: true, runValidators: true }
);
```

**Delete document:**
```javascript
await Model.findByIdAndDelete(id);
```

**Aggregate data:**
```javascript
const stats = await Invoice.aggregate([
  { $match: { paymentStatus: 'completed' } },
  { $group: { _id: null, total: { $sum: '$amount' } } }
]);
```

## Testing

### Backend Testing

Use curl or Postman to test API endpoints:

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"123456","phone":"1234567890"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'

# Get services
curl http://localhost:5000/api/services

# Create service (with token)
curl -X POST http://localhost:5000/api/services \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Haircut","price":300,"duration":30}'
```

### Frontend Testing

- Use React Developer Tools browser extension
- Check Network tab in DevTools
- View console for errors
- Use Chrome DevTools for debugging

## Debugging

### Backend Debugging

Check console logs:
```bash
npm run dev  # Shows all console outputs
```

### Frontend Debugging

1. Open Browser DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for API calls
4. Use React DevTools extension

## Deployment

### Backend Deployment (Heroku, Railway, Render)

1. Set environment variables on platform
2. Push code to GitHub
3. Connect repository to platform
4. Deploy

### Frontend Deployment (Vercel, Netlify)

1. Build project: `npm run build`
2. Push to GitHub
3. Connect repository to platform
4. Deploy

## Performance Optimization

- Add pagination to list endpoints
- Cache frequently accessed data
- Use database indexes for common queries
- Lazy load components in React
- Minimize bundle size

## Security Best Practices

- Never commit `.env` files
- Use strong JWT secrets
- Validate all user inputs
- Use HTTPS in production
- Implement rate limiting
- Sanitize database inputs
- Use CORS carefully

## Troubleshooting

### Common Issues

**Module not found:**
- Run `npm install` again
- Check import paths

**CORS error:**
- Update FRONTEND_URL in server .env
- Restart server

**Database connection error:**
- Check MongoDB is running
- Verify MONGO_URI
- Check network connectivity

**Port already in use:**
- Kill process: `lsof -ti:PORT | xargs kill -9`
- Or change PORT in .env

## Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Vite Documentation](https://vitejs.dev)

## Contributing

When contributing:
1. Create a new branch
2. Make your changes
3. Test thoroughly
4. Submit pull request
5. Wait for review

## Useful Commands

```bash
# Backend
npm run dev          # Start development server
npm start           # Start production server
npm test            # Run tests

# Frontend
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build

# Database
mongod              # Start MongoDB
mongo               # Open MongoDB shell
db.collection.find() # Query collection
```
