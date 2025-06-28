// frontend/src/pages/ChatPage.jsx

import React, { useState } from 'react';

// On importe les 4 composants qui forment notre page
import IconSidebar from '../components/chat/IconSidebar';
import NewSidebar from '../components/chat/NewSidebar'; // Tu avais MainSidebar et SecondarySidebar, on les fusionne dans NewSidebar pour plus de simplicité
import ChatWindow from '../components/chat/ChatWindow';
import InfoPanel from '../components/chat/InfoPanel';
import SettingsModal from '../components/chat/SettingsModal';

// On importe le CSS qui va gérer notre layout
import './ChatPage.css';

export default function ChatPage() {
  // Un état simple pour savoir si on affiche les "salons" ou les "messages privés"
  const [sidebarMode, setSidebarMode] = useState('rooms'); // 'rooms' = salons, 'dms' = messages privés
      const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    // C'est notre conteneur principal. Le CSS va lui donner un layout en grille.
    <div className="chat-page-container">
      
      {/* 1ère colonne : La barre d'icônes. On lui passe la fonction pour changer de mode. */}
 <IconSidebar 
        currentMode={sidebarMode} 
        onModeChange={setSidebarMode} // On utilise un nom de prop clair : "onModeChange"
        onSettingsClick={() => setIsSettingsOpen(true)}
      />
      {/* 2ème colonne : La liste des salons/messages. On lui passe le mode à afficher. */}
      <NewSidebar mode={sidebarMode} />

      {/* 3ème colonne : La fenêtre de conversation. */}
      <ChatWindow />

      {/* 4ème colonne : Le panneau d'informations. */}
      <InfoPanel />
      {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}

    </div>
  );
}