// src/frontend/src/App.js
import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import TicketSelection from './components/TicketSelection';
import UserForm from './components/UserForm';
import TicketDisplay from './components/TicketDisplay';
import AdminPanel from './components/AdminPanel';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  // Estados para manejar el flujo de la aplicación
  const [currentStep, setCurrentStep] = useState('selection'); // 'selection', 'form', 'ticket', 'admin'
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [userData, setUserData] = useState(null);
  const [ticketData, setTicketData] = useState(null);

  // Función para manejar la selección de boletos
  const handleTicketSelection = (tickets) => {
    setSelectedTickets(tickets);
    setCurrentStep('form');
  };

  // Función para manejar el envío del formulario de usuario
  const handleUserSubmit = (data) => {
    setUserData(data);
    
    // Por ahora, solo usamos el primer boleto seleccionado
    // En una versión más completa, se manejarían múltiples boletos
    setTicketData({
      number: selectedTickets[0],
      issueDate: new Date().toLocaleDateString(),
      validUntil: new Date(Date.now() + 48 * 60 * 60 * 1000).toLocaleDateString(),
    });
    
    setCurrentStep('ticket');
  };

  // Función para volver al inicio
  const handleReset = () => {
    setCurrentStep('selection');
    setSelectedTickets([]);
    setUserData(null);
    setTicketData(null);
  };

  // Renderizado condicional según el paso actual
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'selection':
        return <TicketSelection onTicketSelect={handleTicketSelection} />;
      case 'form':
        return <UserForm selectedTickets={selectedTickets} onSubmit={handleUserSubmit} />;
      case 'ticket':
        return <TicketDisplay ticketData={ticketData} userData={userData} />;
      case 'admin':
        return (
          <PrivateRoute>
            <AdminPanel />
          </PrivateRoute>
        );
      default:
        return <TicketSelection onTicketSelect={handleTicketSelection} />;
    }
  };

  return (
    <AuthProvider>
      <div className="App min-h-screen flex flex-col">
        <Header />
        
        <main className="container mx-auto p-4 flex-grow">
          {/* Navegación simple */}
          <div className="mb-6 bg-gray-100 p-3 rounded-lg">
            <nav className="flex flex-wrap space-x-2">
              <button 
                className={`px-3 py-1 rounded ${currentStep === 'selection' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                onClick={() => setCurrentStep('selection')}
              >
                Selección de Boletos
              </button>
              <button 
                className={`px-3 py-1 rounded ${currentStep === 'form' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                onClick={() => selectedTickets.length > 0 && setCurrentStep('form')}
                disabled={selectedTickets.length === 0}
              >
                Formulario
              </button>
              <button 
                className={`px-3 py-1 rounded ${currentStep === 'ticket' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                onClick={() => userData && setCurrentStep('ticket')}
                disabled={!userData}
              >
                Boleto
              </button>
              <button 
                className={`px-3 py-1 rounded ${currentStep === 'admin' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                onClick={() => setCurrentStep('admin')}
              >
                Administración
              </button>
              
              {/* Botón para volver al inicio */}
              {(currentStep === 'form' || currentStep === 'ticket') && (
                <button 
                  className="ml-auto px-3 py-1 rounded bg-red-500 text-white"
                  onClick={handleReset}
                >
                  Cancelar y volver al inicio
                </button>
              )}
            </nav>
          </div>
          
          {/* Componente actual según el paso */}
          {renderCurrentStep()}
        </main>
        
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;