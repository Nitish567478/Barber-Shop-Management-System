# Quick Start Guide

Get the Barber Shop Management System running in minutes!

## Prerequisites

- Node.js v16+ ([Download](https://nodejs.org/))
- MongoDB ([Local](https://docs.mongodb.com/manual/installation/) or [Atlas](https://www.mongodb.com/cloud/atlas))
- Git
- A code editor (VS Code recommended)

## 1. Clone/Extract Project

```bash
cd "Barabar Shop Management System"
```

## 2. Backend Setup (Terminal 1)

```bash
cd server
npm install
```

Create `.env` file:
```
MONGO_URI=mongodb://localhost:27017/barber_shop
JWT_SECRET=your_secret_key_here
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Start MongoDB (if running locally):
```bash
mongod
```

Start backend server:
```bash
npm run dev
```

✅ Backend running on `http://localhost:5000`

## 3. Frontend Setup (Terminal 2)

```bash
cd client
npm install
npm run dev
```

✅ Frontend running on `http://localhost:5173`

## 4. First Steps

1. **Open browser:** `http://localhost:5173`
2. **Register:** Create an account as a customer
3. **Browse services:** View available services (empty initially)
4. **As Admin:**
   - Register with different email as admin (change role in database)
   - Add services
   - Add barbers
   - Create appointments

## Test Credentials (After Setup)

Will be created during registration. For testing, create two accounts:
- **Customer Account:** For booking appointments
- **Admin Account:** For managing the system

## Key Endpoints

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`
- Health Check: `http://localhost:5000/health`

## Common Commands

```bash
# Backend
cd server
npm run dev          # Development mode
npm start           # Production mode

# Frontend
cd client
npm run dev         # Development server
npm run build       # Production build
npm run preview     # Preview build
```

## Troubleshooting

### MongoDB Not Connecting
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB in new terminal
mongod
```

### Port Already in Use
```bash
# Kill process on port (Windows)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Kill process on port (Mac/Linux)
lsof -ti:5000 | xargs kill -9
```

### Dependencies Error
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

### CORS Error
- Check `FRONTEND_URL` in server `.env`
- Restart backend server

## Next Steps

1. **Review Documentation:**
   - [Installation Guide](./docs/INSTALLATION.md)
   - [API Reference](./docs/API.md)
   - [Database Schema](./docs/DATABASE_SCHEMA.md)

2. **Explore Code:**
   - Backend: `server/src/`
   - Frontend: `client/src/`

3. **Add Features:**
   - Create new components in `client/src/components/`
   - Add new API endpoints in `server/src/routes/`

4. **Customize:**
   - Update your shop name/logo
   - Add services in the admin panel
   - Configure pricing

## Project Structure

```
Project Root/
├── client/           # React Frontend
├── server/           # Node.js Backend  
├── docs/            # Documentation
├── database/        # Database info
└── README.md
```

## Support

For detailed information, refer to:
- [Complete API Documentation](./docs/API.md)
- [Development Guide](./docs/DEVELOPMENT.md)
- [Requirements & Features](./docs/REQUIREMENTS.md)

## What's Included?

✅ User authentication (signup/login)
✅ Service management
✅ Appointment booking
✅ Barber management
✅ Invoice generation
✅ Role-based access control
✅ Responsive UI
✅ Error handling
✅ Complete API

## Architecture

```
┌─────────────────┐
│   React App     │
│   (Frontend)    │
└────────┬────────┘
         │ API Calls
         ↓
┌─────────────────┐
│   Node.js API   │ ← JWT Auth
│   (Backend)     │
└────────┬────────┘
         │ Database Ops
         ↓
┌─────────────────┐
│    MongoDB      │
│   (Database)    │
└─────────────────┘
```

## Features Ready to Use

- **Authentication:** Register, login, profile management
- **Services:** Browse and manage services
- **Appointments:** Book, view, and cancel appointments
- **Billing:** Generate and track invoices
- **Admin Dashboard:** View statistics and manage system
- **Authorization:** Role-based access control

## Performance Tips

1. Use indexes for frequently queried fields
2. Implement pagination for large datasets
3. Cache API responses where appropriate
4. Lazy load components in React
5. Use production builds for deployment

## Security Notes

- Never commit `.env` files to git
- Use strong JWT secrets
- Always validate user input
- Use HTTPS in production
- Keep dependencies updated

## Deployment Ready

This project is ready for deployment to:
- **Backend:** Heroku, Railway, Render, AWS, Azure
- **Frontend:** Vercel, Netlify, GitHub Pages
- **Database:** MongoDB Atlas, AWS, Azure, etc.

## Need Help?

1. Check the documentation in `docs/` folder
2. Review error messages in console
3. Check backend logs for API errors
4. Verify MongoDB connection
5. Clear browser cache and retry

---

**Happy developing! 🚀**

For more details, visit the [main README](../README.md)
