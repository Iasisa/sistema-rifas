// src/frontend/src/components/PrivateRoute.js
import React from 'react';
import { useAuth } from '../context/AuthContext';
import LoginForm from './LoginForm';

/**
 * Componente para proteger rutas que requieren autenticación
 */
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  // Mostrar indicador de carga mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md mb-6 text-center py-10">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mr-2"></div>
        Verificando credenciales...
      </div>
    );
  }
  
  // Si no está autenticado, mostrar el formulario de login
  if (!isAuthenticated()) {
    return <LoginForm />;
  }
  
  // Si está autenticado, mostrar el contenido protegido
  return children;
};

export default PrivateRoute;