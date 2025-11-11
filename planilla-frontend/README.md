# Sistema de Planillas - Frontend

Frontend moderno desarrollado con Next.js, TypeScript y Tailwind CSS para la gestión de planillas y facturas.

## Características

- **Diseño Moderno**: Interfaz limpia y profesional con gradientes y animaciones suaves
- **Formulario Validado**: Validación en tiempo real de todos los campos
- **TypeScript**: Tipado estático para mayor seguridad y mantenibilidad
- **Responsive**: Diseño adaptable a diferentes tamaños de pantalla
- **Tailwind CSS**: Estilos modernos y personalizables

## Campos del Formulario

1. **Nombre**: Campo de texto para ingresar el nombre completo
2. **No. de Factura**: Campo de texto para el número de factura
3. **Observaciones**: Selector desplegable con las siguientes opciones:
   - PAGO FACTURA
   - GIRO HONORARIOS ADMINISTRACION OBRA
   - GIRO DE RECURSOS FONDO ROTATORIO
4. **NIT**: Campo de texto para el NIT (validado para 9-10 dígitos)

## Requisitos Previos

- Node.js 18.x o superior
- npm o yarn

## Instalación

1. Navega al directorio del proyecto:
```bash
cd planilla-frontend
```

2. Instala las dependencias (si aún no están instaladas):
```bash
npm install
```

## Ejecutar en Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## Compilar para Producción

```bash
npm run build
npm start
```

## Estructura del Proyecto

```
planilla-frontend/
├── app/
│   ├── globals.css        # Estilos globales con Tailwind
│   ├── layout.tsx         # Layout principal de la aplicación
│   └── page.tsx           # Página principal
├── components/
│   └── PlanillaForm.tsx   # Componente del formulario
├── next.config.js         # Configuración de Next.js
├── tailwind.config.ts     # Configuración de Tailwind CSS
├── tsconfig.json          # Configuración de TypeScript
└── package.json           # Dependencias del proyecto
```

## Tecnologías Utilizadas

- **Next.js 16**: Framework React con renderizado del lado del servidor
- **React 19**: Biblioteca de interfaz de usuario
- **TypeScript 5**: Superset de JavaScript con tipado estático
- **Tailwind CSS 3**: Framework de CSS utilitario
- **PostCSS**: Procesador de CSS

## Validaciones Implementadas

- Todos los campos son obligatorios
- El NIT debe contener entre 9 y 10 dígitos
- Feedback visual inmediato en caso de errores
- Mensajes de error descriptivos

## Características de UI/UX

- Gradiente de fondo suave (azul a púrpura)
- Efectos hover en los campos de entrada
- Animación de carga en el botón de envío
- Iconos de error informativos
- Transiciones suaves en todas las interacciones
- Diseño centrado y espaciado equilibrado
- Sombras y bordes redondeados para un aspecto moderno
