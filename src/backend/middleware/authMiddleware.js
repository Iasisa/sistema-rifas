// src/backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

/**
 * Middleware para verificar la autenticación mediante JWT
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función next
 */
const authMiddleware = (req, res, next) => {
  try {
    // Obtener el token del header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Acceso denegado. Token no proporcionado o formato incorrecto.'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verificar el token
    const secretKey = process.env.JWT_SECRET || 'your_jwt_secret_key';
    const decoded = jwt.verify(token, secretKey);
    
    // Añadir la información del admin al objeto de solicitud
    req.admin = decoded;
    
    // Continuar con la siguiente función
    next();
  } catch (error) {
    console.error('Error en autenticación:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado. Inicie sesión nuevamente.'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error en la autenticación',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
};

module.exports = authMiddleware;