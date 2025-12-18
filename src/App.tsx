import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import ToastContainer from './components/common/ToastContainer';
import Layout from './components/layout/Layout';
import { Loader2 } from 'lucide-react';
import { isSuperAdmin } from './config/constants';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ProfilePage from './pages/auth/ProfilePage';

// User Pages
import DashboardPage from './pages/user/DashboardPage';
import SubmitComplaintPage from './pages/user/SubmitComplaintPage';
import ComplaintHistoryPage from './pages/user/ComplaintHistoryPage';
import CreateGroupComplaintPage from './pages/user/CreateGroupComplaintPage';
import SignGroupComplaintPage from './pages/user/SignGroupComplaintPage';
import ComplaintDetailPage from './pages/user/ComplaintDetailPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import ComplaintManagementPage from './pages/admin/ComplaintManagementPage';
import AdminComplaintDetailPage from './pages/admin/AdminComplaintDetailPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminAIInsightsPage from './pages/admin/AdminAIInsightsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminGroupComplaintsPage from './pages/admin/AdminGroupComplaintsPage';
import AdminLoginRequired from './pages/AdminLoginRequired';
import AdminAccessDenied from './pages/AdminAccessDenied';

// Auth Required Route - only for pages that need login
const AuthRequiredRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { firebaseUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!firebaseUser) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Admin Gate Component - requires login and admin role (super admin OR database admin)
const AdminGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { firebaseUser, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  // Must be logged in first - show login required page
  if (!firebaseUser) {
    return <AdminLoginRequired />;
  }

  // Check if user is super admin by email OR has admin role in database
  const isSuperAdminUser = isSuperAdmin(firebaseUser.email);
  const hasAdminAccess = isSuperAdminUser || isAdmin;

  if (!hasAdminAccess) {
    return <AdminAccessDenied />;
  }

  return <>{children}</>;
};


// Public Route (redirect if logged in - only for login/signup)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { firebaseUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (firebaseUser) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />

      {/* User Routes - Dashboard is public, others need auth */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="submit" element={<AuthRequiredRoute><SubmitComplaintPage /></AuthRequiredRoute>} />
        <Route path="group/create" element={<AuthRequiredRoute><CreateGroupComplaintPage /></AuthRequiredRoute>} />
        <Route path="group/:complaintId" element={<SignGroupComplaintPage />} />
        <Route path="history" element={<AuthRequiredRoute><ComplaintHistoryPage /></AuthRequiredRoute>} />
        <Route path="complaint/:id" element={<AuthRequiredRoute><ComplaintDetailPage /></AuthRequiredRoute>} />
        <Route path="profile" element={<AuthRequiredRoute><ProfilePage /></AuthRequiredRoute>} />
      </Route>

      {/* Admin Routes - Requires login + password */}
      <Route path="/admin" element={<AdminGate><Layout /></AdminGate>}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="complaints" element={<ComplaintManagementPage />} />
        <Route path="group-complaints" element={<AdminGroupComplaintsPage />} />
        <Route path="complaint/:id" element={<AdminComplaintDetailPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="insights" element={<AdminAIInsightsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="history" element={<ComplaintHistoryPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <AppRoutes />
            <ToastContainer />
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
