# Configuración de Supabase

## Paso 1: Crear cuenta en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Click en "Start your project"
3. Regístrate con tu email o GitHub
4. Confirma tu email

## Paso 2: Crear un nuevo proyecto

1. Click en "New Project"
2. Llena los datos:
   - **Name**: `planillas-sistema` (o el nombre que prefieras)
   - **Database Password**: Crea una contraseña segura (guárdala bien)
   - **Region**: Selecciona la más cercana (ej: South America - São Paulo)
   - **Pricing Plan**: Free (es suficiente para empezar)
3. Click en "Create new project"
4. Espera 2-3 minutos mientras se crea el proyecto

## Paso 3: Obtener las claves de API

1. En el panel izquierdo, ve a **Settings** (⚙️)
2. Click en **API**
3. Encontrarás:

   **Project URL:**
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```

   **anon public key:**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

   **service_role key:** (Click en "Reveal" para verla)
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. Copia estas 3 claves

## Paso 4: Configurar variables de entorno

1. Abre el archivo `.env.local` en la raíz del proyecto
2. Reemplaza las siguientes líneas con tus claves:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Paso 5: Crear la tabla de usuarios

1. En el panel izquierdo de Supabase, ve a **SQL Editor**
2. Click en **+ New query**
3. Copia y pega este código:

```sql
-- Crear tabla de usuarios
CREATE TABLE usuarios (
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
CREATE INDEX idx_usuarios_email ON usuarios(email);

-- Crear índice para filtros por rol
CREATE INDEX idx_usuarios_rol ON usuarios(rol);

-- Crear función para actualizar automáticamente el campo actualizado_en
CREATE OR REPLACE FUNCTION actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para actualizar automáticamente actualizado_en
CREATE TRIGGER trigger_actualizar_usuarios_timestamp
BEFORE UPDATE ON usuarios
FOR EACH ROW
EXECUTE FUNCTION actualizar_timestamp();

-- Habilitar Row Level Security (RLS)
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

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
```

4. Click en **Run** (o presiona Ctrl+Enter)
5. Deberías ver el mensaje: "Success. No rows returned"

## Paso 6: Crear el primer usuario admin

1. En el **SQL Editor**, crea una nueva query
2. Copia y pega este código (MODIFICA el email, password y nombre):

```sql
INSERT INTO usuarios (email, password, nombre, rol, activo)
VALUES (
  'admin@tuempresa.com',  -- CAMBIAR por tu email
  '$2a$10$YourHashedPasswordHere',  -- Ver instrucciones abajo
  'Administrador Principal',  -- CAMBIAR por tu nombre
  'admin',
  true
);
```

### Generar el password hasheado:

**Opción 1: Usar herramienta online (TEMPORAL - solo para testing)**
1. Ve a [https://bcrypt-generator.com](https://bcrypt-generator.com)
2. Ingresa tu contraseña (ej: "Admin123!")
3. Rounds: 10
4. Click en "Generate"
5. Copia el hash generado (ej: `$2a$10$...`)
6. Reemplaza `$2a$10$YourHashedPasswordHere` con tu hash

**Opción 2: Usar Node.js (RECOMENDADO - más seguro)**
1. Abre una terminal en la carpeta del proyecto
2. Ejecuta:
```bash
node -e "const bcrypt = require('bcryptjs'); const hash = bcrypt.hashSync('Admin123!', 10); console.log(hash);"
```
3. Copia el hash que aparece
4. Úsalo en la query SQL

### Ejecutar la query:
1. Una vez tengas el hash correcto en la query
2. Click en **Run**
3. Deberías ver: "Success. 1 rows affected"

## Paso 7: Verificar que el usuario se creó correctamente

1. En el panel izquierdo, ve a **Table Editor**
2. Selecciona la tabla `usuarios`
3. Deberías ver tu usuario admin con todos los datos

## Paso 8: Generar una clave secreta para NextAuth

1. Abre una terminal
2. Ejecuta:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
3. Copia la clave generada
4. En `.env.local`, reemplaza:
```bash
NEXTAUTH_SECRET=la_clave_que_generaste_aqui
```

## Resumen de variables de entorno

Tu archivo `.env.local` debería verse así:

```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu_clave_secreta_generada_con_crypto

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# n8n Webhooks (ya configurados)
N8N_WEBHOOK_BUSCAR_EMPRESA=https://n8n-n8n.pu3ek7.easypanel.host/webhook/477d4671-55b7-4ce5-a786-d1641a69ba05
...
```

## ¡Listo!

Ahora puedes iniciar la aplicación con:

```bash
npm run dev
```

Y acceder a:
- **http://localhost:3000** → Redirige al login
- **http://localhost:3000/login** → Página de login

Usa las credenciales que creaste:
- Email: `admin@tuempresa.com`
- Password: `Admin123!` (o la que hayas elegido)

## Troubleshooting

### Error: "Invalid login credentials"
- Verifica que el email y password sean correctos
- Verifica que el password esté hasheado con bcrypt en la base de datos

### Error: "fetch failed"
- Verifica que las variables de entorno estén correctamente configuradas
- Reinicia el servidor de desarrollo (Ctrl+C y luego `npm run dev`)

### Error: "relation usuarios does not exist"
- Verifica que la tabla se haya creado correctamente en Supabase
- Ve a Table Editor y confirma que existe la tabla `usuarios`

## Seguridad

⚠️ **IMPORTANTE:**
- NUNCA subas el archivo `.env.local` a GitHub
- Ya está incluido en `.gitignore` por seguridad
- Las claves de Supabase son sensibles, mantenlas privadas
- Cambia el password del usuario admin después del primer login
