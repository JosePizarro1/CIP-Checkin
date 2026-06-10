# CIP Check-in

Sistema de registro de asistencia para el almuerzo del Día del Ingeniero — CIP Tacna.

## Stack

**Next.js 16** · **Vercel Postgres (Neon)** · **Drizzle ORM** · **Tailwind CSS** · **SheetJS**

---

## Cómo empezar

```bash
# 1. Clonar e instalar
git clone https://github.com/JosePizarro1/CIP-Checkin.git
cd CIP-Checkin
npm install

# 2. Crear archivo .env.local con la conexión a la base de datos
# (copiar variables que da Neon al crear la DB)

# 3. Crear la tabla en la base de datos
npx drizzle-kit push

# 4. Iniciar el servidor local
npm run dev
```

Abrí http://localhost:3000

---

## Flujo completo (de principio a fin)

### 1. Cargar la data del Excel

Antes del evento, cuando tengas el archivo Excel del CIP:

1. Andá a **http://localhost:3000/admin** (o la URL de tu deploy + `/admin`)
2. En la sección **Subir Excel**, seleccioná el archivo `.xlsx`
3. El sistema lee automáticamente las dos hojas:
   - **REGISTROS** — tickets gratuitos (con nombre, CIP, teléfono, plato)
   - **COMPRADOS** — tickets pagados (solo ticket + CIP + plato)
4. Te muestra cuántos registros se importaron

> **El Excel debe tener esta estructura:**
> - Hoja `REGISTROS`: NRO TICKET, CIP, APELLIDOS, NOMBRES, CAPITULO, ESPECIALIDAD, TELEFONO, FECHA Y HORA, PLATO
> - Hoja `COMPRADOS`: NRO TICKET, CIP, FECHA Y HORA, PLATO
>
> Podés recargar el mismo archivo las veces que quieras (actualiza los registros existentes).

### 2. Buscar tickets el día del evento

En la página principal (`/`):

1. Ingresá el número de ticket
2. Se muestran los datos de la persona (nombre, CIP, plato, etc.)
3. Si el plato está vacío, seleccionás **Pollo** o **Chancho**
4. Tocá **Confirmar Asistencia** — queda registrado con la hora exacta

### 3. Descargar reporte final

Al finalizar el evento:

1. Andá a **http://localhost:3000/admin**
2. Tocá **Descargar Excel**
3. El archivo incluye: ticket, CIP, nombres, plato, si asistió (Sí/No) y hora de llegada

### 4. Limpiar datos (para pruebas)

En `/admin` → **Eliminar todos los datos** → borra todo y podés volver a cargar.

---

## Deploy en Vercel

1. Conectá el repo a [Vercel](https://vercel.com/new)
2. Agregá la variable de entorno `POSTGRES_URL`
3. Cada push deploy automático

## Estructura del proyecto

```
src/
├── app/
│   ├── page.tsx              # Check-in: buscar ticket y confirmar
│   ├── layout.tsx            # Layout raíz
│   ├── admin/
│   │   └── page.tsx          # Admin: subir Excel, limpiar, exportar
│   └── api/export/
│       └── route.ts          # API que genera el Excel de descarga
├── components/
│   ├── search-form.tsx       # Formulario de búsqueda
│   ├── person-card.tsx       # Datos de la persona + selector de plato
│   └── confirm-button.tsx    # Botón de confirmación
├── db/
│   ├── schema.ts             # Esquema Drizzle (tabla registrations)
│   └── index.ts              # Conexión a la base de datos
└── lib/
    ├── actions.ts            # Server Actions (buscar, confirmar, subir, limpiar)
    ├── excel.ts              # Parser de Excel (SheetJS)
    └── types.ts              # Tipos compartidos
```
