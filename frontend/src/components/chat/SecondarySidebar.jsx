// frontend/src/components/chat/SecondarySidebar.jsx

import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import ChatContext from '../../context/ChatContext';
import './SecondarySidebar.css';
import { getColorFromString } from '../utils/colorUtils'; // Assurez-vous d'avoir cette fonction utilitaire pour générer des couleurs

// Il reçoit les fonctions de son parent pour communiquer
export default function SecondarySidebar({ mode, setMobileView, onOpenJoinModal }) {
  const { user, loading: userLoading } = useContext(AuthContext);
  const { rooms, myRoomIds, loading: roomsLoading, selectRoom, activeRoom, startPrivateChat } = useContext(ChatContext);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]); // Initialisé à un tableau vide
  const [isSearching, setIsSearching] = useState(false);

  // useEffect pour la recherche
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim().length > 1) {
        setIsSearching(true);
        try {
          const res = await axios.get(`/api/users/search?query=${searchTerm}`);
          setSearchResults(res.data || []); // S'assurer que c'est toujours un tableau
        } catch (err) {
          console.error("Erreur de recherche", err);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleRoomClick = (roomId) => {
    if (selectRoom) selectRoom(roomId);
    setMobileView('chat');
  };

  const handleUserClick = async (foundUser) => {
    alert(`Bientôt, vous pourrez envoyer un message à ${foundUser.username} !`);

    const success = await startPrivateChat(foundUser.id);
    
    // Si la conversation a été ouverte avec succès...
    if (success) {
        // On bascule la vue mobile vers la fenêtre de chat
        setMobileView('chat');
        // Et on efface la recherche pour revenir à la vue normale des listes
        setSearchTerm('');
    }
  };

  // --- RENDU CONDITIONNEL DANS UNE VARIABLE POUR PLUS DE CLARTÉ ---
  let content;
  if (searchTerm.length > 1) {
    content = (
      <div className="rooms-list">
        <h3>Résultats de la recherche</h3>
        {isSearching ? <p className="no-rooms-message">Recherche...</p> : (
          <ul>
            {/* On vérifie que searchResults est bien un tableau avant de mapper */}
            {Array.isArray(searchResults) && searchResults.map(foundUser => (
              <li key={foundUser.id} className="room-item" onClick={() => handleUserClick(foundUser)}>
                <div className="room-avatar">{foundUser.username.charAt(0).toUpperCase()}</div>
                <div className="room-info">
                  <span className="room-name">{foundUser.username}</span>
                  <span className="room-description">{foundUser.email}</span>
                </div>
              </li>
            ))}
            {!isSearching && searchResults.length === 0 && <p className="no-rooms-message">Aucun utilisateur trouvé.</p>}
          </ul>
        )}
      </div>
    );
  } else {
    const myRooms = rooms.filter(room => myRoomIds.includes(room.id));
    const exploreRooms = rooms.filter(room => !myRoomIds.includes(room.id));

    content = (
      <>
        {mode === 'salons' && (
          <>
            <div className="rooms-list">
              <h3>MES SALONS</h3>
              {myRooms.length > 0 ? (
                <ul>{myRooms.map(room => (<li key={room.id} className={room.id === activeRoom ? 'room-item active' : 'room-item'} onClick={() => handleRoomClick(room.id)}>
                  <div className="room-avatar" style={{ backgroundColor: getColorFromString(room.nom) }}>
                    {room.nom.charAt(0)}
                  </div>
                  <div className="room-info">
                    <span className="room-name">{room.nom}</span>
                    <span className="room-description">{room.description}</span>
                  </div>
                </li>))}</ul>
              ) : (<p className="no-rooms-message">Vous n'avez rejoint aucun salon.</p>)}
            </div>
            <div className="rooms-list">
              <h3>EXPLORER</h3>
              <ul>{exploreRooms.map(room => (<li key={room.id} className="room-item" onClick={() => onOpenJoinModal(room)}>
                <div className="room-avatar" style={{ backgroundColor: getColorFromString(room.nom) }}>{room.nom.charAt(0)}</div>
                <div className="room-info">
                  <span className="room-name">{room.nom}</span>
                  <span className="room-description">{room.description}</span>
                </div>
              </li>))}</ul>
            </div>
          </>
        )}
        {mode === 'dms' && (<div className="dms-list"><h3>MESSAGES PRIVÉS</h3><p className="no-rooms-message">Fonctionnalité à venir.</p></div>)}
      </>
    );
  }

  if (userLoading || roomsLoading) {
    return <div className="secondary-sidebar-container">Chargement...</div>;
  }

  return (
    <div className="secondary-sidebar-container">
      <div className="secondary-sidebar-header">
        <div className="search-bar">
          <input type="text" placeholder="Rechercher des utilisateurs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>
      <div className="sidebar-content">{content}</div>
      {user && (<div className="user-profile"><div className="profile-info"><div className="profile-avatar">{user.username.charAt(0).toUpperCase()}</div><div className="profile-details"><span className="profile-name">{user.username}</span><span className="profile-status"><span className="status-dot"></span>En ligne</span></div></div></div>)}
    </div>
  );
}