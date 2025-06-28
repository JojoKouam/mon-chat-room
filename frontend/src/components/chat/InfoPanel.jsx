// frontend/src/components/chat/InfoPanel.jsx

import React, { useContext } from 'react';
import { ChatContext } from '../../context/ChatContext';
import './InfoPanel.css';

// --- Sous-composant pour afficher les infos d'un salon public ---
const RoomInfo = ({ room, messages }) => {
  const imageMessages = messages.filter(m => m.type === 'image');

  return (
    <>
      <div className="profile-section">
        <h3 className="profile-name">{room.nom}</h3>
        <p className="room-description">{room.description}</p>
      </div>
      <div className="info-section">
        <p><strong>Participants (1)</strong></p> {/* A rendre dynamique plus tard */}
      </div>
      <div className="shared-media-section">
        <div className="section-header">
          <h4>Média partagé</h4>
          {imageMessages.length > 0 && <a href="#">Voir tout</a>}
        </div>
        <div className="media-grid">
          {imageMessages.slice(0, 4).map(msg => (
            <img key={msg.id} src={msg.content} alt="media partagé" className="media-grid-img" />
          ))}
          {imageMessages.length === 0 && <p className="no-media">Aucun média partagé.</p>}
        </div>
      </div>
    </>
  );
};

// --- Sous-composant pour afficher le profil d'un utilisateur ---
const UserProfileInfo = ({ user, messages }) => {
  const imageMessages = messages.filter(m => m.type === 'image');
  
  return (
    <>
      <div className="profile-section">
        <img src={user.avatar_url || 'https://i.pravatar.cc/150?u=' + user.id} alt="avatar" className="profile-avatar-large" />
        <h3 className="profile-name">{user.username}</h3>
        <span className="profile-status">En ligne</span>
      </div>
      <div className="info-section">
        <h4>Informations</h4>
        <div className="info-item">
          <p><strong>Email:</strong> {user.email || 'Non renseigné'}</p>
        </div>
        <div className="info-item">
          <p><strong>Localisation:</strong> {user.location || 'Non renseigné'}</p>
        </div>
      </div>
      <div className="shared-media-section">
        <div className="section-header">
          <h4>Média partagé</h4>
          {imageMessages.length > 4 && <a href="#">Voir tout</a>}
        </div>
        {imageMessages.length > 0 ? (
          <div className="media-grid">
            {imageMessages.slice(0, 4).map(msg => (
              <img key={msg.id} src={msg.content} alt="media partagé" className="media-grid-img" />
            ))}
          </div>
        ) : (
          <p className="no-media">Aucun média partagé.</p>
        )}
      </div>
    </>
  );
};


// --- Le composant principal InfoPanel ---
export default function InfoPanel() {
  const { activeRoom, activeEntityDetails, messages } = useContext(ChatContext);

  if (!activeRoom || !activeEntityDetails) {
    return <div className="info-panel-container placeholder"></div>;
  }
  
  // CORRECTION : On vérifie si la propriété 'type' existe dans l'objet.
  // Si elle existe, c'est un salon. Sinon, c'est un profil utilisateur.
  const isUserProfile = activeEntityDetails.type === undefined;

  return (
    <div className="info-panel-container">
      {isUserProfile ? (
        <UserProfileInfo user={activeEntityDetails} messages={messages} />
      ) : (
        <RoomInfo room={activeEntityDetails} messages={messages} />
      )}
    </div>
  );
}