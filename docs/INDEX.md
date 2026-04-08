# Project Documentation Index

## 📚 Complete Documentation Guide

Welcome to the **Barber Shop Management System** documentation. This guide will help you navigate all project resources.

---

## 🚀 Getting Started

### Start Here
1. **[Quick Start Guide](./QUICKSTART.md)** - Get running in 5 minutes
2. **[Installation Guide](./INSTALLATION.md)** - Detailed setup instructions
3. **[Project Summary](./PROJECT_SUMMARY.md)** - Overview of the entire system

---

## 📖 Core Documentation

### 1. [System Architecture](./ARCHITECTURE.md)
Understand how the system is designed and how components communicate.

**Covers:**
- Three-tier architecture
- Frontend component hierarchy
- Backend module organization
- Database design
- Authentication flow
- Scalability considerations

### 2. [API Reference](./API.md)
Complete documentation of all REST API endpoints.

**Covers:**
- Authentication endpoints
- Services endpoints
- Appointments endpoints
- Barbers endpoints
- Invoices endpoints
- Error responses
- Status codes

### 3. [Database Schema](./DATABASE_SCHEMA.md)
Detailed database design and collections.

**Covers:**
- User collection
- Service collection
- Appointment collection
- Barber collection
- Invoice collection
- Indexes
- Query examples
- Relationships

### 4. [Development Guide](./DEVELOPMENT.md)
Guidelines for developing new features and maintaining code quality.

**Covers:**
- Project structure
- Coding standards
- Common tasks
- Database queries
- Testing
- Debugging tips
- Performance optimization

### 5. [Requirements & Features](./REQUIREMENTS.md)
Project scope and feature specifications.

**Covers:**
- Functional requirements
- Non-functional requirements
- Feature list
- User stories
- Success metrics
- Constraints

---

## 🎯 Quick Reference

### Essential Commands

```bash
# Starting the project
cd server && npm install && npm run dev    # Terminal 1
cd client && npm install && npm run dev    # Terminal 2

# Building for production
cd server && npm run build
cd client && npm run build

# Running tests
npm test

# Database
mongod                  # Start MongoDB
mongo                   # Open MongoDB shell
```

### Project URLs
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`
- Health Check: `http://localhost:5000/health`

### File Structure

```
Barabar Shop Management System/
├── client/                 # React Frontend
├── server/                 # Node.js Backend
├── docs/                   # All documentation
├── database/               # Database info
├── README.md               # Main readme
└── package.json            # Root config
```

---

## 🔐 Authentication & Authorization

### Roles
- **Customer:** Can book appointments, view invoices
- **Barber:** Can view their availability and appointments
- **Admin:** Full system access

### JWT Token Flow
1. User logs in with credentials
2. Backend validates and generates JWT
3. Token stored in localStorage (browser)
4. Token sent with every API request
5. Backend verifies token for protected routes

### Protected vs Public Routes

**Public Routes:**
- POST /auth/register
- POST /auth/login
- GET /services
- GET /barbers

**Protected Routes:**
- All routes under /api/appointments
- GET /api/auth/profile
- PUT /api/auth/profile

**Admin Only Routes:**
- POST /api/services
- PUT /api/services/:id
- DELETE /api/services/:id
- POST /api/barbers
- GET /api/invoices

---

## 🛠 Common Development Tasks

### Adding a New Service Endpoint

1. **Create controller** in `server/src/controllers/`
2. **Add validation** in `server/src/validators/`
3. **Create route** in `server/src/routes/`
4. **Register route** in `server/src/server.js`

### Adding a New Frontend Page

1. Create page in `client/src/pages/`
2. Add route in `client/src/App.jsx`
3. Create components if needed in `client/src/components/`
4. Use API service from `client/src/services/api.js`

### Adding Database Model

1. Create schema in `server/src/models/`
2. Export model
3. Use in controllers with Mongoose methods
4. Add indexes as needed

---

## 📊 Database Collections Reference

| Collection | Purpose | Key Fields |
|-----------|---------|-----------|
| **Users** | User accounts | email, password, role |
| **Services** | Available services | name, price, duration |
| **Appointments** | Bookings | date, time, status |
| **Barbers** | Staff info | userId, availability |
| **Invoices** | Billing | amount, paymentStatus |

---

## 🔍 API Endpoints Summary

### Authentication (4 endpoints)
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/profile
- PUT /api/auth/profile

### Services (5 endpoints)
- GET /api/services
- GET /api/services/:id
- POST /api/services (admin)
- PUT /api/services/:id (admin)
- DELETE /api/services/:id (admin)

### Appointments (6 endpoints)
- GET /api/appointments (admin)
- POST /api/appointments
- GET /api/appointments/my-appointments
- GET /api/appointments/:id
- PUT /api/appointments/:id (admin)
- DELETE /api/appointments/:id

### Barbers (5 endpoints)
- GET /api/barbers
- GET /api/barbers/:id
- GET /api/barbers/:id/availability
- POST /api/barbers (admin)
- PUT /api/barbers/:id (admin)

### Invoices (5 endpoints)
- GET /api/invoices (admin)
- POST /api/invoices (admin)
- GET /api/invoices/my-invoices
- PUT /api/invoices/:id (admin)
- GET /api/invoices/stats/revenue (admin)

---

## 🚨 Troubleshooting

### Common Issues

**MongoDB Connection Error**
- Ensure MongoDB is running: `mongod`
- Check MONGO_URI in .env
- Verify MongoDB Atlas IP whitelist

**CORS Error**
- Update FRONTEND_URL in server .env
- Restart server

**Port Already in Use**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

**Module Not Found**
- Run `npm install` again
- Check import paths

---

## 📚 Technology Stack Details

### Frontend Stack
- **React 18:** UI framework
- **Vite:** Build tool
- **Tailwind CSS:** Styling
- **React Router:** Navigation
- **Axios:** HTTP client
- **React Context:** State management

### Backend Stack
- **Node.js:** Runtime
- **Express:** Web framework
- **MongoDB:** Database
- **Mongoose:** ODM
- **JWT:** Authentication
- **bcryptjs:** Password hashing
- **Express Validator:** Input validation

---

## ✅ Pre-Launch Checklist

Before going to production:

- [ ] Update JWT_SECRET with strong value
- [ ] Configure production MONGO_URI
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS
- [ ] Setup error logging
- [ ] Configure CORS properly
- [ ] Add rate limiting
- [ ] Setup database backups
- [ ] Configure email notifications
- [ ] Run security audit
- [ ] Load test the system
- [ ] Monitor performance

---

## 🎓 Learning Resources

### For Frontend Development
- [React Documentation](https://react.dev)
- [Tailwind CSS Docs](https://tailwindcss.com)
- [React Router Guide](https://reactrouter.com)
- [Vite Guide](https://vitejs.dev)

### For Backend Development
- [Express.js Guide](https://expressjs.com)
- [MongoDB Docs](https://docs.mongodb.com)
- [Mongoose Guide](https://mongoosejs.com)
- [REST API Best Practices](https://restfulapi.net)

### Full Stack
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Web Security](https://owasp.org)
- [Clean Code](https://cleancode.com)

---

## 📞 Support & Contact

### Documentation Links
- [Main README](../README.md)
- [Quick Start](./QUICKSTART.md)
- [Full Installation](./INSTALLATION.md)

### Getting Help
1. Check relevant documentation
2. Search for error in code
3. Review error logs
4. Check browser console
5. Contact development team

---

## 📋 Document Overview

| Document | Type | Audience | Read Time |
|----------|------|----------|-----------|
| QUICKSTART.md | Guide | Everyone | 5 min |
| INSTALLATION.md | Guide | Developers | 15 min |
| API.md | Reference | Backend Dev | 20 min |
| DATABASE_SCHEMA.md | Reference | Database/Backend | 15 min |
| DEVELOPMENT.md | Guide | Developers | 20 min |
| ARCHITECTURE.md | Reference | Architects | 20 min |
| REQUIREMENTS.md | Specification | Product/Dev | 20 min |
| PROJECT_SUMMARY.md | Overview | Everyone | 10 min |

---

## 🎯 Key Metrics

- **Total API Endpoints:** 20+
- **Frontend Components:** 10+
- **Database Collections:** 5
- **Documentation Pages:** 8
- **Code Files:** 50+
- **Lines of Code:** 5000+

---

## 🔄 Development Workflow

```
1. Start MongoDB
   ↓
2. Start Backend (npm run dev in server/)
   ↓
3. Start Frontend (npm run dev in client/)
   ↓
4. Open http://localhost:5173
   ↓
5. Register/Login
   ↓
6. Test features
   ↓
7. Check console for errors
   ↓
8. Refer to documentation for fixes
```

---

## 📦 What's Included

✅ Complete backend API
✅ Complete frontend SPA
✅ Database schemas
✅ Authentication system
✅ Authorization system
✅ Error handling
✅ Input validation
✅ Comprehensive documentation
✅ Deployment ready
✅ Scalability ready

---

## 🎉 Ready to Begin?

1. Start with [Quick Start Guide](./QUICKSTART.md)
2. Follow [Installation Instructions](./INSTALLATION.md)
3. Review [API Documentation](./API.md)
4. Check [Development Guide](./DEVELOPMENT.md)
5. Explore the codebase

---

**Last Updated:** March 2026
**Version:** 1.0.0
**Status:** Ready for Development ✅

For more information, visit the [main README](../README.md)
