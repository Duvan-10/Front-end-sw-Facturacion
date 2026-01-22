-- Migración: Crear tabla reportes
-- Ejecutar: mysql -u root -p nombre_base_datos < Backend/migrations/create_reportes_table.sql

CREATE TABLE IF NOT EXISTS reportes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reporte VARCHAR(50) NOT NULL COMMENT 'Código del reporte: RP_FAC, RP_CL, RP_PD',
  fecha DATE NOT NULL COMMENT 'Fecha del reporte generado',
  archivo VARCHAR(255) NOT NULL COMMENT 'Nombre del archivo/filtro aplicado',
  creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha y hora de creación',
  creado_por INT NOT NULL COMMENT 'ID del usuario que generó el reporte',
  
  CONSTRAINT fk_reportes_usuario FOREIGN KEY (creado_por) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_reporte (reporte),
  INDEX idx_fecha (fecha),
  INDEX idx_creado_por (creado_por)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
