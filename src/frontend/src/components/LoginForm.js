// src/frontend/src/components/LoginForm.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const LoginForm = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  
  const { login, loading, error } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación básica
    if (!username.trim() || !password.trim()) {
      setFormError('Por favor, complete todos los campos');
      return;
    }
    
    // Resetear errores
    setFormError('');
    
    // Intentar inicio de sesión
    const success = await login(username, password);
    
    if (success && onLoginSuccess) {
      onLoginSuccess();
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-6 text-center">Acceso Administrativo</h2>
      
      <form onSubmit={handleSubmit}>
        {/* Mensaje de error */}
        {(error || formError) && (
          <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700">
            <p>{formError || error}</p>
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="username">
            Usuario
          </label>
          <input
            id="username"
            type="text"
            className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            placeholder="Nombre de usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>
        
        <button
          type="submit"
          className={`w-full bg-blue-600 text-white p-2 rounded font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={loading}
        >
          {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
        </button>
      </form>
      
      <div className="mt-4 text-center text-sm text-gray-600">
        <p>Este acceso es únicamente para administradores del sistema</p>
      </div>
    </div>
  );
};

export default LoginForm;