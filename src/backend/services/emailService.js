// src/backend/services/emailService.js
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

/**
 * Servicio para envío de correos electrónicos
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.initialized = false;
    this.templateCache = {};
    
    // Inicializar el transporter al instanciar el servicio
    this.initialize();
  }
  
  /**
   * Inicializa el transportador de correo electrónico
   */
  initialize() {
    try {
      // Configuración del transportador de nodemailer
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });
      
      this.initialized = true;
      
      console.log('Servicio de correo electrónico inicializado');
    } catch (error) {
      console.error('Error al inicializar el servicio de correo:', error);
      this.initialized = false;
    }
  }
  
  /**
   * Verifica si el servicio está correctamente inicializado
   */
  isInitialized() {
    return this.initialized && this.transporter !== null;
  }
  
  /**
   * Compila una plantilla de correo
   * @param {string} templateName - Nombre del archivo de plantilla (sin extensión)
   * @returns {Function} - Función compilada de Handlebars
   */
  async getTemplate(templateName) {
    try {
      // Si la plantilla ya está en caché, devolverla
      if (this.templateCache[templateName]) {
        return this.templateCache[templateName];
      }
      
      // Ruta a la plantilla
      const templatePath = path.join(__dirname, '../templates', `${templateName}.html`);
      
      // Leer el archivo de plantilla
      const templateSource = await fs.promises.readFile(templatePath, 'utf8');
      
      // Compilar la plantilla
      const template = handlebars.compile(templateSource);
      
      // Guardar en caché
      this.templateCache[templateName] = template;
      
      return template;
    } catch (error) {
      console.error(`Error al cargar la plantilla ${templateName}:`, error);
      throw error;
    }
  }
  
  /**
   * Envía un correo electrónico
   * @param {Object} options - Opciones de correo
   * @param {string} options.to - Destinatario
   * @param {string} options.subject - Asunto
   * @param {string} options.text - Texto plano (opcional si se proporciona html)
   * @param {string} options.html - Contenido HTML (opcional si se proporciona text)
   * @returns {Promise<Object>} - Resultado del envío
   */
  async sendEmail(options) {
    try {
      if (!this.isInitialized()) {
        throw new Error('El servicio de correo no está inicializado correctamente');
      }
      
      const mailOptions = {
        from: `"${process.env.EMAIL_SENDER_NAME || 'Sistema de Rifas'}" <${process.env.EMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        text: options.text || '',
        html: options.html || ''
      };
      
      const result = await this.transporter.sendMail(mailOptions);
      
      console.log(`Correo enviado a ${options.to}: ${result.messageId}`);
      
      return {
        success: true,
        messageId: result.messageId
      };
    } catch (error) {
      console.error('Error al enviar correo:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Envía un correo usando una plantilla
   * @param {string} templateName - Nombre de la plantilla
   * @param {Object} data - Datos para la plantilla
   * @param {Object} options - Opciones de correo (to, subject)
   * @returns {Promise<Object>} - Resultado del envío
   */
  async sendTemplateEmail(templateName, data, options) {
    try {
      const template = await this.getTemplate(templateName);
      
      const html = template(data);
      
      return await this.sendEmail({
        ...options,
        html
      });
    } catch (error) {
      console.error('Error al enviar correo con plantilla:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Envía un correo de confirmación de reserva de boleto
   * @param {Object} user - Datos del usuario
   * @param {Object} ticket - Datos del boleto
   * @returns {Promise<Object>} - Resultado del envío
   */
  async sendTicketReservationEmail(user, ticket) {
    const expirationDate = new Date(ticket.ReservedAt);
    expirationDate.setHours(expirationDate.getHours() + 48);
    
    return await this.sendTemplateEmail('ticket-reservation', {
      userName: user.Name,
      ticketNumber: ticket.TicketNumber,
      reservationDate: new Date(ticket.ReservedAt).toLocaleString(),
      expirationDate: expirationDate.toLocaleString(),
      paymentInstructions: 'Realiza el pago en cualquier OXXO usando la referencia de tu boleto.'
    }, {
      to: user.Email,
      subject: `Confirmación de Reserva - Boleto #${ticket.TicketNumber}`
    });
  }
  
  /**
   * Envía un correo de confirmación de pago
   * @param {Object} user - Datos del usuario
   * @param {Object} ticket - Datos del boleto
   * @param {Object} payment - Datos del pago
   * @returns {Promise<Object>} - Resultado del envío
   */
  async sendPaymentConfirmationEmail(user, ticket, payment) {
    return await this.sendTemplateEmail('payment-confirmation', {
      userName: user.Name,
      ticketNumber: ticket.TicketNumber,
      paymentDate: new Date(payment.PaymentDate).toLocaleString(),
      paymentAmount: payment.Amount,
      paymentReference: payment.BankReference || 'N/A'
    }, {
      to: user.Email,
      subject: `Pago Confirmado - Boleto #${ticket.TicketNumber}`
    });
  }
  
  /**
   * Envía un recordatorio de pago próximo a vencer
   * @param {Object} user - Datos del usuario
   * @param {Object} ticket - Datos del boleto
   * @param {number} hoursLeft - Horas restantes para vencimiento
   * @returns {Promise<Object>} - Resultado del envío
   */
  async sendPaymentReminderEmail(user, ticket, hoursLeft) {
    const expirationDate = new Date(ticket.ReservedAt);
    expirationDate.setHours(expirationDate.getHours() + 48);
    
    return await this.sendTemplateEmail('payment-reminder', {
      userName: user.Name,
      ticketNumber: ticket.TicketNumber,
      hoursLeft,
      expirationDate: expirationDate.toLocaleString(),
      paymentInstructions: 'Realiza el pago en cualquier OXXO usando la referencia de tu boleto.'
    }, {
      to: user.Email,
      subject: `Recordatorio de Pago - Boleto #${ticket.TicketNumber} (${hoursLeft} horas restantes)`
    });
  }
}

module.exports = new EmailService();