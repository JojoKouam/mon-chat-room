/* eslint-disable no-unused-vars */
import React, { useContext } from 'react';
import './IconSidebar.css';
import {AuthContext}from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// On reçoit les props du parent
export default function IconSidebar({ currentSidebarMode, onModeChange }) {
  const userAvatar = "https://i.pravatar.cc/50?u=currentuser";
    const { user, logout } = useContext(AuthContext);

  const navigate = useNavigate();

  if (!user) {
    return <div className="icon-sidebar-container"></div>;
  }

  const handleLogout = () => {
    logout(navigate);
  };

  return (
    <div className="icon-sidebar-container">
      <div className="profile-icon" title={user.username}>
        {/* On ajoute une sécurité supplémentaire au cas où username serait vide */}
        {user.username ? user.username.charAt(0).toUpperCase() : '?'}
      </div>
      <nav className="nav-icons">
        <ul>
          {/* On utilise les props pour le onClick et la classe 'active' */}
          <li 
            className={currentSidebarMode === 'dms' ? 'active' : ''} 
            onClick={() => onModeChange('dms')}
            title="Messages Privés"
          >
            <span>💬</span>
          </li>
          <li 
            className={currentSidebarMode === 'rooms' ? 'active' : ''} 
            onClick={() => onModeChange('rooms')}
            title="Salons Publics"
          >
            <span>👥</span>
          </li>
          <li title="Favoris"><span>🔖</span></li>
          <li title="Paramètres"><span>⚙️</span></li>
        </ul>
      </nav>
      <div className="logout-icon" onClick={handleLogout} title="Déconnexion">
        <span>🚪</span>
      </div>
    </div>
  );
}



