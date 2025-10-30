# Credit Jambo Client Application

A comprehensive savings management system with secure authentication and transaction handling. This application consists of a backend API and a frontend web application that work together to provide a secure and user-friendly platform for managing savings accounts.

## Overview

Credit Jambo is a full-stack application designed for secure savings management. The system includes user registration, authentication with device verification, and comprehensive transaction capabilities including deposits and withdrawals. The application emphasizes security with device fingerprinting, JWT-based authentication, and input sanitization.

### Project Structure

```
credit-jambo-client-app/
├── backend/          # Node.js/Express API server
└── frontend/         # React/TypeScript web application
```

## Backend (API Server)

Located in the `backend/` directory, this is a Node.js/Express application built with TypeScript that provides the REST API for the savings management system.

### Backend Features

- **Authentication & Authorization**
  - SHA-512 password hashing
  - JWT-based authentication
  - Device ID verification system
  - Session management with auto-expiry

- **Savings Operations**
  - Deposit funds
  - Withdraw funds
  - View account balance
  - Transaction history

- **Security**
  - Helmet.js for secure HTTP headers
  - Rate limiting
  - Input validation and sanitization
  - MongoDB injection protection
  - CORS configuration

### Backend Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Security**: Helmet, express-rate-limit, express-mongo-sanitize

### Backend API Endpoints

- `POST /auth/register` - Customer registration
- `POST /auth/login` - User authentication
- `GET /customers/balance` - Retrieve account balance
- `GET /customers/transactions` - Get transaction history
- `POST /transactions/deposit` - Add funds to account
- `POST /transactions/withdraw` - Withdraw funds from account

## Frontend (Web Application)

Located in the `frontend/` directory, this is a React/TypeScript application built with Vite and Tailwind CSS that provides the user interface for the savings management system.

### Frontend Features

- **User Authentication**
  - Secure registration with SHA-512 password hashing (backend)
  - JWT-based authentication
  - Device fingerprinting for enhanced security
  - Admin device verification requirement

- **Savings Management**
  - Real-time balance display
  - Deposit funds
  - Withdraw funds with balance validation
  - Transaction history with pagination

- **Security Features**
  - Input validation and sanitization
  - Protected routes
  - Session management
  - Device verification
  - Low balance alerts

- **Modern UI/UX**
  - Responsive design
  - Toast notifications

### Frontend Technology Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS v4
- **Routing**: React Router DOM v7
- **HTTP Client**: Axios
- **State Management**: React Context API
- **Notifications**: React Hot Toast
- **Security**: FingerprintJS, JWT Decode

### Frontend Pages & Components

- **Authentication Pages**: Login, Register
- **Dashboard**: Balance display, quick actions, transaction history
- **Transaction Components**: Deposit Modal, Withdraw Modal, Transaction History
- **Common Components**: Alert, Button, Card, Input, Loading, Navbar

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/uwingabirejoselyne/credit-jambo-client-app
   cd credit-jambo-client-app
   ```

2. **Set up the backend**:
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Update .env with your configuration
   npm run dev
   ```

3. **Set up the frontend**:
   ```bash
   cd ../frontend
   npm install
   cp .env.example .env
   # Update .env with your configuration
   npm run dev
   ```

### Environment Configuration

Both the backend and frontend applications require environment variables:

**Backend** (`backend/.env`):
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- Various other configuration options

**Frontend** (`frontend/.env`):
- `VITE_API_BASE_URL` - Backend API base URL
- `VITE_APP_NAME` - Application name
- `VITE_APP_CURRENCY` - Currency for display (e.g., RWF)

## Running the Applications

### Backend API Server
```bash
cd backend
npm run dev
```
The API will be available at `http://localhost:5000`

### Frontend Application
```bash
cd frontend
npm run dev
```
The web app will be available at `http://localhost:5173`

## Security Features

1. **Device Verification**: Both applications implement device verification requiring admin approval
2. **JWT Authentication**: Secure token-based authentication system
3. **Input Validation**: All inputs validated and sanitized on both ends
4. **Password Security**: SHA-512 equivalent hashing with bcryptjs
5. **Rate Limiting**: API protection against abuse
6. **CORS Configuration**: Controlled cross-origin resource sharing

## Architecture & Design

The application follows a layered architecture with clear separation between frontend and backend:

- **Frontend**: React components consuming REST API endpoints from backend
- **Backend**: Express.js server with controllers, services, models, and DTOs
- **Database**: MongoDB with Mongoose ODM for data persistence
- **Security**: Multiple layers of security including device fingerprinting and JWT tokens

## Development Guidelines

- Keep code modular and follow DRY principles
- Use DTOs (Data Transfer Objects) to control data exposure
- Write meaningful commit messages
- Follow TypeScript best practices
- Add comments for complex logic

## Contributing

Contributions are welcome! For major changes, please open an issue first to discuss what you would like to change.

