# Backend API Testing Guide

## Prerequisites

1. MongoDB installed and running
2. Node.js and npm installed
3. Environment variables configured in `.env` file

## Setup Steps

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
Create a `.env` file in the `backend` directory with:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/credit-jambo
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
BCRYPT_ROUNDS=12
```

### 3. Seed the Database
This creates test users for you:
```bash
npm run seed
```

This will create:
- **Super Admin**: superadmin@creditjambo.com / SuperAdmin123!
- **Regular Admin**: admin@creditjambo.com / Admin123!
- **Test Customer**: customer@test.com / Customer123! (Device ID: test-device-12345)

### 4. Start the Server
```bash
npm run dev
```

The server will start on `http://localhost:5000`

## Testing Methods

### Option 1: VS Code REST Client (Recommended)

1. Install the "REST Client" extension in VS Code
2. Open `backend/test.http`
3. Click "Send Request" above any endpoint
4. After login, copy the token and update the `@token` variable

### Option 2: Postman

Import the following requests:

#### 1. Register a New Customer
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "password": "Password123!",
  "deviceId": "device-12345-abcde"
}
```

**Note**: New devices need admin verification before login works!

#### 2. Login as Test Customer (Pre-verified)
```
POST http://localhost:5000/api/auth/login/customer
Content-Type: application/json

{
  "email": "customer@test.com",
  "password": "Customer123!",
  "deviceId": "test-device-12345"
}
```

**Response**: You'll get a JWT token - copy it for authenticated requests!

#### 3. Get Customer Profile (Authenticated)
```
GET http://localhost:5000/api/customers/profile
Authorization: Bearer YOUR_TOKEN_HERE
```

#### 4. Get Balance
```
GET http://localhost:5000/api/customers/balance
Authorization: Bearer YOUR_TOKEN_HERE
```

#### 5. Get Transaction History
```
GET http://localhost:5000/api/customers/transactions?page=1&limit=10
Authorization: Bearer YOUR_TOKEN_HERE
```

### Option 3: cURL

```bash
# Health Check
curl http://localhost:5000/health

# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe","email":"john@test.com","phone":"+1234567890","password":"Password123!","deviceId":"device-123"}'

# Login (Test Customer)
curl -X POST http://localhost:5000/api/auth/login/customer \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@test.com","password":"Customer123!","deviceId":"test-device-12345"}'

# Get Profile (replace TOKEN)
curl http://localhost:5000/api/customers/profile \
  -H "Authorization: Bearer TOKEN"
```

## Available Endpoints

### Authentication Routes (`/api/auth`)
- `POST /register` - Register new customer
- `POST /login/customer` - Customer login
- `POST /login/admin` - Admin login
- `POST /logout` - Logout (requires auth)
- `POST /refresh` - Refresh token (requires auth)

### Customer Routes (`/api/customers`)
All require customer authentication:
- `GET /profile` - Get customer profile
- `PUT /profile` - Update profile
- `PUT /password` - Change password
- `GET /balance` - Get current balance
- `GET /transactions` - Get transaction history (paginated)
- `GET /transactions/:id` - Get specific transaction
- `GET /devices` - Get registered devices

## Testing Workflow

1. **Start Fresh**:
   ```bash
   npm run seed
   npm run dev
   ```

2. **Login as Test Customer**:
   - Use the pre-created customer@test.com account
   - Device is already verified, so login works immediately

3. **Test Customer Routes**:
   - Get profile, balance, transactions
   - Update profile
   - Change password

4. **Register New Customer** (optional):
   - Register with a new email and device
   - Note: Device needs admin verification before login works
   - You'd need admin routes to verify (coming next)

## Common Issues

### "Device not verified"
- New registered devices need admin approval
- Use the test customer (customer@test.com) which has a pre-verified device
- Or wait for admin routes to be implemented

### "Invalid token"
- Token might have expired (24 hours for customers, 8 hours for admins)
- Login again to get a new token

### "Device not registered"
- Make sure you're using the exact same deviceId for login as you used during registration
- For test customer, use: `test-device-12345`

## Next Steps

Once you've tested customer routes:
1. Commit the current changes
2. Continue with admin routes implementation
3. Test admin functionality (device verification, transaction management, etc.)
