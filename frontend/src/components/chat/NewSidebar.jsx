// frontend/src/components/chat/NewSidebar.jsx

import React, {  useState, useEffect } from 'react';
import axios from 'axios';
import { useChatContext } from '../../context/ChatContext';
import { useAuthContext } from '../../context/AuthContext';
import JoinRoomModal from './JoinRoomModal';
import RoomModal from './RoomModal'; // <-- Importer la nouvelle modale
import NewConversationModal from './NewConversationModal';
import './NewSidebar.css';
import { useNavigate } from 'react-router-dom'; // <-- NOUVEL IMPORT

export default function NewSidebar({ mode }) {
    const navigate = useNavigate(); // <-- NOUVEAU HOOK

    const { user } = useAuthContext(); // On récupère l'utilisateur connecté

  const {
    rooms, myRoomIDs, conversations, loading, activeRoom,
    startConversation, deleteRoom
  } = useChatContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roomToEdit, setRoomToEdit] = useState(null); // Pour savoir si on édite ou on crée

  const [roomToJoin, setRoomToJoin] = useState(null);
  // const [isNewConversationModalOpen, setIsNewConversationModalOpen] = useState(false);
  const [showNewConversationModal, setNewConversationModalOpen] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

   const handleOpenCreateModal = () => {
        setRoomToEdit(null); // On s'assure qu'on est en mode création
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (room) => {
        setRoomToEdit(room); // On passe la salle à éditer
        setIsModalOpen(true);
    };
    
    const handleDelete = (e, roomId) => {
        e.stopPropagation(); // Empêche de sélectionner la salle en même temps qu'on la supprime
        deleteRoom(roomId);
    };

    

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

  const myJoinedRooms = Array.isArray(rooms) && Array.isArray(myRoomIDs)
    ? rooms.filter(r => myRoomIDs.includes(r.id))
    : [];

  const exploreRooms = Array.isArray(rooms) && Array.isArray(myRoomIDs)
    ? rooms.filter(r => !myRoomIDs.includes(r.id))
    : [];

     // AJOUTE CES CONSOLE.LOG POUR DÉBOGUER
  // console.log("Données du Contexte:", { rooms, myRoomIDs, conversations });
  // console.log("Salons filtrés:", { myJoinedRooms, exploreRooms });

  if (!user) {
    return <div className="new-sidebar-container">Chargement...</div>;
  }

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
  
  
  return (
    <div className="new-sidebar-container">
      {/* AFFICHER LA MODALE */}
      <RoomModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        roomToEdit={roomToEdit}
      />
      <NewConversationModal
        isOpen={showNewConversationModal}
        onClose={() => setNewConversationModalOpen(false)}
      />

      <div className="sidebar-content">
        {mode === 'rooms' && (
          <>
            <div className="sidebar-section">
              <h4>Mes Salons</h4>
              <ul className="conversations-list">
                {/* CORRECTION : On utilise `myJoinedRooms?.map` pour ne mapper que si le tableau existe. */}
                {myJoinedRooms?.length > 0 ? (
                  myJoinedRooms.map(room => (
                    <li key={room.id} className={`conversation-item ${activeRoom === room.id ? 'active' : ''}`}  onClick={() => navigate(`/chat/room/${room.id}`)}>
                      <div className="room-avatar-placeholder">{room.name.charAt(0).toUpperCase()}</div>
                      <div className="convo-details">
                        <span className="convo-name">{room.name}</span>
                      </div>
                      {/* Afficher les boutons modifier/supprimer seulement si l'utilisateur est le propriétaire */}
                      {user.id === room.owner_id && (
                        <div className="room-actions">
                          <button onClick={(e) => {e.stopPropagation(); handleOpenEditModal(room); }}>✏️</button>
                          <button onClick={(e) => handleDelete(e, room.id)}>🗑️</button>
                        </div>
                      )}
                    </li>
                  ))
                ) : (
                  <p className="no-items-message">Vous n'avez rejoint aucun salon.</p>
                )}
              </ul>
            </div>

            <div className="sidebar-section">
              <div className="section-header">
                <h4>Explorer</h4>
                <button onClick={handleOpenCreateModal} className="add-btn">+</button>
              </div>
              <ul className="conversations-list">
                {/* CORRECTION : On utilise `exploreRooms?.map` pour ne mapper que si le tableau existe. */}
                {exploreRooms?.length > 0 ? (
                  exploreRooms.map(room => (
                    <li key={room.id} className="conversation-item" onClick={() => setRoomToJoin(room)}>
                      <div className="room-avatar-placeholder">{room.name.charAt(0).toUpperCase()}</div>
                      <div className="convo-details">
                        <span className="convo-name">{room.name}</span>
                      </div>
                    </li>
                  ))
                ) : (
                   <p className="no-items-message">Aucun salon à explorer.</p>
                )}
              </ul>
            </div>
          </>
        )}

        {mode === 'dms' && (
          <>
            <div className="sidebar-section">
              <h4>En ligne</h4>
              <ul className="online-users-list">
                 {/* CORRECTION : On utilise `onlineUsers?.map` pour ne mapper que si le tableau existe. */}
                {onlineUsers?.length > 0 ? (
                  onlineUsers.map(onlineUser => (
                    <li key={onlineUser.onlineId} className="online-user-item" onClick={() => handleStartConversationClick(onlineUser.onlineId)}>
                      <div className="user-avatar-online">
                        <img src={`https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(onlineUser.username)}`} alt={onlineUser.username}/>
                        <span className="online-indicator"></span>
                      </div>
                    </li>
                  ))
                ) : (
                  <p className="no-items-message">Personne en ligne.</p>
                )}
              </ul>
            </div>

            <div className="sidebar-section">
               <div className="section-header">
                <h4>Messages</h4>
                <button onClick={() => setNewConversationModalOpen(true)} className="add-btn">+</button>
              </div>
              <ul className="conversations-list">
                {/* CORRECTION : On utilise `conversations?.map` pour ne mapper que si le tableau existe. */}
                {Array.isArray(conversations) && conversations.length > 0 ? (
          conversations.map(convo=> (
                    <li key={convo.id} className={`conversation-item ${activeRoom === convo.id ? 'active' : ''}`} onClick={() => navigate(`/chat/conversation/${convo.id}`)}>
                       <img src={convo.other_user_avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(convo.other_user_name)}`} alt={convo.other_user_name} className="conversation-item-img"/>
                      <div className="convo-details">
                        <span className="convo-name">{convo.other_user_name}</span>
                        <p className="convo-last-message">
                          {convo.last_message_type === 'image' ? '🖼️ Une image a été partagée' : (convo.last_message_content || 'Aucun message')}
                        </p>
                      </div>
                      <div className="convo-meta">
                        <span className="convo-timestamp">{new Date(convo.last_message_created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {convo.unread_count > 0 && (
                          <span className="unread-badge">{convo.unread_count}</span>
                        )}
                      </div>
                    </li>
                  ))
                ) : (
                  <p className="no-items-message">Aucune conversation privée.</p>
                )}
              </ul>
            </div>
          </>
        )}
      </div>

      {/* MODALE POUR REJOINDRE UNE SALLE (Simplifiée) */}
      {roomToJoin && (
        <RoomModal 
          isOpen={!!roomToJoin} 
          onClose={() => setRoomToJoin(null)} 
          roomToJoin={roomToJoin}
        />
      )}
    </div>
  );
};



// import React, { useState } from 'react';
// import { useChatContext } from '../../context/ChatContext.jsx';
// import RoomModal from './RoomModal.jsx';
// import NewConversationModal from './NewConversationModal.jsx';
// import './NewSidebar.css';

// export default function NewSidebar({ mode }) {
//     // On récupère TOUT ce dont on a besoin depuis le contexte
//     const { 
//         rooms, myRoomIds, conversations, loading, selectRoom, activeRoom, 
//         startConversation, onlineUsers 
//     } = useChatContext();

//     // États locaux pour gérer l'ouverture des modales
//     const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
//     const [roomToEdit, setRoomToEdit] = useState(null);
//     const [isNewConversationModalOpen, setIsNewConversationModalOpen] = useState(false);

//     // Fonctions pour gérer les modales
//     const handleOpenCreateModal = () => {
//         setRoomToEdit(null);
//         setIsRoomModalOpen(true);
//     };

    
//     // Si les données sont en train de charger, on affiche un message
//     if (loading) {
//         return <div className="new-sidebar-container">Chargement...</div>;
//     }

//     // On filtre les salons pour l'affichage
//     const myJoinedRooms = rooms.filter(r => myRoomIds.includes(r.id));
//     const exploreRooms = rooms.filter(r => !myRoomIds.includes(r.id));

//     return (
//         <>
//             <div className="new-sidebar-container">
//                 {/* Section pour les salons publics */}
//                 {mode === 'rooms' && (
//                     <>
//                         <div className="sidebar-section">
//                             <h4>Mes Salons</h4>
//                             <ul className="conversations-list">
//                                 {myJoinedRooms.map(room => (
//                                     <li key={room.id} className={`conversation-item ${activeRoom === room.id ? 'active' : ''}`} onClick={() => selectRoom(room.id)}>
//                                         <div className="conversation-item-avatar-placeholder">{room.name?.charAt(0).toUpperCase()}</div>
//                                         <div className="convo-details">
//                                             <span className="convo-name">{room.name}</span>
//                                         </div>
//                                         {/* <button onClick={(e) => handleDeleteClick(e, room.id)}>X</button> */}
//                                     </li>
//                                 ))}
//                             </ul>
//                         </div>
//                         <div className="sidebar-section">
//                             <div className="section-header">
//                                 <h4>Explorer</h4>
//                                 <button className="add-btn" onClick={handleOpenCreateModal}>+</button>
//                             </div>
//                             <ul className="conversations-list">
//                                 {exploreRooms.map(room => (
//                                     <li key={room.id} className={`conversation-item ${activeRoom === room.id ? 'active' : ''}`} onClick={() => selectRoom(room.id)}>
//                                         <div className="conversation-item-avatar-placeholder">{room.name?.charAt(0).toUpperCase()}</div>
//                                         <div className="convo-details">
//                                             <span className="convo-name">{room.name}</span>
//                                         </div>
//                                     </li>
//                                 ))}
//                             </ul>
//                         </div>
//                     </>
//                 )}

//                 {/* Section pour les messages privés */}
//                 {mode === 'dms' && (
//                     <>
//                         <div className="sidebar-section">
//                             <h4>En ligne</h4>
//                             <ul className="online-users-list">
//                                 {onlineUsers.map(onlineUserId => (
//                                     <li key={onlineUserId} className="online-user-item" onClick={() => startConversation(onlineUserId)}>
//                                         {/* Tu devras trouver le nom de l'utilisateur ici plus tard */}
//                                         <span>User {onlineUserId}</span>
//                                     </li>
//                                 ))}
//                             </ul>
//                         </div>
//                         <div className="sidebar-section">
//                             <div className="section-header">
//                                 <h4>Messages</h4>
//                                 <button className="add-btn" onClick={() => setIsNewConversationModalOpen(true)}>+</button>
//                             </div>
//                             <ul className="conversations-list">
//                                 {conversations.map(convo => (
//                                      <li key={convo.id} className={`conversation-item ${activeRoom === convo.id ? 'active' : ''}`} onClick={() => selectRoom(convo.id)}>
//                                         <img src={convo.other_user_avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${convo.other_user_name}`} alt={convo.other_user_name} className="conversation-item-img" />
//                                         <div className="convo-details">
//                                             <span className="convo-name">{convo.other_user_name}</span>
//                                             <p className="convo-last-message">{convo.last_message_content || 'Aucun message'}</p>
//                                         </div>
//                                     </li>
//                                 ))}
//                             </ul>
//                         </div>
//                     </>
//                 )}
//             </div>

//             {/* Les modales */}
//             {isRoomModalOpen && <RoomModal roomToEdit={roomToEdit} onClose={() => setIsRoomModalOpen(false)} />}
//             {isNewConversationModalOpen && <NewConversationModal onClose={() => setIsNewConversationModalOpen(false)} />}
//         </>
//     );
// }