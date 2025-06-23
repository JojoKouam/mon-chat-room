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
app.use('/api/conversations', conversationRoutes); // <-- AJOUTER CETTE LIGNE

// --- LOGIQUE SOCKET.IO ---

io.on('connection', (socket) => {
    console.log('🔌 Un utilisateur est connecté :', socket.id);

    const updateRoomCount = (roomId) => {
        const room = io.sockets.adapter.rooms.get(roomId);
        const count = room ? room.size : 0;
        io.to(roomId).emit('roomMemberCountUpdate', { roomId, count });
    };

    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
        console.log(`L'utilisateur ${socket.id} a rejoint le salon ${roomId}`);
        updateRoomCount(roomId);
    });

    //
    socket.on('startTyping', ({ roomId, username }) => {
    // On diffuse à tout le monde dans le salon, SAUF à l'expéditeur
    socket.broadcast.to(roomId).emit('userIsTyping', { username });
});

socket.on('stopTyping', (roomId) => {
    socket.broadcast.to(roomId).emit('userStoppedTyping');
});

    socket.on('sendMessage', async ({ roomId, message, userId, type }) => {
        try {
            const [result] = await db.query(
                'INSERT INTO messages (room_id, user_id, content, type) VALUES (?, ?, ?, ?)',
                [roomId, userId, message, type]
            );
            const [rows] = await db.query(
                `SELECT m.*, u.username FROM messages m JOIN users u ON m.user_id = u.id WHERE m.id = ?`,
                [result.insertId]
            );
            const newMessage = rows[0];
            io.to(roomId).emit('newMessage', newMessage);
        } catch (error) {
            console.error("Erreur lors de l'envoi du message :", error);
        }
    });

    socket.on('disconnect', () => {
        console.log('🔥 Un utilisateur s\'est déconnecté :', socket.id);
        // On utilise une boucle 'for...of' plus sûre pour itérer sur le Set des rooms
        for (const room of socket.rooms) {
            if (room !== socket.id) {
                // On met à jour le compte après un court délai pour que le serveur ait le temps de le retirer du salon
                setTimeout(() => updateRoomCount(room), 100);
            }
        }
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