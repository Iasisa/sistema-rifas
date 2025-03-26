// src/backend/scripts/initialize.js
const fs = require('fs');
const path = require('path');

/**
 * Script para inicializar las carpetas y archivos necesarios para el proyecto
 */
function initializeDirectories() {
  const rootDir = path.join(__dirname, '..');
  
  // Directorio de plantillas de correo
  const templatesDir = path.join(rootDir, 'templates');
  if (!fs.existsSync(templatesDir)) {
    fs.mkdirSync(templatesDir, { recursive: true });
    console.log('✅ Directorio de plantillas creado:', templatesDir);
  }
  
  // Directorio para archivos temporales
  const tempDir = path.join(rootDir, 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
    console.log('✅ Directorio temporal creado:', tempDir);
  }
  
  // Subdirectorio para uploads
  const uploadsDir = path.join(tempDir, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ Directorio de uploads creado:', uploadsDir);
  }
  
  // Verificar si existe el archivo .env
  const envPath = path.join(rootDir, '..', '..', '.env');
  if (!fs.existsSync(envPath)) {
    console.log('⚠️ No se encontró el archivo .env. Debes crear uno basado en .env.example');
  } else {
    console.log('✅ Archivo .env encontrado');
  }
  
  console.log('\n🚀 Inicialización completada. El sistema está listo para ejecutarse.');
}

// Ejecutar la función de inicialización
initializeDirectories();