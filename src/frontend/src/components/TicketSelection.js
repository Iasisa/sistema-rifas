// src/frontend/src/components/TicketSelection.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TicketSelection = ({ onTicketSelect }) => {
  const [availableTickets, setAvailableTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [searchNumber, setSearchNumber] = useState('');
  const [displayRange, setDisplayRange] = useState({ start: 0, end: 99 });
  const [statusFilter, setStatusFilter] = useState('all');
  const [totalTickets, setTotalTickets] = useState(0);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        
        // Construir la URL con parámetros de paginación
        let url;
        if (statusFilter === 'all' || statusFilter === 'available') {
          url = `http://localhost:3000/api/tickets/search?limit=100&offset=${displayRange.start}`;
        } else {
          url = `http://localhost:3000/api/tickets/search?status=${statusFilter}&limit=100&offset=${displayRange.start}`;
        }
        
        // Realizar la petición a la API
        const response = await axios.get(url);
        
        setAvailableTickets(response.data.data);
        // Si la respuesta incluye el total, actualizarlo
        if (response.data.total) {
          setTotalTickets(response.data.total);
        }
        
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
    // Validar que sea un número de 4 dígitos
    if (!searchNumber.match(/^\d{4}$/)) {
      alert('Por favor ingresa un número de 4 dígitos');
      return;
    }

    try {
      setLoading(true);
      
      // Buscar el boleto específico en la API
      const response = await axios.get(`http://localhost:3000/api/tickets/${searchNumber}`);
      
      if (response.data.success) {
        const ticket = response.data.data;
        
        if (ticket.Status !== 'available') {
          alert(`Este boleto ya está ${ticket.Status === 'paid' ? 'vendido' : 'reservado'}`);
          setLoading(false);
          return;
        }
        
        // Si está disponible, seleccionarlo
        addToSelection(searchNumber);
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

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-4">Selecciona tus números</h2>
      <p className="mb-4">Elige uno o más números del 0000 al 9999 para participar en nuestra rifa.</p>
      
      {/* Filtros y búsqueda */}
      <div className="mb-4 flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Buscar número específico</label>
          <input 
            type="text" 
            placeholder="Ej: 1234" 
            className="mt-1 p-2 border rounded" 
            maxLength="4"
            value={searchNumber}
            onChange={(e) => setSearchNumber(e.target.value)}
          />
          <button 
            className="bg-blue-500 text-white px-3 py-2 rounded ml-2"
            onClick={handleSearch}
          >
            Buscar
          </button>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Estado</label>
          <select 
            className="mt-1 p-2 border rounded"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos</option>
            <option value="available">Disponibles</option>
            <option value="reserved">Reservados</option>
            <option value="paid">Vendidos</option>
          </select>
        </div>
      </div>
      
      {/* Leyenda */}
      <div className="mb-4 flex gap-4">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-white border border-gray-300 mr-2"></div>
          <span>Disponible</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-500 mr-2"></div>
          <span>Seleccionado</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-orange-500 mr-2"></div>
          <span>Reservado (48 hrs)</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-500 mr-2"></div>
          <span>Vendido</span>
        </div>
      </div>
      
      {/* Navegación de números */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <button 
            className={`bg-gray-200 px-3 py-1 rounded ${displayRange.start === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={navigatePrevious} 
            disabled={displayRange.start === 0}
          >
            ← Anterior
          </button>
          <span>Mostrando {displayRange.start.toString().padStart(4, '0')}-{displayRange.end.toString().padStart(4, '0')}</span>
          <button 
            className={`bg-gray-200 px-3 py-1 rounded ${displayRange.end >= 9999 ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={navigateNext} 
            disabled={displayRange.end >= 9999}
          >
            Siguiente →
          </button>
        </div>
        
        {/* Grid de números */}
        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mr-2"></div>
            Cargando boletos...
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">{error}</div>
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
      </div>
      
      {/* Números seleccionados */}
      <div className="mb-4">
        <h3 className="font-medium mb-2">Números seleccionados:</h3>
        <div className="flex flex-wrap gap-2 p-2 border rounded bg-gray-50">
          {selectedTickets.length === 0 ? (
            <span className="text-gray-500">Ninguno seleccionado</span>
          ) : (
            selectedTickets.map(ticket => (
              <span key={ticket} className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {ticket} 
                <button 
                  className="ml-1 text-xs text-gray-500 hover:text-red-500"
                  onClick={() => removeFromSelection(ticket)}
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>
      </div>
      
      <button 
        className={`bg-green-500 text-white px-4 py-2 rounded font-medium ${selectedTickets.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={selectedTickets.length === 0}
        onClick={() => onTicketSelect && onTicketSelect(selectedTickets)}
      >
        Continuar con la compra
      </button>
    </div>
  );
};

export default TicketSelection;