const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware'); // <-- IMPORTER LE MIDDLEWARE


// Définir la route POST pour /api/auth/register
// Quand une requête POST arrive sur cette URL, on exécute la fonction 'register' du contrôleur
router.post('/register', authController.register);

// Définir la route POST pour /api/auth/login
router.post('/login', authController.login);

// Définir la route GET pour /api/auth/me
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;