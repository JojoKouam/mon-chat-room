/* eslint-disable no-undef */
// frontend/src/context/ChatContext.jsx

import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { AuthContext } from './AuthContext';
import { io } from 'socket.io-client';

export const ChatContext = createContext();
const socket = io("http://localhost:4000");

export const ChatProvider = ({ children }) => {
  const { user } = useContext(AuthContext);

  // États
  const [rooms, setRooms] = useState([]);
  const [myRoomIds, setMyRoomIds] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [activeEntityDetails, setActiveEntityDetails] = useState(null);
  const [onlineUserIds, setOnlineUserIds] = useState([]);
  const [typingUser, setTypingUser] = useState(null);

  // --- EFFETS ---
  // Définir fetchInitialData en dehors de useEffect pour qu'il soit accessible partout
  const fetchInitialData = async () => {
    if (!user) { setLoading(false); return; }
    try {
      setLoading(true);
      const [roomsRes, convosRes] = await Promise.all([
        axios.get('/api/rooms'),
        axios.get('/api/conversations')
      ]);
      if (roomsRes.data) {
        setRooms(roomsRes.data.allRooms.filter(room => room.type === 'public') || []);
        setMyRoomIds(roomsRes.data.myRoomIds || []);
      }
      if (convosRes.data) {
        setConversations(convosRes.data || []);
      }
    } catch (err) {
      console.error("Erreur de chargement des données initiales", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    socket.emit('user_connected', user.id);
    const listeners = {
      'update-online-users': (userIds) => setOnlineUserIds(userIds),
      'receive_message': (newMessage) => {
        if (newMessage.room_id === activeRoom) setMessages((prev) => [...prev, newMessage]);
        // On pourrait rafraîchir les convos ici pour mettre à jour l'aperçu du dernier message
      },
      'user_typing': ({ username }) => setTypingUser(username),
      'user_stopped_typing': () => setTypingUser(null)
    };
    Object.keys(listeners).forEach(event => socket.on(event, listeners[event]));
    return () => {
      Object.keys(listeners).forEach(event => socket.off(event, listeners[event]));
    };
  }, [user, activeRoom]);

  // --- FONCTIONS ---
  const selectRoom = async (roomId) => {
    if (roomId === activeRoom) return;
    if (activeRoom) socket.emit('leave_room', activeRoom);
    socket.emit('join_room', roomId);
    setActiveRoom(roomId);
    setIsLoadingMessages(true);
    setActiveEntityDetails(null);

    try {
      // Marquer comme lu
      await axios.post(`/api/read-status/${roomId}`);

      const messagesRes = await axios.get(`/api/rooms/${roomId}/messages`);
      setMessages(messagesRes.data);
      
      const convosRes = await axios.get('/api/conversations');
      const updatedConversations = convosRes.data || [];
      setConversations(updatedConversations);

      const room = rooms.find(r => r.id === roomId);
      const convo = updatedConversations.find(c => c.id === roomId);

      if (room) {
        setActiveEntityDetails(room);
      } else if (convo) {
        console.log("Tentative de sélection d'une conversation :", convo); // <--- AJOUTE ÇA
        console.log("ID de l'autre utilisateur :", convo.other_user_id); // <--- ET ÇA
        const userProfileRes = await axios.get(`/api/users/${convo.other_user_id}`);
        setActiveEntityDetails(userProfileRes.data);
      }
    } catch {
      toast.error("Impossible de charger les informations du salon.");
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const startConversation = async (targetUserId) => {
    try {
      // 1. On crée/récupère le salon privé.
      const res = await axios.post('/api/conversations/start', { id: targetUserId });
      const { roomId } = res.data;

      // 2. On rafraîchit la liste des conversations D'ABORD.
      const convosRes = await axios.get('/api/conversations');
      const updatedConversations = convosRes.data || [];
      // On met à jour l'état pour que la sidebar soit correcte.
      setConversations(updatedConversations);

      // 3. MAINTENANT, on peut appeler selectRoom.
      // Il trouvera la conversation car la liste est à jour dans la closure.
      // C'est un peu "sale" mais c'est la façon la plus simple de s'en sortir.
      // On simule une sélection manuelle pour être sûr.
      if (roomId === activeRoom) return;
      if (activeRoom) socket.emit('leave_room', activeRoom);
      socket.emit('join_room', roomId);
      setActiveRoom(roomId);
      setIsLoadingMessages(true);
      setActiveEntityDetails(null);

      const messagesRes = await axios.get(`/api/rooms/${roomId}/messages`);
      setMessages(messagesRes.data);

      const convo = updatedConversations.find(c => c.id === roomId);
      if (convo) {
        const userProfileRes = await axios.get(`/api/users/${convo.other_user_id}`);
        setActiveEntityDetails(userProfileRes.data);
      }
      setIsLoadingMessages(false);

    } catch (error) {
      console.error("Erreur pour démarrer la conversation", error);
      toast.error("Impossible de démarrer la conversation.");
      setIsLoadingMessages(false);
    }
  };

  const joinRoom = async (roomId) => {
    try {
      await axios.post(`/api/rooms/${roomId}/join`);
      toast.success("Salon rejoint !");
      const res = await axios.get('/api/rooms');
      setRooms(res.data.allRooms.filter(room => room.type === 'public') || []);
      setMyRoomIds(res.data.myRoomIds || []);
    } catch {
      toast.error("Impossible de rejoindre le salon.");
    }
  };

  const sendMessage = (content, type = 'text') => {
    if (socket && activeRoom && content.trim() !== '') {
      const messageData = { content, type, userId: user.id, roomId: activeRoom, username: user.username };
      socket.emit('send_message', messageData);
    }
  };

  const emitStartTyping = () => { if (socket && activeRoom) socket.emit('start_typing', { roomId: activeRoom, username: user.username }); };
  const emitStopTyping = () => { if (socket && activeRoom) socket.emit('stop_typing', { roomId: activeRoom }); };


 const createRoom = async (roomData) => {
    try {
        await axios.post('/api/rooms', roomData);
        
        // La solution la plus fiable : on rafraîchit toutes les données.
        // C'est exactement ce qu'on fait pour updateRoom.
        fetchInitialData(); 

        toast.success('Salle créée avec succès !');
        return true; // Pour indiquer que l'opération a réussi
    } catch (error) {
        toast.error(error.response?.data?.message || "Erreur lors de la création.");
        return false;
    }
};

    const updateRoom = async (roomId, roomData) => {
        try {
            await axios.put(`/api/rooms/${roomId}`, roomData);
            
            // On rafraîchit toutes les données pour être sûr
            // C'est la solution la plus simple et la plus fiable
            fetchInitialData(); 
            
            toast.success('Salle mise à jour !');
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || "Erreur lors de la mise à jour.");
            return false;
        }
    };

    const deleteRoom = async (roomId) => {
        // Ajoutons une confirmation avant une action aussi destructive
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette salle ? Cette action est irréversible.")) {
            return;
        }
        
        try {
            await axios.delete(`/api/rooms/${roomId}`);
            
            // On met à jour l'état en filtrant la salle supprimée
            setMyRooms(prev => prev.filter(room => room.id !== roomId));
            setRooms(prev => prev.filter(room => room.id !== roomId));
            
            // Si la salle supprimée était active, on la désélectionne
            if (activeRoom === roomId) {
                selectRoom(null);
            }

            toast.success('Salle supprimée.');
        } catch (error) {
            toast.error(error.response?.data?.message || "Erreur lors de la suppression.");
        }
    };

  return (
   <ChatContext.Provider value={{
      user, rooms, myRoomIds, conversations, loading,
      messages, activeRoom, isLoadingMessages, activeEntityDetails, onlineUserIds, typingUser,createRoom,updateRoom,deleteRoom,
      joinRoom, selectRoom, startConversation, sendMessage, emitStartTyping, emitStopTyping
    }}>
      {children}
    </ChatContext.Provider>
  );
};