// frontend/src/components/chat/NewConversationModal.jsx

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import UserList from './UserList';
import { ChatContext } from '../../context/ChatContext';
import './NewConversationModal.css'; // On créera ce fichier

export default function NewConversationModal({ onClose }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { startConversation } = useContext(ChatContext); // On va créer cette fonction

  // Charger la liste des utilisateurs à l'ouverture de la modale
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('/api/users/list'); // On appelle la nouvelle route
        setUsers(res.data);
      } catch (error) {
        console.error("Erreur de chargement des utilisateurs", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleUserClick = async (user) => {
    // On appelle la fonction du contexte pour démarrer la convo
    if (startConversation) {
      await startConversation(user.id);
      onClose(); // On ferme la modale après avoir démarré la conversation
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Démarrer une nouvelle conversation</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        <div className="modal-body">
          {loading ? <p>Chargement des utilisateurs...</p> : <UserList users={users} onUserClick={handleUserClick} />}
        </div>
      </div>
    </div>
  );
}