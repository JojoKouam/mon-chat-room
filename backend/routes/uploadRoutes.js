// backend/routes/uploadRoutes.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const uploadController = require('../controllers/uploadController');
const authMiddleware = require('../middleware/authMiddleware');

const upload = multer({ dest: 'uploads/' });

// On précise que c'est bien la racine '/' de '/api/upload'
router.post('/', authMiddleware, upload.single('file'), uploadController.uploadFile);

module.exports = router;