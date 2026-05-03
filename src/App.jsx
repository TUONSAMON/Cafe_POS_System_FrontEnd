import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './component/Layout';

import Login from './context/Login';
import Dashboard from './pages/Dashboard';
import OrderScreen from './pages/OrderScreen';
import TableMap from './pages/TableMap';
import Inventory from './pages/Inventory';
import Staff from './pages/Staff';
import Reports from './pages/Reports';
import Ingredients from "./pages/Ingredients";

function NavigationGuard() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/pos" element={<OrderScreen />} />
        <Route path="/tables" element={<TableMap />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/ingredients" element={<Ingredients />} />
        <Route path="/staff" element={<Staff />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <NavigationGuard />
      </Router>
    </AuthProvider>
  );
}