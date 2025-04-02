// src/frontend/src/pages/TicketSelection.jsx
import React, { useState, useEffect } from 'react';
import SearchFilter from '../components/SearchFilter';
import NumberGrid from '../components/NumberGrid';

const TicketSelection = ({ onContinue }) => {
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Esta función simula un rango de números con diversos estados
  // En un entorno real, vendrían de una API
  const getNumbersForPage = (page) => {
    const start = page * 100;
    const numbers = [];
    
    for (let i = 0; i < 100; i++) {
      const num = (start + i).toString().padStart(4, '0');
      // Simulamos algunos números como vendidos o reservados
      let status = 'available';
      if (i % 10 === 2) status = 'sold';
      if (i % 10 === 5) status = 'reserved';
      
      numbers.push({
        number: num,
        status
      });
    }
    
    return numbers;
  };
  
  const [displayNumbers, setDisplayNumbers] = useState(getNumbersForPage(0));
  
  // Efectos para cambiar de página
  useEffect(() => {
    setDisplayNumbers(getNumbersForPage(currentPage));
  }, [currentPage]);
  
  // Manejar la selección de un número
  const handleNumberSelect = (number) => {
    if (selectedNumbers.includes(number)) {
      setSelectedNumbers(selectedNumbers.filter(num => num !== number));
    } else {
      setSelectedNumbers([...selectedNumbers, number]);
    }
  };
  
  // Manejar la eliminación de un número seleccionado
  const handleRemoveNumber = (number) => {
    setSelectedNumbers(selectedNumbers.filter(num => num !== number));
  };
  
  // Manejar la búsqueda de un número específico
  const handleSearch = () => {
    if (!searchTerm || !/^\d{1,4}$/.test(searchTerm)) {
      alert('Por favor ingresa un número válido de hasta 4 dígitos');
      return;
    }
    
    const formattedNumber = searchTerm.padStart(4, '0');
    const pageOfNumber = Math.floor(parseInt(formattedNumber) / 100);
    setCurrentPage(pageOfNumber);
    
    // Destacar el número buscado (en una implementación real podríamos hacer scroll a él)
  };
  
  // Navegar a la página anterior
  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  // Navegar a la página siguiente
  const goToNextPage = () => {
    if (currentPage < 99) { // 10000 números / 100 por página = 100 páginas (0-99)
      setCurrentPage(currentPage + 1);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-4">Selecciona tus números</h2>
      <p className="mb-4">Elige uno o más números del 0000 al 9999 para participar en nuestra rifa.</p>
      
      {/* Filtros y búsqueda */}
      <SearchFilter 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onSearch={handleSearch}
      />
      
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
            className="bg-gray-200 px-3 py-1 rounded"
            onClick={goToPreviousPage}
            disabled={currentPage === 0}
          >
            ← Anterior
          </button>
          <span>
            Mostrando {currentPage * 100}-{currentPage * 100 + 99}
          </span>
          <button 
            className="bg-gray-200 px-3 py-1 rounded"
            onClick={goToNextPage}
            disabled={currentPage === 99}
          >
            Siguiente →
          </button>
        </div>
        
        {/* Grid de números */}
        <NumberGrid 
          numbers={displayNumbers}
          selectedNumbers={selectedNumbers}
          onNumberSelect={handleNumberSelect}
        />
      </div>
      
      {/* Números seleccionados */}
      <div className="mb-4">
        <h3 className="font-medium mb-2">Números seleccionados:</h3>
        <div className="flex flex-wrap gap-2 p-2 border rounded bg-gray-50">
          {selectedNumbers.length === 0 ? (
            <span className="text-gray-500">Ningún número seleccionado</span>
          ) : (
            selectedNumbers.map(number => (
              <span key={number} className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {number}
                <button 
                  className="ml-1 text-xs"
                  onClick={() => handleRemoveNumber(number)}
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>
      </div>
      
      <button 
        className="bg-green-500 text-white px-4 py-2 rounded font-medium"
        onClick={() => onContinue(selectedNumbers)}
        disabled={selectedNumbers.length === 0}
      >
        Continuar con la compra
      </button>
    </div>
  );
};

export default TicketSelection;