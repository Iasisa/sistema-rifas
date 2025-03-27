// src/frontend/src/components/HowItWorks.js
import React from 'react';

const HowItWorks = () => {
  const steps = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
        </svg>
      ),
      title: 'Elige tu número',
      description: 'Selecciona uno o más números de tu preferencia entre 0000 y 9999.'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      title: 'Reserva tu boleto',
      description: 'Ingresa tus datos personales para reservar tu boleto seleccionado.'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      title: 'Realiza el pago',
      description: 'Tienes 48 horas para pagar tu boleto en cualquier OXXO o tienda de conveniencia.'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a4 4 0 00-4-4H8.8a4 4 0 00-3.2 1.6" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v5.4a4 4 0 001.6 3.2L12 16l5.4-4.4a4 4 0 001.6-3.2V3" />
        </svg>
      ),
      title: 'Espera el sorteo',
      description: 'Una vez confirmado tu pago, ¡ya estás participando! Espera el día del sorteo.'
    }
  ];

  const faqItems = [
    {
      question: '¿Cómo sé si gané?',
      answer: 'El ganador será anunciado en nuestra página web y se le contactará directamente a través del correo electrónico y teléfono proporcionados durante la reserva del boleto.'
    },
    {
      question: '¿Cuánto tiempo tengo para reclamar mi premio?',
      answer: 'Tienes 30 días calendario a partir de la fecha del sorteo para reclamar tu premio. Si no lo reclamas dentro de este período, se declarará desierto.'
    },
    {
      question: '¿Puedo transferir mi boleto a otra persona?',
      answer: 'No, los boletos no son transferibles. La persona que realiza la compra es la única que puede reclamar el premio.'
    },
    {
      question: '¿Qué pasa si no pago mi boleto a tiempo?',
      answer: 'Si no realizas el pago dentro de las 48 horas siguientes a la reserva, tu boleto será liberado automáticamente y quedará disponible para que otra persona lo adquiera.'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
      {/* Encabezado con fondo degradado */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 md:p-10">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">¿Cómo Funciona?</h2>
        <p className="text-blue-100">Participar en nuestra rifa es fácil y transparente. Sigue estos simples pasos:</p>
      </div>
      
      {/* Pasos del proceso */}
      <div className="p-6 md:p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center relative">
              {/* Línea conectora entre pasos */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 right-0 w-full h-1 bg-gray-200">
                  <div className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full border-2 border-gray-200 bg-white z-10"></div>
                </div>
              )}
              
              <div className="bg-blue-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                {step.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
        
        {/* Botón de acción */}
        <div className="text-center mt-10">
          <a 
            href="#" 
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transform transition-transform hover:scale-105"
          >
            Participa Ahora
          </a>
        </div>
      </div>
      
      {/* Preguntas frecuentes */}
      <div className="bg-gray-50 p-6 md:p-10 border-t border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Preguntas Frecuentes</h3>
        
        <div className="space-y-6">
          {faqItems.map((item, index) => (
            <div key={index} className="bg-white p-5 rounded-lg shadow-sm">
              <h4 className="text-lg font-medium text-gray-800 mb-2">{item.question}</h4>
              <p className="text-gray-600">{item.answer}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">¿Tienes más preguntas?</p>
          <a 
            href="#" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <span>Contacta con nosotros</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;