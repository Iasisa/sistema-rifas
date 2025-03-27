// src/frontend/src/components/LoginForm.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './LoginForm.css';

const LoginForm = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  
  const { login, loading, error } = useAuth();
  
  // Efecto para recuperar el nombre de usuario guardado
  useEffect(() => {
    const savedUsername = localStorage.getItem('rememberedUsername');
    if (savedUsername) {
      setFormData(prev => ({ ...prev, username: savedUsername }));
      setRememberMe(true);
    }
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Limpiar errores al escribir
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };
  
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };
  
  const handleRememberMeChange = () => {
    setRememberMe(!rememberMe);
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.username.trim()) {
      errors.username = 'El nombre de usuario es obligatorio';
    }
    
    if (!formData.password) {
      errors.password = 'La contraseña es obligatoria';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Guardar o eliminar el nombre de usuario según la opción "Recordarme"
    if (rememberMe) {
      localStorage.setItem('rememberedUsername', formData.username);
    } else {
      localStorage.removeItem('rememberedUsername');
    }
    
    // Intentar inicio de sesión
    const success = await login(formData.username, formData.password);
    
    if (success && onLoginSuccess) {
      onLoginSuccess();
    }
  };
  
  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <div className="logo-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" strokeWidth="2" />
                <path d="M12 6V12L16 14" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h1 className="login-title">Sistema de Rifas</h1>
          </div>
          <h2 className="login-subtitle">Acceso Administrativo</h2>
        </div>
        
        <div className="login-body">
          {error && (
            <div className="login-error">
              <div className="error-icon">!</div>
              <div className="error-message">{error}</div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username" className="form-label">Nombre de usuario</label>
              <div className={`input-container ${formErrors.username ? 'has-error' : ''}`}>
                <div className="input-icon username-icon"></div>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Ingresa tu nombre de usuario"
                  disabled={loading}
                  className="form-input"
                />
              </div>
              {formErrors.username && <div className="error-text">{formErrors.username}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="password" className="form-label">Contraseña</label>
              <div className={`input-container ${formErrors.password ? 'has-error' : ''}`}>
                <div className="input-icon password-icon"></div>
                <input
                  type={isPasswordVisible ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Ingresa tu contraseña"
                  disabled={loading}
                  className="form-input"
                />
                <button 
                  type="button"
                  className={`toggle-password ${isPasswordVisible ? 'visible' : ''}`}
                  onClick={togglePasswordVisibility}
                  tabIndex="-1"
                  aria-label={isPasswordVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
                ></button>
              </div>
              {formErrors.password && <div className="error-text">{formErrors.password}</div>}
            </div>
            
            <div className="form-options">
              <div className="remember-me">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={handleRememberMeChange}
                  className="remember-checkbox"
                />
                <label htmlFor="rememberMe" className="remember-label">Recordarme</label>
              </div>
              
              <a href="#" className="forgot-password">¿Olvidaste tu contraseña?</a>
            </div>
            
            <button
              type="submit"
              className={`login-button ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="button-spinner"></span>
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </form>
        </div>
        
        <div className="login-footer">
          <p>Este acceso es exclusivo para administradores del sistema</p>
          <p className="copyright">© {new Date().getFullYear()} Sistema de Rifas. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;