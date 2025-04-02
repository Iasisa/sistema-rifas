// src/backend/controllers/userController.js
const userModel = require('../models/userModel');

/**
 * Controlador para la gestión de usuarios
 */
class UserController {
  /**
   * Crea un nuevo usuario
   */
  async createUser(req, res) {
    try {
      const userData = req.body;
      
      // Validar datos necesarios
      if (!userData.name || !userData.email || !userData.phone) {
        return res.status(400).json({
          success: false,
          message: 'Datos de usuario incompletos. Se requiere nombre, email y teléfono.'
        });
      }
      
      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        return res.status(400).json({
          success: false,
          message: 'El formato del email es inválido.'
        });
      }
      
      // Validar formato de teléfono (asumiendo que es un número de 10 dígitos)
      if (!/^\d{10}$/.test(userData.phone)) {
        return res.status(400).json({
          success: false,
          message: 'El teléfono debe tener 10 dígitos numéricos.'
        });
      }
      
      // Crear usuario
      const user = await userModel.createUser(userData);
      
      res.status(201).json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Error al crear usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear el usuario',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
      });
    }
  }
  
  /**
   * Obtiene un usuario por su ID
   */
  async getUserById(req, res) {
    try {
      const { userId } = req.params;
      
      // Obtener usuario
      const user = await userModel.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: `Usuario con ID ${userId} no encontrado`
        });
      }
      
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error(`Error al obtener usuario con ID ${req.params.userId}:`, error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener el usuario',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
      });
    }
  }
  
  /**
   * Obtiene un usuario por su correo electrónico
   */
  async getUserByEmail(req, res) {
    try {
      const { email } = req.params;
      
      // Obtener usuario
      const user = await userModel.getUserByEmail(email);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: `Usuario con email ${email} no encontrado`
        });
      }
      
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error(`Error al obtener usuario con email ${req.params.email}:`, error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener el usuario',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
      });
    }
  }
  
  /**
   * Obtiene los boletos de un usuario
   */
  async getUserTickets(req, res) {
    try {
      const { userId } = req.params;
      
      // Verificar si el usuario existe
      const user = await userModel.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: `Usuario con ID ${userId} no encontrado`
        });
      }
      
      // Obtener boletos del usuario
      const tickets = await userModel.getUserTickets(userId);
      
      res.status(200).json({
        success: true,
        count: tickets.length,
        data: tickets
      });
    } catch (error) {
      console.error(`Error al obtener boletos del usuario ${req.params.userId}:`, error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener los boletos del usuario',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
      });
    }
  }
}

module.exports = new UserController();