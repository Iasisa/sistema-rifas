// src/backend/models/adminModel.js
const { poolPromise, sql } = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class AdminModel {
  /**
   * Verifica las credenciales de un administrador
   * @param {string} username - Nombre de usuario
   * @param {string} password - Contraseña
   * @returns {Promise<object|null>} - Datos del administrador sin la contraseña o null si falla
   */
  async verifyCredentials(username, password) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('username', sql.VarChar(50), username)
        .query(`
          SELECT AdminId, Username, PasswordHash, Email, FullName, CreatedAt
          FROM Admins
          WHERE Username = @username
        `);
        
      if (result.recordset.length === 0) {
        return null;
      }
      
      const admin = result.recordset[0];
      
      // Verificar la contraseña
      const passwordMatch = await bcrypt.compare(password, admin.PasswordHash);
      
      if (!passwordMatch) {
        return null;
      }
      
      // No devolver la contraseña hash
      delete admin.PasswordHash;
      
      return admin;
    } catch (error) {
      console.error('Error al verificar credenciales:', error);
      throw error;
    }
  }
  
  /**
   * Genera un token JWT para el administrador
   * @param {object} admin - Datos del administrador
   * @returns {string} - Token JWT
   */
  generateToken(admin) {
    // El secret debería estar en variables de entorno
    const secretKey = process.env.JWT_SECRET || 'your_jwt_secret_key';
    
    const token = jwt.sign(
      { 
        adminId: admin.AdminId, 
        username: admin.Username,
        email: admin.Email
      },
      secretKey,
      { expiresIn: '8h' }
    );
    
    return token;
  }
  
  /**
   * Obtiene un administrador por su ID
   * @param {number} adminId - ID del administrador
   */
  async getAdminById(adminId) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('adminId', sql.Int, adminId)
        .query(`
          SELECT AdminId, Username, Email, FullName, CreatedAt, UpdatedAt
          FROM Admins
          WHERE AdminId = @adminId
        `);
        
      if (result.recordset.length === 0) {
        return null;
      }
      
      return result.recordset[0];
    } catch (error) {
      console.error(`Error al obtener administrador con ID ${adminId}:`, error);
      throw error;
    }
  }
  
  /**
   * Crea un nuevo administrador
   * @param {object} adminData - Datos del administrador
   * @param {string} adminData.username - Nombre de usuario
   * @param {string} adminData.password - Contraseña (será hasheada)
   * @param {string} adminData.email - Correo electrónico
   * @param {string} adminData.fullName - Nombre completo
   */
  async createAdmin(adminData) {
    try {
      // Hashear la contraseña
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(adminData.password, salt);
      
      const pool = await poolPromise;
      
      // Verificar si el nombre de usuario ya existe
      const checkUser = await pool.request()
        .input('username', sql.VarChar(50), adminData.username)
        .query(`
          SELECT COUNT(*) AS count FROM Admins
          WHERE Username = @username
        `);
      
      if (checkUser.recordset[0].count > 0) {
        throw new Error('El nombre de usuario ya está en uso');
      }
      
      // Crear el nuevo administrador
      const result = await pool.request()
        .input('username', sql.VarChar(50), adminData.username)
        .input('passwordHash', sql.VarChar(100), passwordHash)
        .input('email', sql.VarChar(100), adminData.email)
        .input('fullName', sql.VarChar(100), adminData.fullName || null)
        .input('now', sql.DateTime, new Date())
        .query(`
          INSERT INTO Admins (Username, PasswordHash, Email, FullName, CreatedAt, UpdatedAt)
          VALUES (@username, @passwordHash, @email, @fullName, @now, @now);
          
          SELECT SCOPE_IDENTITY() AS AdminId;
        `);
      
      const adminId = result.recordset[0].AdminId;
      
      // Retornar el administrador creado (sin la contraseña)
      const newAdmin = await pool.request()
        .input('adminId', sql.Int, adminId)
        .query(`
          SELECT AdminId, Username, Email, FullName, CreatedAt, UpdatedAt
          FROM Admins
          WHERE AdminId = @adminId
        `);
        
      return newAdmin.recordset[0];
    } catch (error) {
      console.error('Error al crear administrador:', error);
      throw error;
    }
  }
  
  /**
   * Inicializa el primer administrador si no existe ninguno
   * @param {object} defaultAdmin - Datos del administrador por defecto
   */
  async initializeDefaultAdmin(defaultAdmin) {
    try {
      const pool = await poolPromise;
      
      // Verificar si ya existen administradores
      const checkAdmins = await pool.request().query(`
        SELECT COUNT(*) AS count FROM Admins
      `);
      
      // Si no hay administradores, crear el administrador por defecto
      if (checkAdmins.recordset[0].count === 0) {
        await this.createAdmin(defaultAdmin);
        console.log('Administrador por defecto creado');
      }
    } catch (error) {
      console.error('Error al inicializar administrador por defecto:', error);
      throw error;
    }
  }
}

module.exports = new AdminModel();