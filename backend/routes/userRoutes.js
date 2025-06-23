const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/users/search?query=... - Rechercher un utilisateur
router.get('/search', authMiddleware, userController.searchUsers);

module.exports = router;