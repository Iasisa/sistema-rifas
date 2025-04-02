// src/backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Rutas públicas
router.post('/', userController.createUser);
router.get('/:userId', userController.getUserById);
router.get('/email/:email', userController.getUserByEmail);
router.get('/:userId/tickets', userController.getUserTickets);

module.exports = router;