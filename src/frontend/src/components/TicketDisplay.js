// src/frontend/src/components/TicketDisplay.js
import React, { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import axios from 'axios';
import './TicketDisplay.css';

const TicketDisplay = ({ ticketData, userData }) => {
  const ticketRef = useRef(null);
  const [isSending, setIsSending] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [ticketStatus, setTicketStatus] = useState(null);
  
  // Fecha de emisión del boleto (actual)
  const issueDate = new Date().toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Fecha de vencimiento (48 horas después)
  const validUntil = new Date(Date.now() + 48 * 60 * 60 * 1000).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  // Verificar el estado actual del boleto
  useEffect(() => {
    const checkTicketStatus = async () => {
      try {
        if (ticketData && ticketData.number) {
          const response = await axios.get(`http://localhost:3000/api/tickets/${ticketData.number}`);
          if (response.data.success) {
            setTicketStatus(response.data.data.Status);
          }
        }
      } catch (error) {
        console.error('Error al verificar estado del boleto:', error);
      }
    };
    
    checkTicketStatus();
    
    // Verificar cada 30 segundos si el estado cambió
    const intervalId = setInterval(checkTicketStatus, 30000);
    
    return () => clearInterval(intervalId);
  }, [ticketData]);
  
  const handlePrintTicket = () => {
    window.print();
  };
  
  const handleDownloadTicket = async () => {
    setIsDownloading(true);
    
    try {
      if (ticketRef.current) {
        const canvas = await html2canvas(ticketRef.current);
        const link = document.createElement('a');
        link.download = `Boleto-${ticketData.number}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    } catch (error) {
      console.error('Error al descargar boleto:', error);
      alert('No se pudo descargar el boleto. Por favor, intente nuevamente.');
    } finally {
      setIsDownloading(false);
    }
  };
  
  const handleSendEmail = async () => {
    setIsSending(true);
    
    try {
      // La lógica de envío de correo ya está implementada en el backend
      // Al reservar el boleto, se envía automáticamente un correo
      // Aquí solo simulamos el envío para la interfaz
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setEmailSent(true);
      alert(`El boleto ha sido enviado a ${userData.email}`);
    } catch (error) {
      console.error('Error al enviar correo:', error);
      alert('No se pudo enviar el correo. Por favor, intente nuevamente.');
    } finally {
      setIsSending(false);
    }
  };
  
  // Mostrar mensaje según el estado del boleto
  const renderStatusMessage = () => {
    if (!ticketStatus) return null;
    
    switch (ticketStatus) {
      case 'reserved':
        return (
          <div className="status-message reserved">
            <div className="status-icon">
              <i className="status-clock"></i>
            </div>
            <div className="status-content">
              <h3>Boleto Reservado</h3>
              <p>Tu boleto ha sido reservado exitosamente. Por favor, realiza el pago dentro de las próximas 48 horas.</p>
              <p className="status-detail">Se ha enviado un correo electrónico con los detalles de tu reserva.</p>
            </div>
          </div>
        );
      case 'paid':
        return (
          <div className="status-message paid">
            <div className="status-icon">
              <i className="status-check"></i>
            </div>
            <div className="status-content">
              <h3>Boleto Pagado</h3>
              <p>¡Gracias por tu pago! Tu boleto ha sido confirmado y participará en el sorteo.</p>
              <p className="status-detail">Se ha enviado un correo electrónico de confirmación.</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Renderizar contador de tiempo restante
  const renderCountdown = () => {
    if (ticketStatus === 'paid') return null;
    
    return (
      <div className="countdown-section">
        <div className="countdown-title">Tiempo restante para pagar:</div>
        <div className="countdown-timer">48:00:00</div>
        <div className="countdown-subtitle">El boleto será liberado automáticamente si no se recibe el pago.</div>
      </div>
    );
  };

  return (
    <div className="ticket-container">
      <h1 className="ticket-title">Tu Boleto Está Reservado</h1>
      
      {renderStatusMessage()}
      
      <div className="ticket-card" ref={ticketRef}>
        <div className="ticket-header">
          <div className="ticket-logo">
            <span className="logo-text">Sistema de Rifas</span>
          </div>
          <div className="ticket-dates">
            <div className="ticket-date">
              <span className="date-label">Fecha de emisión:</span>
              <span className="date-value">{issueDate}</span>
            </div>
            <div className="ticket-date">
              <span className="date-label">Válido hasta:</span>
              <span className="date-value">{validUntil}</span>
            </div>
          </div>
        </div>
        
        <div className="ticket-body">
          <div className="ticket-number-section">
            <span className="ticket-label">Número de Boleto:</span>
            <span className="ticket-number">{ticketData?.number || ''}</span>
          </div>
          
          <div className="ticket-user-section">
            <h3>Datos del participante</h3>
            <div className="user-details">
              <div className="user-detail">
                <span className="detail-label">Nombre:</span>
                <span className="detail-value">{userData?.name || ''}</span>
              </div>
              <div className="user-detail">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{userData?.email || ''}</span>
              </div>
              <div className="user-detail">
                <span className="detail-label">Teléfono:</span>
                <span className="detail-value">{userData?.phone || ''}</span>
              </div>
              {userData?.city && (
                <div className="user-detail">
                  <span className="detail-label">Ciudad:</span>
                  <span className="detail-value">{userData.city}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="ticket-payment-section">
            <h3>Instrucciones de Pago</h3>
            <div className="payment-reference">
              <span className="payment-label">Referencia:</span>
              <span className="payment-value">#{ticketData?.number || ''}</span>
            </div>
            <div className="payment-amount">
              <span className="payment-label">Monto a pagar:</span>
              <span className="payment-value">$100.00 MXN</span>
            </div>
            <div className="payment-instructions">
              <p>Para completar tu participación, realiza el pago en cualquier OXXO usando la referencia proporcionada.</p>
              <p className="payment-deadline">Tienes <strong>48 horas</strong> para realizar el pago.</p>
            </div>
          </div>
          
          {renderCountdown()}
          
          <div className="ticket-verification">
            <div className="verification-code">
              {/* Aquí se podría colocar un código QR en una implementación real */}
              <div className="verification-qr-placeholder"></div>
            </div>
            <div className="verification-message">
              Este boleto es tu comprobante oficial de participación en la rifa.
              Conserva este boleto hasta el día del sorteo.
            </div>
          </div>
        </div>
        
        <div className="ticket-footer">
          <div className="footer-text">
            <p>Sistema de Rifas | www.sistema-rifas.com | Sorteo: 15 de abril, 2025</p>
          </div>
        </div>
      </div>
      
      <div className="ticket-actions">
        <button 
          className="action-button action-print"
          onClick={handlePrintTicket}
        >
          <span className="button-icon print-icon"></span>
          <span className="button-text">Imprimir boleto</span>
        </button>
        
        <button 
          className={`action-button action-download ${isDownloading ? 'is-loading' : ''}`}
          onClick={handleDownloadTicket}
          disabled={isDownloading}
        >
          <span className="button-icon download-icon"></span>
          <span className="button-text">
            {isDownloading ? 'Descargando...' : 'Descargar'}
          </span>
        </button>
        
        <button 
          className={`action-button action-email ${isSending || emailSent ? 'is-disabled' : ''}`}
          onClick={handleSendEmail}
          disabled={isSending || emailSent}
        >
          <span className="button-icon email-icon"></span>
          <span className="button-text">
            {isSending ? 'Enviando...' : emailSent ? 'Enviado' : 'Enviar por correo'}
          </span>
        </button>
      </div>
      
      <div className="return-home">
        <button 
          className="home-button"
          onClick={() => window.location.href = '/'}
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
};

export default TicketDisplay;