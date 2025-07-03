// // frontend/src/components/chat/NewConversationModal.jsx

// import React, { useState, useEffect} from 'react';
// import axios from 'axios';
// import UserList from './UserList';
// import { useChatContext } from '../../context/ChatContext';
// import './NewConversationModal.css'; // On créera ce fichier

// export default function NewConversationModal({ onClose }) {
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const { startConversation } = useChatContext(); // On va créer cette fonction

//   // Charger la liste des utilisateurs à l'ouverture de la modale
//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const res = await axios.get('/api/users/list'); // On appelle la nouvelle route
//         setUsers(res.data);
//       } catch (error) {
//         console.error("Erreur de chargement des utilisateurs", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchUsers();
//   }, []);

//   const handleUserClick = async (user) => {
//     // On appelle la fonction du contexte pour démarrer la convo
//     if (startConversation) {
//       await startConversation(user.id);
//       onClose(); // On ferme la modale après avoir démarré la conversation
//     }
//   };

//   return (
//     <div className="modal-overlay" onClick={onClose}>
//       <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//         <div className="modal-header">
//           <h2>Démarrer une nouvelle conversation</h2>
//           <button onClick={onClose} className="close-button">×</button>
//         </div>
//         <div className="modal-body">
//           {loading ? <p>Chargement des utilisateurs...</p> : <UserList users={users} onUserClick={handleUserClick} />}
//         </div>
//       </div>
//     </div>
//   );
// }





import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UserList from './UserList'; // Assure-toi que le chemin est bon
import { useChatContext } from '../../context/ChatContext';
import './NewConversationModal.css';

export default function NewConversationModal({ isOpen, onClose }) {
  // CORRECTION : Initialiser l'état `users` avec un tableau vide []
  const [users, setUsers] = useState([]); 
  const [loading, setLoading] = useState(true);
  const { startConversation } = useChatContext();

  useEffect(() => {
    // Si la modale n'est pas ouverte, on ne fait rien.
    if (!isOpen) return;

    const fetchUsers = async () => {
      setLoading(true); // Remettre à true à chaque ouverture
      try {
        // On récupère la liste de tous les utilisateurs (sauf soi-même)
        const res = await axios.get('/api/users/list'); 
        setUsers(res.data);
      } catch (error) {
        console.error("Erreur de chargement des utilisateurs", error);
        setUsers([]); // En cas d'erreur, on met un tableau vide
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isOpen]); // On déclenche l'effet à chaque fois que `isOpen` change.

  const handleUserClick = async (user) => {
    if (startConversation) {
      // La fonction startConversation gère déjà la logique de création/sélection
      await startConversation(user.id); 
    }
    onClose(); // On ferme la modale après avoir démarré la conversation
  };
  
  // Si la modale n'est pas ouverte, on n'affiche rien.
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Démarrer une nouvelle conversation</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        <div className="modal-body">
          {loading ? (
            <p>Chargement des utilisateurs...</p>
          ) : (
            <UserList users={users} onUserClick={handleUserClick} />
          )}
        </div>
      </div>
    </div>
  );
}