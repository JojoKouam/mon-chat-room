import React, { useContext } from 'react';
import ChatContext from '../../context/ChatContext';
import './JoinRoomModal.css';

export default function JoinRoomModal({ room, onClose }) {
  const { joinRoom } = useContext(ChatContext);

  if (!room) return null;

  const handleJoinClick = () => {
    if (joinRoom) {
      joinRoom(room.id);
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="join-room-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <button className="close-button" onClick={onClose}>×</button>
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