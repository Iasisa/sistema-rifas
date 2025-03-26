// src/backend/routes/index.js
const express = require('express');
const router = express.Router();
const ticketRoutes = require('./ticketRoutes');
const userRoutes = require('./userRoutes');
const paymentRoutes = require('./paymentRoutes');
const authRoutes = require('./authRoutes'); // Nueva importación

// Ruta raíz de la API - Lista todos los endpoints disponibles
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API del Sistema de Rifas',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: {
        login: '/api/auth/login [POST]',
        verify: '/api/auth/verify [GET] (protegido)',
        register: '/api/auth/register [POST] (protegido)'
      },
      tickets: {
        getAvailable: '/api/tickets/available',
        search: '/api/tickets/search',
        getByNumber: '/api/tickets/:ticketNumber',
        reserve: '/api/tickets/:ticketNumber/reserve [POST]'
      },
      users: {
        create: '/api/users [POST]',
        getById: '/api/users/:userId',
        getByEmail: '/api/users/email/:email',
        getTickets: '/api/users/:userId/tickets'
      },
      payments: {
        create: '/api/payments [POST]',
        getByTicket: '/api/payments/ticket/:ticketNumber',
        syncBank: '/api/payments/sync-bank [POST]',
        stats: '/api/payments/stats'
      }
    }
  });
});

// Rutas API
router.use('/auth', authRoutes); // Nuevas rutas de autenticación
router.use('/tickets', ticketRoutes);
router.use('/users', userRoutes);
router.use('/payments', paymentRoutes);

// Ruta de prueba para verificar que la API funciona
router.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'success', 
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;