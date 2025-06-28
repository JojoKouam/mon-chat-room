// backend/routes/conversationRoutes.js
const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversationController');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/conversations -> Lister les conversations existantes
router.get('/', authMiddleware, conversationController.getAllConversations);

// POST /api/conversations/start -> Démarrer une nouvelle conversation
router.post('/start', authMiddleware, conversationController.startOrGetConversation);

module.exports = router;