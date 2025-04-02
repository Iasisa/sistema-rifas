// src/frontend/src/components/Header.js
import React, { useState } from 'react';
import './Header.css';

const Header = ({ currentStep, setCurrentStep, onReset }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleTabClick = (step) => {
    setCurrentStep(step);
  };

  const handleCancel = () => {
    if (window.confirm('¿Estás seguro que deseas cancelar y volver al inicio?')) {
      onReset();
    }
  };

  // Solo mostrar el botón de cancelar si no estamos en el paso inicial
  // y no estamos en administración
  const showCancelButton = currentStep !== 'selection' && currentStep !== 'admin';

  return (
    <header className="site-header">
      <div className="header-container">
        <div className="header-logo-container" onClick={() => handleTabClick('selection')} style={{cursor: 'pointer'}}>
          <div className="logo">
            <div className="logo-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" strokeWidth="2" />
                <path d="M12 6V12L16 14" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="logo-text">Sistema de Rifas</div>
          </div>
          <div className="header-tagline">¡La suerte está de tu lado!</div>
        </div>

        {/* Botón para menú móvil */}
        <button className="mobile-menu-button" onClick={toggleMobileMenu}>
          <div className={`menu-icon ${mobileMenuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>

        {/* Navegación principal */}
        <nav className={`main-navigation ${mobileMenuOpen ? 'open' : ''}`}>
          <ul className="nav-links">
            <li className="nav-item">
              <a href="#" className="nav-link active" onClick={() => handleTabClick('selection')}>Inicio</a>
            </li>
            <li className="nav-item">
              <a href="#" className="nav-link">¿Cómo participar?</a>
            </li>
            <li className="nav-item">
              <a href="#" className="nav-link">Premios</a>
            </li>
            <li className="nav-item">
              <a href="#" className="nav-link admin-link" onClick={() => handleTabClick('admin')}>Administración</a>
            </li>
          </ul>
        </nav>
      </div>
      
      {/* Navegación secundaria/tabs con indicadores de proceso */}
      <div className="secondary-navigation-container">
        <div className="secondary-navigation">
          <div className="process-steps">
            <button 
              className={`tab-button ${currentStep === 'selection' ? 'active' : ''}`}
              onClick={() => handleTabClick('selection')}
            >
              <span className="step-number">1</span> Selección de Boletos
            </button>
            
            <div className="step-arrow">→</div>
            
            <button 
              className={`tab-button ${currentStep === 'form' ? 'active' : ''}`}
              onClick={() => handleTabClick('form')}
              disabled={!currentStep || currentStep === 'selection'}
            >
              <span className="step-number">2</span> Formulario
            </button>
            
            <div className="step-arrow">→</div>
            
            <button 
              className={`tab-button ${currentStep === 'ticket' ? 'active' : ''}`}
              onClick={() => handleTabClick('ticket')}
              disabled={!currentStep || currentStep === 'selection' || currentStep === 'form'}
            >
              <span className="step-number">3</span> Boleto
            </button>
          </div>
          
          {showCancelButton && (
            <button 
              className="tab-button cancel-button"
              onClick={handleCancel}
            >
              Cancelar y volver al inicio
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;