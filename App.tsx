import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabase';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Pipeline } from './pages/Pipeline';
import { JobDetails } from './pages/JobDetails';
import { CreateJob } from './pages/CreateJob';
import { UserManagement } from './pages/UserManagement';
import { CandidatesPool } from './pages/CandidatesPool';
import { Settings } from './pages/Settings';
import { Layout } from './components/Layout';
import { AppProvider, useApp } from './context/AppContext';

const AppContent: React.FC = () => {
  const { currentUser, loading } = useApp();
  const isAuthenticated = currentUser.id !== 'guest';

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-primary text-6xl animate-spin">progress_activity</span>
          <p className="text-slate-600 dark:text-slate-400 font-medium">Sincronizando Sessão...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          !isAuthenticated ? (
            <Login onLogin={() => { }} />
          ) : (
            <Navigate to="/dashboard" replace />
          )
        }
      />

      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Layout onLogout={handleLogout}>
              <Navigate to="/dashboard" replace />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/dashboard"
        element={
          isAuthenticated ? (
            <Layout onLogout={handleLogout}>
              <Dashboard />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/pipeline"
        element={
          isAuthenticated ? (
            <Layout onLogout={handleLogout}>
              <Pipeline />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/jobs/new"
        element={
          isAuthenticated ? (
            <Layout onLogout={handleLogout}>
              <CreateJob />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/jobs/:id"
        element={
          isAuthenticated ? (
            <Layout onLogout={handleLogout}>
              <JobDetails />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/users"
        element={
          isAuthenticated ? (
            <Layout onLogout={handleLogout}>
              <UserManagement />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/candidates"
        element={
          isAuthenticated ? (
            <Layout onLogout={handleLogout}>
              <CandidatesPool />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/settings"
        element={
          isAuthenticated ? (
            <Layout onLogout={handleLogout}>
              <Settings />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}

const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </AppProvider>
  );
};

export default App;
