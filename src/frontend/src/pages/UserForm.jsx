// src/frontend/src/pages/UserForm.jsx
import React, { useState } from 'react';

const UserForm = ({ selectedNumbers, onFormSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: ''
  });
  
  const [errors, setErrors] = useState({});
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre completo es obligatorio';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El correo electrónico no es válido';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es obligatorio';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'El teléfono debe tener 10 dígitos';
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'La ciudad es obligatoria';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onFormSubmit(formData);
    }
  };
  
  return (
    <div id="user-form" className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-4">Ingresa tus datos</h2>
      
      {selectedNumbers && selectedNumbers.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 rounded-md">
          <p className="font-medium">Números seleccionados: {selectedNumbers.join(', ')}</p>
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
              required
              className={`mt-1 p-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded w-full`}
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
              required
              className={`mt-1 p-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded w-full`}
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
              required
              className={`mt-1 p-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded w-full`}
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Ciudad *</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              className={`mt-1 p-2 border ${errors.city ? 'border-red-500' : 'border-gray-300'} rounded w-full`}
            />
            {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
          </div>
        </div>
        
        <button 
          type="submit" 
          className="bg-blue-500 text-white px-4 py-2 rounded font-medium"
        >
          Generar boleto
        </button>
      </form>
    </div>
  );
};

export default UserForm;