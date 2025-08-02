# Student Management System

A professional login system with role-based authentication for students, club coordinators, and admins. Built with React.js frontend and Node.js/Express backend with MongoDB.

## Features

- **Role-based Authentication**: Separate login for students, club coordinators, and admins
- **Student Registration**: Only students can sign up with complete profile information
- **Professional UI**: Modern, responsive design with gradient backgrounds
- **Secure Authentication**: JWT tokens with password hashing
- **Protected Routes**: Role-based access control for dashboards
- **MongoDB Integration**: Robust data storage with user validation

## Tech Stack

### Frontend
- React.js 18
- React Router DOM
- Styled Components
- Axios for API calls

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing
- express-validator for input validation

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd student-management-system
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Setup environment variables
# Update .env file with your MongoDB URI if needed
# Default: mongodb://localhost:27017/student_management

# Seed the database with admin and club coordinator data
npm run seed

# Start the backend server
npm run dev
```

### 3. Frontend Setup
```bash
# Navigate to project root
cd ..

# Install dependencies
npm install

# Start the React development server
npm start
```

### 4. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Login Credentials

### Admin Accounts
- **Email**: admin@college.edu | **Password**: admin123
- **Email**: john.admin@college.edu | **Password**: admin123

### Club Coordinator Accounts
- **Email**: alice.coord@college.edu | **Password**: coord123 | **Club**: Computer Science Club
- **Email**: bob.coord@college.edu | **Password**: coord123 | **Club**: Electronics Club
- **Email**: carol.coord@college.edu | **Password**: coord123 | **Club**: Drama Club
- **Email**: david.coord@college.edu | **Password**: coord123 | **Club**: Sports Club
- **Email**: emma.coord@college.edu | **Password**: coord123 | **Club**: Music Club
- **Email**: frank.coord@college.edu | **Password**: coord123 | **Club**: Debate Club

### Student Accounts
Students need to register through the signup page with the following information:
- Full Name
- Email Address
- Roll Number (must be unique)
- Gender (Male/Female/Other)
- Academic Year (1st/2nd/3rd/4th)
- Password (minimum 6 characters)

## Project Structure

```
student-management-system/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── dashboards/
│   │   │   ├── AdminDashboard.js
│   │   │   ├── ClubCoordinatorDashboard.js
│   │   │   └── StudentDashboard.js
│   │   ├── Login.js
│   │   ├── Signup.js
│   │   └── ProtectedRoute.js
│   ├── App.js
│   └── index.js
├── backend/
│   ├── models/
│   │   └── User.js
│   ├── routes/
│   │   └── auth.js
│   ├── .env
│   ├── server.js
│   ├── seed.js
│   └── package.json
├── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - Student registration
- `GET /api/auth/me` - Get current user profile

### Health Check
- `GET /api/health` - Server health status

## Features Overview

### Login Page
- Role selection dropdown (Student/Club Coordinator/Admin)
- Email and password authentication
- Professional UI with gradient design
- Error handling and loading states
- Signup link for students only

### Signup Page (Students Only)
- Complete student registration form
- Form validation (email, password length, required fields)
- Gender selection with radio buttons
- Academic year dropdown
- Automatic redirect to login after successful registration

### Dashboards

#### Admin Dashboard
- System overview with statistics
- User management capabilities
- System-wide monitoring tools

#### Club Coordinator Dashboard
- Club member management
- Event organization tools
- Application review system

#### Student Dashboard
- Personal profile display
- Academic progress tracking
- Club participation overview

## Database Schema

### User Model
```javascript
{
  name: String (required)
  email: String (required, unique)
  password: String (required, hashed)
  role: String (student/club_coordinator/admin)
  
  // Student specific fields
  rollNo: String (required for students, unique)
  gender: String (male/female/other)
  year: String (1/2/3/4)
  
  // Club coordinator specific fields
  clubName: String (required for coordinators)
  department: String (required for coordinators/admins)
  
  // Common fields
  phone: String (optional)
  isActive: Boolean (default: true)
  lastLogin: Date
  timestamps: true
}
```

## Development Commands

### Frontend
```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
```

### Backend
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run seed       # Seed database with sample data
```

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Input validation and sanitization
- Role-based access control
- Protected API endpoints
- CORS configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.