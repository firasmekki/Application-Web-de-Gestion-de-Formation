import React, { useState, useEffect, useRef, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { IoAttach, IoSend, IoClose, IoDocument } from 'react-icons/io5';
import { useAuth } from '../../context/AuthContext';
import { 
  setCurrentConversation, 
  addMessage, 
  clearMessages, 
  setMessages, 
  setConversations,
  fetchConversations,
  fetchMessages 
} from '../../features/chatSlice';
import { API_URL } from '../../config';
import './Chat.css';

// Fonction utilitaire pour obtenir l'URL de l'avatar
const getAvatarUrl = (participant) => {
  if (participant.photo) {
    return `${API_URL}/uploads/${participant.photo}`;
  }
  return `https://ui-avatars.com/api/?name=${participant.prenom}+${participant.nom}&background=random`;
};

// Formater la date du message
const formatMessageDate = (date) => {
  return format(new Date(date), 'HH:mm', { locale: fr });
};

// Fonction utilitaire pour formater les dates
const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    return format(date, 'dd MMMM yyyy à HH:mm', { locale: fr });
  } catch (error) {
    console.error('Erreur de formatage de date:', error);
    return '';
  }
};

// Fonction utilitaire pour formater la taille des fichiers
const formatFileSize = (size) => {
  if (size < 1024) return size + ' B';
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB';
  return (size / (1024 * 1024)).toFixed(2) + ' MB';
};

// Message component
const Message = memo(({ message, currentUserId }) => {
  if (!message || typeof message !== 'object') return null;

  const isOwnMessage = message.expediteur._id === currentUserId;
  const avatarUrl = getAvatarUrl(message.expediteur);

  return (
    <div className={`message ${isOwnMessage ? 'own-message' : ''}`}>
      <div className="message-avatar">
        <img src={avatarUrl} alt={message.expediteur.nom} />
      </div>
      <div className="message-content">
        <div className="message-header">
          <span className="message-author">
            {isOwnMessage ? 'Vous' : `${message.expediteur.nom} ${message.expediteur.prenom}`}
          </span>
          <span className="message-time">{formatMessageDate(message.dateCreation)}</span>
        </div>
        <div className="message-text">{message.contenu}</div>
        {message.fichier && (
          <div className="message-file">
            <IoDocument className="file-icon" />
            <a 
              href={`${API_URL}/uploads/chat/${message.fichier.chemin}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="file-link"
            >
              {message.fichier.nom} ({formatFileSize(message.fichier.taille)})
            </a>
          </div>
        )}
      </div>
    </div>
  );
});

// Main Chat component
const Chat = memo(() => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const [participants, setParticipants] = useState([]);
  const [showParticipants, setShowParticipants] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const fileInputRef = useRef(null);
  const onlineUsers = useSelector(state => state.chat.onlineUsers) || [];

  const messages = useSelector(state => state.chat.messages) || [];
  const conversations = useSelector(state => {
    console.log('État des conversations:', state.chat.conversations);
    return state.chat.conversations || [];
  });
  const currentChat = useSelector(state => state.chat.currentConversation) || {};

  // Charger les conversations au montage
  useEffect(() => {
    console.log('Chargement des conversations...');
    dispatch(fetchConversations());
    loadParticipants();
  }, [dispatch]);

  // Charger la liste des participants
  const loadParticipants = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/chat/participants`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.data.success) {
        setParticipants(response.data.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des participants:', error);
      setError('Impossible de charger la liste des participants');
    }
  };

  useEffect(() => {
    console.log('État des conversations:', conversations);
  }, [conversations]);

  // Initialiser Socket.IO
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    socketRef.current = io(API_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socketRef.current.on('connect', () => {
      console.log('Socket connecté avec succès');
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Erreur de connexion Socket.IO:', error);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Sélectionner un participant
  const handleParticipantSelect = async (participant, conversationId) => {
    console.log('Sélection du participant:', participant);
    setSelectedParticipant(participant);
    setError(null);

    try {
      let chatId = conversationId;
      
      if (!chatId) {
        // Créer une nouvelle conversation
        const response = await axios.post(
          `${API_URL}/api/chat/conversation`,
          { destinataireId: participant._id },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        
        if (response.data.success) {
          chatId = response.data.data._id;
          // Mettre à jour la liste des conversations
          dispatch(fetchConversations());
        } else {
          throw new Error('Erreur lors de la création de la conversation');
        }
      }

      console.log('Conversation ID:', chatId);

      // Mettre à jour la conversation courante
      dispatch(setCurrentConversation({ chatId, participant }));
      
      // Charger les messages
      const messagesResponse = await axios.get(
        `${API_URL}/api/chat/messages/${chatId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (messagesResponse.data.success) {
        dispatch(setMessages(messagesResponse.data.data));
      }
      
      // Rejoindre la room Socket.IO
      socketRef.current.emit('joinChat', chatId);
    } catch (error) {
      console.error('Erreur lors de la sélection du participant:', error);
      setError('Impossible de charger la conversation');
    }
  };

  // Gérer la réception des messages en temps réel
  useEffect(() => {
    if (!socketRef.current || !currentChat?.chatId) return;

    // Rejoindre le chat actuel
    socketRef.current.emit('joinChat', currentChat.chatId);

    // Écouter les nouveaux messages
    socketRef.current.on('newMessage', (data) => {
      console.log('Nouveau message reçu:', data);
      if (data.chatId === currentChat.chatId) {
        dispatch(addMessage(data.message));
      }
    });

    // Écouter le statut de frappe
    socketRef.current.on('userTyping', (data) => {
      if (data.userId !== user._id) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 2000);
      }
    });

    // Écouter les erreurs
    socketRef.current.off('chatError');
    socketRef.current.on('chatError', (error) => {
      console.error('Erreur chat:', error);
      setError(error.message);
    });

    return () => {
      socketRef.current.off('newMessage');
      socketRef.current.off('userTyping');
      socketRef.current.off('chatError');
    };
  }, [currentChat?.chatId, dispatch, user._id]);

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || !currentChat?.chatId) {
      return;
    }

    try {
      const formData = new FormData();
      formData.append('chatId', currentChat.chatId);
      formData.append('contenu', newMessage.trim());
      
      if (selectedFile) {
        formData.append('fichier', selectedFile);
      }

      console.log('Envoi du message:', {
        chatId: currentChat.chatId,
        contenu: newMessage.trim()
      });

      const response = await axios.post(
        `${API_URL}/api/chat/message`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        setNewMessage('');
        setSelectedFile(null);
        
        // Ajouter le message localement
        dispatch(addMessage(response.data.data));
        
        // Émettre le message via Socket.IO
        socketRef.current.emit('sendMessage', {
          chatId: currentChat.chatId,
          message: response.data.data
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      setError('Erreur lors de l\'envoi du message');
    }
  };

  const renderMessages = () => {
    if (!messages || messages.length === 0) {
      return (
        <div className="no-messages">
          <p>Aucun message. Commencez la conversation !</p>
        </div>
      );
    }

    // Trier les messages du plus ancien au plus récent
    const sortedMessages = [...messages].sort((a, b) => 
      new Date(a.dateCreation) - new Date(b.dateCreation)
    );

    return sortedMessages.map((message, index) => (
      <Message
        key={message._id || index}
        message={message}
        currentUserId={user._id}
      />
    ));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        setError('Le fichier est trop volumineux. Taille maximale: 5MB');
        return;
      }

      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];

      if (!allowedTypes.includes(file.type)) {
        setError('Type de fichier non supporté');
        return;
      }

      setSelectedFile(file);
      setError('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // État local pour la recherche de participants
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  // Filtrer les participants
  const filteredParticipants = participants.filter(participant =>
    `${participant.nom} ${participant.prenom}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Gérer la saisie en cours
  const handleTyping = () => {
    if (!currentChat?.chatId) return;

    setIsTyping(true);
    socketRef.current?.emit('typing', {
      chatId: currentChat.chatId,
      isTyping: true
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socketRef.current?.emit('typing', {
        chatId: currentChat.chatId,
        isTyping: false
      });
    }, 2000);
  };

  return (
    <div className="flex h-[calc(100vh-100px)] bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Liste des participants */}
      <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher un participant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredParticipants.map((participant) => (
            <div
              key={participant._id}
              onClick={() => handleParticipantSelect(participant)}
              className={`flex items-center gap-3 p-3 cursor-pointer transition-colors
                ${selectedParticipant?._id === participant._id 
                  ? 'bg-blue-50' 
                  : 'hover:bg-gray-50'}`}
            >
              <div className="relative">
                <img
                  src={getAvatarUrl(participant)}
                  alt={`${participant.prenom} ${participant.nom}`}
                  className="w-12 h-12 rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${participant.prenom}+${participant.nom}&background=random`;
                  }}
                />
                <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white
                  ${onlineUsers.includes(participant._id) ? 'bg-green-500' : 'bg-gray-400'}`}
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {participant.prenom} {participant.nom}
                </h3>
                <p className="text-xs text-gray-500 truncate">
                  {participant.email}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Zone de chat */}
      <div className="flex-1 flex flex-col">
        {selectedParticipant ? (
          <>
            {/* En-tête du chat */}
            <div className="flex items-center gap-4 p-4 border-b border-gray-200 bg-white">
              <div className="relative">
                <img
                  src={getAvatarUrl(selectedParticipant)}
                  alt={`${selectedParticipant.prenom} ${selectedParticipant.nom}`}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${selectedParticipant.prenom}+${selectedParticipant.nom}&background=random`;
                  }}
                />
                <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white
                  ${onlineUsers.includes(selectedParticipant._id) ? 'bg-green-500' : 'bg-gray-400'}`}
                />
              </div>
              
              <div className="flex-1">
                <h2 className="text-lg font-medium text-gray-900">
                  {selectedParticipant.prenom} {selectedParticipant.nom}
                </h2>
                <p className="text-sm text-gray-500">
                  {onlineUsers.includes(selectedParticipant._id) ? 'En ligne' : 'Hors ligne'}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50" ref={messagesEndRef}>
              {renderMessages()}
            </div>

            {/* Zone de saisie */}
            <div className="p-4 bg-white border-t border-gray-200">
              {selectedFile && (
                <div className="flex items-center gap-2 p-2 mb-2 bg-gray-100 rounded-lg">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  <span className="flex-1 text-sm text-gray-600 truncate">
                    {selectedFile.name}
                  </span>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => document.getElementById('file-input').click()}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>

                <input
                  id="file-input"
                  type="file"
                  className="hidden"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                />

                <div className="flex-1">
                  <textarea
                    rows="1"
                    placeholder="Écrivez votre message..."
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-full resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <button
                  onClick={handleSendMessage}
                  disabled={(!newMessage.trim() && !selectedFile) || isTyping}
                  className={`p-2 rounded-full transition-colors
                    ${(!newMessage.trim() && !selectedFile) || isTyping
                      ? 'bg-gray-100 text-gray-400'
                      : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                >
                  {isTyping ? (
                    <div className="w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spin" />
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Pas de conversation sélectionnée
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Sélectionnez un participant pour démarrer une conversation
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default Chat;
