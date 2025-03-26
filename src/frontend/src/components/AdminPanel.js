// src/frontend/src/components/AdminPanel.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AdminPanel = () => {
  const { currentAdmin, logout } = useAuth();
  
  const [stats, setStats] = useState({
    soldTickets: 0,
    reservedTickets: 0,
    totalRevenue: 0
  });
  
  const [expiringTickets, setExpiringTickets] = useState([]);
  const [lastSync, setLastSync] = useState('No sincronizado');
  const [syncLoading, setSyncLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sendingReminder, setSendingReminder] = useState({});
  
  // Cargar datos al iniciar
  useEffect(() => {
    fetchStats();
    fetchExpiringTickets();
  }, []);
  
  // Función para cargar estadísticas
  const fetchStats = async () => {
    try {
      // Cargar estadísticas de boletos
      const ticketsResponse = await axios.get('http://localhost:3000/api/tickets/search?status=paid');
      const reservedResponse = await axios.get('http://localhost:3000/api/tickets/search?status=reserved');
      
      // Cargar estadísticas de pagos
      const paymentsResponse = await axios.get('http://localhost:3000/api/payments/stats');
      
      setStats({
        soldTickets: ticketsResponse.data.count || 0,
        reservedTickets: reservedResponse.data.count || 0,
        totalRevenue: paymentsResponse.data.data?.totalAmount || 0
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      setError('Error al cargar datos. Por favor, recargue la página.');
      setLoading(false);
    }
  };
  
  // Función para cargar boletos por vencer
  const fetchExpiringTickets = async () => {
    try {
      // En una implementación real, habría un endpoint específico para esto
      // Por ahora, obtenemos todos los boletos reservados
      const response = await axios.get('http://localhost:3000/api/tickets/search?status=reserved');
      
      // Convertir a formato para mostrar en la tabla
      const formattedTickets = response.data.data.map(ticket => {
        // Calcular tiempo restante
        const reservedAt = new Date(ticket.ReservedAt);
        const expiresAt = new Date(reservedAt.getTime() + (48 * 60 * 60 * 1000));
        const now = new Date();
        const hoursLeft = Math.max(0, Math.floor((expiresAt - now) / (60 * 60 * 1000)));
        
        // Solo incluir los que expiran en las próximas 12 horas
        if (hoursLeft <= 12) {
          return {
            number: ticket.TicketNumber,
            customer: `Usuario #${ticket.UserId}`, // En una versión real, obtendríamos el nombre
            expiresIn: `${hoursLeft} horas`,
            userId: ticket.UserId
          };
        }
        return null;
      }).filter(Boolean);
      
      setExpiringTickets(formattedTickets);
    } catch (error) {
      console.error('Error al cargar boletos por vencer:', error);
    }
  };
  
  const handleSync = async () => {
    if (!selectedFile) {
      alert('Por favor, seleccione un archivo CSV del estado de cuenta.');
      return;
    }
    
    setSyncLoading(true);
    
    try {
      // Preparar el archivo para subir
      const formData = new FormData();
      formData.append('bankStatement', selectedFile);
      
      // Enviar al backend
      const response = await axios.post('http://localhost:3000/api/payments/sync-bank', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        setLastSync(new Date().toLocaleString());
        alert(`Sincronización completada. ${response.data.data.processedCount} pagos procesados.`);
        
        // Actualizar estadísticas después de sincronizar
        fetchStats();
        fetchExpiringTickets();
      } else {
        alert('Error en la sincronización: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error al sincronizar:', error);
      alert('Error al sincronizar: ' + (error.response?.data?.message || error.message));
    } finally {
      setSyncLoading(false);
    }
  };
  
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };
  
  const handleReleaseTicket = async (number) => {
    try {
      // En una implementación real, habría un endpoint para esto
      // Por ahora, simulamos la liberación
      alert(`Boleto ${number} liberado correctamente.`);
      
      // Actualizar la lista
      setExpiringTickets(expiringTickets.filter(ticket => ticket.number !== number));
    } catch (error) {
      console.error(`Error al liberar boleto ${number}:`, error);
      alert('Error al liberar el boleto.');
    }
  };
  
  const handleNotifyCustomer = async (number) => {
    try {
      // Marcar como enviando
      setSendingReminder({
        ...sendingReminder,
        [number]: true
      });
      
      // Llamar al endpoint para enviar recordatorio
      const response = await axios.post(`http://localhost:3000/api/tickets/${number}/send-reminder`);
      
      if (response.data.success) {
        alert(`Se ha enviado un recordatorio de pago para el boleto ${number}.`);
      } else {
        alert(`Error al enviar recordatorio: ${response.data.message}`);
      }
    } catch (error) {
      console.error(`Error al notificar para boleto ${number}:`, error);
      alert('Error al enviar la notificación: ' + (error.response?.data?.message || error.message));
    } finally {
      // Quitar el estado de enviando
      setSendingReminder({
        ...sendingReminder,
        [number]: false
      });
    }
  };
  
  const handleReleaseUnpaid = async () => {
    try {
      setSyncLoading(true);
      
      // Llamar al endpoint para liberar boletos no pagados
      const response = await axios.post('http://localhost:3000/api/tickets/release-unpaid');
      
      if (response.data.success) {
        alert(response.data.message);
        
        // Actualizar estadísticas y lista de boletos
        fetchStats();
        fetchExpiringTickets();
      } else {
        alert('Error: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error al liberar boletos no pagados:', error);
      alert('Error al liberar boletos no pagados.');
    } finally {
      setSyncLoading(false);
    }
  };
  
  const handleSendAllReminders = async () => {
    if (expiringTickets.length === 0) {
      alert('No hay boletos por vencer para enviar recordatorios.');
      return;
    }
    
    if (!window.confirm(`¿Estás seguro de enviar recordatorios a ${expiringTickets.length} boletos?`)) {
      return;
    }
    
    setSyncLoading(true);
    
    try {
      let sentCount = 0;
      let failedCount = 0;
      
      // Enviar recordatorios en secuencia para evitar sobrecargar el servidor
      for (const ticket of expiringTickets) {
        try {
          // Actualizar el estado de envío para este boleto
          setSendingReminder({
            ...sendingReminder,
            [ticket.number]: true
          });
          
          // Llamar al endpoint
          const response = await axios.post(`http://localhost:3000/api/tickets/${ticket.number}/send-reminder`);
          
          if (response.data.success) {
            sentCount++;
          } else {
            failedCount++;
          }
        } catch (error) {
          console.error(`Error al enviar recordatorio para boleto ${ticket.number}:`, error);
          failedCount++;
        } finally {
          // Limpiar el estado de envío
          setSendingReminder({
            ...sendingReminder,
            [ticket.number]: false
          });
        }
        
        // Pequeña pausa entre envíos para no sobrecargar el servidor de correo
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      alert(`Proceso completado. Recordatorios enviados: ${sentCount}. Fallidos: ${failedCount}`);
    } catch (error) {
      console.error('Error al enviar recordatorios en masa:', error);
      alert('Error al enviar recordatorios en masa.');
    } finally {
      setSyncLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md mb-6 text-center py-10">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mr-2"></div>
        Cargando información...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="text-center text-red-500 py-10">
          <p>{error}</p>
          <button 
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => window.location.reload()}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      {/* Barra superior con información del admin y logout */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <div>
          <h2 className="text-xl font-semibold">Panel de Administración</h2>
          {currentAdmin && (
            <p className="text-sm text-gray-600">
              Usuario: <span className="font-medium">{currentAdmin.Username || currentAdmin.username}</span>
            </p>
          )}
        </div>
        <button 
          className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
          onClick={logout}
        >
          Cerrar sesión
        </button>
      </div>
      
      <div className="mb-6">
        <h3 className="font-medium mb-2">Sincronización con estado de cuenta</h3>
        <div className="flex items-center gap-4 mb-2">
          <p className="text-sm">Última sincronización: <strong>{lastSync}</strong></p>
          <button 
            className={`bg-indigo-500 text-white px-3 py-1 rounded text-sm ${syncLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleSync}
            disabled={syncLoading || !selectedFile}
          >
            {syncLoading ? 'Sincronizando...' : 'Sincronizar ahora'}
          </button>
        </div>
        <div className="mt-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subir estado de cuenta (CSV):
          </label>
          <input 
            type="file" 
            accept=".csv" 
            onChange={handleFileChange}
            className="text-sm"
          />
        </div>
        <div className="mt-4">
          <button
            className={`bg-orange-500 text-white px-3 py-1 rounded text-sm ${syncLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleReleaseUnpaid}
            disabled={syncLoading}
          >
            Liberar boletos no pagados
          </button>
          <p className="text-xs text-gray-500 mt-1">
            Esta acción liberará todos los boletos que fueron reservados hace más de 48 horas pero no han sido pagados.
          </p>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="font-medium mb-2">Resumen de ventas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-700">Boletos vendidos</p>
            <p className="font-bold text-2xl">{stats.soldTickets.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-orange-50 border border-orange-200 rounded">
            <p className="text-sm text-orange-700">Boletos reservados</p>
            <p className="font-bold text-2xl">{stats.reservedTickets}</p>
          </div>
          <div className="p-3 bg-green-50 border border-green-200 rounded">
            <p className="text-sm text-green-700">Recaudación total</p>
            <p className="font-bold text-2xl">${stats.totalRevenue.toLocaleString()}</p>
          </div>
        </div>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">Boletos por vencer (próximas 12 horas)</h3>
          
          {expiringTickets.length > 0 && (
            <button 
              className={`bg-blue-500 text-white text-sm px-3 py-1 rounded ${syncLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleSendAllReminders}
              disabled={syncLoading}
            >
              Enviar todos los recordatorios
            </button>
          )}
        </div>
        
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
              {expiringTickets.map((ticket) => (
                <tr key={ticket.number}>
                  <td className="px-6 py-4 whitespace-nowrap">{ticket.number}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{ticket.customer}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{ticket.expiresIn}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      className={`text-blue-600 hover:text-blue-900 mr-2 ${sendingReminder[ticket.number] ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => handleNotifyCustomer(ticket.number)}
                      disabled={sendingReminder[ticket.number]}
                    >
                      {sendingReminder[ticket.number] ? 'Enviando...' : 'Notificar'}
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
              {expiringTickets.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                    No hay boletos por vencer en las próximas 12 horas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;