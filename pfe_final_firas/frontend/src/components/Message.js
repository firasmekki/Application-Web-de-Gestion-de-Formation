import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { IoCheckmarkDone, IoTime, IoDownload } from 'react-icons/io5';
import { API_URL } from '../config';

const getAvatarUrl = (participant) => {
  if (participant.photo) {
    return `${API_URL}/uploads/${participant.photo}`;
  }
  return `https://ui-avatars.com/api/?name=${participant.prenom}+${participant.nom}&background=random`;
};

const Message = ({ message, currentUserId }) => {
  const isCurrentUser = message.expediteur._id === currentUserId;
  const [isDownloading, setIsDownloading] = React.useState(false);

  const handleFileDownload = async () => {
    if (!message.fichier) return;
    
    setIsDownloading(true);
    try {
      const response = await fetch(`${API_URL}/uploads/${message.fichier.chemin}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = message.fichier.nom;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`flex items-end gap-2 mb-4 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <img
        src={getAvatarUrl(message.expediteur)}
        alt={`${message.expediteur.prenom} ${message.expediteur.nom}`}
        className="w-8 h-8 rounded-full object-cover"
        onError={(e) => {
          e.target.src = `https://ui-avatars.com/api/?name=${message.expediteur.prenom}+${message.expediteur.nom}&background=random`;
        }}
      />
      
      <div className={`max-w-[70%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
        {!isCurrentUser && (
          <span className="text-xs text-gray-500 ml-2 mb-1">
            {message.expediteur.prenom} {message.expediteur.nom}
          </span>
        )}
        
        <div className={`relative rounded-2xl px-4 py-2 shadow-sm
          ${isCurrentUser 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-100 text-gray-800'}`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.contenu}
          </p>

          {message.fichier && (
            <div className={`mt-2 p-2 rounded-lg flex items-center gap-2
              ${isCurrentUser ? 'bg-blue-600' : 'bg-gray-200'}`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">
                  {message.fichier.nom}
                </p>
                <p className={`text-xs ${isCurrentUser ? 'text-blue-200' : 'text-gray-500'}`}>
                  {formatFileSize(message.fichier.taille)}
                </p>
              </div>
              <button
                onClick={handleFileDownload}
                disabled={isDownloading}
                className={`p-1.5 rounded-full transition-colors
                  ${isCurrentUser 
                    ? 'hover:bg-blue-700 disabled:bg-blue-400' 
                    : 'hover:bg-gray-300 disabled:bg-gray-100'}`}
              >
                {isDownloading ? (
                  <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <IoDownload className="w-4 h-4" />
                )}
              </button>
            </div>
          )}

          <div className={`flex items-center gap-1 mt-1 text-xs
            ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}
          >
            <span>
              {format(new Date(message.dateCreation), 'HH:mm', { locale: fr })}
            </span>
            
            {isCurrentUser && (
              message.lu ? (
                <IoCheckmarkDone className="w-4 h-4" />
              ) : (
                <IoTime className="w-4 h-4" />
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;
