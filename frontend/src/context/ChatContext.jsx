import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { io } from "socket.io-client";
import AuthContext from './AuthContext';

const socket = io("http://localhost:4000");
const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [rooms, setRooms] = useState([]);
    const [myRoomIds, setMyRoomIds] = useState([]);
    const [messages, setMessages] = useState([]);
    const [activeRoom, setActiveRoom] = useState(null);
    const [memberCounts, setMemberCounts] = useState({});
    const [loading, setLoading] = useState(true);
    const [typingUsers, setTypingUsers] = useState([]);
    

    useEffect(() => {
        const fetchInitialData = async () => {
            if (!user) {
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const res = await axios.get('http://localhost:4000/api/rooms');
                setRooms(res.data.allRooms);
                setMyRoomIds(res.data.myRoomIds);
                // On sélectionne le premier salon de l'utilisateur par défaut
                if (res.data.myRoomIds.length > 0) {
                    selectRoom(res.data.myRoomIds[0]);
                }
            } catch (err) {
                console.error("Erreur de chargement des données", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [user]);

    useEffect(() => {
        socket.on('newMessage', (newMessage) => {
            // On utilise une fonction pour éviter les problèmes de closure avec 'activeRoom'
            setMessages(prevMessages => [...prevMessages, newMessage]);
        });

        socket.on('roomMemberCountUpdate', ({ roomId, count }) => {
            setMemberCounts(prevCounts => ({ ...prevCounts, [roomId]: count }));
        });

         // --- NOUVEAU : Écouter les événements de typing ---
        socket.on('userIsTyping', ({ username }) => {
            // On ajoute l'utilisateur à la liste (s'il n'y est pas déjà)
            setTypingUsers(prev => [...new Set([...prev, username])]);
        });

        socket.on('userStoppedTyping', () => {
            // Pour ce cas simple, on vide la liste. On pourrait gérer ça plus finement.
            setTypingUsers([]);
        });

        return () => {
            socket.off('newMessage');
            socket.off('roomMemberCountUpdate');
            socket.off('userIsTyping');
            socket.off('userStoppedTyping');
        };
    }, []);

    const selectRoom = async (roomId) => {
        if (activeRoom) socket.emit('leaveRoom', activeRoom); // Pas encore implémenté au back, mais bonne pratique
        
        socket.emit('joinRoom', roomId);
        setActiveRoom(roomId);
        try {
            const res = await axios.get(`http://localhost:4000/api/rooms/${roomId}/messages`);
            setMessages(res.data);
        } catch (err) {
            console.error(err);
            setMessages([]);
        }
    };

    const joinRoom = async (roomId) => {
        try {
            await axios.post(`http://localhost:4000/api/rooms/${roomId}/join`);
            setMyRoomIds(prevIds => [...prevIds, roomId]);
            selectRoom(roomId); // On sélectionne le salon automatiquement après l'avoir rejoint
            toast.success("Salon rejoint !");
        } catch (err) {
            toast.error(err.response?.data?.message || "Impossible de rejoindre le salon.");
        }
    };
    // Fonction pour envoyer un message

    const sendMessage = (content, type = 'text') => { // On ajoute un paramètre 'type'
    if (socket && activeRoom && user && content.trim() !== '') {
        socket.emit('sendMessage', {
            roomId: activeRoom,
            message: content, // 'content' contient maintenant soit du texte, soit une URL
            userId: user.id,
            type: type // On envoie le type du message
        });
    }
};

    // Fonctions pour gérer le typing

    const startTyping = () => {
        if (socket && activeRoom && user) {
            socket.emit('startTyping', { roomId: activeRoom, username: user.username });
        }
    };
    const stopTyping = () => {
        if (socket && activeRoom) {
            socket.emit('stopTyping', activeRoom);
        }
    };

    // --- NOUVELLE FONCTION POUR DÉMARRER UNE CONVERSATION ---
    const startPrivateChat = async (targetUserId) => {
        // On affiche un toast de chargement pour l'UX
        const toastId = toast.loading('Ouverture de la conversation...');

        try {
            // On appelle notre nouvelle API backend
            const res = await axios.post('http://localhost:4000/api/conversations/start', { targetUserId });
            
            // L'API nous renvoie l'ID du salon (nouveau ou existant)
            const { roomId } = res.data;
            
            // On sélectionne ce salon pour afficher les messages
            selectRoom(roomId);
            
            // On met à jour le toast en succès
            toast.success('Conversation ouverte !', { id: toastId });

            return true; // On indique que l'opération a réussi

        } catch (err) {
            console.error("Impossible de démarrer la conversation", err);
            // On met à jour le toast en erreur
            toast.error("Impossible de démarrer la conversation.", { id: toastId });
            return false; // On indique que l'opération a échoué
        }
    };

    return (
        <ChatContext.Provider value={{
            rooms, myRoomIds, messages, activeRoom, memberCounts, loading,typingUsers, startTyping, stopTyping,
            joinRoom, selectRoom, sendMessage, startPrivateChat
        }}>
            {children}
        </ChatContext.Provider>
    );
};

export default ChatContext;