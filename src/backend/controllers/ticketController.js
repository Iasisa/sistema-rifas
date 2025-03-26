// src/backend/controllers/ticketController.js
const ticketModel = require('../models/ticketModel');
const userModel = require('../models/userModel');
const emailService = require('../services/emailService');

/**
 * Controlador para la gestión de boletos
 */
class TicketController {
  /**
   * Obtiene todos los boletos disponibles
   */
  async getAvailableTickets(req, res) {
    try {
      // Parámetros de paginación
      const limit = parseInt(req.query.limit) || 100;
      const offset = parseInt(req.query.offset) || 0;
      
      // Obtener boletos disponibles
      const tickets = await ticketModel.getAvailableTickets(limit, offset);
      
      res.status(200).json({
        success: true,
        count: tickets.length,
        data: tickets
      });
    } catch (error) {
      console.error('Error al obtener boletos disponibles:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener los boletos disponibles',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
      });
    }
  }
  
  /**
   * Obtiene un boleto por su número
   */
  async getTicketByNumber(req, res) {
    try {
      const { ticketNumber } = req.params;
      
      // Validar formato del número de boleto
      if (!ticketNumber || !/^\d{4}$/.test(ticketNumber)) {
        return res.status(400).json({
          success: false,
          message: 'Número de boleto inválido. Debe ser un número de 4 dígitos.'
        });
      }
      
      // Obtener boleto
      const ticket = await ticketModel.getTicketByNumber(ticketNumber);
      
      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: `Boleto ${ticketNumber} no encontrado`
        });
      }
      
      res.status(200).json({
        success: true,
        data: ticket
      });
    } catch (error) {
      console.error(`Error al obtener boleto ${req.params.ticketNumber}:`, error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener el boleto',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
      });
    }
  }
  
  /**
   * Busca boletos según criterios
   */
  async searchTickets(req, res) {
    try {
      // Parámetros de filtro
      const filters = {
        status: req.query.status,
        startNumber: req.query.start,
        endNumber: req.query.end
      };
      
      // Parámetros de paginación
      const limit = parseInt(req.query.limit) || 100;
      const offset = parseInt(req.query.offset) || 0;
      
      // Buscar boletos
      const tickets = await ticketModel.searchTickets(filters, limit, offset);
      
      res.status(200).json({
        success: true,
        count: tickets.length,
        data: tickets
      });
    } catch (error) {
      console.error('Error al buscar boletos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al buscar boletos',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
      });
    }
  }
  
  /**
   * Reserva un boleto para un usuario
   */
  async reserveTicket(req, res) {
    try {
      const { ticketNumber } = req.params;
      const userData = req.body;
      
      // Validar datos necesarios
      if (!ticketNumber || !/^\d{4}$/.test(ticketNumber)) {
        return res.status(400).json({
          success: false,
          message: 'Número de boleto inválido. Debe ser un número de 4 dígitos.'
        });
      }
      
      if (!userData.name || !userData.email || !userData.phone) {
        return res.status(400).json({
          success: false,
          message: 'Datos de usuario incompletos. Se requiere nombre, email y teléfono.'
        });
      }
      
      // Crear o actualizar usuario
      const user = await userModel.createUser(userData);
      
      // Reservar boleto
      const ticket = await ticketModel.reserveTicket(ticketNumber, user.UserId);
      
      // Enviar correo de confirmación de reserva
      try {
        await emailService.sendTicketReservationEmail(user, ticket);
        console.log(`Correo de confirmación enviado para boleto ${ticketNumber}`);
      } catch (emailError) {
        // Si falla el envío del correo, lo registramos pero continuamos
        console.error(`Error al enviar correo de confirmación para boleto ${ticketNumber}:`, emailError);
      }
      
      res.status(200).json({
        success: true,
        data: {
          ticket,
          user
        }
      });
    } catch (error) {
      console.error(`Error al reservar boleto ${req.params.ticketNumber}:`, error);
      
      // Manejar errores específicos
      if (error.message.includes('no está disponible') || error.message.includes('no encontrado')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Error al reservar el boleto',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
      });
    }
  }
  
  /**
   * Libera boletos no pagados (ejecutado por tarea programada)
   */
  async releaseUnpaidTickets(req, res) {
    try {
      const result = await ticketModel.releaseUnpaidTickets();
      
      res.status(200).json({
        success: true,
        message: `Se liberaron ${result.liberatedCount} boletos que no fueron pagados en 48 horas.`,
        data: result
      });
    } catch (error) {
      console.error('Error al liberar boletos no pagados:', error);
      res.status(500).json({
        success: false,
        message: 'Error al liberar boletos no pagados',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
      });
    }
  }
  
  /**
   * Envía recordatorio de pago para un boleto próximo a expirar
   */
  async sendPaymentReminder(req, res) {
    try {
      const { ticketNumber } = req.params;
      
      // Validar formato del número de boleto
      if (!ticketNumber || !/^\d{4}$/.test(ticketNumber)) {
        return res.status(400).json({
          success: false,
          message: 'Número de boleto inválido. Debe ser un número de 4 dígitos.'
        });
      }
      
      // Obtener boleto
      const ticket = await ticketModel.getTicketByNumber(ticketNumber);
      
      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: `Boleto ${ticketNumber} no encontrado`
        });
      }
      
      // Verificar que el boleto esté reservado
      if (ticket.Status !== 'reserved') {
        return res.status(400).json({
          success: false,
          message: `El boleto ${ticketNumber} no está reservado (estado actual: ${ticket.Status})`
        });
      }
      
      // Calcular horas restantes
      const reservedAt = new Date(ticket.ReservedAt);
      const expiresAt = new Date(reservedAt.getTime() + (48 * 60 * 60 * 1000));
      const now = new Date();
      const hoursLeft = Math.max(0, Math.floor((expiresAt - now) / (60 * 60 * 1000)));
      
      // Obtener datos del usuario
      const user = await userModel.getUserById(ticket.UserId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: `Usuario asociado al boleto ${ticketNumber} no encontrado`
        });
      }
      
      // Enviar recordatorio
      const emailResult = await emailService.sendPaymentReminderEmail(user, ticket, hoursLeft);
      
      if (!emailResult.success) {
        return res.status(500).json({
          success: false,
          message: 'Error al enviar recordatorio',
          error: emailResult.error
        });
      }
      
      res.status(200).json({
        success: true,
        message: `Recordatorio enviado a ${user.Email} para el boleto ${ticketNumber}`,
        data: {
          ticketNumber,
          hoursLeft,
          emailSent: true
        }
      });
    } catch (error) {
      console.error(`Error al enviar recordatorio para boleto ${req.params.ticketNumber}:`, error);
      res.status(500).json({
        success: false,
        message: 'Error al enviar recordatorio',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
      });
    }
  }
}

module.exports = new TicketController();