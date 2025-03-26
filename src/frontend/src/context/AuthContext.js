// src/frontend/src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Crear el contexto
const AuthContext = createContext(null);

// Constante para el token en localStorage
const TOKEN_KEY = 'auth_token';

export const AuthProvider = ({ children }) => {
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Configurar el token en los headers de axios cuando cambia
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [token]);
  
  // Verificar el token al cargar la aplicación
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:3000/api/auth/verify');
        
        if (response.data.success) {
          setCurrentAdmin(response.data.data.admin);
        } else {
          // Si el token no es válido, eliminarlo
          setToken(null);
          setCurrentAdmin(null);
        }
      } catch (error) {
        console.error('Error al verificar el token:', error);
        setToken(null);
        setCurrentAdmin(null);
      } finally {
        setLoading(false);
      }
    };
    
    verifyToken();
  }, [token]);
  
  // Función para iniciar sesión
  const login = async (username, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post('http://localhost:3000/api/auth/login', {
        username,
        password
      });
      
      if (response.data.success) {
        setToken(response.data.data.token);
        setCurrentAdmin(response.data.data.admin);
        return true;
      } else {
        setError(response.data.message || 'Error de autenticación');
        return false;
      }
    } catch (error) {
      console.error('Error de inicio de sesión:', error);
      setError(error.response?.data?.message || 'Error de conexión');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Función para cerrar sesión
  const logout = () => {
    setToken(null);
    setCurrentAdmin(null);
  };
  
  // Verificar si el usuario está autenticado
  const isAuthenticated = () => {
    return !!currentAdmin;
  };
  
  // Valores proporcionados por el contexto
  const value = {
    currentAdmin,
    loading,
    error,
    login,
    logout,
    isAuthenticated
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};

export default AuthContext;