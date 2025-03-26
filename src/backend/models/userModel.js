// src/backend/models/userModel.js
const { poolPromise, sql } = require('../config/db');

class UserModel {
  /**
   * Crea un nuevo usuario
   * @param {Object} userData - Datos del usuario
   * @param {string} userData.name - Nombre completo del usuario
   * @param {string} userData.email - Correo electrónico del usuario
   * @param {string} userData.phone - Teléfono del usuario
   * @param {string} userData.city - Ciudad del usuario (opcional)
   */
  async createUser(userData) {
    try {
      const pool = await poolPromise;
      
      // Verificar si el usuario ya existe
      const checkUser = await pool.request()
        .input('email', sql.NVarChar(100), userData.email)
        .query(`
          SELECT UserId FROM Users
          WHERE Email = @email
        `);
      
      // Si el usuario ya existe, retornar ese usuario
      if (checkUser.recordset.length > 0) {
        const existingUser = await pool.request()
          .input('userId', sql.Int, checkUser.recordset[0].UserId)
          .query(`
            SELECT UserId, Name, Email, Phone, City, CreatedAt, UpdatedAt
            FROM Users
            WHERE UserId = @userId
          `);
        return existingUser.recordset[0];
      }
      
      // Si no existe, crear un nuevo usuario
      const result = await pool.request()
        .input('name', sql.NVarChar(100), userData.name)
        .input('email', sql.NVarChar(100), userData.email)
        .input('phone', sql.VarChar(20), userData.phone)
        .input('city', sql.NVarChar(100), userData.city || null)
        .input('now', sql.DateTime, new Date())
        .query(`
          INSERT INTO Users (Name, Email, Phone, City, CreatedAt, UpdatedAt)
          VALUES (@name, @email, @phone, @city, @now, @now);
          
          SELECT SCOPE_IDENTITY() AS UserId;
        `);
      
      const userId = result.recordset[0].UserId;
      
      // Retornar el usuario creado
      const newUser = await pool.request()
        .input('userId', sql.Int, userId)
        .query(`
          SELECT UserId, Name, Email, Phone, City, CreatedAt, UpdatedAt
          FROM Users
          WHERE UserId = @userId
        `);
        
      return newUser.recordset[0];
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene un usuario por su ID
   * @param {number} userId - ID del usuario
   */
  async getUserById(userId) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('userId', sql.Int, userId)
        .query(`
          SELECT UserId, Name, Email, Phone, City, CreatedAt, UpdatedAt
          FROM Users
          WHERE UserId = @userId
        `);
        
      if (result.recordset.length === 0) {
        return null;
      }
      
      return result.recordset[0];
    } catch (error) {
      console.error(`Error al obtener usuario con ID ${userId}:`, error);
      throw error;
    }
  }
  
  /**
   * Obtiene un usuario por su correo electrónico
   * @param {string} email - Correo electrónico del usuario
   */
  async getUserByEmail(email) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('email', sql.NVarChar(100), email)
        .query(`
          SELECT UserId, Name, Email, Phone, City, CreatedAt, UpdatedAt
          FROM Users
          WHERE Email = @email
        `);
        
      if (result.recordset.length === 0) {
        return null;
      }
      
      return result.recordset[0];
    } catch (error) {
      console.error(`Error al obtener usuario con email ${email}:`, error);
      throw error;
    }
  }
  
  /**
   * Obtiene los boletos de un usuario
   * @param {number} userId - ID del usuario
   */
  async getUserTickets(userId) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('userId', sql.Int, userId)
        .query(`
          SELECT t.TicketId, t.TicketNumber, t.Status, t.ReservedAt, t.CreatedAt, t.UpdatedAt
          FROM Tickets t
          WHERE t.UserId = @userId
          ORDER BY t.Status, t.ReservedAt DESC
        `);
        
      return result.recordset;
    } catch (error) {
      console.error(`Error al obtener boletos del usuario ${userId}:`, error);
      throw error;
    }
  }
}

module.exports = new UserModel();