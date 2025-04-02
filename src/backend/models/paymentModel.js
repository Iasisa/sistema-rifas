// src/backend/models/paymentModel.js
const { poolPromise, sql } = require('../config/db');

class PaymentModel {
  /**
   * Registra un nuevo pago
   * @param {Object} paymentData - Datos del pago
   * @param {string} paymentData.ticketNumber - Número de boleto
   * @param {number} paymentData.amount - Cantidad pagada
   * @param {string} paymentData.bankReference - Referencia bancaria (opcional)
   * @param {string} paymentData.status - Estado del pago (pending, completed, failed)
   */
  async createPayment(paymentData) {
    try {
      const pool = await poolPromise;
      
      const result = await pool.request()
        .input('ticketNumber', sql.Char(4), paymentData.ticketNumber)
        .input('amount', sql.Decimal(10, 2), paymentData.amount)
        .input('bankReference', sql.VarChar(50), paymentData.bankReference || null)
        .input('status', sql.VarChar(20), paymentData.status || 'pending')
        .input('now', sql.DateTime, new Date())
        .query(`
          INSERT INTO Payments (TicketNumber, Amount, PaymentDate, BankReference, Status, CreatedAt, UpdatedAt)
          VALUES (@ticketNumber, @amount, @now, @bankReference, @status, @now, @now);
          
          SELECT SCOPE_IDENTITY() AS PaymentId;
        `);
      
      const paymentId = result.recordset[0].PaymentId;
      
      // Si el pago es exitoso, actualizar el estado del boleto
      if (paymentData.status === 'completed') {
        await pool.request()
          .input('ticketNumber', sql.Char(4), paymentData.ticketNumber)
          .input('now', sql.DateTime, new Date())
          .query(`
            UPDATE Tickets
            SET Status = 'paid', UpdatedAt = @now
            WHERE TicketNumber = @ticketNumber
          `);
      }
      
      // Devolver el pago creado
      const newPayment = await pool.request()
        .input('paymentId', sql.Int, paymentId)
        .query(`
          SELECT PaymentId, TicketNumber, Amount, PaymentDate, BankReference, Status, CreatedAt, UpdatedAt
          FROM Payments
          WHERE PaymentId = @paymentId
        `);
        
      return newPayment.recordset[0];
    } catch (error) {
      console.error('Error al crear pago:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene los pagos asociados a un boleto
   * @param {string} ticketNumber - Número de boleto
   */
  async getPaymentsByTicket(ticketNumber) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('ticketNumber', sql.Char(4), ticketNumber)
        .query(`
          SELECT PaymentId, TicketNumber, Amount, PaymentDate, BankReference, Status, CreatedAt, UpdatedAt
          FROM Payments
          WHERE TicketNumber = @ticketNumber
          ORDER BY PaymentDate DESC
        `);
        
      return result.recordset;
    } catch (error) {
      console.error(`Error al obtener pagos del boleto ${ticketNumber}:`, error);
      throw error;
    }
  }
  
  /**
   * Sincroniza los pagos del estado de cuenta bancario
   * Este método simula la lectura del estado de cuenta
   * En una implementación real, leerías un archivo CSV o accederías a una API bancaria
   * @param {Array} bankTransactions - Transacciones bancarias del archivo
   */
  async syncBankPayments(bankTransactions) {
    try {
      const pool = await poolPromise;
      const transaction = pool.transaction();
      await transaction.begin();
      
      let processedCount = 0;
      
      try {
        for (const bankTx of bankTransactions) {
          // Verificar si la referencia corresponde a un número de boleto
          if (bankTx.reference && /^\d{4}$/.test(bankTx.reference)) {
            const ticketNumber = bankTx.reference;
            
            // Verificar si el boleto existe y no está pagado
            const ticketCheck = await transaction.request()
              .input('ticketNumber', sql.Char(4), ticketNumber)
              .query(`
                SELECT TicketId, Status FROM Tickets
                WHERE TicketNumber = @ticketNumber
              `);
            
            if (ticketCheck.recordset.length > 0 && ticketCheck.recordset[0].Status !== 'paid') {
              // Registrar el pago
              await transaction.request()
                .input('ticketNumber', sql.Char(4), ticketNumber)
                .input('amount', sql.Decimal(10, 2), bankTx.amount)
                .input('bankReference', sql.VarChar(50), bankTx.id || bankTx.reference)
                .input('paymentDate', sql.DateTime, new Date(bankTx.date))
                .input('now', sql.DateTime, new Date())
                .query(`
                  INSERT INTO Payments (TicketNumber, Amount, PaymentDate, BankReference, Status, CreatedAt, UpdatedAt)
                  VALUES (@ticketNumber, @amount, @paymentDate, @bankReference, 'completed', @now, @now);
                  
                  UPDATE Tickets
                  SET Status = 'paid', UpdatedAt = @now
                  WHERE TicketNumber = @ticketNumber;
                `);
              
              processedCount++;
            }
          }
        }
        
        await transaction.commit();
        return { success: true, processedCount };
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      console.error('Error al sincronizar pagos del banco:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene estadísticas de pagos
   */
  async getPaymentStats() {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query(`
        SELECT 
          COUNT(*) AS totalPayments,
          SUM(Amount) AS totalAmount,
          COUNT(DISTINCT TicketNumber) AS uniqueTickets,
          MAX(PaymentDate) AS lastPaymentDate
        FROM Payments
        WHERE Status = 'completed'
      `);
      
      return result.recordset[0];
    } catch (error) {
      console.error('Error al obtener estadísticas de pagos:', error);
      throw error;
    }
  }
}

module.exports = new PaymentModel();