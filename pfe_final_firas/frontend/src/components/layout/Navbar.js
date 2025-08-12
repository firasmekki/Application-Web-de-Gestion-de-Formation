import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bars3Icon, BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';

const Navbar = ({ user, onLogout, onMenuClick }) => {
  const navigate = useNavigate();

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <button
                type="button"
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                onClick={onMenuClick}
              >
                <span className="sr-only">Ouvrir le menu</span>
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="flex items-center">
            <button
              type="button"
              className="p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => navigate(`/${user.role}/notifications`)}
            >
              <span className="sr-only">Voir les notifications</span>
              <BellIcon className="h-6 w-6" aria-hidden="true" />
            </button>

            <div className="ml-3 relative">
              <div className="flex items-center">
                <button
                  type="button"
                  className="flex items-center max-w-xs rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => navigate(`/${user.role}/profil`)}
                >
                  <span className="sr-only">Ouvrir le menu utilisateur</span>
                  <UserCircleIcon className="h-8 w-8 text-gray-400" aria-hidden="true" />
                  <span className="hidden md:block ml-3 text-gray-700">{user?.prenom} {user?.nom}</span>
                </button>
                <button
                  onClick={onLogout}
                  className="ml-4 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <span className="hidden sm:block">Déconnexion</span>
                  <span className="sm:hidden">×</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
