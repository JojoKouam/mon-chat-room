const express = require('express');
const router = express.Router();
const convController = require('../controllers/conversationController');
const authMiddleware = require('../middleware/authMiddleware');

// On définit notre route : POST /api/conversations/start
// Elle est protégée : il faut être connecté pour l'utiliser.
// Elle exécute la fonction que nous venons de créer.
router.post('/start', authMiddleware, convController.startOrGetConversation);

module.exports = router;