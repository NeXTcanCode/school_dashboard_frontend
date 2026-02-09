import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';

// Pages (to be implemented)
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import SelectFeaturesPage from './pages/SelectFeaturesPage';
import DashboardPage from './pages/DashboardPage';
import NewsPage from './pages/NewsPage';
import EventsPage from './pages/EventsPage';
import GalleryPage from './pages/GalleryPage';
import SettingsPage from './pages/SettingsPage';

// Layout
import DashboardLayout from './components/layout/DashboardLayout';
import PageTransition from './components/common/PageTransition';

import { useAuth } from './hooks/useAuth';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  const location = useLocation();

  return (
    <>
      <Toaster position="top-right" />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={
              <PageTransition>
                <DashboardPage />
              </PageTransition>
            } />
            <Route path="select-features" element={
              <PageTransition>
                <SelectFeaturesPage />
              </PageTransition>
            } />
            <Route path="news" element={
              <PageTransition>
                <NewsPage />
              </PageTransition>
            } />
            <Route path="events" element={
              <PageTransition>
                <EventsPage />
              </PageTransition>
            } />
            <Route path="gallery" element={
              <PageTransition>
                <GalleryPage />
              </PageTransition>
            } />
            <Route path="settings" element={
              <PageTransition>
                <SettingsPage />
              </PageTransition>
            } />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default App;
