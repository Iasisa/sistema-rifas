// src/backend/controllers/authController.js
const adminModel = require('../models/adminModel');

/**
 * Controlador para la autenticación de administradores
 */
class AuthController {
  /**
   * Autentica a un administrador
   */
  async login(req, res) {
    try {
      const { username, password } = req.body;
      
      // Validar datos necesarios
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'El nombre de usuario y la contraseña son obligatorios'
        });
      }
      
      // Verificar credenciales
      const admin = await adminModel.verifyCredentials(username, password);
      
      if (!admin) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }
      
      // Generar token JWT
      const token = adminModel.generateToken(admin);
      
      // Responder con token y datos del admin
      res.status(200).json({
        success: true,
        message: 'Autenticación exitosa',
        data: {
          admin,
          token
        }
      });
    } catch (error) {
      console.error('Error en autenticación:', error);
      res.status(500).json({
        success: false,
        message: 'Error en la autenticación',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
      });
    }
  }
  
  /**
   * Verifica si el token es válido
   */
  async verifyToken(req, res) {
    try {
      // Si llega a este punto, el middleware authMiddleware ya verificó el token
      // y añadió el admin a req.admin
      
      // Obtener datos actualizados del admin
      const admin = await adminModel.getAdminById(req.admin.adminId);
      
      if (!admin) {
        return res.status(404).json({
          success: false,
          message: 'Administrador no encontrado'
        });
      }
      
      res.status(200).json({
        success: true,
        data: {
          admin
        }
      });
    } catch (error) {
      console.error('Error al verificar token:', error);
      res.status(500).json({
        success: false,
        message: 'Error al verificar el token',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
      });
    }
  }
  
  /**
   * Registra un nuevo administrador (solo administradores pueden crear otros)
   */
  async registerAdmin(req, res) {
    try {
      // Solo administradores existentes pueden crear otros (verificado por middleware)
      const adminData = req.body;
      
      // Validar datos necesarios
      if (!adminData.username || !adminData.password || !adminData.email) {
        return res.status(400).json({
          success: false,
          message: 'Datos incompletos. Se requiere nombre de usuario, contraseña y email.'
        });
      }
      
      // Crear el nuevo administrador
      const newAdmin = await adminModel.createAdmin(adminData);
      
      res.status(201).json({
        success: true,
        message: 'Administrador creado exitosamente',
        data: newAdmin
      });
    } catch (error) {
      console.error('Error al crear administrador:', error);
      
      // Manejar error específico de usuario duplicado
      if (error.message.includes('ya está en uso')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Error al crear el administrador',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
      });
    }
  }
}

module.exports = new AuthController();