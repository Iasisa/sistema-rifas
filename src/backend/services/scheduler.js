// src/backend/services/scheduler.js
const cron = require('node-cron');
const { poolPromise, sql } = require('../config/db');
const emailService = require('./emailService');
const userModel = require('../models/userModel');
const ticketModel = require('../models/ticketModel');

/**
 * Servicio para programar tareas automáticas
 */
class SchedulerService {
  constructor() {
    this.tasks = [];
    this.initialized = false;
  }
  
  /**
   * Inicializa el programador de tareas
   */
  initialize() {
    try {
      // Programar tarea para enviar recordatorios (cada hora)
      this.scheduleReminderTask();
      
      // Programar tarea para liberar boletos no pagados (cada 3 horas)
      this.scheduleTicketReleaseTask();
      
      this.initialized = true;
      console.log('Programador de tareas inicializado');
    } catch (error) {
      console.error('Error al inicializar el programador de tareas:', error);
      this.initialized = false;
    }
  }
  
  /**
   * Programa la tarea de envío de recordatorios
   */
  scheduleReminderTask() {
    // Ejecutar cada hora (minuto 0)
    const task = cron.schedule('0 * * * *', async () => {
      console.log('Ejecutando tarea programada: envío de recordatorios', new Date().toISOString());
      
      try {
        // Obtener boletos próximos a vencer (entre 6 y 3 horas para vencer)
        const expiringTickets = await this.getExpiringTickets(6, 3);
        
        console.log(`Encontrados ${expiringTickets.length} boletos próximos a vencer`);
        
        // Enviar recordatorios
        for (const ticket of expiringTickets) {
          try {
            // Obtener datos del usuario
            const user = await userModel.getUserById(ticket.UserId);
            
            if (user) {
              // Calcular horas restantes
              const reservedAt = new Date(ticket.ReservedAt);
              const expiresAt = new Date(reservedAt.getTime() + (48 * 60 * 60 * 1000));
              const now = new Date();
              const hoursLeft = Math.max(0, Math.floor((expiresAt - now) / (60 * 60 * 1000)));
              
              // Enviar correo de recordatorio
              await emailService.sendPaymentReminderEmail(user, ticket, hoursLeft);
              console.log(`Recordatorio enviado para boleto ${ticket.TicketNumber} (${hoursLeft} horas restantes)`);
            }
          } catch (emailError) {
            console.error(`Error al enviar recordatorio para boleto ${ticket.TicketNumber}:`, emailError);
          }
          
          // Pequeña pausa entre envíos para no sobrecargar el servidor de correo
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error('Error al ejecutar tarea de recordatorios:', error);
      }
    });
    
    this.tasks.push(task);
  }
  
  /**
   * Programa la tarea de liberación de boletos no pagados
   */
  scheduleTicketReleaseTask() {
    // Ejecutar cada 3 horas (minuto 30)
    const task = cron.schedule('30 */3 * * *', async () => {
      console.log('Ejecutando tarea programada: liberación de boletos', new Date().toISOString());
      
      try {
        // Llamar a la función de liberación de boletos
        const result = await ticketModel.releaseUnpaidTickets();
        console.log(`Se liberaron ${result.liberatedCount} boletos no pagados`);
      } catch (error) {
        console.error('Error al ejecutar tarea de liberación de boletos:', error);
      }
    });
    
    this.tasks.push(task);
  }
  
  /**
   * Obtiene boletos próximos a vencer en un rango de horas
   * @param {number} maxHours - Horas máximas para vencimiento
   * @param {number} minHours - Horas mínimas para vencimiento
   * @returns {Promise<Array>} - Lista de boletos
   */
  async getExpiringTickets(maxHours, minHours) {
    try {
      const pool = await poolPromise;
      
      // Calcular fechas límite
      const now = new Date();
      const minExpiryTime = new Date(now.getTime() + (minHours * 60 * 60 * 1000));
      const maxExpiryTime = new Date(now.getTime() + (maxHours * 60 * 60 * 1000));
      
      // 48 horas desde ReservedAt es cuando expira
      const result = await pool.request()
        .input('now', sql.DateTime, now)
        .input('minExpiry', sql.DateTime, minExpiryTime)
        .input('maxExpiry', sql.DateTime, maxExpiryTime)
        .query(`
          SELECT * FROM Tickets
          WHERE Status = 'reserved'
          AND DATEADD(HOUR, 48, ReservedAt) > @minExpiry
          AND DATEADD(HOUR, 48, ReservedAt) < @maxExpiry
        `);
      
      return result.recordset;
    } catch (error) {
      console.error('Error al obtener boletos próximos a vencer:', error);
      throw error;
    }
  }
  
  /**
   * Detiene todas las tareas programadas
   */
  stop() {
    for (const task of this.tasks) {
      task.stop();
    }
    console.log('Programador de tareas detenido');
  }
}

module.exports = new SchedulerService();