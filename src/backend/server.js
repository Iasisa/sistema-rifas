// src/backend/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Importar rutas
const apiRoutes = require('./routes');

// Importar configuración de la base de datos
const { connectDB } = require('./config/db');

// Importar modelo de administrador para inicialización
const adminModel = require('./models/adminModel');

// Importar programador de tareas
const schedulerService = require('./services/scheduler');

// Crear la aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Crear carpeta temporal para uploads si no existe
const uploadsDir = path.join(__dirname, 'temp/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Crear carpeta para plantillas de correo si no existe
const templatesDir = path.join(__dirname, 'templates');
if (!fs.existsSync(templatesDir)) {
  fs.mkdirSync(templatesDir, { recursive: true });
}

// Conexión a la base de datos
connectDB()
  .then(async () => {
    console.log('Base de datos conectada');
    
    // Inicializar administrador por defecto si no existe ninguno
    try {
      await adminModel.initializeDefaultAdmin({
        username: process.env.DEFAULT_ADMIN_USER || 'admin',
        password: process.env.DEFAULT_ADMIN_PASSWORD || 'Admin123!',
        email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@sistema-rifas.com',
        fullName: 'Administrador Principal'
      });
    } catch (err) {
      console.error('Error al inicializar administrador por defecto:', err);
    }
    
    // Inicializar el programador de tareas
    if (process.env.NODE_ENV !== 'test') {
      schedulerService.initialize();
    }
  })
  .catch(err => {
    console.error('Error al inicializar la base de datos', err);
    process.exit(1);
  });

// Rutas API
app.use('/api', apiRoutes);

// Servir archivos estáticos en producción
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

// Manejador de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Iniciar el servidor
const server = app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV}`);
  console.log(`URL de la API: http://localhost:${PORT}/api`);
});

// Manejo de cierre del servidor
process.on('SIGTERM', () => {
  console.log('Recibida señal SIGTERM. Cerrando servidor...');
  
  // Detener programador de tareas
  schedulerService.stop();
  
  server.close(() => {
    console.log('Servidor cerrado');
    process.exit(0);
  });
});

module.exports = { app, server };