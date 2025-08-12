import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './common/LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const location = useLocation();
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated || !user) {
    // Rediriger vers la page de connexion avec l'URL de retour
    return <Navigate to="/connexion" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Rediriger vers la page appropriée selon le rôle
    const redirectPath = (() => {
      switch (user.role) {
        case 'participant':
          return '/participant/tableau-de-bord';
        case 'formateur':
          return '/formateur/tableau-de-bord';
        case 'administrateur':
          return '/admin/tableau-de-bord';
        default:
          return '/connexion';
      }
    })();
    
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
