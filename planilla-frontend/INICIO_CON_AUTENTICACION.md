# Inicio Rápido - Sistema con Autenticación

## ✅ Checklist de Configuración

Antes de iniciar, asegúrate de haber completado:

- [ ] Cuenta creada en Supabase
- [ ] Proyecto creado en Supabase
- [ ] Tabla `usuarios` creada
- [ ] Usuario admin creado
- [ ] Variables de entorno configuradas en `.env.local`
- [ ] NEXTAUTH_SECRET generado

Si NO has completado estos pasos, sigue primero la guía: **[CONFIGURACION_SUPABASE.md](./CONFIGURACION_SUPABASE.md)**

## 🚀 Iniciar la Aplicación

### 1. Instalar dependencias (si aún no lo has hecho)

```bash
npm install
```

### 2. Verificar variables de entorno

Abre `.env.local` y verifica que tengas:

```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu_clave_secreta  # Debe estar configurada
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co  # Debe estar configurada
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...  # Debe estar configurada
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Debe estar configurada
```

### 3. Iniciar el servidor de desarrollo

```bash
npm run dev
```

Espera a ver el mensaje:
```
✓ Ready in X ms
○ Local:        http://localhost:3000
```

### 4. Abrir la aplicación

Abre tu navegador en: **http://localhost:3000**

Se redirigirá automáticamente a: **http://localhost:3000/login**

## 🔐 Primer Login

### Credenciales:
- **Email**: El que configuraste en Supabase (ej: `admin@tuempresa.com`)
- **Password**: La contraseña que usaste al crear el usuario (ej: `Admin123!`)

### Si el login es exitoso:
1. Se redirigirá a `/dashboard`
2. Verás el panel principal con 3 botones:
   - **Planillas** → Tu formulario actual
   - **Información de Planillas** → (Placeholder - próximamente)
   - **Gestionar Usuarios** → (Solo admin - Placeholder)

## 📋 Estructura de Navegación

```
http://localhost:3000
  ↓ (redirige a)
/dashboard
  ↓ (si NO autenticado → redirige a /login)
  ├─ /dashboard → Panel principal con botones
  ├─ /dashboard/planillas → Formulario de planillas (tu código actual)
  ├─ /dashboard/informacion-planillas → Historial (próximamente)
  └─ /dashboard/usuarios → Gestión de usuarios (solo admin - próximamente)
```

## 🎨 Flujo de Usuario

### Primera vez

1. Usuario abre `http://localhost:3000`
2. Middleware detecta: NO hay sesión
3. Redirige a `/login`
4. Usuario ve pantalla de login moderna
5. Ingresa email y password
6. NextAuth valida contra Supabase
7. Si correcto → Crea sesión y redirige a `/dashboard`
8. Usuario ve panel con 3 botones

### Sesión activa

1. Usuario abre `http://localhost:3000`
2. Middleware detecta: SÍ hay sesión válida
3. Permite acceso directo a `/dashboard`
4. Usuario ve panel con sus datos

### Navegación

```
Dashboard
  ↓ (Click en "Planillas")
/dashboard/planillas
  - Formulario completo de planillas
  - Funciona igual que antes
  - Ahora registra quién creó cada factura
```

## 🧪 Probar el Sistema

### Test 1: Login correcto
1. Ve a `/login`
2. Ingresa credenciales correctas
3. ✅ Deberías ver el dashboard

### Test 2: Login incorrecto
1. Ve a `/login`
2. Ingresa email o password incorrectos
3. ✅ Deberías ver alerta roja: "Credenciales incorrectas"

### Test 3: Protección de rutas
1. Cierra sesión (botón "Cerrar Sesión" en header)
2. Intenta acceder directamente a: `http://localhost:3000/dashboard`
3. ✅ Deberías ser redirigido a `/login`

### Test 4: Acceso a planillas
1. Login exitoso
2. Click en botón "Planillas"
3. ✅ Deberías ver tu formulario de planillas

### Test 5: Rol de admin
1. Login con usuario admin
2. En dashboard, deberías ver 3 botones:
   - Planillas
   - Información de Planillas
   - Gestionar Usuarios ← Solo admins
3. ✅ Verificar que aparece el botón "Gestionar Usuarios"

## 🔧 Solución de Problemas

### Error: "fetch failed" o "Network error"

**Causa**: Variables de entorno no configuradas

**Solución**:
1. Verifica que `.env.local` existe en la raíz del proyecto
2. Verifica que las variables estén correctamente copiadas
3. Reinicia el servidor: Ctrl+C y luego `npm run dev`

### Error: "Invalid login credentials"

**Causa**: Email o password incorrectos

**Solución**:
1. Verifica el email en Supabase (Table Editor → usuarios)
2. Si olvidaste el password, crea uno nuevo:
   ```bash
   node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('NuevoPassword123', 10));"
   ```
3. Actualiza en Supabase con SQL Editor:
   ```sql
   UPDATE usuarios
   SET password = '$2a$10$hash_generado_aqui'
   WHERE email = 'admin@tuempresa.com';
   ```

### Error: "relation usuarios does not exist"

**Causa**: Tabla no creada en Supabase

**Solución**:
1. Ve a Supabase → SQL Editor
2. Ejecuta el script de creación de tabla (ver CONFIGURACION_SUPABASE.md)
3. Verifica en Table Editor que la tabla existe

### La página se recarga infinitamente

**Causa**: NEXTAUTH_SECRET no configurado

**Solución**:
1. Genera una clave:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
2. Agrégala a `.env.local`:
   ```bash
   NEXTAUTH_SECRET=la_clave_generada
   ```
3. Reinicia el servidor

### No aparece el botón "Gestionar Usuarios"

**Causa**: Usuario no es admin

**Solución**:
1. Verifica en Supabase que el rol sea 'admin'
2. Si no lo es, actualiza:
   ```sql
   UPDATE usuarios
   SET rol = 'admin'
   WHERE email = 'tu@email.com';
   ```

## 📱 Responsive

La interfaz es completamente responsive:

- ✅ Desktop (1920px+)
- ✅ Laptop (1024px - 1920px)
- ✅ Tablet (768px - 1024px)
- ✅ Mobile (320px - 768px)

Puedes probar abriendo las DevTools del navegador (F12) y cambiando el tamaño de pantalla.

## 🎯 Próximos Pasos

Una vez que el login funcione correctamente:

1. ✅ Crear la sección "Información de Planillas" (reportes)
2. ✅ Crear la sección "Gestión de Usuarios" (CRUD de usuarios)
3. ✅ Integrar auditoría completa con n8n
4. ✅ Implementar cambio de contraseña
5. ✅ Implementar recuperación de contraseña
6. ✅ Deploy a Vercel (producción)

## 📚 Recursos

- [Documentación de NextAuth](https://next-auth.js.org)
- [Documentación de Supabase](https://supabase.com/docs)
- [Next.js App Router](https://nextjs.org/docs/app)

## 🆘 Ayuda

Si tienes problemas, verifica:

1. **Console del navegador** (F12 → Console) - errores de JavaScript
2. **Terminal del servidor** - errores de backend
3. **Supabase Logs** - errores de base de datos (Supabase → Logs)
4. **Variables de entorno** - que estén correctas

---

**¿Todo funcionando?** ¡Excelente! Ya tienes un sistema completo de autenticación 🎉

**¿Problemas?** Revisa los pasos de troubleshooting o consulta la documentación.
