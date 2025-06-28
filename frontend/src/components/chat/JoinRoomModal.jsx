import React, { useContext } from 'react';
import {ChatContext}  from '../../context/ChatContext';
import './JoinRoomModal.css';

export default function JoinRoomModal({ room, onClose }) {
  const { joinRoom } = useContext(ChatContext);

  if (!room) return null;

  // On transforme la fonction en async pour pouvoir utiliser await
  const handleJoinClick = async () => {
    if (joinRoom) {
      try {
        await joinRoom(room.id); // On attend que la fonction se termine
        onClose(); // On ferme la modale SEULEMENT si ça a marché
      } catch (error) {
        // L'erreur est déjà gérée par un toast dans le contexte, donc on ne fait rien ici
        // La modale restera ouverte, ce qui est bien pour l'utilisateur
        console.error("Échec pour rejoindre le salon", error);
      }
    }
  };

  return (
    // Ton JSX est parfait, pas besoin de le changer
    <div className="modal-overlay" onClick={onClose}>
      <div className="join-room-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <button onClick={onClose} className="close-button">×</button>
        </div>
        <div className="modal-body">
          <h2>{room.nom}</h2>
          <p>{room.description}</p>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Fermer</button>
          <button className="btn-primary" onClick={handleJoinClick}>Rejoindre</button>
        </div>
      </div>
    </div>
  );
}