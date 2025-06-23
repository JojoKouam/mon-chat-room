const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/rooms - Récupérer tous les salons
// C'est une route protégée, il faut être connecté pour voir les salons.
router.get('/', authMiddleware, roomController.getAllRooms);

// POST /api/rooms/:roomId/join - Rejoindre un salon
router.post('/:roomId/join', authMiddleware, roomController.joinRoom);

// GET /api/rooms/:roomId/messages - Récupérer l'historique d'un salon
router.get('/:roomId/messages', authMiddleware, roomController.getRoomMessages);

module.exports = router;