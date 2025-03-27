// src/frontend/src/components/PromoBanner.js
import React, { useState } from 'react';

const PromoBanner = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  
  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };
  
  if (!isVisible) return null;
  
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 sm:p-6 relative overflow-hidden fade-in">
      {/* Formas decorativas */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-white opacity-10 rounded-full"></div>
        <div className="absolute left-10 bottom-10 w-16 h-16 bg-white opacity-10 rounded-full"></div>
        <div className="absolute right-32 bottom-8 w-8 h-8 bg-white opacity-10 rounded-full"></div>
      </div>
      
      <div className="container mx-auto relative">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0 text-center md:text-left">
            <h2 className="text-2xl font-bold mb-2">¡Gran Sorteo de Primavera!</h2>
            <p className="text-blue-100 max-w-xl">
              Participa en nuestro sorteo y gana premios increíbles. Elige tu número de la suerte hoy.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <div className="bg-white text-blue-600 px-5 py-3 rounded-lg text-center">
              <div className="text-2xl font-bold">$100,000</div>
              <div className="text-xs font-medium">PREMIO MAYOR</div>
            </div>
            
            <div className="bg-white/20 backdrop-blur-sm text-white px-5 py-3 rounded-lg text-center">
              <div className="text-2xl font-bold">26</div>
              <div className="text-xs font-medium">DÍAS RESTANTES</div>
            </div>
            
            <a 
              href="#" 
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg text-center font-medium transform transition-transform hover:scale-105"
            >
              ¡Compra Ahora!
            </a>
          </div>
        </div>
        
        {/* Botón para cerrar */}
        <button 
          onClick={handleClose}
          className="absolute right-0 top-0 p-2 text-white/80 hover:text-white"
          aria-label="Cerrar banner"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default PromoBanner;