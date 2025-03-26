// src/backend/models/ticketModel.js
const { poolPromise, sql } = require('../config/db');

class TicketModel {
  /**
   * Obtiene todos los boletos con su estado actual
   */
  async getAllTickets() {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query(`
        SELECT TicketId, TicketNumber, Status, ReservedAt, UserId, CreatedAt, UpdatedAt
        FROM Tickets
        ORDER BY TicketNumber
      `);
      return result.recordset;
    } catch (error) {
      console.error('Error al obtener todos los boletos:', error);
      throw error;
    }
  }

  /**
   * Obtiene los boletos disponibles (que no están reservados ni vendidos)
   * @param {number} limit - Cantidad máxima de boletos a devolver
   * @param {number} offset - Número de boletos a saltar para paginación
   */
  async getAvailableTickets(limit = 100, offset = 0) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('status', sql.VarChar, 'available')
        .input('limit', sql.Int, limit)
        .input('offset', sql.Int, offset)
        .query(`
          SELECT TicketId, TicketNumber, Status
          FROM Tickets
          WHERE Status = @status
          ORDER BY TicketNumber
          OFFSET @offset ROWS
          FETCH NEXT @limit ROWS ONLY
        `);
      return result.recordset;
    } catch (error) {
      console.error('Error al obtener boletos disponibles:', error);
      throw error;
    }
  }

  /**
   * Obtiene un boleto por su número
   * @param {string} ticketNumber - Número de boleto (4 dígitos)
   */
  async getTicketByNumber(ticketNumber) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('ticketNumber', sql.Char(4), ticketNumber)
        .query(`
          SELECT TicketId, TicketNumber, Status, ReservedAt, UserId, CreatedAt, UpdatedAt
          FROM Tickets
          WHERE TicketNumber = @ticketNumber
        `);
      
      if (result.recordset.length === 0) {
        return null;
      }
      
      return result.recordset[0];
    } catch (error) {
      console.error(`Error al obtener boleto ${ticketNumber}:`, error);
      throw error;
    }
  }

  /**
   * Reserva un boleto para un usuario
   * @param {string} ticketNumber - Número de boleto (4 dígitos)
   * @param {number} userId - ID del usuario que reserva el boleto
   */
  async reserveTicket(ticketNumber, userId) {
    try {
      const pool = await poolPromise;
      
      // Verificar si el boleto está disponible
      const checkResult = await pool.request()
        .input('ticketNumber', sql.Char(4), ticketNumber)
        .query(`
          SELECT Status FROM Tickets
          WHERE TicketNumber = @ticketNumber
        `);
      
      if (checkResult.recordset.length === 0) {
        throw new Error(`Boleto ${ticketNumber} no encontrado`);
      }
      
      if (checkResult.recordset[0].Status !== 'available') {
        throw new Error(`Boleto ${ticketNumber} no está disponible`);
      }
      
      // Reservar el boleto
      const result = await pool.request()
        .input('ticketNumber', sql.Char(4), ticketNumber)
        .input('userId', sql.Int, userId)
        .input('status', sql.VarChar, 'reserved')
        .input('now', sql.DateTime, new Date())
        .query(`
          UPDATE Tickets
          SET Status = @status,
              ReservedAt = @now,
              UserId = @userId,
              UpdatedAt = @now
          WHERE TicketNumber = @ticketNumber;
          
          SELECT TicketId, TicketNumber, Status, ReservedAt, UserId, CreatedAt, UpdatedAt
          FROM Tickets
          WHERE TicketNumber = @ticketNumber
        `);
      
      return result.recordset[0];
    } catch (error) {
      console.error(`Error al reservar boleto ${ticketNumber}:`, error);
      throw error;
    }
  }

  /**
   * Marca un boleto como pagado
   * @param {string} ticketNumber - Número de boleto (4 dígitos)
   */
  async markTicketAsPaid(ticketNumber) {
    try {
      const pool = await poolPromise;
      
      const result = await pool.request()
        .input('ticketNumber', sql.Char(4), ticketNumber)
        .input('status', sql.VarChar, 'paid')
        .input('now', sql.DateTime, new Date())
        .query(`
          UPDATE Tickets
          SET Status = @status,
              UpdatedAt = @now
          WHERE TicketNumber = @ticketNumber;
          
          SELECT TicketId, TicketNumber, Status, ReservedAt, UserId, CreatedAt, UpdatedAt
          FROM Tickets
          WHERE TicketNumber = @ticketNumber
        `);
      
      if (result.recordset.length === 0) {
        throw new Error(`Boleto ${ticketNumber} no encontrado`);
      }
      
      return result.recordset[0];
    } catch (error) {
      console.error(`Error al marcar boleto ${ticketNumber} como pagado:`, error);
      throw error;
    }
  }

  /**
   * Libera los boletos que no han sido pagados después de 48 horas
   */
  async releaseUnpaidTickets() {
    try {
      const pool = await poolPromise;
      
      // Llamar al procedimiento almacenado
      await pool.request().execute('ReleaseUnpaidTickets');
      
      // Contar cuántos boletos fueron liberados
      const result = await pool.request().query(`
        SELECT COUNT(*) AS liberatedCount
        FROM Tickets
        WHERE Status = 'available' AND UpdatedAt > DATEADD(MINUTE, -5, GETDATE())
      `);
      
      return { liberatedCount: result.recordset[0].liberatedCount };
    } catch (error) {
      console.error('Error al liberar boletos no pagados:', error);
      throw error;
    }
  }
  
  /**
   * Busca boletos por filtros
   * @param {Object} filters - Filtros de búsqueda
   * @param {string} filters.status - Estado del boleto (available, reserved, paid)
   * @param {string} filters.startNumber - Rango inicial de números
   * @param {string} filters.endNumber - Rango final de números
   * @param {number} limit - Cantidad máxima de boletos a retornar
   * @param {number} offset - Offset para paginación
   */
  async searchTickets(filters = {}, limit = 100, offset = 0) {
    try {
      const pool = await poolPromise;
      const request = pool.request()
        .input('limit', sql.Int, limit)
        .input('offset', sql.Int, offset);
      
      let query = `
        SELECT TicketId, TicketNumber, Status, ReservedAt, UserId
        FROM Tickets
        WHERE 1=1
      `;
      
      // Aplicar filtros
      if (filters.status) {
        request.input('status', sql.VarChar, filters.status);
        query += ` AND Status = @status`;
      }
      
      if (filters.startNumber) {
        request.input('startNumber', sql.Char(4), filters.startNumber);
        query += ` AND TicketNumber >= @startNumber`;
      }
      
      if (filters.endNumber) {
        request.input('endNumber', sql.Char(4), filters.endNumber);
        query += ` AND TicketNumber <= @endNumber`;
      }
      
      // Agregar paginación
      query += `
        ORDER BY TicketNumber
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY
      `;
      
      const result = await request.query(query);
      return result.recordset;
    } catch (error) {
      console.error('Error al buscar boletos:', error);
      throw error;
    }
  }
}

module.exports = new TicketModel();