import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SharedDocuments from './pages/SharedDocuments';
import Upload from './pages/Upload';
import Editor from './pages/Editor';
import NotFound from './pages/NotFound';
import { Loader2 } from 'lucide-react';

// Protected Route Wrapper with Layout
const ProtectedRoute = ({ children, useSidebarLayout = true }) => {
  const { isAuthenticated, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (useSidebarLayout) {
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-slate-950 text-slate-100 overflow-hidden">
        {/* Mobile Navbar */}
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        
        {/* Sidebar (handles both desktop persistent & mobile drawer) */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        {/* Main Content Pane */}
        <main className="flex-grow flex flex-col h-screen overflow-hidden">
          {children}
        </main>
      </div>
    );
  }

  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Sidebar Routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute useSidebarLayout={true}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/shared" 
            element={
              <ProtectedRoute useSidebarLayout={true}>
                <SharedDocuments />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/upload" 
            element={
              <ProtectedRoute useSidebarLayout={true}>
                <Upload />
              </ProtectedRoute>
            } 
          />

          {/* Protected Fullscreen Editor */}
          <Route 
            path="/document/:id" 
            element={
              <ProtectedRoute useSidebarLayout={false}>
                <Editor />
              </ProtectedRoute>
            } 
          />

          {/* 404 Route */}
          <Route 
            path="*" 
            element={
              <ProtectedRoute useSidebarLayout={true}>
                <NotFound />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
