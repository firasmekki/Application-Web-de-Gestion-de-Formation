import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import io from 'socket.io-client';
import { API_URL } from '../../config';
import { 
  PaperAirplaneIcon,
  UserIcon,
  AcademicCapIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  PhoneIcon,
  VideoCameraIcon,
  PaperClipIcon,
  FaceSmileIcon,
  MicrophoneIcon,
  CheckIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const Chat = () => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentChatId, setCurrentChatId] = useState(null);
  const messagesEndRef = useRef(null);
  const socketRef = useRef();

  useEffect(() => {
    // Connexion au serveur Socket.IO
    const token = localStorage.getItem('token');
    socketRef.current = io(API_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    // Écoute des nouveaux messages
    socketRef.current.on('newMessage', (data) => {
      console.log('Nouveau message reçu:', data);
      if (data.chatId === currentChatId) {
        setMessages((prevMessages) => [...prevMessages, data.message]);
      }
    });

    // Écoute du statut de frappe
    socketRef.current.on('userTyping', (data) => {
      if (data.userId === selectedContact?._id) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      }
    });

    // Écoute des erreurs
    socketRef.current.on('chatError', (error) => {
      console.error('Erreur chat:', error);
      setError(error.message);
    });

    // Chargement des contacts
    const fetchContacts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Tentative de récupération des contacts depuis:', `${API_URL}/api/chat/participants`);
        
        const token = localStorage.getItem('token');
        console.log('Token disponible:', !!token);
        
        const response = await fetch(`${API_URL}/api/chat/participants`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Réponse reçue:', response.status, response.statusText);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Données reçues:', result);
        
        if (result.success) {
          // Transformer les données pour correspondre au format attendu
          const transformedContacts = result.data.map(participant => ({
            _id: participant._id,
            name: `${participant.prenom} ${participant.nom}`,
            avatar: participant.photo,
            lastMessage: 'Aucun message',
            lastMessageTime: participant.lastSeen || new Date(),
            unreadCount: 0,
            isOnline: participant.isOnline || false,
            formation: 'Formation en cours', // À adapter selon vos besoins
            email: participant.email
          }));
          console.log('Contacts transformés:', transformedContacts);
          setContacts(transformedContacts);
        } else {
          console.error('Erreur lors du chargement des contacts:', result.message);
          setError(result.message);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des contacts:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    // Chargement des messages pour le contact sélectionné
    const fetchMessages = async () => {
      if (selectedContact && currentChatId) {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${API_URL}/api/chat/messages/${currentChatId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              setMessages(result.data);
            }
          }
        } catch (error) {
          console.error('Erreur lors du chargement des messages:', error);
        }
      }
    };

    fetchMessages();
  }, [selectedContact, currentChatId]);

  useEffect(() => {
    // Scroll automatique vers le bas
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (message.trim() && selectedContact && currentChatId) {
      try {
        const formData = new FormData();
        formData.append('chatId', currentChatId);
        formData.append('contenu', message.trim());

        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/chat/message`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            // Le message sera ajouté via Socket.IO
            setMessage('');
            
            // Émettre l'événement de frappe
            socketRef.current.emit('typing', {
              chatId: currentChatId,
              isTyping: false
            });
          }
        } else {
          throw new Error('Erreur lors de l\'envoi du message');
        }
      } catch (error) {
        console.error('Erreur lors de l\'envoi du message:', error);
        setError('Erreur lors de l\'envoi du message');
      }
    }
  };

  const handleTyping = () => {
    if (selectedContact && currentChatId) {
      socketRef.current.emit('typing', {
        chatId: currentChatId,
        isTyping: true
      });
    }
  };

  // Sélectionner un contact et créer/joindre une conversation
  const handleContactSelect = async (contact) => {
    setSelectedContact(contact);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      
      // Créer ou récupérer une conversation
      const response = await fetch(`${API_URL}/api/chat/conversation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ destinataireId: contact._id })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const chatId = result.data._id;
          setCurrentChatId(chatId);
          
          // Rejoindre la room Socket.IO
          socketRef.current.emit('joinChat', chatId);
          
          // Charger les messages
          const messagesResponse = await fetch(`${API_URL}/api/chat/messages/${chatId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (messagesResponse.ok) {
            const messagesResult = await messagesResponse.json();
            if (messagesResult.success) {
              setMessages(messagesResult.data);
            }
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de la sélection du contact:', error);
      setError('Impossible de charger la conversation');
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffTime = Math.abs(now - messageTime);
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'À l\'instant';
    if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return messageTime.toLocaleDateString('fr-FR');
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    const today = new Date();
    const messageDate = new Date(timestamp);
    const diffTime = Math.abs(today - messageDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Hier';
    } else if (diffDays > 1) {
      return messageDate.toLocaleDateString('fr-FR');
    } else {
      return 'Aujourd\'hui';
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fonction pour formater l'heure des messages
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Fonction pour vérifier si un message est à l'utilisateur actuel
  const isOwnMessage = (message) => {
    return message.expediteur._id === user._id;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
              <p className="text-gray-600">Communiquez avec vos participants</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[70vh]">
          {/* Liste des contacts */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un contact..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="overflow-y-auto h-full">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-500">Chargement des contacts...</p>
                </div>
              ) : error ? (
                <div className="p-8 text-center">
                  <div className="text-red-500 mb-4">
                    <svg className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <p className="text-sm font-medium">Erreur de chargement</p>
                    <p className="text-xs text-gray-600 mt-1">{error}</p>
                  </div>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Réessayer
                  </button>
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="p-8 text-center">
                  <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Aucun contact trouvé</p>
                  <p className="text-xs text-gray-400 mt-2">Vérifiez que le backend est démarré</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredContacts.map((contact) => (
                    <motion.div
                      key={contact._id}
                      whileHover={{ backgroundColor: '#f9fafb' }}
                      onClick={() => handleContactSelect(contact)}
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedContact?._id === contact._id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {contact.avatar ? (
                              <img src={contact.avatar} alt={contact.name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              contact.name.charAt(0)
                            )}
                          </div>
                          {contact.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                              {contact.name}
                            </h3>
                            <span className="text-xs text-gray-500">
                              {formatTime(contact.lastMessageTime)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            {contact.lastMessage}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-blue-600 font-medium">
                              {contact.formation}
                            </span>
                            {contact.unreadCount > 0 && (
                              <span className="bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                {contact.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Zone de chat */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 bg-white rounded-xl shadow-lg overflow-hidden flex flex-col"
          >
            {selectedContact ? (
              <>
                {/* Header du chat */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {selectedContact.avatar ? (
                            <img src={selectedContact.avatar} alt={selectedContact.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            selectedContact.name.charAt(0)
                          )}
                        </div>
                        {selectedContact.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{selectedContact.name}</h3>
                        <p className="text-sm text-gray-600">{selectedContact.formation}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <PhoneIcon className="h-5 w-5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <VideoCameraIcon className="h-5 w-5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <EllipsisVerticalIcon className="h-5 w-5" />
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg, index) => (
                    <motion.div
                      key={msg.id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className={`flex ${isOwnMessage(msg) ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        isOwnMessage(msg) 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className="text-sm">{msg.contenu}</p>
                        <div className={`flex items-center justify-end mt-1 space-x-1 ${
                          isOwnMessage(msg) ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                                                     <span className="text-xs">{formatMessageTime(msg.dateCreation)}</span>
                          {isOwnMessage(msg) && (
                            msg.lu ? (
                              <CheckIcon className="h-3 w-3" />
                            ) : (
                              <ClockIcon className="h-3 w-3" />
                            )
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                        <p className="text-sm italic">En train d'écrire...</p>
                      </div>
                    </motion.div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Zone de saisie */}
                <div className="p-4 border-t border-gray-200">
                  <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <PaperClipIcon className="h-5 w-5" />
                    </motion.button>
                    
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleTyping}
                        placeholder="Tapez votre message..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
                        >
                          <FaceSmileIcon className="h-4 w-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
                        >
                          <MicrophoneIcon className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={!message.trim()}
                      className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <PaperAirplaneIcon className="h-5 w-5" />
                    </motion.button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <AcademicCapIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Sélectionnez un contact</h3>
                  <p className="text-gray-600">Choisissez un participant pour commencer à discuter</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
