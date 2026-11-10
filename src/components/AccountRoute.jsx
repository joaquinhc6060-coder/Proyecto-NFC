import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import OwnerDashboardPage from '../pages/OwnerDashboardPage';
export default function AccountRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <p role="status" className="p-16 text-center">Comprobando sesión…</p>;
  if (!user) return <Navigate to={'/login?next=' + encodeURIComponent(location.pathname + location.search)} replace />;
  return children || <OwnerDashboardPage key={user.id} />;
}
