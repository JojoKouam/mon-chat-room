// frontend/src/components/chat/UserList.jsx

import React from 'react';
import './UserList.css'; // On créera ce fichier juste après

export default function UserList({ users, onUserClick }) {
  if (!users || users.length === 0) {
    return <p className="user-list-empty">Aucun utilisateur trouvé.</p>;
  }

  return (
    <ul className="user-list">
      {users.map(user => (
        <li key={user.id} className="user-list-item" onClick={() => onUserClick(user)}>
          <div className="user-list-avatar">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <span className="user-list-name">{user.username}</span>
        </li>
      ))}
    </ul>
  );
}