import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import './App.css';

// Pages
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Feed from './pages/Feed';
import Settings from './pages/Settings';

/**
 * Loading screen component
 * Displayed while auth state is being determined
 */
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-herald-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* Spinning logo mark */}
        <div className="relative">
          <div className="w-12 h-12 bg-herald-accent rounded flex items-center justify-center shadow-[0_0_30px_rgba(0,240,255,0.4)] animate-pulse-glow">
            <span className="font-display font-bold text-herald-black text-2xl">H</span>
          </div>
        </div>
        <p className="text-herald-text-muted font-mono text-xs uppercase tracking-wider">
          Loading...
        </p>
      </div>
    </div>
  );
}

/**
 * Protected route wrapper
 * Redirects to login if user is not authenticated
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    // Redirect to login, but save the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

/**
 * Public route wrapper
 * Redirects to feed if user is already authenticated
 */
function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

/**
 * Onboarding route wrapper
 * Only accessible after registration, redirects if already completed
 */
function OnboardingRoute({ children }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user has already selected topics, redirect to feed
  // In production, you might have a flag like user.onboarding_completed
  if (user?.topics_selected || user?.onboarding_completed) {
    return <Navigate to="/" replace />;
  }

  return children;
}

/**
 * App routes component
 * Must be inside BrowserRouter
 */
function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* Onboarding route */}
      <Route
        path="/onboarding"
        element={
          <OnboardingRoute>
            <Onboarding />
          </OnboardingRoute>
        }
      />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Feed />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

/**
 * Main App component
 * Herald RSS Reader - Editorial meets brutalist design
 */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-herald-black text-herald-text">
          <AppRoutes />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
