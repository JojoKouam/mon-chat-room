import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

import db from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import userRoutes from './routes/userRoutes.js';
import conversationRoutes from './routes/conversationRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import readStatusRoutes from './routes/readStatusRoutes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middlewares
app.use(cors());
app.use(express.json());

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/users', userRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/read-status', readStatusRoutes);

// --- LOGIQUE SOCKET.IO ---

const onlineUsers = new Map(); // Map pour stocker { userId: socketId }

// Middleware d'authentification pour Socket.IO
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error: Token not provided'));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.user.id;
    socket.username = decoded.username;

    // On vérifie que l'ID n'est pas undefined
    if (!socket.userId) {
        return next(new Error('Authentication error: User ID not found in token'));
    }
    
    // Ajoutons un console.log pour être 100% sûr
    console.log(`Middleware Socket: user.id ${socket.userId} attaché au socket ${socket.id}`);


    next();
  } catch (err) {
    return next(new Error('Authentication error: Invalid token'));
  }
});

io.on("connection", (socket) => {
  console.log("Un utilisateur s'est connecté :", socket.id, "avec l'ID user:", socket.userId);

  onlineUsers.set(socket.userId, socket.id);
  io.emit('update-online-users', Array.from(onlineUsers.keys()));

  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} a rejoint la salle ${roomId}`);
  });

  socket.on("leave_room", (roomId) => {
    socket.leave(roomId);
    console.log(`Socket ${socket.id} a quitté la salle ${roomId}`);
  });

  socket.on("send_message", async ({ roomId, content, type }) => {
    const userId = socket.userId;
    try {
      // 1. Insérer le message dans la base de données
      const [result] = await db.query(
        "INSERT INTO messages (room_id, user_id, content, type) VALUES (?, ?, ?, ?)",
        [roomId, userId, content, type]
      );
      
      // 2. Récupérer l'avatar de l'utilisateur (on pourrait l'attacher au socket pour optimiser)
      const [[user_data]] = await db.query("SELECT avatar_url FROM users WHERE id = ?", [userId]);

      // 3. Créer l'objet message complet à renvoyer aux clients
      const newMessage = {
        id: result.insertId,
        room_id: parseInt(roomId, 10),
        user_id: userId,
        content,
        type,
        created_at: new Date().toISOString(),
        username: socket.username, // Attaché au socket lors de la connexion
        avatar_url: user_data.avatar_url
      };
      
      // 4. Diffuser le nouveau message à tout le monde dans la salle
      io.to(roomId).emit("receive_message", newMessage);

    } catch (error) {
      console.error("Erreur d'envoi de message :", error);
      // Optionnel : envoyer une erreur à l'expéditeur
      socket.emit("error_message", { message: "Votre message n'a pas pu être envoyé." });
    }
  });

  // Gestion de 'is typing'
  socket.on('start_typing', ({ roomId, username }) => {
    socket.to(roomId).emit('user_typing', { username });
  });

  socket.on('stop_typing', ({ roomId }) => {
    socket.to(roomId).emit('user_stopped_typing');
  });
  socket.on("disconnect", () => {
    console.log("Un utilisateur s'est déconnecté :", socket.id);
    onlineUsers.delete(socket.userId);
    io.emit('update-online-users', Array.from(onlineUsers.keys()));
  });
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`Serveur et Sockets démarrés sur le port ${PORT}`);
});

// Gestion de la connexion DB
db.getConnection()
  .then(connection => {
    console.log('Connexion à la base de données MySQL réussie !');
    connection.release();
  })
  .catch(error => {
    console.error('Échec de la connexion à la base de données MySQL :', error);
    process.exit(1);
  });