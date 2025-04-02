// src/backend/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../middleware/authMiddleware'); // Importar middleware

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../temp/uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, 'bank-statement-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Aceptar solo archivos CSV
    if (path.extname(file.originalname).toLowerCase() !== '.csv') {
      return cb(new Error('Solo se permiten archivos CSV'));
    }
    cb(null, true);
  }
});

// Rutas públicas
router.post('/', paymentController.createPayment);
router.get('/ticket/:ticketNumber', paymentController.getPaymentsByTicket);

// Rutas administrativas protegidas con autenticación
router.post('/sync-bank', authMiddleware, upload.single('bankStatement'), paymentController.syncBankAccount);
router.get('/stats', authMiddleware, paymentController.getPaymentStats);

module.exports = router;