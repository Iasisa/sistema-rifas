// src/frontend/src/components/UserForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserForm.css'; // Asegúrate de crear este archivo CSS

const UserForm = ({ selectedTickets, onSubmit }) => {
  // Estado del formulario
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: ''
  });
  
  // Estados adicionales
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formFeedback, setFormFeedback] = useState(null);
  
  // Calcular el precio total basado en la cantidad de boletos seleccionados
  const totalPrice = selectedTickets.length * 100;
  
  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Si el campo tiene un error y el usuario empieza a escribir, limpiar el error
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
    
    // Marcar el campo como tocado para validación en tiempo real
    if (!touched[name]) {
      setTouched({
        ...touched,
        [name]: true
      });
    }
  };
  
  // Validar un campo específico
  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        return !value.trim() 
          ? 'El nombre es obligatorio' 
          : value.trim().length < 3 
            ? 'El nombre debe tener al menos 3 caracteres'
            : null;
      
      case 'email':
        return !value.trim() 
          ? 'El correo electrónico es obligatorio' 
          : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) 
            ? 'Correo electrónico inválido'
            : null;
      
      case 'phone':
        return !value.trim() 
          ? 'El teléfono es obligatorio' 
          : !/^\d{10}$/.test(value.replace(/\D/g, '')) 
            ? 'El teléfono debe tener 10 dígitos'
            : null;
      
      default:
        return null;
    }
  };
  
  // Validar campo cuando pierde el foco
  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    // Marcar como tocado
    setTouched({
      ...touched,
      [name]: true
    });
    
    // Validar y establecer errores
    const error = validateField(name, value);
    if (error) {
      setErrors({
        ...errors,
        [name]: error
      });
    }
  };
  
  // Validar todos los campos del formulario
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;
    
    // Validar cada campo
    Object.keys(formData).forEach(field => {
      if (field === 'city') return; // La ciudad es opcional
      
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });
    
    setErrors(newErrors);
    return isValid;
  };
  
  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar todos los campos antes de enviar
    if (!validateForm()) {
      setFormFeedback({
        type: 'error',
        message: 'Por favor, corrige los errores en el formulario'
      });
      return;
    }
    
    setIsSubmitting(true);
    setFormFeedback(null);
    
    try {
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
        setFormFeedback({
          type: 'error',
          message: 'Error al reservar el boleto: ' + response.data.message
        });
      }
    } catch (error) {
      console.error('Error al reservar el boleto:', error);
      
      if (error.response && error.response.data) {
        setFormFeedback({
          type: 'error',
          message: 'Error: ' + error.response.data.message
        });
      } else {
        setFormFeedback({
          type: 'error',
          message: 'Error de conexión. Por favor, inténtelo de nuevo más tarde.'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validar automáticamente campos tocados cuando cambian
  useEffect(() => {
    const validationErrors = {};
    
    Object.keys(touched).forEach(field => {
      if (touched[field]) {
        const error = validateField(field, formData[field]);
        if (error) {
          validationErrors[field] = error;
        }
      }
    });
    
    setErrors(validationErrors);
  }, [formData, touched]);

  return (
    <div className="form-container">
      <h1 className="form-title">Ingresa tus datos</h1>
      
      {/* Mostrar números seleccionados */}
      {selectedTickets && selectedTickets.length > 0 && (
        <div className="tickets-summary">
          <h3>Número(s) seleccionado(s):</h3>
          <div className="selected-numbers">
            {selectedTickets.map(number => (
              <span key={number} className="number-badge">
                {number}
              </span>
            ))}
          </div>
          <div className="price-info">
            <span>Total a pagar:</span>
            <span className="price-value">${totalPrice.toFixed(2)} MXN</span>
          </div>
        </div>
      )}
      
      {/* Mensajes de retroalimentación */}
      {formFeedback && (
        <div className={`feedback-message ${formFeedback.type}`}>
          <p>{formFeedback.message}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="modern-inputs">
        <div className="form-row">
          <div className="input-data">
            <label htmlFor="name">Nombre completo</label>
            <input 
              id="name"
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              disabled={isSubmitting}
              placeholder="Escribe tu nombre completo"
            />
            {errors.name && (
              <div className="error-message">{errors.name}</div>
            )}
          </div>
          
          <div className="input-data">
            <label htmlFor="email">Correo electrónico</label>
            <input 
              id="email"
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              disabled={isSubmitting}
              placeholder="ejemplo@correo.com"
            />
            {errors.email && (
              <div className="error-message">{errors.email}</div>
            )}
          </div>
        </div>
        
        <div className="form-row">
          <div className="input-data">
            <label htmlFor="phone">Teléfono</label>
            <input 
              id="phone"
              type="tel" 
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              maxLength={10}
              disabled={isSubmitting}
              placeholder="10 dígitos"
            />
            {errors.phone && (
              <div className="error-message">{errors.phone}</div>
            )}
          </div>
          
          <div className="input-data">
            <label htmlFor="city">Ciudad</label>
            <input 
              id="city"
              type="text" 
              name="city"
              value={formData.city}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
              placeholder="¿De dónde nos visitas?"
            />
          </div>
        </div>
        
        <div className="info-section">
          <h4>Información importante:</h4>
          <ul>
            <li>Tienes 48 horas para realizar el pago después de reservar</li>
            <li>Recibirás un correo electrónico con las instrucciones de pago</li>
            <li>El número se liberará automáticamente si no se recibe el pago</li>
          </ul>
        </div>
        
        <div className="form-row submit-btn">
          <div className="input-data">
            <div className="inner"></div>
            <input 
              type="submit" 
              value={isSubmitting ? "Procesando..." : "Generar boleto"}
              disabled={isSubmitting}
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default UserForm;