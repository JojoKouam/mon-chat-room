// // frontend/src/components/chat/UserList.jsx

// import React from 'react';
// import './UserList.css'; // On créera ce fichier juste après

// export default function UserList({ users, onUserClick }) {
//   if (!users || users.length === 0) {
//     return <p className="user-list-empty">Aucun utilisateur trouvé.</p>;
//   }

//   return (
//     <ul className="user-list">
//       {users.map(user => (
//         <li key={user.id} className="user-list-item" onClick={() => onUserClick(user)}>
//           <div className="user-list-avatar">
//             {user.username.charAt(0).toUpperCase()}
//           </div>
//           <span className="user-list-name">{user.username}</span>
//         </li>
//       ))}
//     </ul>
//   );
// }


import React from 'react';
import './UserList.css';

// On crée ce fichier juste après
export default function UserList({ users, onUserClick }) {
  // CORRECTION : On vérifie que `users` est bien un tableau avant de faire .map()
  // S'il n'y a pas d'utilisateurs ou que le prop n'est pas un tableau, on affiche un message.
  if (!Array.isArray(users) || users.length === 0) {
    return <p className="user-list-empty">Aucun utilisateur trouvé.</p>;
  }

  return (
    <ul className="user-list">
      {users.map((user) => (
        <li key={user.id} className="user-list-item" onClick={() => onUserClick(user)}>
          <img 
            src={user.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(user.username)}`} 
            alt={user.username} 
            className="user-list-avatar"
          />
          <span className="user-list-name">{user.username}</span>
        </li>
      ))}
    </ul>
  );
}