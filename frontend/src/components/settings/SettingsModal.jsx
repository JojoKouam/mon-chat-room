import React from 'react';
import './SettingsModal.css';

// Reçoit la fonction 'onClose' pour pouvoir se fermer
export default function SettingsModal({ onClose }) {
  return (
    // Le fond semi-transparent qui recouvre toute la page
    <div className="modal-overlay" onClick={onClose}>
      {/* La modale elle-même. 'e.stopPropagation()' empêche la fermeture si on clique à l'intérieur */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Paramètres</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="settings-menu">
            <ul>
              <li className="active">Mon Compte</li>
              <li>Profil</li>
              <li>Apparence</li>
            </ul>
          </div>
          <div className="settings-content">
            <h3>Mon Compte</h3>
            <p>Ici, vous pourrez modifier votre nom d'utilisateur, email, mot de passe et plus encore.</p>
            {/* On ajoutera les champs plus tard */}
          </div>
        </div>
      </div>
    </div>
  );
}