# Testing Guide - Credit Jambo Frontend (Mock Data)

The frontend is now using **mock data** so you can test all features without a backend!

## Access the Application

Open your browser and visit: **http://localhost:5174**

---

## Test Flow

### 1. Register a New Account

1. Click **"Create Account"** or visit `/register`
2. Fill in the form:
   - **Full Name**: John Doe
   - **Email**: john@example.com
   - **Phone**: +250788268451
   - **Password**: Test@123 (must meet requirements)
   - **Confirm Password**: Test@123
3. Click **"Create Account"**
4. You'll see a success toast and be redirected to login

### 2. Login

1. Visit `/login` or click **"Sign in"**
2. Enter credentials:
   - **Email**: john@example.com
   - **Password**: Test@123
3. Device fingerprint will be generated automatically
4. Click **"Sign In"**
5. You'll be redirected to the Dashboard

### 3. View Dashboard

Once logged in, you'll see:
- **Balance Card**: Shows 80,000 RWF (mock balance)
- **Quick Actions**: Deposit and Withdraw buttons
- **Transaction History**: 5 pre-loaded transactions

### 4. Test Deposit

1. Click the **"Deposit"** card
2. Enter amount: `25000`
3. Add description (optional): "Salary deposit"
4. Click **"Deposit"**
5. Watch for:
   - Success toast notification
   - Balance updates to 105,000 RWF
   - New transaction appears at the top of history

### 5. Test Withdrawal

1. Click the **"Withdraw"** card
2. See your available balance displayed
3. Enter amount: `10000`
4. Add description (optional): "Personal expense"
5. Click **"Withdraw"**
6. Watch for:
   - Success toast notification
   - Balance updates to 95,000 RWF
   - New transaction appears in history

### 6. Test Validation

**Try these to test validation:**

**Withdrawal > Balance:**
- Try to withdraw 200,000 RWF (more than balance)
- You'll see error: "Insufficient balance"

**Invalid Amount:**
- Try entering: `abc` or `-100`
- You'll see validation errors

**Decimal Places:**
- Try: `1234.567` (3 decimal places)
- Error: "Amount can have at most 2 decimal places"

### 7. Test Transaction History

- Scroll through the transaction list
- See color coding:
  - **Green** for deposits
  - **Red** for withdrawals
- Notice relative time (e.g., "2 days ago")
- See status badges (Completed, Pending, Failed)

### 8. Test Logout

1. Click **"Logout"** button in the navbar
2. You'll see a success toast
3. Redirected to login page
4. Try accessing `/dashboard` directly - you'll be redirected to login (Protected Route works!)

---

## Mock Data Features

### Pre-loaded Transactions

The app comes with 5 sample transactions:
1. Initial deposit: 50,000 RWF (7 days ago)
2. Monthly savings: 25,000 RWF (5 days ago)
3. Emergency withdrawal: -15,000 RWF (3 days ago)
4. Bonus savings: 30,000 RWF (2 days ago)
5. Personal expense: -10,000 RWF (1 day ago)

**Starting Balance**: 80,000 RWF

### Data Persistence

Mock data is stored in:
- **LocalStorage**: User info, auth tokens
- **Memory**: Transactions (reset on page refresh)

**Note**: Refreshing the page will reset transactions to the original 5, but your auth session will persist.

---

## Features to Test

### ✅ Authentication
- [x] Register with validation
- [x] Login with mock credentials
- [x] Logout
- [x] Device fingerprinting (check browser console)
- [x] Protected routes

### ✅ Balance Management
- [x] View current balance
- [x] Balance updates after deposit
- [x] Balance updates after withdrawal
- [x] Low balance alert (when < 10,000)

### ✅ Transactions
- [x] Make deposits
- [x] Make withdrawals
- [x] View transaction history
- [x] See transaction details
- [x] Color-coded transactions
- [x] Relative time display

### ✅ Validation
- [x] Email format validation
- [x] Password strength requirements
- [x] Phone number validation
- [x] Amount validation
- [x] Balance check for withdrawals
- [x] Input sanitization

### ✅ UI/UX
- [x] Responsive design
- [x] Toast notifications
- [x] Loading states
- [x] Error handling
- [x] Beautiful gradients
- [x] Smooth animations

---

## Network Delay

All mock services include artificial delays (300-800ms) to simulate real API calls. You'll see:
- Loading spinners
- Disabled buttons during operations
- Smooth state transitions

---

## Mock vs Real API

### Currently Using Mock Services:
- `services/mock/authService.mock.ts`
- `services/mock/accountService.mock.ts`
- `services/mock/transactionService.mock.ts`

### Real API Services (Ready for Backend):
- `services/api/authService.ts`
- `services/api/accountService.ts`
- `services/api/transactionService.ts`

**To switch to real backend**, simply update the imports in:
- `store/contexts/AuthContext.tsx`
- `store/contexts/AccountContext.tsx`
- `components/transactions/DepositModal.tsx`
- `components/transactions/WithdrawModal.tsx`
- `components/transactions/TransactionHistory.tsx`

Change from:
```typescript
import { ... } from '../../services/mock/...';
```

To:
```typescript
import { ... } from '../../services/api/...';
```

---

## Troubleshooting

### Can't Login
- Make sure you registered first
- Use the exact email/password you registered with
- Check browser console for errors

### Balance Not Updating
- Check browser console for errors
- Try refreshing the page
- Check if localStorage has data

### Transactions Not Showing
- Refresh the page to reset mock data
- Check browser console for errors

---

## Demo Credentials

You can create any account you want! Example:
- **Email**: demo@creditjambo.com
- **Password**: Demo@123456
- **Full Name**: Demo User
- **Phone**: +250788268451

---

## Next Steps

Once you're satisfied with the frontend:
1. Commit this working version
2. Build the backend API
3. Switch from mock services to real API
4. Test with real data

Enjoy testing! 🎉
