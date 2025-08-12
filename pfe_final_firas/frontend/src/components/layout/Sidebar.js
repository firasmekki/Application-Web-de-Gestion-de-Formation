import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  AcademicCapIcon,
  UserIcon,
  BellIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  UsersIcon,
  FolderIcon,
  ClipboardDocumentListIcon,
  ArchiveBoxIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ user, isOpen, onClose }) => {
  const location = useLocation();
  const role = user?.role || 'participant';

  const navigationLinks = {
    participant: [
      { name: 'Tableau de bord', href: '/participant/tableau-de-bord', icon: HomeIcon },
      { name: 'Formations', href: '/participant/formations', icon: AcademicCapIcon },
      { name: 'Profil', href: '/participant/profil', icon: UserIcon },
      { name: 'Historique', href: '/participant/historique', icon: ClipboardDocumentListIcon },
      { name: 'Chat', href: '/participant/chat', icon: ChatBubbleLeftRightIcon },
      { name: 'Notifications', href: '/participant/notifications', icon: BellIcon },
    ],
    formateur: [
      { name: 'Tableau de bord', href: '/formateur/tableau-de-bord', icon: HomeIcon },
      { name: 'Mes formations', href: '/formateur/formations', icon: AcademicCapIcon },
      { name: 'Profil', href: '/formateur/profil', icon: UserIcon },
      { name: 'Statistiques', href: '/formateur/statistiques', icon: ChartBarIcon },
      { name: 'Chat', href: '/formateur/chat', icon: ChatBubbleLeftRightIcon },
      { name: 'Notifications', href: '/formateur/notifications', icon: BellIcon },
    ],
    administrateur: [
      { name: 'Tableau de bord', href: '/admin/tableau-de-bord', icon: HomeIcon },
      { name: 'Utilisateurs', href: '/admin/utilisateurs', icon: UsersIcon },
      { name: 'Formations', href: '/admin/formations', icon: FolderIcon },
      { name: 'Domaines', href: '/admin/domaines', icon: AcademicCapIcon },
      { name: 'Validation', href: '/admin/validation-demandes', icon: ClipboardDocumentListIcon },
      { name: 'Statistiques', href: '/admin/statistiques', icon: ChartBarIcon },
      { name: 'Archive', href: '/admin/archive', icon: ArchiveBoxIcon },
    ],
  };

  const links = navigationLinks[role] || [];

  const renderNavLinks = () => (
    <nav className="flex-1 px-2 bg-white space-y-1">
      {links.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.name}
            to={item.href}
            onClick={onClose}
            className={`${
              isActive
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
          >
            <Icon
              className={`${
                isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
              } mr-3 flex-shrink-0 h-6 w-6`}
              aria-hidden="true"
            />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden" 
          onClick={onClose}
        />
      )}

      {/* Sidebar pour mobile */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 w-64 bg-white transform transition-transform duration-300 ease-in-out z-30 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-800">Formation Hub</h1>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="overflow-y-auto h-full pb-4">
          {renderNavLinks()}
        </div>
      </div>

      {/* Sidebar pour desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-grow bg-white pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-xl font-semibold text-gray-800">Formation Hub</h1>
            </div>
            <div className="mt-5">
              {renderNavLinks()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
