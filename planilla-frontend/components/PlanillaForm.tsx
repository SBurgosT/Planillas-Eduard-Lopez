"use client";

import { useState, FormEvent, useRef } from "react";

interface FormData {
  numeroPlanilla: string;
  observaciones: string;
  noFactura: string;
  nit: string;
  nombre: string;
  valorPagar: string;
}

interface FacturaRegistrada {
  id: string;
  noFactura: string;
  nombre: string;
  valorPagar: string;
}

const OBSERVACIONES_OPTIONS = [
  "PAGO FACTURA",
  "GIRO HONORARIOS ADMINISTRACION OBRA",
  "GIRO DE RECURSOS FONDO ROTATORIO",
];

export default function PlanillaForm() {
  const [formData, setFormData] = useState<FormData>({
    numeroPlanilla: "",
    observaciones: "",
    noFactura: "",
    nit: "",
    nombre: "",
    valorPagar: "",
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"error" | "success">("error");
  const valorPagarRef = useRef<HTMLInputElement>(null);
  const [facturasRegistradas, setFacturasRegistradas] = useState<FacturaRegistrada[]>([]);
  const [isEnviandoPlanilla, setIsEnviandoPlanilla] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isEnviandoPlanillaFinal, setIsEnviandoPlanillaFinal] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Validar según el campo
    let newValue = value;

    // Número de Planilla: solo números
    if (name === "numeroPlanilla") {
      newValue = value.replace(/\D/g, "");
    }

    // NIT: solo números
    if (name === "nit") {
      newValue = value.replace(/\D/g, "");
    }

    // No. Factura: solo alfanuméricos (letras y números)
    if (name === "noFactura") {
      newValue = value.replace(/[^a-zA-Z0-9]/g, "");
    }

    // Valor a Pagar: solo números con formato de miles
    if (name === "valorPagar" && e.target instanceof HTMLInputElement) {
      const input = e.target;
      const cursorPosition = input.selectionStart || 0;

      // Obtener el valor numérico sin formato
      const numericValue = value.replace(/\D/g, "");

      // Limitar a 15 dígitos
      const limitedValue = numericValue.slice(0, 15);

      // Formatear con puntos de miles
      if (limitedValue) {
        newValue = Number(limitedValue).toLocaleString("es-CO");
      } else {
        newValue = "";
      }

      // Calcular la nueva posición del cursor
      // Contar cuántos dígitos hay antes de la posición del cursor en el valor sin formato
      const digitsBeforeCursor = value.slice(0, cursorPosition).replace(/\D/g, "").length;

      // Encontrar la posición en el nuevo valor formateado
      let newCursorPosition = 0;
      let digitCount = 0;
      for (let i = 0; i < newValue.length; i++) {
        if (/\d/.test(newValue[i])) {
          digitCount++;
          if (digitCount === digitsBeforeCursor) {
            newCursorPosition = i + 1;
            break;
          }
        }
      }

      // Si no encontramos la posición exacta, usar el final
      if (digitCount < digitsBeforeCursor) {
        newCursorPosition = newValue.length;
      }

      // Actualizar el valor y luego restaurar la posición del cursor
      setFormData((prev) => ({
        ...prev,
        [name]: newValue,
      }));

      // Restaurar la posición del cursor después del re-render
      setTimeout(() => {
        if (valorPagarRef.current) {
          valorPagarRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
        }
      }, 0);

      // Limpiar error del campo cuando el usuario empieza a escribir
      if (errors[name as keyof FormData]) {
        setErrors((prev) => ({
          ...prev,
          [name]: "",
        }));
      }

      return; // Salir temprano para valorPagar
    }

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido";
    }

    if (!formData.noFactura.trim()) {
      newErrors.noFactura = "El número de factura es requerido";
    }

    if (!formData.observaciones) {
      newErrors.observaciones = "Debe seleccionar una observación";
    }

    if (!formData.nit.trim()) {
      newErrors.nit = "El NIT es requerido";
    } else if (!/^\d{9,10}$/.test(formData.nit.replace(/\D/g, ""))) {
      newErrors.nit = "El NIT debe contener entre 9 y 10 dígitos";
    }

    if (!formData.valorPagar.trim()) {
      newErrors.valorPagar = "El valor a pagar es requerido";
    } else {
      // Verificar que sea un número válido después de quitar el formato
      const numericValue = formData.valorPagar.replace(/\D/g, "");
      if (!numericValue || isNaN(Number(numericValue))) {
        newErrors.valorPagar = "El valor debe ser un número válido";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Verificar si ya existe una factura con el mismo No. Factura Y Nombre
    const facturaExistente = facturasRegistradas.find(
      (factura) =>
        factura.noFactura.toLowerCase() === formData.noFactura.toLowerCase() &&
        factura.nombre.toLowerCase() === formData.nombre.toLowerCase()
    );

    if (facturaExistente) {
      setAlertType("error");
      setAlertMessage(
        `Ya existe una factura registrada con el número ${formData.noFactura} para ${formData.nombre}`
      );
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
      return;
    }

    setIsSubmitting(true);

    try {
      // Preparar datos para enviar al webhook
      const datosFactura = {
        numeroPlanilla: formData.numeroPlanilla,
        observaciones: formData.observaciones,
        noFactura: formData.noFactura,
        nit: formData.nit,
        nombre: formData.nombre,
        valorPagar: formData.valorPagar,
        fechaRegistro: new Date().toISOString(),
      };

      console.log("Enviando factura a n8n:", datosFactura);

      // Enviar al webhook de n8n y esperar la respuesta
      const response = await fetch(
        "https://n8n-n8n.pu3ek7.easypanel.host/webhook/2c306f58-745f-4513-80c5-032bb2548db2",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(datosFactura),
        }
      );

      if (!response.ok) {
        throw new Error("Error al registrar la factura en n8n");
      }

      const data = await response.json();
      console.log("Respuesta de n8n:", data);

      // Verificar el status de la respuesta
      if (data.status === "fail") {
        // Si la factura ya existe, mostrar alerta de error
        setAlertType("error");
        setAlertMessage(data.message || `La factura ${formData.noFactura} ya existe`);
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 5000);
        return; // No agregar la factura a la lista
      }

      // Si el status es success, continuar con el registro
      if (data.status === "success") {
        // Agregar la factura a la lista de facturas registradas
        const nuevaFactura: FacturaRegistrada = {
          id: Date.now().toString(),
          noFactura: formData.noFactura,
          nombre: formData.nombre,
          valorPagar: formData.valorPagar,
        };

        setFacturasRegistradas((prev) => [...prev, nuevaFactura]);

        console.log("Datos del formulario:", formData);

        // Mostrar alerta de éxito con el mensaje del webhook
        setAlertType("success");
        setAlertMessage(data.message || "Factura registrada exitosamente");
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);

        // Resetear formulario (manteniendo el número de planilla)
        setFormData({
          numeroPlanilla: formData.numeroPlanilla,
          observaciones: "",
          noFactura: "",
          nit: "",
          nombre: "",
          valorPagar: "",
        });
      }
    } catch (error) {
      console.error("❌ Error al registrar la factura:", error);
      setAlertType("error");
      setAlertMessage("Error al registrar la factura. Intente nuevamente.");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBuscarEmpresa = async () => {
    if (!formData.nit.trim()) {
      setErrors((prev) => ({
        ...prev,
        nit: "Ingrese un NIT para buscar",
      }));
      return;
    }

    setIsSearching(true);

    try {
      // Llamada al webhook de n8n
      const response = await fetch("https://n8n-n8n.pu3ek7.easypanel.host/webhook/477d4671-55b7-4ce5-a786-d1641a69ba05", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nit: formData.nit,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al buscar la empresa");
      }

      const data = await response.json();

      // Log extensivo para debugging
      console.log("=== INICIO DEBUG ===");
      console.log("Respuesta completa de n8n:", data);
      console.log("Tipo de data:", typeof data);
      console.log("Es array?:", Array.isArray(data));
      console.log("Keys de data:", Object.keys(data || {}));
      console.log("JSON stringificado:", JSON.stringify(data, null, 2));
      console.log("=== FIN DEBUG ===");

      // Intentar diferentes estructuras de respuesta
      let nombreEmpresa = null;

      // Opción 1: data.nombre
      if (data && data.nombre) {
        nombreEmpresa = data.nombre;
        console.log("Encontrado en: data.nombre");
      }
      // Opción 2: data.nombre_empresa
      else if (data && data.nombre_empresa) {
        nombreEmpresa = data.nombre_empresa;
        console.log("Encontrado en: data.nombre_empresa");
      }
      // Opción 3: data.data?.nombre
      else if (data && data.data && data.data.nombre) {
        nombreEmpresa = data.data.nombre;
        console.log("Encontrado en: data.data.nombre");
      }
      // Opción 4: data.data?.nombre_empresa
      else if (data && data.data && data.data.nombre_empresa) {
        nombreEmpresa = data.data.nombre_empresa;
        console.log("Encontrado en: data.data.nombre_empresa");
      }
      // Opción 5: Si es un array, tomar el primer elemento
      else if (Array.isArray(data) && data.length > 0) {
        nombreEmpresa = data[0].nombre || data[0].nombre_empresa || data[0]["Nombre Completo"] || data[0].Nombre;
        console.log("Encontrado en: array[0]");
      }
      // Opción 6: data.Nombre (con mayúscula)
      else if (data && data.Nombre) {
        nombreEmpresa = data.Nombre;
        console.log("Encontrado en: data.Nombre");
      }
      // Opción 7: data["Nombre Completo"] (con espacio)
      else if (data && data["Nombre Completo"]) {
        nombreEmpresa = data["Nombre Completo"];
        console.log("Encontrado en: data['Nombre Completo']");
      }

      if (nombreEmpresa) {
        console.log("✅ Nombre encontrado:", nombreEmpresa);
        setFormData((prev) => {
          const newData = {
            ...prev,
            nombre: nombreEmpresa,
          };
          console.log("✅ Formulario actualizado con éxito:", newData);
          return newData;
        });
      } else {
        console.error("❌ NO SE ENCONTRÓ EL NOMBRE - Verifique la estructura de la respuesta de n8n");
        // Mostrar alerta cuando no se encuentra el NIT
        setAlertType("error");
        setAlertMessage(`El NIT ${formData.nit} no existe en la base de datos`);
        setShowAlert(true);
        // Ocultar alerta después de 5 segundos
        setTimeout(() => setShowAlert(false), 5000);
      }
    } catch (error) {
      console.error("❌ Error al buscar la empresa:", error);
      // Mostrar alerta en caso de error
      setAlertType("error");
      setAlertMessage("Error al conectar con el servidor. Intente nuevamente.");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLimpiarNit = () => {
    setFormData((prev) => ({
      ...prev,
      nit: "",
    }));
    setErrors((prev) => ({
      ...prev,
      nit: "",
    }));
  };

  const eliminarFactura = async (id: string) => {
    try {
      // Buscar la factura que se va a eliminar para enviar sus datos al webhook
      const facturaAEliminar = facturasRegistradas.find((factura) => factura.id === id);

      if (!facturaAEliminar) {
        console.error("❌ Factura no encontrada");
        return;
      }

      // Preparar datos para enviar al webhook
      const datosEliminacion = {
        noFactura: facturaAEliminar.noFactura,
        nombre: facturaAEliminar.nombre,
        valorPagar: facturaAEliminar.valorPagar,
        numeroPlanilla: formData.numeroPlanilla,
        fechaEliminacion: new Date().toISOString(),
      };

      console.log("Enviando eliminación a n8n:", datosEliminacion);

      // Llamar al webhook de eliminación
      const response = await fetch(
        "https://n8n-n8n.pu3ek7.easypanel.host/webhook/895570dd-0c38-4c6f-8e64-1e2ff6fff828",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(datosEliminacion),
        }
      );

      if (!response.ok) {
        console.error("❌ Error al notificar la eliminación al webhook");
        // Continuar con la eliminación aunque falle el webhook
      } else {
        const data = await response.json();
        console.log("✅ Respuesta del webhook de eliminación:", data);
      }

      // Eliminar la factura de la lista
      setFacturasRegistradas((prev) => prev.filter((factura) => factura.id !== id));

      // Mostrar alerta de éxito
      setAlertType("success");
      setAlertMessage("Factura eliminada exitosamente");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      console.error("❌ Error al eliminar la factura:", error);
      // Eliminar la factura de todas formas, incluso si falla el webhook
      setFacturasRegistradas((prev) => prev.filter((factura) => factura.id !== id));

      setAlertType("error");
      setAlertMessage("Factura eliminada localmente, pero hubo un error al notificar al servidor");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
    }
  };

  // Calcular el total de todas las facturas
  const calcularTotal = () => {
    return facturasRegistradas.reduce((total, factura) => {
      const valor = Number(factura.valorPagar.replace(/\D/g, ""));
      return total + valor;
    }, 0);
  };

  // Enviar planilla provisional a n8n
  const handleEnviarPlanillaProvisional = async () => {
    // Validar que haya un número de planilla
    if (!formData.numeroPlanilla.trim()) {
      setAlertType("error");
      setAlertMessage("Debe ingresar un número de planilla antes de enviar");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
      return;
    }

    // Validar que haya al menos una factura registrada
    if (facturasRegistradas.length === 0) {
      setAlertType("error");
      setAlertMessage("Debe registrar al menos una factura antes de enviar la planilla");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
      return;
    }

    setIsEnviandoPlanilla(true);

    try {
      // Preparar los datos para enviar
      const datosEnvio = {
        numeroPlanilla: formData.numeroPlanilla,
        facturas: facturasRegistradas.map((factura) => ({
          noFactura: factura.noFactura,
          nombre: factura.nombre,
          valorPagar: factura.valorPagar,
        })),
        total: calcularTotal(),
        totalFacturas: facturasRegistradas.length,
        fechaEnvio: new Date().toISOString(),
      };

      console.log("Enviando planilla provisional a n8n:", datosEnvio);

      // Llamada al webhook de n8n (Planilla Provisional)
      const response = await fetch(
        "https://n8n-n8n.pu3ek7.easypanel.host/webhook/31e49e09-16d3-422b-9039-4e5211e7a720",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(datosEnvio),
        }
      );

      if (!response.ok) {
        throw new Error("Error al enviar la planilla provisional");
      }

      const data = await response.json();
      console.log("Respuesta de n8n:", data);

      // Mostrar alerta de éxito
      setAlertType("success");
      setAlertMessage("Planilla provisional enviada exitosamente");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      console.error("❌ Error al enviar la planilla provisional:", error);
      setAlertType("error");
      setAlertMessage("Error al enviar la planilla provisional. Intente nuevamente.");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
    } finally {
      setIsEnviandoPlanilla(false);
    }
  };

  // Enviar planilla final a n8n
  const handleEnviarPlanillaFinal = async () => {
    setShowConfirmDialog(false);
    setIsEnviandoPlanillaFinal(true);

    try {
      // Preparar los datos para enviar
      const datosEnvio = {
        numeroPlanilla: formData.numeroPlanilla,
        facturas: facturasRegistradas.map((factura) => ({
          noFactura: factura.noFactura,
          nombre: factura.nombre,
          valorPagar: factura.valorPagar,
        })),
        total: calcularTotal(),
        totalFacturas: facturasRegistradas.length,
        fechaEnvio: new Date().toISOString(),
      };

      console.log("Enviando planilla final a n8n:", datosEnvio);

      // Llamada al webhook de n8n (Planilla Final)
      const response = await fetch(
        "https://n8n-n8n.pu3ek7.easypanel.host/webhook/c414f2b0-12a9-4fc4-ad63-bd4dc50943b5",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(datosEnvio),
        }
      );

      if (!response.ok) {
        throw new Error("Error al enviar la planilla final");
      }

      const data = await response.json();
      console.log("Respuesta de n8n:", data);

      // Mostrar alerta de éxito
      setAlertType("success");
      setAlertMessage("Planilla enviada exitosamente. No se aceptarán cambios.");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);

      // Limpiar todo después de enviar
      setFacturasRegistradas([]);
      setFormData({
        numeroPlanilla: "",
        observaciones: "",
        noFactura: "",
        nit: "",
        nombre: "",
        valorPagar: "",
      });
    } catch (error) {
      console.error("❌ Error al enviar la planilla final:", error);
      setAlertType("error");
      setAlertMessage("Error al enviar la planilla final. Intente nuevamente.");
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
    } finally {
      setIsEnviandoPlanillaFinal(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Alerta moderna */}
        {showAlert && (
          <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
            <div
              className={`${
                alertType === "error"
                  ? "bg-red-500"
                  : "bg-green-500"
              } text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 max-w-md`}
            >
              {alertType === "error" ? (
                <svg
                  className="w-6 h-6 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
              <div className="flex-1">
                <p className="font-semibold text-sm">{alertMessage}</p>
              </div>
              <button
                onClick={() => setShowAlert(false)}
                className={`flex-shrink-0 ${
                  alertType === "error"
                    ? "hover:bg-red-600"
                    : "hover:bg-green-600"
                } rounded-full p-1 transition-colors`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Sistema de Planillas
          </h1>
          <p className="text-lg text-gray-600">
            Gestión de planillas y facturas
          </p>
        </div>

        {/* Contenedor principal con dos columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulario - Ocupa 1 columna */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Número de Planilla */}
                <div>
                  <label
                    htmlFor="numeroPlanilla"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Número de Planilla
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    id="numeroPlanilla"
                    name="numeroPlanilla"
                    value={formData.numeroPlanilla}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-semibold text-lg"
                    placeholder="Ingrese el número de planilla"
                  />
                </div>

                {/* Observaciones */}
                <div>
                  <label
                    htmlFor="observaciones"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Observaciones
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <select
                    id="observaciones"
                    name="observaciones"
                    value={formData.observaciones}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white cursor-pointer text-gray-900 ${
                      errors.observaciones
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                      backgroundPosition: "right 0.5rem center",
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "1.5em 1.5em",
                      paddingRight: "2.5rem",
                    }}
                  >
                    <option value="">Seleccione una observación</option>
                    {OBSERVACIONES_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  {errors.observaciones && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.observaciones}
                    </p>
                  )}
                </div>

                {/* No de Factura */}
                <div>
                  <label
                    htmlFor="noFactura"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    No. de Factura
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    id="noFactura"
                    name="noFactura"
                    value={formData.noFactura}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 ${
                      errors.noFactura
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    placeholder="Ingrese el número de factura"
                  />
                  {errors.noFactura && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.noFactura}
                    </p>
                  )}
                </div>

                {/* NIT */}
                <div>
                  <label
                    htmlFor="nit"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    NIT
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    id="nit"
                    name="nit"
                    value={formData.nit}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 ${
                      errors.nit
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    placeholder="Ingrese el NIT (9-10 dígitos)"
                  />
                  {errors.nit && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.nit}
                    </p>
                  )}

                  {/* Botones de Buscar y Limpiar */}
                  <div className="flex gap-3 mt-3">
                    <button
                      type="button"
                      onClick={handleBuscarEmpresa}
                      disabled={isSearching}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-medium rounded-lg shadow-sm hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSearching ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Buscando...
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                          Buscar
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleLimpiarNit}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all duration-200"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Limpiar
                    </button>
                  </div>
                </div>

                {/* Nombre */}
                <div>
                  <label
                    htmlFor="nombre"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Nombre Completo
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 ${
                      errors.nombre
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    placeholder="Ingrese el nombre completo"
                  />
                  {errors.nombre && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.nombre}
                    </p>
                  )}
                </div>

                {/* Valor a Pagar */}
                <div>
                  <label
                    htmlFor="valorPagar"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Valor a Pagar
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    ref={valorPagarRef}
                    type="text"
                    id="valorPagar"
                    name="valorPagar"
                    value={formData.valorPagar}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 ${
                      errors.valorPagar
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    placeholder="Ingrese el valor a pagar"
                  />
                  {errors.valorPagar && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.valorPagar}
                    </p>
                  )}
                </div>

                {/* Botones */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg font-semibold shadow-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Registrando...
                      </span>
                    ) : (
                      "Registrar"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        numeroPlanilla: formData.numeroPlanilla,
                        observaciones: "",
                        noFactura: "",
                        nit: "",
                        nombre: "",
                        valorPagar: "",
                      });
                      setErrors({});
                    }}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                  >
                    Limpiar
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Lista de Facturas Registradas - Ocupa 1 columna */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 sticky top-8">
              {/* Header con tabla de columnas */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-t-lg -mx-6 -mt-6 mb-4">
                <div className="grid grid-cols-3 gap-2 text-xs font-bold uppercase tracking-wide">
                  <div>No. Factura</div>
                  <div>Nombre Empresa</div>
                  <div className="text-right">Valor a Pagar</div>
                </div>
              </div>

              {/* Lista de facturas */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {facturasRegistradas.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <svg
                      className="w-16 h-16 mx-auto mb-3 opacity-50"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="text-sm font-medium">No hay facturas registradas</p>
                  </div>
                ) : (
                  facturasRegistradas.map((factura) => (
                    <div
                      key={factura.id}
                      className="bg-gray-50 hover:bg-gray-100 rounded-lg p-3 transition-colors border border-gray-200 group"
                    >
                      <div className="grid grid-cols-3 gap-2 items-center">
                        <div className="text-sm font-bold text-gray-900 truncate">
                          {factura.noFactura}
                        </div>
                        <div className="text-xs text-gray-700 truncate" title={factura.nombre}>
                          {factura.nombre}
                        </div>
                        <div className="text-sm font-bold text-emerald-700 text-right flex items-center justify-end gap-2">
                          <span>${factura.valorPagar}</span>
                          <button
                            onClick={() => eliminarFactura(factura.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
                            title="Eliminar"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Total */}
              {facturasRegistradas.length > 0 && (
                <div className="mt-6 pt-4 border-t-2 border-gray-300">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900 uppercase">
                      Total:
                    </span>
                    <span className="text-2xl font-bold text-emerald-700">
                      ${calcularTotal().toLocaleString("es-CO")}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 text-right">
                    {facturasRegistradas.length}{" "}
                    {facturasRegistradas.length === 1 ? "factura" : "facturas"} registrada
                    {facturasRegistradas.length === 1 ? "" : "s"}
                  </div>
                </div>
              )}
            </div>

            {/* Botones de envío */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              {/* Botón Planilla Provisional */}
              <button
                onClick={handleEnviarPlanillaProvisional}
                disabled={isEnviandoPlanilla || facturasRegistradas.length === 0}
                className="w-full bg-gradient-to-r from-yellow-500 via-yellow-600 to-orange-600 text-white py-4 px-4 rounded-xl font-bold text-sm shadow-2xl hover:shadow-yellow-500/50 hover:from-yellow-600 hover:via-yellow-700 hover:to-orange-700 focus:outline-none focus:ring-4 focus:ring-yellow-500 focus:ring-offset-2 transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none relative overflow-hidden group"
              >
                {isEnviandoPlanilla ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>ENVIANDO...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span>PLANILLA PROVISIONAL</span>
                  </span>
                )}
              </button>

              {/* Botón Enviar Planilla Final */}
              <button
                onClick={() => setShowConfirmDialog(true)}
                disabled={isEnviandoPlanillaFinal || facturasRegistradas.length === 0}
                className="w-full bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white py-4 px-4 rounded-xl font-bold text-sm shadow-2xl hover:shadow-purple-500/50 hover:from-purple-700 hover:via-purple-800 hover:to-indigo-800 focus:outline-none focus:ring-4 focus:ring-purple-500 focus:ring-offset-2 transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none relative overflow-hidden group"
              >
                {isEnviandoPlanillaFinal ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>ENVIANDO...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>ENVIAR PLANILLA</span>
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Modal de Confirmación */}
        {showConfirmDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all animate-scale-in">
              {/* Icono de advertencia */}
              <div className="flex justify-center mb-6">
                <div className="bg-yellow-100 rounded-full p-4">
                  <svg
                    className="w-16 h-16 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
              </div>

              {/* Título */}
              <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">
                ¿Estás seguro de enviar la planilla?
              </h3>

              {/* Mensaje */}
              <p className="text-gray-600 text-center mb-8 leading-relaxed">
                Una vez enviada, <span className="font-bold text-red-600">no se aceptarán cambios ni modificaciones</span>. Esta acción es irreversible.
              </p>

              {/* Botones */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all duration-200"
                >
                  No, cancelar
                </button>
                <button
                  onClick={handleEnviarPlanillaFinal}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-105"
                >
                  Sí, enviar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Todos los campos marcados con{" "}
            <span className="text-red-500">*</span> son obligatorios
          </p>
        </div>
      </div>
    </div>
  );
}
