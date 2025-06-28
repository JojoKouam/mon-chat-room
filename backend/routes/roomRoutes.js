const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const authMiddleware = require('../middleware/authMiddleware');


// POST /api/rooms/ -> Créer une nouvelle salle
router.post('/', authMiddleware, roomController.createRoom);

// PUT /api/rooms/:id -> Modifier une salle existante
router.put('/:id', authMiddleware, roomController.updateRoom);

// DELETE /api/rooms/:id -> Supprimer une salle
router.delete('/:id', authMiddleware, roomController.deleteRoom);

// GET /api/rooms - Récupérer tous les salons
// C'est une route protégée, il faut être connecté pour voir les salons.
router.get('/', authMiddleware, roomController.getAllRooms);

// POST /api/rooms/:roomId/join - Rejoindre un salon
router.post('/:roomId/join', authMiddleware, roomController.joinRoom);

// GET /api/rooms/:roomId/messages - Récupérer l'historique d'un salon
router.get('/:roomId/messages', authMiddleware, roomController.getRoomMessages);

module.exports = router;