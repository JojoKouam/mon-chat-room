// backend/routes/readStatusRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const readStatusController = require('../controllers/readStatusController');

// Route pour marquer un salon comme lu
router.post('/:roomId', authMiddleware, readStatusController.markAsRead);

module.exports = router;