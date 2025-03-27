// src/frontend/src/components/TicketSelection.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TicketSelection.css';

const TicketSelection = ({ onTicketSelect }) => {
  const [availableTickets, setAvailableTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [searchNumber, setSearchNumber] = useState('');
  const [displayRange, setDisplayRange] = useState({ start: 0, end: 99 });
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        
        // Construir la URL con parámetros de paginación y filtro
        let url = `http://localhost:3000/api/tickets/search?limit=100&offset=${displayRange.start}`;
        
        // Añadir filtro de estado si no es "todos"
        if (statusFilter !== 'all') {
          url += `&status=${statusFilter}`;
        }
        
        // Realizar la petición a la API
        const response = await axios.get(url);
        
        // Si no hay respuesta de la API, utilizamos un array vacío
        const ticketsData = response.data.data || [];
        
        setAvailableTickets(ticketsData);
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar boletos:', err);
        setError('Error al cargar boletos. Por favor, intente nuevamente.');
        setLoading(false);
      }
    };

    fetchTickets();
  }, [statusFilter, displayRange]);

  const handleSearch = async () => {
    // Validar que sea un número de 4 dígitos o menos
    if (!searchNumber.match(/^\d{1,4}$/)) {
      alert('Por favor ingresa un número entre 0 y 9999');
      return;
    }

    try {
      setLoading(true);
      
      // Formatear el número para que tenga 4 dígitos
      const formattedNumber = searchNumber.padStart(4, '0');
      
      // Buscar el boleto específico en la API
      const response = await axios.get(`http://localhost:3000/api/tickets/${formattedNumber}`);
      
      if (response.data.success) {
        const ticket = response.data.data;
        
        if (ticket.Status !== 'available') {
          alert(`Este boleto ${ticket.Status === 'paid' ? 'ya está vendido' : 'está reservado por otro usuario (48 hrs)'}`);
          setLoading(false);
          return;
        }
        
        // Si está disponible, seleccionarlo
        addToSelection(formattedNumber);

        // Navegar a la página correspondiente
        const pageNumber = Math.floor(parseInt(formattedNumber) / 100);
        setDisplayRange({
          start: pageNumber * 100,
          end: (pageNumber * 100) + 99
        });
      } else {
        alert('No se encontró el boleto');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error al buscar boleto:', error);
      alert('Error al buscar el boleto. Por favor, intente nuevamente.');
      setLoading(false);
    }
  };

  const addToSelection = (number) => {
    if (selectedTickets.includes(number)) {
      return; // Ya está seleccionado
    }
    
    setSelectedTickets([...selectedTickets, number]);
  };

  const removeFromSelection = (number) => {
    setSelectedTickets(selectedTickets.filter(ticket => ticket !== number));
  };

  const handleTicketClick = (ticket) => {
    if (ticket.Status !== 'available') {
      alert(`Este número no está disponible. ${ticket.Status === 'paid' ? 'Ya ha sido vendido.' : 'Está reservado por otro usuario (48 hrs).'}`);
      return; // No se puede seleccionar
    }
    
    if (selectedTickets.includes(ticket.TicketNumber)) {
      removeFromSelection(ticket.TicketNumber);
    } else {
      addToSelection(ticket.TicketNumber);
    }
  };

  const navigatePrevious = () => {
    if (displayRange.start > 0) {
      const newStart = Math.max(0, displayRange.start - 100);
      setDisplayRange({
        start: newStart,
        end: newStart + 99
      });
    }
  };

  const navigateNext = () => {
    const newStart = displayRange.end + 1;
    if (newStart < 10000) {
      setDisplayRange({
        start: newStart,
        end: Math.min(9999, newStart + 99)
      });
    }
  };

  // Verifica si hay tickets disponibles para mostrar
  const hasTicketsToShow = availableTickets && availableTickets.length > 0;

  return (
    <div className="ticket-selection-container">
      <h1 className="ticket-selection-title">Selecciona tus números</h1>
      <p className="ticket-selection-subtitle">Elige uno o más números del 0000 al 9999 para participar en nuestra rifa.</p>
      
      {/* Filtros y búsqueda */}
      <div className="filters-container">
        <div className="search-box">
          <label className="filter-label">Buscar número específico</label>
          <div className="search-input-container">
            <input 
              type="text" 
              placeholder="Ej: 1234" 
              className="search-input" 
              maxLength="4"
              value={searchNumber}
              onChange={(e) => setSearchNumber(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button 
              className="search-button"
              onClick={handleSearch}
            >
              Buscar
            </button>
          </div>
        </div>
        <div className="filter-box">
          <label className="filter-label">Filtrar por estado</label>
          <select 
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Mostrar todos</option>
            <option value="available">Solo disponibles</option>
            <option value="reserved">Solo reservados</option>
            <option value="paid">Solo vendidos</option>
          </select>
        </div>
      </div>
      
      {/* Leyenda */}
      <div className="legend-container">
        <h3 className="legend-title">Leyenda:</h3>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color available"></div>
            <span className="legend-label">Disponible</span>
          </div>
          <div className="legend-item">
            <div className="legend-color selected"></div>
            <span className="legend-label">Seleccionado</span>
          </div>
          <div className="legend-item">
            <div className="legend-color reserved"></div>
            <span className="legend-label">Reservado (48 hrs)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color sold"></div>
            <span className="legend-label">Vendido</span>
          </div>
        </div>
      </div>
      
      {/* Navegación de números */}
      <div className="navigation-container">
        <button 
          className="nav-button"
          onClick={navigatePrevious} 
          disabled={displayRange.start === 0}
        >
          ◀ Anterior
        </button>
        
        <div className="nav-range">
          Mostrando {displayRange.start.toString().padStart(4, '0')}-{displayRange.end.toString().padStart(4, '0')}
        </div>
        
        <button 
          className="nav-button"
          onClick={navigateNext} 
          disabled={displayRange.end >= 9999}
        >
          Siguiente ▶
        </button>
      </div>
      
      {/* Grid de números */}
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando boletos...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p>{error}</p>
          <button 
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            Reintentar
          </button>
        </div>
      ) : !hasTicketsToShow ? (
        <div className="empty-results">
          <p>No hay boletos que coincidan con el filtro seleccionado.</p>
        </div>
      ) : (
        <div className="number-grid">
          {availableTickets.map((ticket) => (
            <div 
              key={ticket.TicketNumber}
              className={`number-cell ${
                ticket.Status === 'paid' ? 'sold' : 
                ticket.Status === 'reserved' ? 'reserved' : 
                selectedTickets.includes(ticket.TicketNumber) ? 'selected' : ''
              }`}
              onClick={() => handleTicketClick(ticket)}
            >
              {ticket.TicketNumber}
            </div>
          ))}
        </div>
      )}
      
      {/* Números seleccionados */}
      <div className="selected-numbers-container">
        <h3 className="selected-numbers-title">Números seleccionados:</h3>
        <div className="selected-numbers-box">
          {selectedTickets.length === 0 ? (
            <div className="selected-numbers-empty">
              Ningún número seleccionado
            </div>
          ) : (
            selectedTickets.map(ticket => (
              <div key={ticket} className="selected-number-badge">
                {ticket} 
                <button 
                  className="remove-number-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromSelection(ticket);
                  }}
                  aria-label="Eliminar"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="selection-footer">
        <div className="selection-info">
          {selectedTickets.length > 0 ? 
            `Has seleccionado ${selectedTickets.length} número${selectedTickets.length > 1 ? 's' : ''}` : 
            'Selecciona al menos un número para continuar'
          }
        </div>
        <button 
          className="continue-button"
          disabled={selectedTickets.length === 0}
          onClick={() => onTicketSelect && onTicketSelect(selectedTickets)}
        >
          Continuar con la compra
          <span className="continue-button-icon">▶</span>
        </button>
      </div>
    </div>
  );
};

export default TicketSelection;