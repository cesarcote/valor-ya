# Flujo ValorYa

## Descripción General
ValorYa es un servicio que permite calcular el valor comercial de un predio en Bogotá usando el Método de Comparación de Mercado (MCM).

---

## Flujo Principal

### Step 1: Búsqueda del Predio
**Ruta:** `/valor-ya/seleccionar`

El usuario puede buscar su predio por:
- **Dirección Catastral** (Opción 2 del API)
- **CHIP** (Opción 3 del API)
- **Folio de Matrícula Inmobiliaria** *(deshabilitado - en desarrollo)*

**Endpoint:** `GET /catastro/consultar?Opcion={2|3}&Identificador={valor}`

---

### Step 2: Revisión del Predio
**Ruta:** `/valor-ya/solicitud`

Se muestra la información del predio en un mapa con sus datos catastrales.

#### Validaciones al dar "Continuar":

1. **Código de Uso** - Solo predios PH (códigos 037, 038)
   - Si no cumple → Modal "Predio no elegible" → Vuelve al Step 1

2. **Conexión MCM** - Verifica disponibilidad del servicio
   - Endpoint: `GET /api/procesar-chips/test-conexion`
   - Si falla → Modal "Servicio no disponible"

   Esto se hace con el fin de que si el servicio de mcm se cae en ese momento, no deje avanzar al usuario a quiza a realizar un registro innecesario por el momento o peor, llevarlo a un pago y que no obtenga de manera inmediata su producto.

3. **Mínimo de Ofertas** - Valida que existan ofertas de referencia
   - Endpoint: `POST /api/procesar-chips/validar-minimo-ofertas`
   - Si falla → Modal "No podemos calcular el valor"

4. **Autenticación** - Se pide login/registro (última validación)
   - Si no está logueado → Modal de login
   - Después del login → Repite validaciones y continúa

---

### Step 3: Pago
**Ruta:** `/valor-ya/pago`

Formulario de pago con datos del usuario (autocompletados si está logueado).

**Flujo de pago:**
1. Crear compra → `POST /api/compras`
2. Crear pago → `POST /api/pagos`
3. Redirigir a pasarela de pagos (PayU)

---

### Step 4: Resultado
**Ruta:** `/valor-ya/resultado`

Se muestra el resultado del avalúo con:
- Valor calculado (VALOR_YA)
- Límite inferior y superior
- Coeficiente de variación
- Mapa del predio
- Mapa de ofertas de referencia (máximo 5 predios circundantes)

**Endpoints:**
- Resumen: `POST /api/procesar-chips/calcular-valorya`
- Mapa ofertas: `POST /api/procesar-chips/chip-unico`

**Acciones:**
- Descargar PDF del avalúo
- Enviar por correo

---

## Persistencia de Datos

| Dato | Almacenamiento | Propósito |
|------|---------------|-----------|
| Token de sesión | `localStorage` | Autenticación |
| Datos de usuario | `localStorage` | Info del usuario logueado |
| Búsqueda activa | `sessionStorage` | Mantener búsqueda al recargar |
| Datos del predio | `localStorage` | Contexto para pago/resultado |

---

## Códigos de Uso Permitidos

| Código | Tipo de Predio |
|--------|---------------|
| 037 | Casa en Propiedad Horizontal |
| 038 | Apartamento |

*Otros tipos de predio no son elegibles actualmente.*

---

## Contacto (mostrado en errores)
- 📞 +57 601 234 7600 ext. 7600
- ✉️ buzon-correspondencia@catastrobogota.gov.co
