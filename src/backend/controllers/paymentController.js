// src/backend/controllers/paymentController.js
const paymentModel = require('../models/paymentModel');
const ticketModel = require('../models/ticketModel');
const userModel = require('../models/userModel');
const emailService = require('../services/emailService');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

/**
 * Controlador para la gestión de pagos
 */
class PaymentController {
  /**
   * Registra un nuevo pago
   */
  async createPayment(req, res) {
    try {
      const paymentData = req.body;
      
      // Validar datos necesarios
      if (!paymentData.ticketNumber || !paymentData.amount) {
        return res.status(400).json({
          success: false,
          message: 'Datos de pago incompletos. Se requiere número de boleto y monto.'
        });
      }
      
      // Verificar si el boleto existe
      const ticket = await ticketModel.getTicketByNumber(paymentData.ticketNumber);
      
      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: `Boleto ${paymentData.ticketNumber} no encontrado`
        });
      }
      
      // Registrar pago
      const payment = await paymentModel.createPayment(paymentData);
      
      // Si el pago es exitoso, enviar correo de confirmación
      if (payment.Status === 'completed') {
        // Obtener datos del usuario
        const user = await userModel.getUserById(ticket.UserId);
        
        if (user) {
          try {
            await emailService.sendPaymentConfirmationEmail(user, ticket, payment);
            console.log(`Correo de confirmación de pago enviado para boleto ${paymentData.ticketNumber}`);
          } catch (emailError) {
            // Si falla el envío del correo, lo registramos pero continuamos
            console.error(`Error al enviar correo de confirmación de pago para boleto ${paymentData.ticketNumber}:`, emailError);
          }
        }
      }
      
      res.status(201).json({
        success: true,
        data: payment
      });
    } catch (error) {
      console.error('Error al registrar pago:', error);
      res.status(500).json({
        success: false,
        message: 'Error al registrar el pago',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
      });
    }
  }
  
  /**
   * Obtiene los pagos de un boleto
   */
  async getPaymentsByTicket(req, res) {
    try {
      const { ticketNumber } = req.params;
      
      // Validar formato del número de boleto
      if (!ticketNumber || !/^\d{4}$/.test(ticketNumber)) {
        return res.status(400).json({
          success: false,
          message: 'Número de boleto inválido. Debe ser un número de 4 dígitos.'
        });
      }
      
      // Verificar si el boleto existe
      const ticket = await ticketModel.getTicketByNumber(ticketNumber);
      
      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: `Boleto ${ticketNumber} no encontrado`
        });
      }
      
      // Obtener pagos del boleto
      const payments = await paymentModel.getPaymentsByTicket(ticketNumber);
      
      res.status(200).json({
        success: true,
        count: payments.length,
        data: payments
      });
    } catch (error) {
      console.error(`Error al obtener pagos del boleto ${req.params.ticketNumber}:`, error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener los pagos del boleto',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
      });
    }
  }
  
  /**
   * Sincroniza pagos desde un archivo de estado de cuenta
   */
  async syncBankAccount(req, res) {
    try {
      // Verificar si se cargó un archivo
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se ha proporcionado ningún archivo de estado de cuenta.'
        });
      }
      
      const filePath = req.file.path;
      const transactions = [];
      
      // Procesar archivo CSV
      return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (row) => {
            // Adaptar según el formato de su estado de cuenta
            // Este es un ejemplo genérico
            const transaction = {
              date: row.Fecha || row.Date || row.fecha,
              amount: parseFloat(row.Monto || row.Amount || row.monto || 0),
              reference: row.Referencia || row.Reference || row.referencia,
              id: row.ID || row.Id || row.id
            };
            
            // Solo incluir transacciones con referencia y monto
            if (transaction.reference && transaction.amount > 0) {
              transactions.push(transaction);
            }
          })
          .on('end', async () => {
            try {
              // Procesar las transacciones
              const result = await paymentModel.syncBankPayments(transactions);
              
              // Enviar correos de confirmación para cada pago procesado
              if (result.processedPayments && result.processedPayments.length > 0) {
                for (const payment of result.processedPayments) {
                  try {
                    const ticket = await ticketModel.getTicketByNumber(payment.ticketNumber);
                    if (ticket && ticket.UserId) {
                      const user = await userModel.getUserById(ticket.UserId);
                      if (user) {
                        await emailService.sendPaymentConfirmationEmail(user, ticket, payment);
                        console.log(`Correo de confirmación de pago enviado para boleto ${payment.ticketNumber}`);
                      }
                    }
                  } catch (emailError) {
                    console.error(`Error al enviar correo de confirmación para boleto ${payment.ticketNumber}:`, emailError);
                  }
                }
              }
              
              // Limpiar archivo temporal
              fs.unlinkSync(filePath);
              
              res.status(200).json({
                success: true,
                message: `Se procesaron ${result.processedCount} pagos del estado de cuenta.`,
                data: result
              });
              
              resolve();
            } catch (error) {
              reject(error);
            }
          })
          .on('error', (error) => {
            reject(error);
          });
      });
    } catch (error) {
      console.error('Error al sincronizar el estado de cuenta:', error);
      
      // Limpiar archivo temporal si existe
      if (req.file && req.file.path) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error('Error al eliminar archivo temporal:', unlinkError);
        }
      }
      
      res.status(500).json({
        success: false,
        message: 'Error al sincronizar el estado de cuenta',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
      });
    }
  }
  
  /**
   * Obtiene estadísticas de pagos
   */
  async getPaymentStats(req, res) {
    try {
      const stats = await paymentModel.getPaymentStats();
      
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error al obtener estadísticas de pagos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener estadísticas de pagos',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
      });
    }
  }
}

module.exports = new PaymentController();