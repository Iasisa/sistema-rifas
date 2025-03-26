// src/frontend/src/pages/TicketDisplay.jsx
import React from 'react';

const TicketDisplay = ({ userData, ticketData, selectedNumbers }) => {
  // Función para obtener la fecha actual formateada
  const getCurrentDate = () => {
    const date = new Date();
    return date.toLocaleDateString('es-MX');
  };
  
  // Función para obtener la fecha de vencimiento (48 horas después)
  const getExpiryDate = () => {
    const date = new Date();
    date.setHours(date.getHours() + 48);
    return date.toLocaleDateString('es-MX');
  };
  
  // Maneja el botón de imprimir
  const handlePrint = () => {
    window.print();
  };
  
  // Maneja el botón de enviar por correo
  const handleSendEmail = () => {
    // En una implementación real, aquí llamaríamos a una API
    alert(`Se enviará un correo a ${userData.email} con los detalles del boleto.`);
  };
  
  return (
    <div id="ticket" className="bg-white p-6 rounded-lg shadow-md mb-6 border-2 border-blue-500">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-semibold">
          Boleto de Rifa #{selectedNumbers[0]}
        </h2>
        <div className="text-right">
          <p className="text-sm">Fecha de emisión: {getCurrentDate()}</p>
          <p className="text-sm">Válido hasta: {getExpiryDate()} (48 hrs)</p>
        </div>
      </div>
      
      <div className="mb-4">
        <h3 className="font-medium">Datos del participante:</h3>
        <p>{userData.name}</p>
        <p>{userData.email}</p>
        <p>{userData.phone}</p>
        <p>{userData.city}</p>
      </div>
      
      <div className="mb-4">
        <h3 className="font-medium">Número(s) seleccionado(s):</h3>
        <div className="flex flex-wrap gap-2 mt-1">
          {selectedNumbers.map(number => (
            <span key={number} className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {number}
            </span>
          ))}
        </div>
      </div>
      
      <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-medium text-yellow-800">Instrucciones de pago:</h3>
        <p className="text-sm mb-2">
          Para completar tu participación, realiza el pago en cualquier OXXO usando la siguiente referencia:
        </p>
        <div className="bg-white p-3 border border-gray-300 text-center">
          <p className="font-bold text-lg">
            Referencia: #{selectedNumbers[0]}
          </p>
          <p className="text-sm">
            Monto a pagar: ${(selectedNumbers.length * 100).toFixed(2)} MXN
          </p>
        </div>
        <p className="text-sm mt-2 text-red-600">
          IMPORTANTE: Tienes 48 horas para realizar el pago, de lo contrario tu número será liberado automáticamente.
        </p>
      </div>
      
      <div className="flex justify-between">
        <button 
          className="bg-gray-200 px-4 py-2 rounded font-medium"
          onClick={handlePrint}
        >
          Imprimir boleto
        </button>
        <button 
          className="bg-blue-500 text-white px-4 py-2 rounded font-medium"
          onClick={handleSendEmail}
        >
          Enviar por correo
        </button>
      </div>
    </div>
  );
};

export default TicketDisplay;