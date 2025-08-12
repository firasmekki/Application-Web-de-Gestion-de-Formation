import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { logout } from '../../redux/slices/authSlice';
import { useAuth } from '../../context/AuthContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
  };

  // Liste des routes publiques
  const publicRoutes = ['/', '/connexion', '/inscription', '/reinitialisation-mot-de-passe'];
  const isPublicRoute = publicRoutes.includes(location.pathname);

  if (isPublicRoute) {
    return <main className="min-h-screen bg-gray-50">{children}</main>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {isAuthenticated && (
        <Sidebar 
          user={user} 
          onLogout={handleLogout} 
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        {isAuthenticated && (
          <Navbar 
            user={user} 
            onLogout={handleLogout}
            onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          />
        )}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-4 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
