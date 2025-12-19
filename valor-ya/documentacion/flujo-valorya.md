# Flujo ValorYa

## Descripción General

ValorYa es un servicio que permite calcular el valor comercial de un predio en Bogotá usando el Método de Comparación de Mercado (MCM).

---

## Flujo Principal

### Step 1: Búsqueda del Predio

**Ruta:** `/valor-ya/seleccionar`  
**Autenticación requerida:** No

El usuario puede buscar su predio por:

- **Dirección Catastral** (Opción 2 del API)
- **CHIP** (Opción 3 del API)
- **Folio de Matrícula Inmobiliaria** _(deshabilitado - en desarrollo)_

**Endpoint:** `GET /catastro/consultar?Opcion={2|3}&Identificador={valor}`

---

### Step 2: Revisión del Predio

**Ruta:** `/valor-ya/solicitud`  
**Autenticación requerida:** No (se solicita al dar "Continuar")

Se muestra la información del predio en un mapa con sus datos catastrales.

#### Validaciones al dar "Continuar":

1. **Datos Completos del Predio** - Validar que existan chip y loteid

   - Si no cumple → Error "No hay información completa del predio"

2. **Validación Valor Ya vs Valor Avalúo** - Para TODOS los predios permitidos

   - Obtiene `valorAvaluo` del endpoint `/catastro/consultar` (ya incluido en la respuesta)
   - Llama temporalmente a `POST /api/procesar-chips/calcular-valorya` para obtener `VALOR_YA`
   - Compara: Si `VALOR_YA < valorAvaluo` → Modal "No se puede mostrar resultado, No hay suficiente informacion para determinar el valor de su propiedad"
   - **Nota:** Esta validación es temporal desde el frontend. En el futuro se debe implementar en el backend para mayor eficiencia y seguridad.

3. **Código de Uso** - Solo predios permitidos (códigos 037, 038, 048, 049, 051)

   - Si no cumple → Modal "Predio no elegible" → Vuelve al Step 1

4. **Validación MCM y Mínimo de Ofertas** - Solo para códigos 037 y 038

   - **Conexión MCM** - Verifica disponibilidad del servicio

     - Endpoint: `GET /api/procesar-chips/test-conexion`
     - Si falla → Modal "Servicio no disponible"

   - **Mínimo de Ofertas** - Valida que existan ofertas de referencia
     - Endpoint: `POST /api/procesar-chips/validar-minimo-ofertas`
     - Si falla → Modal "No podemos calcular el valor"

   Esto se hace con el fin de que si el servicio de mcm se cae en ese momento, no deje avanzar al usuario a quiza a realizar un registro innecesario por el momento o peor, llevarlo a un pago y que no obtenga de manera inmediata su producto.

5. **Autenticación** - Se pide login/registro (última validación)
   - Si no está logueado → Modal de login
   - Después del login exitoso → Continúa al Step 3

---

### Step 3: Pago

**Ruta:** `/valor-ya/pago`  
**Autenticación requerida:** Sí (protegida por `authGuard` + `predioDataGuard`)

Formulario de pago con datos del usuario (autocompletados si está logueado).

**Flujo de pago:**

1. Crear compra → `POST /api/compras`
2. Crear pago → `POST /api/pagos`
3. Redirigir a pasarela de pagos (PayU)

---

### Step 4: Resultado

**Ruta:** `/valor-ya/respuesta`  
**Autenticación requerida:** Sí (protegida por `authGuard` + `predioDataGuard`)

Se muestra el resultado del avalúo con:

- Valor calculado (VALOR_YA)
- Límite inferior y superior
- Coeficiente de variación
- Mapa del predio
- Mapa de ofertas de referencia (máximo 5 predios circundantes)

**Validación inicial:**

- Conexión MCM: `GET /api/procesar-chips/test-conexion`
- Si falla → Modal con contacto de soporte

**Endpoints para datos:**

- Resumen: `POST /api/procesar-chips/calcular-valorya`
- Mapa ofertas: `POST /api/procesar-chips` (limitado a 5 predios)

**Generación de PDF:**

- Endpoint: `POST /api/reportes/valorya-completo/pdf`
- Request: `{ chip, imagenBase64, imagenBase64Ofertas }`

---

## Guards de Rutas

| Guard             | Propósito                                        |
| ----------------- | ------------------------------------------------ |
| `authGuard`       | Valida que el usuario esté autenticado           |
| `predioDataGuard` | Valida que exista un chip de predio en el estado |

---

## Persistencia de Datos

### localStorage

| Key                        | Propósito                                 |
| -------------------------- | ----------------------------------------- |
| `valorya-token`            | Token JWT de autenticación                |
| `valorya-user`             | Información del usuario logueado          |
| `valorya-predio-data`      | Datos completos del predio para resultado |
| `valor-ya-payment-context` | Contexto de pago                          |

### sessionStorage

| Key                       | Propósito                                             |
| ------------------------- | ----------------------------------------------------- |
| `valorya-busqueda-state`  | Tipo y valor de búsqueda (para recuperar al recargar) |
| `valorya-resultado-state` | Chip y datos de pago (para persistir resultado)       |

---

## Limpieza de Datos

Al cerrar sesión (`logout`) se limpian:

- **localStorage:** `valorya-predio-data`, `valor-ya-payment-context`, `valorya-token`, `valorya-user`
- **sessionStorage:** `valorya-busqueda-state`, `valorya-resultado-state`

---

## Códigos de Uso Permitidos

| Código | Tipo de Predio               |
| ------ | ---------------------------- |
| 037    | Casa en Propiedad Horizontal |
| 038    | Apartamento                  |
| 048    | Otro tipo de predio          |
| 049    | Parqueadero                  |
| 051    | Depósito                     |

**Nota:** Los códigos 037 y 038 requieren validación adicional de MCM y mínimo de ofertas. Los códigos 048, 049 y 051 solo requieren la validación de Valor Ya vs Valor Avalúo.

---

## Contacto (mostrado en errores)

- 📞 +57 601 234 7600 ext. 7600
- ✉️ buzon-correspondencia@catastrobogota.gov.co
