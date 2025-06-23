// frontend/src/components/chat/MainSidebar.jsx

import React from 'react';
import './MainSidebar.css';
import { useNavigate } from 'react-router-dom'; // On importe useNavigate pour la navigation
import AuthContext from '../../context/AuthContext'; // On importe le contexte ici aussi


// Récupère 'setNavMode' et 'onLogout' depuis les props
export default function MainSidebar({ setNavMode, onOpenSettings }) {
  // On utilise useContext pour accéder au contexte d'authentification
  const { logout } = React.useContext(AuthContext);
    const navigate = useNavigate(); // On récupère la fonction pour naviguer

  // Fonction de déconnexion
  const handleLogout = () => {
    logout(navigate); // Appelle la fonction de déconnexion du contexte
  };
  return (
    <nav className="main-sidebar-container">
      <div> {/* Conteneur pour les icônes du haut */}
        <div 
          className="main-sidebar-brand" 
          onClick={() => setNavMode('dms')} // On s'assure que ça ramène aux DMs
          title="Accueil / Messages Privés"
        >
          {/* --- CHANGEMENT ICI --- */}
          <span>🏠</span> 
        </div>
        <ul className="main-sidebar-nav">
          <li className="nav-item active" onClick={() => setNavMode('salons')} title="Salons">
            <span>💬</span>
          </li>
          <li className="nav-item" onClick={() => setNavMode('dms')} title="Messages Privés">
            <span>👥</span>
          </li>
        </ul>
      </div>

      {/* --- NOUVEAU : Section d'actions en bas --- */}
      <div className="main-sidebar-actions">
        <span className="action-icon" onClick={onOpenSettings} title="Paramètres">⚙️</span>
        <span className="action-icon" onClick={handleLogout} title="Déconnexion">🚪</span>
      </div>
    </nav>
  );
}