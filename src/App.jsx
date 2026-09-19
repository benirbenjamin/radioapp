import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StationProvider } from './context/StationContext';

// Public Pages
import { StationDirectoryPage } from './pages/public/StationDirectoryPage';
import { StationHomePage } from './pages/public/StationHomePage';
import { StationSchedulePage } from './pages/public/StationSchedulePage';
import { StationNewsPage } from './pages/public/StationNewsPage';
import { StationNewsDetailPage } from './pages/public/StationNewsDetailPage';
import { StationVideosPage } from './pages/public/StationVideosPage';
import { StationContactPage } from './pages/public/StationContactPage';

// Admin Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminLayout } from './components/layout/AdminLayout';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AppearancePage } from './pages/admin/AppearancePage';
import { StreamsPage } from './pages/admin/StreamsPage';
import { ProgramsPage } from './pages/admin/ProgramsPage';
import { NewsManagerPage } from './pages/admin/NewsManagerPage';
import { NewsEditPage } from './pages/admin/NewsEditPage';
import { VideosManagerPage } from './pages/admin/VideosManagerPage';
import { SectionsManagerPage } from './pages/admin/SectionsManagerPage';
import { StationSettingsPage } from './pages/admin/StationSettingsPage';
import { AnalyticsPage } from './pages/admin/AnalyticsPage';
import { ProfilePage } from './pages/admin/ProfilePage';

// Super Admin Pages
import { StationsManagerPage } from './pages/admin/superadmin/StationsManagerPage';
import { AdminsManagerPage } from './pages/admin/superadmin/AdminsManagerPage';
import { PlatformStatsPage } from './pages/admin/superadmin/PlatformStatsPage';
import { AuditLogsPage } from './pages/admin/superadmin/AuditLogsPage';

// Protected Route Component
function ProtectedRoute({ children, superAdminOnly = false }) {
  const { user, loading, isSuperAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-sans text-sm">
        Verifying authorization...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (superAdminOnly && !isSuperAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

export function App() {
  return (
    <AuthProvider>
      <Routes>
        
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<StationDirectoryPage />} />

        {/* Public Station Dynamic Routes */}
        <Route
          path="/station/:slug"
          element={
            <StationProvider>
              <StationHomePage />
            </StationProvider>
          }
        />
        <Route
          path="/station/:slug/schedule"
          element={
            <StationProvider>
              <StationSchedulePage />
            </StationProvider>
          }
        />
        <Route
          path="/station/:slug/news"
          element={
            <StationProvider>
              <StationNewsPage />
            </StationProvider>
          }
        />
        <Route
          path="/station/:slug/news/:articleSlug"
          element={
            <StationProvider>
              <StationNewsDetailPage />
            </StationProvider>
          }
        />
        <Route
          path="/station/:slug/videos"
          element={
            <StationProvider>
              <StationVideosPage />
            </StationProvider>
          }
        />
        <Route
          path="/station/:slug/contact"
          element={
            <StationProvider>
              <StationContactPage />
            </StationProvider>
          }
        />

        {/* AUTH & ADMIN PORTAL */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="appearance" element={<AppearancePage />} />
          <Route path="streams" element={<StreamsPage />} />
          <Route path="programs" element={<ProgramsPage />} />
          <Route path="news" element={<NewsManagerPage />} />
          <Route path="news/new" element={<NewsEditPage />} />
          <Route path="news/edit/:articleId" element={<NewsEditPage />} />
          <Route path="videos" element={<VideosManagerPage />} />
          <Route path="sections" element={<SectionsManagerPage />} />
          <Route path="settings" element={<StationSettingsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="profile" element={<ProfilePage />} />

          {/* Super Admin specific routes */}
          <Route
            path="superadmin/stations"
            element={
              <ProtectedRoute superAdminOnly>
                <StationsManagerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="superadmin/admins"
            element={
              <ProtectedRoute superAdminOnly>
                <AdminsManagerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="superadmin/stats"
            element={
              <ProtectedRoute superAdminOnly>
                <PlatformStatsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="superadmin/audit-logs"
            element={
              <ProtectedRoute superAdminOnly>
                <AuditLogsPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </AuthProvider>
  );
}
export default App;
