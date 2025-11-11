# Inicio Rápido - Sistema de Planillas

## Instrucciones para Iniciar el Proyecto

### 1. Abrir el proyecto
Abre una terminal o línea de comandos y navega al directorio del proyecto:

```bash
cd "C:\Users\sbt08\Documents\Planillas Eduard Lopez\planilla-frontend"
```

### 2. Iniciar el servidor de desarrollo
Ejecuta el siguiente comando:

```bash
npm run dev
```

### 3. Acceder a la aplicación
Una vez que veas el mensaje "✓ Ready", abre tu navegador web y visita:

- **Local**: http://localhost:3000
- **Si el puerto 3000 está ocupado**: http://localhost:3001

### 4. Usar el formulario

El formulario incluye los siguientes campos:

1. **Nombre Completo** (obligatorio)
   - Campo de texto libre

2. **No. de Factura** (obligatorio)
   - Campo de texto libre

3. **Observaciones** (obligatorio)
   - Desplegable con opciones:
     - PAGO FACTURA
     - GIRO HONORARIOS ADMINISTRACION OBRA
     - GIRO DE RECURSOS FONDO ROTATORIO

4. **NIT** (obligatorio)
   - Debe contener entre 9 y 10 dígitos
   - Ejemplo: 900123456

### Características del Formulario

- Validación en tiempo real
- Mensajes de error descriptivos
- Diseño moderno con gradientes
- Animaciones suaves
- Responsive (se adapta a móviles y tablets)
- Botón de limpiar para resetear el formulario

### Detener el Servidor

Para detener el servidor de desarrollo, presiona:
- **Windows**: `Ctrl + C` en la terminal
- **Mac/Linux**: `Cmd + C` o `Ctrl + C` en la terminal

---

## Solución de Problemas

**Si el puerto 3000 está ocupado:**
- La aplicación automáticamente usará el puerto 3001
- O puedes especificar un puerto diferente:
  ```bash
  PORT=3002 npm run dev
  ```

**Si hay errores de compilación:**
- Elimina la carpeta `.next` y vuelve a iniciar:
  ```bash
  rm -rf .next
  npm run dev
  ```

**Si necesitas reinstalar dependencias:**
  ```bash
  rm -rf node_modules
  npm install
  npm run dev
  ```
