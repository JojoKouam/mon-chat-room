// frontend/src/components/chat/NewSidebar.jsx

import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { ChatContext } from '../../context/ChatContext';
import JoinRoomModal from './JoinRoomModal';
import NewConversationModal from './NewConversationModal';
import './NewSidebar.css';

export default function NewSidebar({ mode }) {
  const {
    rooms, myRoomIds, conversations, loading, selectRoom, activeRoom,
    startConversation, onlineUserIds
  } = useContext(ChatContext);
  
  const [roomToJoin, setRoomToJoin] = useState(null);
  const [isNewConversationModalOpen, setIsNewConversationModalOpen] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (mode === 'dms') {
      const fetchUsers = async () => {
        try {
          const res = await axios.get('/api/users/list');
          setOnlineUsers(res.data);
        } catch (error) { console.error("Impossible de charger les utilisateurs", error); }
      };
      fetchUsers();
    }
  }, [mode]);

  if (loading) {
    return (
      <div className="new-sidebar-container">
        <div className="sidebar-header"><input type="text" placeholder="Chargement..." disabled /></div>
        <div className="sidebar-content"><p className="no-items-message">Chargement...</p></div>
      </div>
    );
  }
  
  const handleStartConversationClick = (userId) => {
     // --- CONSOLE LOG 1 ---
    console.log('[NewSidebar] Clic pour démarrer une conversation avec User ID:', userId);

    if (typeof userId !== 'number') {
      console.error('ERREUR : L\'ID de l\'utilisateur n\'est pas un nombre !');
      return;
    }

    if (startConversation) {
      startConversation(userId);
    }
  };
  const myJoinedRooms = rooms.filter(r => myRoomIds.includes(r.id));
  const exploreRooms = rooms.filter(r => !myRoomIds.includes(r.id));

  return (
    <>
      <div className="new-sidebar-container">
        <div className="sidebar-header">
          <input type="text" placeholder="Rechercher..." />
        </div>
        <div className="sidebar-content">
          {mode === 'rooms' ? (
            <>
              <div className="sidebar-section">
                <h4>Mes Salons</h4>
                <ul className="conversations-list">
                  {myJoinedRooms.map(room => (
                    <li key={room.id} className={`conversation-item ${activeRoom === room.id ? 'active' : ''}`} onClick={() => selectRoom(room.id)}>
                      <div className="room-avatar-placeholder">{room.nom.charAt(0).toUpperCase()}</div>
                      <div className="convo-details"><span className="convo-name">{room.nom}</span></div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="sidebar-section">
                <h4>Explorer</h4>
                <ul className="conversations-list">
                  {exploreRooms.map(room => (
                    <li key={room.id} className="conversation-item" onClick={() => setRoomToJoin(room)}>
                      <div className="room-avatar-placeholder">{room.nom.charAt(0).toUpperCase()}</div>
                      <div className="convo-details"><span className="convo-name">{room.nom}</span></div>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <>
              <div className="sidebar-section">
                <h4>En ligne</h4>
                <div className="online-users-list">
                  {onlineUsers.map(user => {
                    const isOnline = onlineUserIds.includes(user.id);
                    return (
                      <div key={user.id} className="online-user-item" title={user.username} onClick={() => handleStartConversationClick(user.id)}>
                        <div className="online-user-avatar">
                          {user.username.charAt(0).toUpperCase()}
                          <span className={`online-indicator ${isOnline ? 'online' : ''}`}></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="sidebar-section">
                <div className="section-header">
                  <h4>Messages</h4>
                  <button onClick={() => setIsNewConversationModalOpen(true)} className="add-convo-btn">+</button>
                </div>
                <ul className="conversations-list">
                  {conversations.length > 0 ? conversations.map(convo => (
                    <li key={convo.id} className={`conversation-item ${activeRoom === convo.id ? 'active' : ''}`} onClick={() => selectRoom(convo.id)}>
                      <div className="room-avatar-placeholder">{convo.other_user_username.charAt(0).toUpperCase()}</div>
                      <div className="convo-details">
                        <span className="convo-name">{convo.other_user_username}</span>
                        <p className="convo-last-message">
                          {convo.last_message_content === 'image' ? 'Une image a été partagée' : (convo.last_message_content || 'Aucun message')}
                          </p>
                      </div>
                      <div className="convo-meta">
                        {convo.last_message_created_at && (
                          <span className="convo-timestamp">{new Date(convo.last_message_created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>)}
                          {convo.unread_count > 0 && ( 
                            <span className="unread-badge">{convo.unread_count}</span>
                            )}
                      </div>
                    </li>
                  )) : <p className="no-items-message">Aucune conversation privée.</p>}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>

      {roomToJoin && <JoinRoomModal room={roomToJoin} onClose={() => setRoomToJoin(null)} />}
      {isNewConversationModalOpen && <NewConversationModal onClose={() => setIsNewConversationModalOpen(false)} />}
    </>
  );
};