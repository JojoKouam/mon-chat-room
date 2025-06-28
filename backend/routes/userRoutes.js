// backend/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// CORRECTION : Les routes spécifiques DOIVENT être déclarées avant les routes avec des paramètres.

// GET /api/users/list -> Lister tous les utilisateurs pour démarrer une conversation
router.get('/list', authMiddleware, userController.listAllUsers);

// GET /api/users/search -> Recherche d'utilisateurs par nom
router.get('/search', authMiddleware, userController.searchUsers);

// GET /api/users/:id -> Obtenir le profil d'un utilisateur spécifique.
// Cette route doit être en DERNIER pour ne pas "capturer" /list ou /search.
router.get('/:id', authMiddleware, userController.getUserProfile);

module.exports = router;