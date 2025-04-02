// src/backend/routes/ticketRoutes.js
const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const authMiddleware = require('../middleware/authMiddleware');

// Rutas públicas
router.get('/available', ticketController.getAvailableTickets);
router.get('/search', ticketController.searchTickets);
router.get('/:ticketNumber', ticketController.getTicketByNumber);
router.post('/:ticketNumber/reserve', ticketController.reserveTicket);

// Rutas administrativas protegidas con autenticación
router.post('/release-unpaid', authMiddleware, ticketController.releaseUnpaidTickets);
router.post('/:ticketNumber/send-reminder', authMiddleware, ticketController.sendPaymentReminder);

module.exports = router;