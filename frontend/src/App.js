import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import CookieConsent from './components/CookieConsent';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import EditorPage from './pages/EditorPage';
import SettingsPage from './pages/SettingsPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Billing from './pages/Billing';
import AdminPanel from './pages/AdminPanel';
import { Toaster } from './components/ui/sonner';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes */}
            <Route path="/billing" element={
              <ProtectedRoute>
                <Billing />
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard" element={
              <ProtectedRoute requireSubscription={true}>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/editor" element={
              <ProtectedRoute requireSubscription={true}>
                <EditorPage />
              </ProtectedRoute>
            } />
            
            <Route path="/editor/:projectId" element={
              <ProtectedRoute requireSubscription={true}>
                <EditorPage />
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } />
          </Routes>
          <CookieConsent />
        </BrowserRouter>
        <Toaster position="top-right" richColors />
      </div>
    </AuthProvider>
  );
}

export default App;