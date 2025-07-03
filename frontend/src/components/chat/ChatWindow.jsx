import React, { useEffect, useRef } from 'react';
import { useChatContext } from '../../context/ChatContext';
import { useAuthContext } from '../../context/AuthContext';
import MessageInput from './MessageInput';
import './ChatWindow.css';

export default function ChatWindow() {
  const { 
    messages, 
    isLoadingMessages, 
    activeEntityDetails,
    typingUser
  } = useChatContext();
  const { user } = useAuthContext();
  const endOfMessagesRef = useRef(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!activeEntityDetails) {
    return <div className="chat-window-placeholder"><h3>Sélectionnez un salon pour commencer à discuter !</h3></div>;
  }

  if (isLoadingMessages) {
    return <div className="chat-window-placeholder"><h3>Chargement des messages...</h3></div>;
  }

  const isOtherUserTyping = typingUser && typingUser !== user.username;
  const entityName = activeEntityDetails.name || activeEntityDetails.other_user_name;
  
  return (
    <div className="chat-window-container">
      <div className="chat-header">
        <img 
          src={activeEntityDetails.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(entityName)}`} 
          alt={entityName} 
          className="header-avatar"
        />
        <div className="header-details">
          <h3>{entityName}</h3>
          {isOtherUserTyping && <span className="header-status">{typingUser} est en train d'écrire...</span>}
        </div>
      </div>

      <div className="messages-list">
        {messages.length > 0 ? (
          messages.map((msg) => {
            // SÉCURITÉ : Si un message n'a pas d'ID, on ne l'affiche pas pour éviter les erreurs.
            if (!msg || !msg.id) return null;

            const isMe = msg.user_id === user.id;

            return (
              <div key={msg.id} className={`message-wrapper ${isMe ? 'me' : 'other'}`}>
                {!isMe && (
                  // L'avatar du message est DÉJÀ dans l'objet `msg` grâce à la jointure SQL.
                  <img
                    src={msg.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(msg.username)}`}
                    alt={msg.username}
                    className="message-avatar"
                  />
                )}
                <div className="message-content">
                  {/* Le nom d'utilisateur est aussi DÉJÀ dans `msg` */}
                  {!isMe && <span className="message-username">{msg.username}</span>}
                  
                  {/* On gère les images ou le texte */}
                  {msg.type === 'image' ? (
                    <img src={msg.content} alt="Image partagée" className="message-image" />
                  ) : (
                    <p className="message-text">{msg.content}</p>
                  )}
                  
                  <span className="message-timestamp">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-messages-info">
            <p>Soyez le premier à envoyer un message !</p>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      <MessageInput />
    </div>
  );
}