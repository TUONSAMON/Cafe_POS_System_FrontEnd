import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// 1. Import Context Providers
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LangProvider } from './context/LangContext';

// 2. Import Global Layout
import Layout from './component/Layout';

// 3. Import All Pages
import Login from './context/Login';
import Dashboard from './pages/Dashboard';
import OrderScreen from './pages/OrderScreen';
import TableMap from './pages/TableMap';
import Inventory from './pages/Inventory';
import Staff from './pages/Staff';
import Reports from './pages/Reports';

/**
 * NavigationGuard handles the logic of private access.
 * If a user isn't logged in, they are forced to the Login screen.
 */
function NavigationGuard() {
  const { user } = useAuth();

  // If the user is not logged in, show the Login page only.
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // If logged in, wrap the entire application in the Sidebar Layout
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/pos" element={<OrderScreen />} />
        <Route path="/tables" element={<TableMap />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/staff" element={<Staff />} />
        <Route path="/reports" element={<Reports />} />
        
        {/* Redirect any unknown paths to the Dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

/**
 * Main App Component
 * We wrap everything in our 3 core Providers to make 
 * Theme, Language, and Auth data available everywhere.
 */
export default function App() {
  return (
    <ThemeProvider>
      <LangProvider>
        <AuthProvider>
          <Router>
            <NavigationGuard />
          </Router>
        </AuthProvider>
      </LangProvider>
    </ThemeProvider>
  );
}