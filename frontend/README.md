# Credit Jambo - Client Application (Frontend)

A modern, secure savings management system built with React, TypeScript, and Tailwind CSS.

## Features

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

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS v4
- **Routing**: React Router DOM v7
- **HTTP Client**: Axios
- **State Management**: React Context API
- **Notifications**: React Hot Toast
- **Security**: FingerprintJS, JWT Decode

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── auth/              # Authentication components
│   │   │   └── ProtectedRoute.tsx
│   │   ├── common/            # Reusable UI components
│   │   │   ├── Alert.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Loading.tsx
│   │   │   ├── Navbar.tsx
│   │   │   └── index.ts
│   │   └── transactions/      # Transaction components
│   │       ├── DepositModal.tsx
│   │       ├── WithdrawModal.tsx
│   │       └── TransactionHistory.tsx
│   ├── pages/
│   │   ├── auth/              # Authentication pages
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   └── dashboard/         # Dashboard pages
│   │       └── Dashboard.tsx
│   ├── services/
│   │   └── api/               # API service layer
│   │       ├── axiosConfig.ts
│   │       ├── authService.ts
│   │       ├── accountService.ts
│   │       └── transactionService.ts
│   ├── store/
│   │   └── contexts/          # React Context providers
│   │       ├── AuthContext.tsx
│   │       └── AccountContext.tsx
│   ├── utils/                 # Utility functions
│   │   ├── deviceFingerprint.ts
│   │   ├── validators.ts
│   │   ├── sanitizer.ts
│   │   └── formatters.ts
│   ├── App.tsx               # Main app component
│   ├── main.tsx              # Entry point
│   └── index.css             # Global styles
├── public/                   # Static assets
├── .env.example             # Environment variables example
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Backend API running on port 5000

### Installation

1. **Clone the repository** (if not already done):
   ```bash
   git clone `https://github.com/uwingabirejoselyne/credit-jambo-client-app`
   cd credit-jambo-client-app/frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and configure:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   VITE_APP_NAME=Credit Jambo
   VITE_APP_CURRENCY=RWF
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173` (or next available port)

### Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Color Scheme

The application uses a professional 3-color palette:

- **Primary (Emerald Green)**: `#10b981` - Trust, growth, money
- **Secondary (Deep Blue)**: `#2563eb` - Security, professionalism
- **Accent (Warm Orange)**: `#f97316` - Action, energy, alerts

## Key Features Implementation

### Device Fingerprinting

The app generates a unique device fingerprint using:
- FingerprintJS library
- Browser information (user agent, platform, language)
- Screen resolution
- Timezone
- Fallback UUID if fingerprinting fails

Location: `src/utils/deviceFingerprint.ts`

### Input Validation & Sanitization

All user inputs are validated and sanitized before being sent to the backend:

**Validators** (`src/utils/validators.ts`):
- Email format validation
- Password strength (min 8 chars, uppercase, lowercase, number, special char)
- Phone number (international format)
- Amount validation (positive, max 2 decimal places)
- Withdrawal validation (against balance)

**Sanitizers** (`src/utils/sanitizer.ts`):
- Remove HTML tags
- Escape special characters
- Strip dangerous characters
- XSS prevention

### Protected Routes

Routes that require authentication are wrapped with the `ProtectedRoute` component:

```tsx
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

### State Management

The app uses React Context API for global state:

- **AuthContext**: Manages user authentication state, login, logout, token management
- **AccountContext**: Manages account balance and related operations

## API Integration

All API calls are made through service files in `src/services/api/`:

- **authService.ts**: Registration, login, logout, token refresh
- **accountService.ts**: Get balance, get/update profile
- **transactionService.ts**: Deposit, withdraw, transaction history

### Axios Configuration

The axios instance (`src/services/api/axiosConfig.ts`) includes:
- Automatic JWT token attachment to requests
- Request/response logging in development
- Global error handling
- 401 redirect to login
- Network error handling

## User Flow

1. **Registration**:
   - User fills registration form
   - Device fingerprint is generated
   - Data is validated and sanitized
   - Sent to backend for approval
   - User redirected to login

2. **Login**:
   - User enters credentials
   - Device fingerprint checked
   - JWT tokens stored in localStorage
   - Redirect to dashboard (if device verified)
   - Show warning (if device not verified)

3. **Dashboard**:
   - Display current balance
   - Quick action buttons (Deposit/Withdraw)
   - Transaction history with pagination
   - Low balance alerts

4. **Transactions**:
   - Modal opens for deposit/withdraw
   - Amount validation
   - Success toast notification
   - Balance refreshed
   - Transaction added to history

## Security Considerations

1. **JWT Token Storage**: Tokens are stored in localStorage (consider httpOnly cookies for production)
2. **Device Verification**: Required for account access
3. **Input Sanitization**: All inputs sanitized before API calls
4. **Protected Routes**: Authentication required for sensitive pages
5. **Session Expiry**: Tokens expire and redirect to login
6. **HTTPS**: Use HTTPS in production

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### Port Already in Use

If port 5173 is in use, Vite will automatically try the next available port.

### API Connection Issues

1. Ensure backend is running on `http://localhost:5000`
2. Check `.env` file for correct `VITE_API_BASE_URL`
3. Check browser console for CORS errors

### Device Fingerprint Not Generating

1. Check browser console for errors
2. Ensure FingerprintJS is properly installed
3. Fallback UUID will be used if fingerprinting fails

## Future Enhancements

- [ ] Email verification
- [ ] Password reset functionality
- [ ] Multi-factor authentication (MFA)
- [ ] Push notifications (Web Push API)
- [ ] Dark mode
- [ ] Multiple currency support
- [ ] Export transaction history (CSV/PDF)
- [ ] Account settings page
- [ ] Profile picture upload

## Contributing

Please read the main project README for contribution guidelines.

## License

This project is part of Credit Jambo Ltd practical assessment.

## Support

For issues or questions:
- Email: hello@creditjambo.com
- Phone: +250 788 268 451
- Address: NM 233 St, Nyamagumba, Musanze – Rwanda
