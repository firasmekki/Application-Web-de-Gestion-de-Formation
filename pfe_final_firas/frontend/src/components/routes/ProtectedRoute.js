import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children, role }) => {
  const { utilisateur, isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/connexion" />;
  }

  if (role && utilisateur.role !== role) {
    // Rediriger vers le tableau de bord approprié selon le rôle
    const redirectPaths = {
      participant: '/participant/tableau-de-bord',
      formateur: '/formateur/tableau-de-bord',
      administrateur: '/admin/tableau-de-bord'
    };
    return <Navigate to={redirectPaths[utilisateur.role]} />;
  }

  return children;
};

export default ProtectedRoute;
