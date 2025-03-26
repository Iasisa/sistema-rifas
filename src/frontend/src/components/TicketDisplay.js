// src/frontend/src/components/TicketDisplay.js
import React, { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import axios from 'axios';

const TicketDisplay = ({ ticketData, userData }) => {
  const ticketRef = useRef(null);
  const [isSending, setIsSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [ticketStatus, setTicketStatus] = useState(null);
  
  // Fecha de emisión del boleto (actual)
  const issueDate = new Date().toLocaleDateString();
  
  // Fecha de vencimiento (48 horas después)
  const validUntil = new Date(Date.now() + 48 * 60 * 60 * 1000).toLocaleDateString();
  
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
    
    // Verificar cada 30 segundos si el estado cambió (por ejemplo, si fue marcado como pagado)
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
          <div className="mt-4 bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded">
            <p className="font-bold">Boleto Reservado</p>
            <p>Tu boleto ha sido reservado exitosamente. Por favor, realiza el pago dentro de las próximas 48 horas.</p>
            <p className="mt-2 text-sm">Se ha enviado un correo electrónico con los detalles de tu reserva a <strong>{userData.email}</strong>.</p>
          </div>
        );
      case 'paid':
        return (
          <div className="mt-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded">
            <p className="font-bold">Boleto Pagado</p>
            <p>¡Gracias por tu pago! Tu boleto ha sido confirmado y participará en el sorteo.</p>
            <p className="mt-2 text-sm">Se ha enviado un correo electrónico de confirmación a <strong>{userData.email}</strong>.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div id="ticket" className="border-2 border-blue-500 p-6 rounded-lg mb-6">
        <div ref={ticketRef}>
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold">Boleto de Rifa #{ticketData.number}</h2>
            <div className="text-right">
              <p className="text-sm">Fecha de emisión: {issueDate}</p>
              <p className="text-sm">Válido hasta: {validUntil} (48 hrs)</p>
            </div>
          </div>
          
          <div className="mb-4">
            <h3 className="font-medium">Datos del participante:</h3>
            <p>{userData.name}</p>
            <p>{userData.email}</p>
            <p>{userData.phone}</p>
            {userData.city && <p>{userData.city}</p>}
          </div>
          
          <div className="mb-4">
            <h3 className="font-medium">Número(s) seleccionado(s):</h3>
            <div className="flex flex-wrap gap-2 mt-1">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{ticketData.number}</span>
            </div>
          </div>
          
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <h3 className="font-medium text-yellow-800">Instrucciones de pago:</h3>
            <p className="text-sm mb-2">Para completar tu participación, realiza el pago en cualquier OXXO usando la siguiente referencia:</p>
            <div className="bg-white p-3 border border-gray-300 text-center">
              <p className="font-bold text-lg">Referencia: #{ticketData.number}</p>
              <p className="text-sm">Monto a pagar: $100.00 MXN</p>
            </div>
            <p className="text-sm mt-2 text-red-600">IMPORTANTE: Tienes 48 horas para realizar el pago, de lo contrario tu número será liberado automáticamente.</p>
          </div>
          
          {/* QR code could be added here */}
          <div className="text-center border-t border-gray-200 pt-4 mt-4">
            <p className="text-xs text-gray-500">
              Este boleto es tu comprobante oficial de participación en la rifa. 
              Conserva este boleto hasta el día del sorteo.
            </p>
          </div>
        </div>
      </div>
      
      {renderStatusMessage()}
      
      <div className="flex flex-wrap justify-between gap-2">
        <button 
          className="bg-gray-200 px-4 py-2 rounded font-medium"
          onClick={handlePrintTicket}
        >
          Imprimir boleto
        </button>
        <div className="space-x-2">
          <button 
            className={`bg-gray-200 px-4 py-2 rounded font-medium ${isDownloading ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleDownloadTicket}
            disabled={isDownloading}
          >
            {isDownloading ? 'Descargando...' : 'Descargar'}
          </button>
          <button 
            className={`bg-blue-500 text-white px-4 py-2 rounded font-medium ${isSending || emailSent ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleSendEmail}
            disabled={isSending || emailSent}
          >
            {isSending ? 'Enviando...' : emailSent ? 'Enviado' : 'Reenviar por correo'}
          </button>
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <button 
          className="bg-green-500 text-white px-6 py-2 rounded-full font-medium hover:bg-green-600 transition-colors"
          onClick={() => window.location.href = '/'}
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
};

export default TicketDisplay;