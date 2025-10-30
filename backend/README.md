# Credit Jambo Client Application - Backend

Backend API for the Credit Jambo Savings Management System (Client Application).

## Features

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

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs (SHA-512 equivalent strength)
- **Validation**: express-validator
- **Security**: Helmet, express-rate-limit, express-mongo-sanitize

## Project Structure

```
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Request handlers
│   ├── services/       # Business logic
│   ├── models/         # Database models
│   ├── dtos/          # Data Transfer Objects
│   ├── middlewares/    # Custom middleware
│   ├── routes/         # API routes
│   ├── utils/          # Utility functions
│   └── server.ts       # Application entry point
├── tests/              # Test files
├── .env.example        # Environment variables template
├── package.json
└── tsconfig.json
```

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn

### Installation

1. **Clone the repository** (if not already done):
   ```bash
   git clone `https://github.com/uwingabirejoselyne/credit-jambo-client-app`
   cd credit-jambo-client-app/backend
   ```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update `.env` file with your configuration:
   - Set `MONGODB_URI` to your MongoDB connection string
   - Set `JWT_SECRET` to a strong secret key
   - Configure other environment variables as needed

5. Start MongoDB (if running locally):
```bash
mongod
```

### Running the Application

#### Development Mode
```bash
npm run dev
```

#### Production Mode
```bash
npm run build
npm start
```

#### Running Tests
```bash
npm test
```

## API Documentation
```
http://localhost:5000/api-docs/
````

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication Endpoints

#### Register Customer
- **POST** `/auth/register`
- **Body**:
  ```json
  {
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "phone": "string",
    "password": "string",
    "deviceId": "string"
  }
  ```

#### Login
- **POST** `/auth/login`
- **Body**:
  ```json
  {
    "email": "string",
    "password": "string",
    "deviceId": "string"
  }
  ```

### Account Endpoints (Authenticated)

#### Get Balance
- **GET** `/customers/balance`
- **Headers**: `Authorization: Bearer <token>`

#### Get Transaction History
- **GET** `/customers/transactions`
- **Headers**: `Authorization: Bearer <token>`

### Transaction Endpoints (Authenticated)

#### Deposit
- **POST** `/transactions/deposit`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "amount": "number",
    "description": "string (optional)"
  }
  ```

#### Withdraw
- **POST** `/transactions/withdraw`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "amount": "number",
    "description": "string (optional)"
  }
  ```

## Environment Variables

See `.env.example` for all available configuration options.

## Security Features

1. **Password Security**: Uses bcryptjs with high salt rounds
2. **JWT Authentication**: Secure token-based authentication
3. **Device Verification**: Admin must verify device before full access
4. **Rate Limiting**: Prevents brute force attacks
5. **Input Validation**: All inputs validated and sanitized
6. **Secure Headers**: Helmet.js for security headers
7. **MongoDB Injection Protection**: Sanitization of queries

## Architecture

The application follows a layered architecture:

1. **Routes Layer**: Defines API endpoints
2. **Controllers Layer**: Handles HTTP requests/responses
3. **Services Layer**: Contains business logic
4. **Models Layer**: Database schemas and models
5. **DTOs Layer**: Controls data exposure to clients
6. **Middlewares Layer**: Authentication, validation, error handling

## Development Guidelines

- Keep code modular and follow DRY principles
- Use DTOs to transform data before sending to clients
- Write meaningful commit messages
- Follow TypeScript best practices
- Add comments for complex logic

## License

Copyright © 2025 Credit Jambo Ltd. All rights reserved.
