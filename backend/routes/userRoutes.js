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

router.put('/me', authMiddleware, userController.updateCurrentUserProfile);

// Routes pour le système de blocage
router.post('/block/:userId', authMiddleware, userController.blockUser);
router.post('/unblock/:userId', authMiddleware, userController.unblockUser);
router.get('/me/blocked', authMiddleware, userController.getBlockedUsers);

// Route pour obtenir le profil d'un utilisateur par son ID (doit être en dernier)
router.get('/:id', authMiddleware, userController.getUserProfile);

module.exports = router;