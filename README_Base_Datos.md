# Base de Datos de Clientes - Documentación

## Archivo Generado
**Nombre:** `Base_Datos_Clientes_Limpia.csv`

## Descripción
Base de datos limpia de clientes/beneficiarios procesada desde el archivo original "Clientes EDUARD LOPEZ.csv", eliminando columnas redundantes e innecesarias.

## Estructura de la Base de Datos

### Columnas

| Columna | Descripción | Tipo | Ejemplo |
|---------|-------------|------|---------|
| **NIT** | Número de Identificación Tributaria o Cédula | Numérico | 822000574 |
| **NOMBRE_BENEFICIARIO** | Nombre completo del beneficiario o empresa | Texto | MODULART S.A.S. |
| **TIPO_CUENTA** | Tipo de cuenta bancaria | CA/CC | CA (Cuenta de Ahorros) o CC (Cuenta Corriente) |
| **ENTIDAD_FINANCIERA** | Nombre del banco o entidad financiera | Texto | Bancolombia |
| **NUMERO_CUENTA** | Número de cuenta bancaria | Alfanumérico | 63277001006 |

## Estadísticas

- **Total de registros:** 45 clientes/beneficiarios activos
- **Formato:** CSV (valores separados por comas)
- **Codificación:** UTF-8 con BOM

## Entidades Financieras Presentes

- Bancolombia
- Davivienda
- BBVA (Bbva)
- Banco de Bogotá (Bogota)
- Banco de Occidente (Occidente)
- BCSC (Bcsc)

## Tipos de Clientes

La base de datos incluye:
- Empresas (S.A.S., S.A., etc.)
- Personas naturales
- Proveedores
- Contratistas

## Cambios Realizados

### Columnas Eliminadas
- `Cont_1` - Contador interno
- `Cont_2` - Contador duplicado
- `N° Cuentas` - Información redundante
- Columnas vacías

### Datos Limpiados
- Se eliminó el sufijo 'h' de los NITs
- Se filtraron solo registros activos (Cont_1 = 1)
- Se eliminaron espacios en blanco innecesarios

## Uso del Script de Procesamiento

El script `procesar_clientes.py` puede ejecutarse nuevamente si se actualiza el archivo original:

```bash
python procesar_clientes.py
```

## Notas Importantes

1. **Validación de NIT:** Los NITs varían en longitud (7 a 10 dígitos)
2. **Números de Cuenta:** Algunos pueden contener letras (ej: O72012347)
3. **Nombres:** Algunos incluyen caracteres especiales y tildes
4. **Tipos de Cuenta:** Solo dos valores posibles: CA o CC

## Formato de Ejemplo

```csv
NIT,NOMBRE_BENEFICIARIO,TIPO_CUENTA,ENTIDAD_FINANCIERA,NUMERO_CUENTA
822000574,MODULART S.A.S.,CA,Bancolombia,63277001006
900426784,LAMAR INGENIERIA SAS,CA,Bancolombia,71600006335
```

## Integración con el Frontend

Este archivo puede ser utilizado para:
- Autocompletar datos en el formulario
- Validar NITs existentes
- Cargar información bancaria automáticamente
- Crear un selector de beneficiarios

---

**Fecha de Creación:** 2025-11-08
**Generado desde:** Clientes EDUARD LOPEZ.csv
**Procesado por:** procesar_clientes.py
