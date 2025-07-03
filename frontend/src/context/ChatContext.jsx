/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-refresh/only-export-components */
/* eslint-disable no-unused-vars */
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuthContext } from './AuthContext';
import { useParams, useLocation } from 'react-router-dom'; // <-- NOUVEL IMPORT

const ChatContext = createContext();

export const useChatContext = () => {
  return useContext(ChatContext);
};


export const ChatProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuthContext();
  const params = useParams(); // <-- NOUVEAU HOOK pour lire les paramètres de l'URL
  const location = useLocation(); // Pour extraire le type et l'id de /chat/*

  // Extraire le type et l'id de l'URL
  const pathParts = location.pathname.split('/').filter(p => p); // ex: ['chat', 'room', '3']
  const entityType = pathParts[1];
  const entityId = pathParts[2];

  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  
  // États du Chat
  const [rooms, setRooms] = useState([]);
  const [myRoomIDs, setMyRoomIDs] = useState([]);
  const [conversations, setConversations] = useState([]);
  
  // États de l'UI
  const [loading, setLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [activeRoom, setActiveRoom] = useState(null);
  const [activeEntityDetails, setActiveEntityDetails] = useState(null);
  const [activeRoomMembers, setActiveRoomMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState(null);

  // --- GESTION DE LA CONNEXION SOCKET ---
  // useEffect(() => {
  //   if (user && !socket) {
  //     const newSocket = io('http://localhost:4000', {
  //       auth: { token: localStorage.getItem('chat-token') }
  //     });

  //     setSocket(newSocket);

  //     return () => {
  //       newSocket.disconnect();
  //       setSocket(null);
  //     };
  //   } else if (!user && socket) {
  //     socket.disconnect();
  //     setSocket(null);
  //   }
  // }, [user, socket]);
  useEffect(() => {
    if (user) {
      const newSocket = io("http://localhost:4000", {
        auth: { token: localStorage.getItem("chat-token") },
      });
      setSocket(newSocket);
      return () => newSocket.close();
    }
  }, [user]);


  // --- GESTION DES ÉCOUTEURS D'ÉVÉNEMENTS SOCKET ---
  useEffect(() => {
    if (!socket) return;
    
    const handleConnect = () => console.log('Socket connecté avec succès ! ID:', socket.id);
    const handleUpdateOnlineUsers = (users) => setOnlineUsers(users);
    const handleReceiveMessage = (newMessage) => {
        // Mettre à jour les messages seulement si on est dans la bonne salle
        if (newMessage.room_id === activeRoom) {
            setMessages(prev => [...prev, newMessage]);
        }
        toast('Nouveau message !', { icon: '💬' });
        // Optionnel : Mettre à jour la liste des conversations pour afficher "Nouveau message"
        fetchInitialData();
    };
    const handleUserTyping = ({ username }) => setTypingUser(username);
    const handleUserStoppedTyping = () => setTypingUser(null);
    const handleConnectError = (err) => toast.error(`Erreur de connexion chat: ${err.message}`);

    socket.on('connect', handleConnect);
    socket.on('update-online-users', handleUpdateOnlineUsers);
    socket.on('receive_message', handleReceiveMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stopped_typing', handleUserStoppedTyping);
    socket.on('connect_error', handleConnectError);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('update-online-users', handleUpdateOnlineUsers);
      socket.off('receive_message', handleReceiveMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stopped_typing', handleUserStoppedTyping);
      socket.off('connect_error', handleConnectError);
    };
  }, [socket, activeRoom]); // On ajoute activeRoom pour la logique de receive_message


  // --- CHARGEMENT DES DONNÉES INITIALES ---
  const fetchInitialData = useCallback(async () => {
    if (authLoading || !user) return; // Ne rien faire tant que l'auth n'est pas terminée

    setLoading(true);
    try {
      const [roomsRes, convosRes] = await Promise.all([
        axios.get('/api/rooms'),
        axios.get('/api/conversations')
      ]);

      if (roomsRes?.data) {
        setRooms(roomsRes.data.allRooms || []);
        setMyRoomIDs(roomsRes.data.myRoomIDs || []);
      }
      if (convosRes?.data) {
        setConversations(convosRes.data || []);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données initiales:", error);
      toast.error("Impossible de charger les données du chat.");
      setRooms([]);
      setMyRoomIDs([]);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [user, authLoading]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // --- NOUVEAU : SÉLECTION AUTOMATIQUE BASÉE SUR L'URL ---
  useEffect(() => {
    // Si l'URL a changé et contient un ID, on charge les données
    if (entityId && entityId !== activeRoom?.toString()) {
      selectRoom(entityId);
    } else if (!entityId) {
      // Si on est sur /chat, on vide tout
      setActiveRoom(null);
      setMessages([]);
      setActiveEntityDetails(null);
    }
  }, [entityId]); // Cet effet se déclenche UNIQUEMENT quand l'ID dans l'URL change

  // --- FONCTIONS EXPOSÉES PAR LE CONTEXTE ---

  const selectRoom = useCallback(async (roomId) => {
    if (!roomId) return;
    
    // Émettre un événement pour quitter l'ancienne salle, si elle existe
    if (socket && activeRoom) socket.emit('leave_room', activeRoom);

    setActiveRoom(roomId);
    setIsLoadingMessages(true);
    try {
      const res = await axios.get(`/api/rooms/${roomId}/messages`);
      setMessages(res.data.messages || []);
      setActiveRoomMembers(res.data.members || []);

      // Mettre à jour les détails de l'entité active pour l'affichage dans le header
      const allEntities = [...rooms, ...conversations];
      const details = allEntities.find(e => e.id == roomId);
      setActiveEntityDetails(details);
      
      // Rejoindre la nouvelle salle sur le serveur socket
      if (socket) socket.emit('join_room', roomId);
    } catch (error) {
      toast.error("Impossible de charger les informations du salon.");
    } finally {
      setIsLoadingMessages(false);
    }
  }, [socket, rooms, conversations, activeRoom]); // On ajoute activeRoom pour la logique de leave_room
  
  const sendMessage = useCallback((content, type = 'text') => {
    if (socket && activeRoom && content.trim()) {
      socket.emit('send_message', {
        roomId: activeRoom,
        content: content.trim(),
        type: type
      });
    }
  }, [socket, activeRoom]);

  const createRoom = useCallback(async (roomData) => {
    try {
      await axios.post('/api/rooms', roomData);
      toast.success("Salle créée avec succès !");
      await fetchInitialData(); // Recharger les données
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la création.");
      return false;
    }
  }, [fetchInitialData]);

  const updateRoom = useCallback(async (roomId, roomData) => {
    try {
      await axios.put(`/api/rooms/${roomId}`, roomData);
      toast.success("Salle mise à jour !");
      await fetchInitialData();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la mise à jour.");
      return false;
    }
  }, [fetchInitialData]);

  const deleteRoom = useCallback(async (roomId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette salle ?")) {
      try {
        await axios.delete(`/api/rooms/${roomId}`);
        if (activeRoom === roomId) setActiveRoom(null);
        toast.success("Salle supprimée !");
        await fetchInitialData();
      } catch (error) {
        toast.error(error.response?.data?.message || "Erreur lors de la suppression.");
      }
    }
  }, [fetchInitialData, activeRoom]);

  const startConversation = useCallback(async (targetUserId) => {
    try {
        const res = await axios.post('/api/conversations/start', { targetUserId });
        await fetchInitialData();
        // Sélectionner directement la nouvelle conversation
        selectRoom(res.data.roomId);
        toast.success("Prêt à discuter !");
    } catch(error) {
        toast.error("Impossible de démarrer la conversation.");
    }
  }, [fetchInitialData, selectRoom]);

  const emitStartTyping = useCallback(() => {
    if (socket && activeRoom) {
      socket.emit('start_typing', { roomId: activeRoom, username: user.username });
    }
  }, [socket, activeRoom, user]);

  const emitStopTyping = useCallback(() => {
    if (socket && activeRoom) {
      socket.emit('stop_typing', { roomId: activeRoom });
    }
  }, [socket, activeRoom]);


  // --- VALEUR DU PROVIDER (TOUT CE QUI EST EXPOSÉ) ---
  const providerValue = {
    socket,
    onlineUsers,
    rooms,
    myRoomIDs,
    conversations,
    loading,
    isLoadingMessages,
    activeRoom,
    activeEntityDetails,
    activeRoomMembers,
    messages,
    typingUser,
    selectRoom,
    sendMessage,
    startConversation,
    createRoom,
    updateRoom,
    deleteRoom,
    emitStartTyping,
    emitStopTyping,
  };

  return (
    <ChatContext.Provider value={providerValue}>
      {!authLoading && children}
    </ChatContext.Provider>
  );
};