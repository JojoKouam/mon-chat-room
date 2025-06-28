// frontend/src/components/chat/ChatWindow.jsx

import React, { useContext, useEffect, useRef } from 'react';
import { ChatContext } from '../../context/ChatContext';
import { AuthContext } from '../../context/AuthContext'; // On doit importer AuthContext
import MessageInput from './MessageInput';
import './ChatWindow.css';

export default function ChatWindow() {
  const { user } = useContext(AuthContext);
  const {
    activeRoom, messages, isLoadingMessages, activeEntityDetails,
    onlineUserIds, typingUser
  } = useContext(ChatContext);

  const endOfMessagesRef = useRef(null);
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUser]);

  // --- Cas de rendu initiaux ---
  if (!activeRoom) {
    return <div className="chat-window-container placeholder"><h2>Sélectionnez un salon pour commencer à discuter !</h2></div>;
  }

  // CORRECTION CRUCIALE : On met un état de chargement tant que les détails ne sont pas là
  if (isLoadingMessages || !activeEntityDetails) {
    return <div className="chat-window-container placeholder"><h3>Chargement du salon...</h3></div>;
  }

  // --- Logique d'affichage (maintenant on est sûr que activeEntityDetails existe) ---
  const isDM = activeEntityDetails.type === undefined;
  const isOtherUserOnline = isDM && onlineUserIds.includes(activeEntityDetails.id);

  return (
    <div className="chat-window-container">
      <div className="chat-header">
        {activeEntityDetails && (
          isDM ? (
          <div className="user-header">
            <img src={activeEntityDetails.avatar_url || 'https://i.pravatar.cc/40?u=' + activeEntityDetails.id} alt="avatar" className="header-avatar" />
            <div>
              <h3>{activeEntityDetails.username}</h3>
              <span className="header-status">{typingUser ? `${typingUser} est en train d'écrire...` : (isOtherUserOnline ? 'En ligne' : 'Hors ligne')}</span>
            </div>
          </div>
        ) : (
          <h3>{activeEntityDetails.nom}</h3>
        )
        )}
      </div>

      <div className="messages-list">
        {messages.map((msg) => {
          const isMe = msg.user_id === user.id;
          if (msg.type === 'image') {
            return (
              <div key={msg.id} className={`message-wrapper ${isMe ? 'me' : 'other'}`}>
                <div className="message-content image-content">
                  {!isMe && <span className="message-user">{msg.username}</span>}
                  <img src={msg.content} alt="Image partagée" className="message-image" />
                  <span className="message-timestamp">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            );
          }
          return (
            <div key={msg.id} className={`message-wrapper ${isMe ? 'me' : 'other'}`}>
              {!isMe && <div className="message-avatar">{msg.username.charAt(0).toUpperCase()}</div>}
              <div className="message-content">
                {!isMe && <span className="message-user">{msg.username}</span>}
                <p className="message-text">{msg.content}</p>
                <span className="message-timestamp">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          );
        })}
        
        {/* L'indicateur de frappe a été déplacé dans le header, donc plus besoin ici */}
        
        <div ref={endOfMessagesRef} />
      </div>
      
      <MessageInput />
    </div>
  );
}