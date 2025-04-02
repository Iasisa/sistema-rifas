// src/frontend/src/pages/AdminPanel.jsx
import React, { useState, useEffect } from 'react';

const AdminPanel = () => {
  const [lastSync, setLastSync] = useState('16/03/2025 08:30');
  const [stats, setStats] = useState({
    soldTickets: 1245,
    reservedTickets: 68,
    totalRevenue: 124500
  });
  const [expiringTickets, setExpiringTickets] = useState([
    { number: '1234', customer: 'María López', expiresIn: '5 horas' },
    { number: '5678', customer: 'Juan Pérez', expiresIn: '8 horas' },
    { number: '9012', customer: 'Ana Gómez', expiresIn: '10 horas' }
  ]);
  
  // Simular una sincronización
  const handleSync = () => {
    // En una implementación real, aquí llamaríamos a una API
    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    setLastSync(formattedDate);
    alert('Sincronización completada');
  };
  
  // Simular notificación a cliente
  const handleNotifyCustomer = (number, customer) => {
    // En una implementación real, aquí llamaríamos a una API
    alert(`Se ha enviado una notificación a ${customer} por el boleto ${number}`);
  };
  
  // Simular liberación de boleto
  const handleReleaseTicket = (number) => {
    // En una implementación real, aquí llamaríamos a una API
    if (window.confirm(`¿Está seguro de liberar el boleto ${number}?`)) {
      setExpiringTickets(expiringTickets.filter(ticket => ticket.number !== number));
      alert(`Boleto ${number} liberado correctamente`);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-4">Panel de Administración</h2>
      
      <div className="mb-4">
        <h3 className="font-medium mb-2">Sincronización con estado de cuenta</h3>
        <p className="text-sm mb-2">La última sincronización fue: <strong>{lastSync}</strong></p>
        <button 
          className="bg-indigo-500 text-white px-3 py-1 rounded text-sm"
          onClick={handleSync}
        >
          Sincronizar ahora
        </button>
      </div>
      
      <div className="mb-4">
        <h3 className="font-medium mb-2">Resumen de ventas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-700">Boletos vendidos</p>
            <p className="font-bold text-2xl">{stats.soldTickets.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-orange-50 border border-orange-200 rounded">
            <p className="text-sm text-orange-700">Boletos reservados</p>
            <p className="font-bold text-2xl">{stats.reservedTickets.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-green-50 border border-green-200 rounded">
            <p className="text-sm text-green-700">Recaudación total</p>
            <p className="font-bold text-2xl">${stats.totalRevenue.toLocaleString()}.00</p>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="font-medium mb-2">Boletos por vencer (próximas 12 horas)</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vence en</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {expiringTickets.map(ticket => (
                <tr key={ticket.number}>
                  <td className="px-6 py-4 whitespace-nowrap">{ticket.number}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{ticket.customer}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{ticket.expiresIn}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      className="text-blue-600 hover:text-blue-900 mr-2"
                      onClick={() => handleNotifyCustomer(ticket.number, ticket.customer)}
                    >
                      Notificar
                    </button>
                    <button 
                      className="text-red-600 hover:text-red-900"
                      onClick={() => handleReleaseTicket(ticket.number)}
                    >
                      Liberar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;