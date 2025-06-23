import React, { useState } from 'react';
import { ChatProvider } from '../context/ChatContext';
import MainSidebar from '../components/chat/MainSidebar';
import SecondarySidebar from '../components/chat/SecondarySidebar';
import ChatWindow from '../components/chat/ChatWindow';
import SettingsModal from '../components/settings/SettingsModal';
import JoinRoomModal from '../components/chat/JoinRoomModal';
import './ChatPage.css';

export default function ChatPage() {
  const [navMode, setNavMode] = useState('salons');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [mobileView, setMobileView] = useState('sidebar');
  const [roomToJoin, setRoomToJoin] = useState(null);

  return (
    <ChatProvider>
      <div className={`chat-page-container mobile-view-${mobileView}`}>
        <MainSidebar 
          setNavMode={setNavMode} 
          onOpenSettings={() => setIsSettingsOpen(true)} 
        />
        <SecondarySidebar 
          mode={navMode} 
          setMobileView={setMobileView}
          onOpenJoinModal={setRoomToJoin}
        />
        <ChatWindow 
          setMobileView={setMobileView} 
        />
        
        {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
        
        <JoinRoomModal 
          room={roomToJoin} 
          onClose={() => setRoomToJoin(null)}
        />
      </div>
    </ChatProvider>
  );
}