/* eslint-disable no-unused-vars */
import React, { useContext } from 'react';
import './IconSidebar.css';
import {useAuthContext}from '../../context/AuthContext';
import { useNavigate, Link} from 'react-router-dom';

// On reçoit les props du parent
export default function IconSidebar({ currentSidebarMode, onModeChange, onSettingsClick }) {
  const userAvatar = "https://i.pravatar.cc/50?u=currentuser";
    const { user, logout } = useAuthContext();

  const navigate = useNavigate();

  // Si l'utilisateur n'est pas encore chargé, on peut afficher un placeholder
    if (!user) {
        return <div className="icon-sidebar-container" style={{ backgroundColor: '#e0e0e0' }}></div>;
    }

    // On calcule la source de l'avatar, comme dans la modale
  const avatarSrc = user.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(user.username)}`;
  const handleLogout = () => {
    logout(navigate);
  };

  return (
    <div className="icon-sidebar-container">
      <div className="profile-icon" title={user.username}>
                <img src={avatarSrc} alt="Mon avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}/>
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
          <li title="Paramètres" onClick={onSettingsClick} style={{ cursor: 'pointer' }}>
            <span>⚙️</span>
          </li>
        </ul>
      </nav>
      <div className="logout-icon" onClick={handleLogout} title="Déconnexion">
        <span>🚪</span>
      </div>
    </div>
  );
}



