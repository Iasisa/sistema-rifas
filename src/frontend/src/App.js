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
        <Header currentStep={currentStep} setCurrentStep={setCurrentStep} onReset={handleReset} />
        
        <main className="app-main">
          {renderCurrentStep()}
        </main>
        
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;