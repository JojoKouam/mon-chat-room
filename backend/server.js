const express = require('express');
const http = require('http'); // <-- Module natif de Node.js
const { Server } = require("socket.io"); // <-- On importe la classe Server de socket.io
const cors = require('cors');
require('dotenv').config();
const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const userRoutes = require('./routes/userRoutes'); // <-- IMPORTER
const uploadRoutes = require('./routes/uploadRoutes'); // <-- IMPORTER
const conversationRoutes = require('./routes/conversationRoutes'); // <-- AJOUTER CET IMPORT
const readStatusRoutes = require('./routes/readStatusRoutes');


const app = express();
const server = http.createServer(app); // <-- On crée un serveur http à partir d'Express
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
    },
    allowEIO3: true // Ajout pour la compatibilité
});

app.use(cors());
app.use(express.json());

// ... (vos routes API ne changent pas)
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/users', userRoutes); // <-- ON UTILISE userRoutes
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes); 
app.use('/api/conversations', conversationRoutes); 
app.use('/api/read-status', readStatusRoutes); // <-- AJOUTER CETTE ROUTE

// --- LOGIQUE SOCKET.IO ---

const onlineUsers = new Map(); // On utilise une Map pour stocker { userId: socketId }

const broadcastOnlineUsers = () => {
  // On envoie la liste des IDs des utilisateurs en ligne à tout le monde
  io.emit('update-online-users', Array.from(onlineUsers.keys()));
};

io.on('connection', (socket) => {
    console.log('🔌 Un utilisateur est connecté :', socket.id);

    const updateRoomCount = (roomId) => {
        const room = io.sockets.adapter.rooms.get(roomId);
        const count = room ? room.size : 0;
        io.to(roomId).emit('roomMemberCountUpdate', { roomId, count });
    };

    socket.on('user_connected', (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`Utilisateur ID ${userId} est en ligne.`);
    broadcastOnlineUsers();
  });


    socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
    // Tu peux aussi ajouter le updateRoomCount ici si tu veux
  });
    // socket.on('joinRoom', (roomId) => {
    //     socket.join(roomId);
    //     console.log(`L'utilisateur ${socket.id} a rejoint le salon ${roomId}`);
    //     updateRoomCount(roomId);
    // });

    //
   socket.on('start_typing', ({ roomId, username }) => {
    // On diffuse à tout le monde dans le salon, SAUF à l'expéditeur
    socket.to(roomId).emit('user_typing', { username });
  });

socket.on('stop_typing', (roomId) => {
    socket.to(roomId).emit('user_stopped_typing');
});

    // socket.on('sendMessage', async ({ roomId, message, userId, type }) => {
    //     try {
    //         const [result] = await db.query(
    //             'INSERT INTO messages (room_id, user_id, content, type) VALUES (?, ?, ?, ?)',
    //             [roomId, userId, message, type]
    //         );
    //         const [rows] = await db.query(
    //             `SELECT m.*, u.username FROM messages m JOIN users u ON m.user_id = u.id WHERE m.id = ?`,
    //             [result.insertId]
    //         );
    //         const newMessage = rows[0];
    //         io.to(roomId).emit('newMessage', newMessage);
    //     } catch (error) {
    //         console.error("Erreur lors de l'envoi du message :", error);
    //     }
    // });


    socket.on('send_message', async (data) => {
    // 1. On déstructure ce que le front envoie VRAIMENT
    const { roomId, userId, content, username, type = 'text' } = data; // On attend 'content' et on met 'text' par défaut

    if (!content) return; // Sécurité

    try {
      // 2. On sauvegarde en BDD avec les bonnes variables
      const query = 'INSERT INTO messages (room_id, user_id, content, type) VALUES (?, ?, ?, ?)';
      const [result] = await db.query(query, [roomId, userId, content, type]);

      // 3. On prépare le message à renvoyer aux clients
      const newMessage = {
        id: result.insertId,
        room_id: roomId,
        user_id: userId,
        content: content,
        type: type,
        username: username, // On réutilise le username envoyé par le front, pas besoin de requête BDD !
        created_at: new Date().toISOString()
      };
      
      // 4. On diffuse le message à tout le monde dans le salon
      io.to(roomId).emit('receive_message', newMessage);

    } catch (error) {
      console.error("Erreur lors de l'envoi du message :", error);
      // On pourrait envoyer une erreur au client si besoin
    }
  });

    socket.on('disconnect', () => {
        console.log('🔥 Un utilisateur s\'est déconnecté :', socket.id);
        // On utilise une boucle 'for...of' plus sûre pour itérer sur le Set des rooms
        for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    broadcastOnlineUsers();
  });
});
// -------------------------

const PORT = process.env.PORT || 4000;

// On change app.listen en server.listen
db.getConnection().then(connection => {
    console.log('✅ Connexion à la base de données MySQL réussie !');
    connection.release();
    server.listen(PORT, () => { // <-- ON UTILISE server.listen
        console.log(`🚀 Serveur et Sockets démarrés sur le port ${PORT}`);
    });
}).catch(error => {
    console.error('❌ Échec de la connexion à la base de données MySQL :', error);
    process.exit(1); // On arrête le processus si la connexion échoue
});