// src/backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Rutas públicas
router.post('/login', authController.login);

// Rutas protegidas
router.get('/verify', authMiddleware, authController.verifyToken);
router.post('/register', authMiddleware, authController.registerAdmin);

module.exports = router;