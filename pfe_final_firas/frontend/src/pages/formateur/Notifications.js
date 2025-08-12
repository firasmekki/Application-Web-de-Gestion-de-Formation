import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import io from 'socket.io-client';
import {
  BellIcon,
  UserIcon,
  AcademicCapIcon,
  QuestionMarkCircleIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  EyeIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);
  const [filter, setFilter] = useState('all');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Connexion au serveur Socket.IO
    const newSocket = io(process.env.REACT_APP_API_URL);
    setSocket(newSocket);

    // Chargement initial des notifications
    fetchNotifications();

    // Écoute des nouvelles notifications
    newSocket.on('notification', (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return () => newSocket.disconnect();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      const data = await response.json();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });
      setNotifications(notifications.filter((n) => n.id !== notificationId));
    } catch (error) {
      console.error('Erreur lors de la suppression de la notification:', error);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
      });
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'PUT',
      });
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Erreur lors du marquage de toutes comme lues:', error);
    }
  };

  const getNotificationIcon = (type) => {
    const iconClasses = "h-6 w-6";
    switch (type) {
      case 'inscription':
        return <UserIcon className={`${iconClasses} text-blue-600`} />;
      case 'formation':
        return <AcademicCapIcon className={`${iconClasses} text-purple-600`} />;
      case 'question':
        return <QuestionMarkCircleIcon className={`${iconClasses} text-orange-600`} />;
      case 'warning':
        return <ExclamationTriangleIcon className={`${iconClasses} text-red-600`} />;
      case 'info':
        return <InformationCircleIcon className={`${iconClasses} text-green-600`} />;
      default:
        return <BellIcon className={`${iconClasses} text-gray-600`} />;
    }
  };

  const getNotificationStyle = (type) => {
    switch (type) {
      case 'inscription':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'formation':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'question':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'warning':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'info':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInHours = Math.floor((now - notificationDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'À l\'instant';
    } else if (diffInHours < 24) {
      return `Il y a ${diffInHours}h`;
    } else {
      return notificationDate.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  // Données de démonstration
  const demoNotifications = [
    {
      id: 1,
      type: 'inscription',
      title: 'Nouvelle inscription',
      message: 'Ahmed Ben Ali s\'est inscrit à votre formation "React Avancé"',
      read: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      formation: 'React Avancé'
    },
    {
      id: 2,
      type: 'formation',
      title: 'Formation approuvée',
      message: 'Votre formation "Node.js Backend" a été approuvée par l\'administrateur',
      read: true,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      formation: 'Node.js Backend'
    },
    {
      id: 3,
      type: 'question',
      title: 'Question d\'un participant',
      message: 'Sarah Martin a posé une question sur le module 3 de "Python Data"',
      read: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
      formation: 'Python Data'
    },
    {
      id: 4,
      type: 'info',
      title: 'Mise à jour de la plateforme',
      message: 'De nouvelles fonctionnalités sont disponibles pour les formateurs',
      read: true,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      formation: null
    },
    {
      id: 5,
      type: 'warning',
      title: 'Formation en retard',
      message: 'La formation "DevOps Basics" n\'a pas été mise à jour depuis 7 jours',
      read: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      formation: 'DevOps Basics'
    }
  ];

  // Utiliser les données de démonstration si aucune notification réelle
  const displayNotifications = notifications.length > 0 ? filteredNotifications : demoNotifications;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
              <p className="text-gray-600">Restez informé de toutes les activités importantes</p>
            </div>
            <div className="flex items-center space-x-3">
              {unreadCount > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleMarkAllAsRead}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                >
                  <CheckIcon className="h-4 w-4 mr-2" />
                  Tout marquer comme lu
                </motion.button>
              )}
              <div className="relative">
                <BellIcon className="h-6 w-6 text-gray-600" />
                {unreadCount > 0 && (
                  <div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filtres */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Toutes les notifications</option>
                <option value="unread">Non lues</option>
                <option value="inscription">Inscriptions</option>
                <option value="formation">Formations</option>
                <option value="question">Questions</option>
                <option value="warning">Avertissements</option>
                <option value="info">Informations</option>
              </select>
            </div>
            <div className="text-sm text-gray-500">
              {displayNotifications.length} notification{displayNotifications.length > 1 ? 's' : ''}
            </div>
          </div>
        </motion.div>

        {/* Liste des notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          {displayNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Aucune notification</p>
              <p className="text-gray-400">Vous êtes à jour !</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {displayNotifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className={`p-6 hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`p-3 rounded-lg ${!notification.read ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {notification.title}
                          </h3>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getNotificationStyle(notification.type)}`}>
                            {notification.type}
                          </span>
                          <span className="text-sm text-gray-500 flex items-center">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            {formatDate(notification.timestamp)}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mt-2">
                        {notification.message}
                      </p>
                      
                      {notification.formation && (
                        <div className="mt-3 flex items-center text-sm text-gray-500">
                          <AcademicCapIcon className="h-4 w-4 mr-2" />
                          Formation: {notification.formation}
                        </div>
                      )}
                      
                      <div className="mt-4 flex items-center space-x-3">
                        {!notification.read && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                          >
                            <CheckIcon className="h-4 w-4 mr-1" />
                            Marquer comme lu
                          </motion.button>
                        )}
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDelete(notification.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center"
                        >
                          <TrashIcon className="h-4 w-4 mr-1" />
                          Supprimer
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Notifications;
