import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Pipeline } from './pages/Pipeline';
import { JobDetails } from './pages/JobDetails';
import { CreateJob } from './pages/CreateJob';
import { UserManagement } from './pages/UserManagement';
import { CandidatesPool } from './pages/CandidatesPool';
import { Settings } from './pages/Settings';
import { Layout } from './components/Layout';
import { AppProvider } from './context/AppContext';

const AppContent: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          !isAuthenticated ? (
            <Login onLogin={handleLogin} />
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
