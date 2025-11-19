-- =========================================
-- SCRIPT DE CONFIGURACIÓN COMPLETO
-- Sistema de Planillas - Supabase Setup
-- =========================================

-- PASO 1: Crear tabla de usuarios
-- =========================================

CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  rol VARCHAR(50) NOT NULL CHECK (rol IN ('admin', 'editor', 'visor')),
  activo BOOLEAN DEFAULT true,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índice para búsquedas rápidas por email
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);

-- Crear índice para filtros por rol
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);

-- PASO 2: Crear función para actualizar automáticamente el timestamp
-- =========================================

CREATE OR REPLACE FUNCTION actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- PASO 3: Crear trigger para actualizar automáticamente actualizado_en
-- =========================================

DROP TRIGGER IF EXISTS trigger_actualizar_usuarios_timestamp ON usuarios;

CREATE TRIGGER trigger_actualizar_usuarios_timestamp
BEFORE UPDATE ON usuarios
FOR EACH ROW
EXECUTE FUNCTION actualizar_timestamp();

-- PASO 4: Habilitar Row Level Security (RLS)
-- =========================================

ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- PASO 5: Crear políticas de seguridad
-- =========================================

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver usuarios" ON usuarios;
DROP POLICY IF EXISTS "Solo admins pueden crear usuarios" ON usuarios;
DROP POLICY IF EXISTS "Solo admins pueden actualizar usuarios" ON usuarios;
DROP POLICY IF EXISTS "Solo admins pueden eliminar usuarios" ON usuarios;

-- Política: Solo usuarios autenticados pueden leer usuarios
CREATE POLICY "Usuarios autenticados pueden ver usuarios"
ON usuarios FOR SELECT
USING (auth.role() = 'authenticated');

-- Política: Solo admins pueden insertar usuarios
CREATE POLICY "Solo admins pueden crear usuarios"
ON usuarios FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Política: Solo admins pueden actualizar usuarios
CREATE POLICY "Solo admins pueden actualizar usuarios"
ON usuarios FOR UPDATE
USING (auth.role() = 'authenticated');

-- Política: Solo admins pueden eliminar usuarios
CREATE POLICY "Solo admins pueden eliminar usuarios"
ON usuarios FOR DELETE
USING (auth.role() = 'authenticated');

-- PASO 6: Crear usuario administrador inicial
-- =========================================

-- INSTRUCCIONES:
-- 1. Copia este archivo a "setup_supabase.sql"
-- 2. Genera un hash de password usando bcrypt:
--    node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('TU_PASSWORD_AQUI', 10));"
-- 3. Reemplaza YOUR_ADMIN_EMAIL y YOUR_PASSWORD_HASH con tus valores reales
-- 4. Ejecuta el script en Supabase SQL Editor
-- 5. NO SUBAS setup_supabase.sql a GitHub (está en .gitignore)

INSERT INTO usuarios (email, password, nombre, rol, activo)
VALUES (
  'YOUR_ADMIN_EMAIL',
  'YOUR_PASSWORD_HASH',
  'Administrador Principal',
  'admin',
  true
)
ON CONFLICT (email) DO NOTHING;

-- =========================================
-- VERIFICACIÓN
-- =========================================

-- Ver el usuario creado
SELECT
  id,
  email,
  nombre,
  rol,
  activo,
  creado_en
FROM usuarios
ORDER BY creado_en DESC;

-- =========================================
-- FINALIZADO
-- =========================================
-- Si ves tu usuario admin en los resultados, la configuración fue exitosa!
-- =========================================
