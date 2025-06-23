// frontend/src/components/chat/ChatWindow.jsx

import React, { useContext, useEffect, useRef } from 'react';
import ChatContext from '../../context/ChatContext';
import AuthContext from '../../context/AuthContext';
import MessageInput from './MessageInput';
import './ChatWindow.css';

const TypingIndicator = ({ typingUsers }) => {
  if (typingUsers.length === 0) return <span></span>;
  if (typingUsers.length === 1) return <span>{typingUsers[0]} est en train d'écrire...</span>;
  if (typingUsers.length === 2) return <span>{typingUsers.join(' et ')} sont en train d'écrire...</span>;
  return <span>Plusieurs personnes sont en train d'écrire...</span>;
};

// --- CORRECTION : La fonction accepte bien { setMobileView } comme une prop ---
export default function ChatWindow({ setMobileView }) {
  const { user } = useContext(AuthContext);
  const { rooms, messages, activeRoom, memberCounts, typingUsers } = useContext(ChatContext);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  const currentRoom = rooms.find(room => room.id === activeRoom);
  const currentMemberCount = memberCounts[activeRoom] || 0;
  const otherTypingUsers = user ? typingUsers.filter(username => username !== user.username) : typingUsers;

  if (!activeRoom) {
    return (
      <div className="chat-window-container placeholder">
        <h3>Sélectionnez un salon pour commencer à discuter !</h3>
      </div>
    );
  }

  return (
    <div className="chat-window-container">
      <div className="chat-header">
        <button className="back-button" onClick={() => setMobileView('sidebar')}>
          &lt;
        </button>
        <div className="header-info">
          <h3>{currentRoom ? currentRoom.nom : 'Chargement...'}</h3>
          {currentMemberCount > 0 && <span>{currentMemberCount} membre{currentMemberCount > 1 ? 's' : ''} en ligne</span>}
        </div>
        <div className="typing-indicator-header">
          <TypingIndicator typingUsers={otherTypingUsers} />
        </div>
      </div>
      <div className="messages-list">
        {messages.map((msg, index) => {
          const isMe = user && msg.user_id === user.id;
          return (
            <div key={index} className={`message-wrapper ${isMe ? 'me' : 'other'}`}>
              <div className="message-item">
                {!isMe && (
                  <div className="message-avatar" style={{backgroundColor: '#e5e7eb', color: '#374151'}}>
                    {msg.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="message-content">
                   {msg.type === 'image' ? (
        <img src={msg.content} alt="Image envoyée" className="message-image" />
    ) : (
        <p className="message-text">{msg.content}</p>
    )}
                  <span className="message-timestamp">{new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <MessageInput />
    </div>
  );
}