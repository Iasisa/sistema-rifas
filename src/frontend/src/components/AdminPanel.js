// src/frontend/src/components/AdminPanel.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './AdminPanel.css';

const AdminPanel = () => {
  const { currentAdmin, logout } = useAuth();
  
  // Estados
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
  const [activeTab, setActiveTab] = useState('dashboard');
  const [syncResult, setSyncResult] = useState(null);
  
  // Cargar datos al iniciar
  useEffect(() => {
    fetchStats();
    fetchExpiringTickets();
  }, []);
  
  // Función para cargar estadísticas
  const fetchStats = async () => {
    try {
      setLoading(true);
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
      const response = await axios.get('http://localhost:3000/api/tickets/search?status=reserved');
      
      // Convertir a formato para mostrar en la tabla
      const formattedTickets = response.data.data ? response.data.data.map(ticket => {
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
      }).filter(Boolean) : [];
      
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
    setSyncResult(null);
    
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
        setSyncResult({
          success: true,
          message: `Sincronización completada. ${response.data.data.processedCount} pagos procesados.`
        });
        
        // Actualizar estadísticas después de sincronizar
        fetchStats();
        fetchExpiringTickets();
      } else {
        setSyncResult({
          success: false,
          message: 'Error en la sincronización: ' + response.data.message
        });
      }
    } catch (error) {
      console.error('Error al sincronizar:', error);
      setSyncResult({
        success: false,
        message: 'Error al sincronizar: ' + (error.response?.data?.message || error.message)
      });
    } finally {
      setSyncLoading(false);
    }
  };
  
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setSyncResult(null);
  };
  
  const handleReleaseTicket = async (number) => {
    try {
      // Simulamos la liberación, en una implementación real, habría un endpoint para esto
      if (window.confirm(`¿Estás seguro de que deseas liberar el boleto ${number}?`)) {
        // Aquí iría la llamada a la API
        // await axios.post(`http://localhost:3000/api/tickets/${number}/release`);
        
        alert(`Boleto ${number} liberado correctamente.`);
        
        // Actualizar la lista
        setExpiringTickets(expiringTickets.filter(ticket => ticket.number !== number));
      }
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
      if (!window.confirm('¿Estás seguro de liberar todos los boletos no pagados? Esta acción no se puede deshacer.')) {
        return;
      }
      
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

  // Renderizar pantalla de carga
  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner"></div>
        <p>Cargando panel de administración...</p>
      </div>
    );
  }

  // Renderizar error
  if (error) {
    return (
      <div className="admin-error">
        <div className="error-icon">!</div>
        <h3>Error al cargar datos</h3>
        <p>{error}</p>
        <button 
          className="retry-button"
          onClick={() => window.location.reload()}
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1 className="admin-title">Panel de Administración</h1>
        <div className="admin-info">
          {currentAdmin && (
            <div className="admin-user">
              <span className="admin-name">{currentAdmin.Username || currentAdmin.username}</span>
              <span className="admin-role">Administrador</span>
            </div>
          )}
          <button 
            className="logout-button"
            onClick={logout}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
      
      <div className="admin-tabs">
        <button 
          className={`admin-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={`admin-tab ${activeTab === 'expiring' ? 'active' : ''}`}
          onClick={() => setActiveTab('expiring')}
        >
          Boletos por vencer ({expiringTickets.length})
        </button>
        <button 
          className={`admin-tab ${activeTab === 'sync' ? 'active' : ''}`}
          onClick={() => setActiveTab('sync')}
        >
          Sincronización Bancaria
        </button>
      </div>
      
      <div className="admin-content">
        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-section">
            <div className="stats-cards">
              <div className="stat-card sold">
                <div className="stat-icon sold-icon"></div>
                <div className="stat-content">
                  <h3 className="stat-title">Boletos Vendidos</h3>
                  <p className="stat-value">{stats.soldTickets.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="stat-card reserved">
                <div className="stat-icon reserved-icon"></div>
                <div className="stat-content">
                  <h3 className="stat-title">Boletos Reservados</h3>
                  <p className="stat-value">{stats.reservedTickets.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="stat-card revenue">
                <div className="stat-icon revenue-icon"></div>
                <div className="stat-content">
                  <h3 className="stat-title">Recaudación Total</h3>
                  <p className="stat-value">${stats.totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <div className="quick-actions">
              <h3 className="section-title">Acciones rápidas</h3>
              <div className="action-buttons">
                <button 
                  className="action-button sync-button"
                  onClick={() => setActiveTab('sync')}
                >
                  Sincronizar con Banco
                </button>
                
                <button 
                  className="action-button reminder-button"
                  onClick={handleSendAllReminders}
                  disabled={expiringTickets.length === 0 || syncLoading}
                >
                  Enviar Recordatorios ({expiringTickets.length})
                </button>
                
                <button 
                  className="action-button release-button"
                  onClick={handleReleaseUnpaid}
                  disabled={syncLoading}
                >
                  Liberar Boletos No Pagados
                </button>
              </div>
            </div>
            
            {expiringTickets.length > 0 && (
              <div className="expiring-preview">
                <div className="section-header">
                  <h3 className="section-title">Boletos por vencer pronto</h3>
                  <button 
                    className="view-all-button"
                    onClick={() => setActiveTab('expiring')}
                  >
                    Ver todos
                  </button>
                </div>
                
                <div className="expiring-preview-list">
                  {expiringTickets.slice(0, 3).map((ticket) => (
                    <div key={ticket.number} className="preview-item">
                      <div className="preview-number">#{ticket.number}</div>
                      <div className="preview-customer">{ticket.customer}</div>
                      <div className="preview-expires">Vence en: {ticket.expiresIn}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Boletos por vencer */}
        {activeTab === 'expiring' && (
          <div className="expiring-section">
            <div className="section-header">
              <h3 className="section-title">Boletos por vencer (próximas 12 horas)</h3>
              
              {expiringTickets.length > 0 && (
                <button 
                  className="send-all-button"
                  onClick={handleSendAllReminders}
                  disabled={syncLoading}
                >
                  {syncLoading ? 'Enviando...' : 'Enviar todos los recordatorios'}
                </button>
              )}
            </div>
            
            {expiringTickets.length === 0 ? (
              <div className="no-results">
                <p>No hay boletos por vencer en las próximas 12 horas.</p>
              </div>
            ) : (
              <div className="tickets-table-container">
                <table className="tickets-table">
                  <thead>
                    <tr>
                      <th>Número</th>
                      <th>Cliente</th>
                      <th>Vence en</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expiringTickets.map((ticket) => (
                      <tr key={ticket.number}>
                        <td className="ticket-number">#{ticket.number}</td>
                        <td>{ticket.customer}</td>
                        <td className="expiry-time">{ticket.expiresIn}</td>
                        <td className="actions-cell">
                          <button 
                            className="table-action notify-action"
                            onClick={() => handleNotifyCustomer(ticket.number)}
                            disabled={sendingReminder[ticket.number]}
                          >
                            {sendingReminder[ticket.number] ? 'Enviando...' : 'Notificar'}
                          </button>
                          <button 
                            className="table-action release-action"
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
            )}
          </div>
        )}
        
        {/* Sincronización Bancaria */}
        {activeTab === 'sync' && (
          <div className="sync-section">
            <div className="sync-info">
              <h3 className="section-title">Sincronización con estado de cuenta bancario</h3>
              <p className="sync-description">
                Sube un archivo CSV de tu estado de cuenta bancario para sincronizar automáticamente los pagos recibidos con los boletos reservados.
              </p>
              
              <div className="last-sync-info">
                <p>Última sincronización: <strong>{lastSync}</strong></p>
              </div>
            </div>
            
            <div className="sync-form">
              <div className="file-upload-container">
                <label htmlFor="bank-statement" className="file-label">
                  Seleccionar archivo CSV del estado de cuenta:
                </label>
                <div className="file-input-wrapper">
                  <input 
                    type="file" 
                    id="bank-statement"
                    accept=".csv" 
                    onChange={handleFileChange}
                    className="file-input"
                    disabled={syncLoading}
                  />
                  <div className="file-display">
                    {selectedFile ? selectedFile.name : 'Ningún archivo seleccionado'}
                  </div>
                  <label htmlFor="bank-statement" className="browse-button">
                    Examinar
                  </label>
                </div>
              </div>
              
              <button 
                className="sync-button"
                onClick={handleSync}
                disabled={!selectedFile || syncLoading}
              >
                {syncLoading ? (
                  <>
                    <span className="button-spinner"></span>
                    Sincronizando...
                  </>
                ) : 'Sincronizar ahora'}
              </button>
            </div>
            
            {syncResult && (
              <div className={`sync-result ${syncResult.success ? 'success' : 'error'}`}>
                <div className={`result-icon ${syncResult.success ? 'success-icon' : 'error-icon'}`}></div>
                <p className="result-message">{syncResult.message}</p>
              </div>
            )}
            
            <div className="release-section">
              <h3 className="section-title">Liberar boletos no pagados</h3>
              <p className="release-description">
                Esta acción liberará automáticamente todos los boletos que fueron reservados hace más de 48 horas y no han sido pagados.
              </p>
              <button 
                className="release-all-button"
                onClick={handleReleaseUnpaid}
                disabled={syncLoading}
              >
                {syncLoading ? 'Procesando...' : 'Liberar boletos no pagados'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;