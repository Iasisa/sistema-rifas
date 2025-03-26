// src/frontend/src/components/UserForm.js
import React, { useState } from 'react';
import axios from 'axios';

const UserForm = ({ selectedTickets, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Limpiar error cuando el usuario escribe
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    // Validar nombre
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }
    
    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Correo electrónico inválido';
    }
    
    // Validar teléfono (10 dígitos)
    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es obligatorio';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'El teléfono debe tener 10 dígitos';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        setIsSubmitting(true);
        
        // Para este ejemplo, solo reservamos el primer boleto seleccionado
        // En una versión más completa, podríamos manejar múltiples boletos
        const ticketNumber = selectedTickets[0];
        
        console.log(`Intentando reservar boleto ${ticketNumber} para ${formData.name}`);
        
        // Llamar a la API para reservar el boleto
        const response = await axios.post(
          `http://localhost:3000/api/tickets/${ticketNumber}/reserve`, 
          formData
        );
        
        console.log('Respuesta del servidor:', response.data);
        
        if (response.data.success) {
          // Si la reserva es exitosa, informar al componente padre
          onSubmit(formData);
        } else {
          alert('Error al reservar el boleto: ' + response.data.message);
        }
      } catch (error) {
        console.error('Error al reservar el boleto:', error);
        
        if (error.response && error.response.data) {
          alert('Error: ' + error.response.data.message);
        } else {
          alert('Error de conexión. Por favor, inténtelo de nuevo más tarde.');
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div id="user-form" className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-4">Ingresa tus datos</h2>
      
      {/* Mostrar números seleccionados */}
      {selectedTickets && selectedTickets.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 rounded-md">
          <h3 className="font-medium">Número(s) seleccionado(s):</h3>
          <div className="flex flex-wrap gap-2 mt-1">
            {selectedTickets.map(number => (
              <span key={number} className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {number}
              </span>
            ))}
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre completo *</label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`mt-1 p-2 border rounded w-full ${errors.name ? 'border-red-500' : ''}`}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Correo electrónico *</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`mt-1 p-2 border rounded w-full ${errors.email ? 'border-red-500' : ''}`}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Teléfono *</label>
            <input 
              type="tel" 
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`mt-1 p-2 border rounded w-full ${errors.phone ? 'border-red-500' : ''}`}
              maxLength={10}
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Ciudad</label>
            <input 
              type="text" 
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="mt-1 p-2 border rounded w-full"
            />
          </div>
        </div>
        
        <button 
          type="submit" 
          className={`bg-blue-500 text-white px-4 py-2 rounded font-medium ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Procesando...' : 'Generar boleto'}
        </button>
      </form>
    </div>
  );
};

export default UserForm;