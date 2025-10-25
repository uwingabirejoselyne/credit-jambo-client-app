import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './store/contexts/AuthContext';
import { AccountProvider } from './store/contexts/AccountContext';
import { Register } from './pages/auth/Register';
import { Login } from './pages/auth/Login';

/**
 * Main App component with routing and providers
 */

function App() {
  return (
    <Router>
      <AuthProvider>
        <AccountProvider>
          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />

          {/* Routes */}
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* Add more routes later */}
          </Routes>
        </AccountProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
