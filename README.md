# CIP Check-in

Sistema de registro de asistencia para el almuerzo del Día del Ingeniero — CIP Tacna.

## Stack

**Next.js 16** · **Vercel Postgres (Neon)** · **Drizzle ORM** · **Tailwind CSS** · **SheetJS**

---

## 1. Clonar e instalar

```bash
git clone https://github.com/JosePizarro1/CIP-Checkin.git
cd CIP-Checkin
npm install
```

## 2. Variables de entorno

Creá un archivo `.env.local` en la raíz con la conexión a tu base de datos Neon:

```env
POSTGRES_URL=postgresql://neondb_owner:npg_BRDsw4xo8eXO@ep-super-resonance-aqz3o2am-pooler.c-8.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require
```

## 3. Inicializar base de datos

```bash
npx drizzle-kit push
```

Esto crea la tabla `registrations` con todos los campos necesarios.

## 4. Ejecutar en local

```bash
npm run dev
```

Abrí http://localhost:3000

## Uso

### Buscar ticket

1. En la página principal, ingresá el número de ticket
2. Se muestran los datos del colegiado (nombre, CIP, plato, etc.)
3. Si el plato está vacío, seleccionás Pollo o Chancho
4. Tocá **Confirmar Asistencia** — queda registrado con timestamp

### Administrar datos

Entrá a **http://localhost:3000/admin**:

- **Subir Excel** — cargá el archivo con las hojas REGISTROS y COMPRADOS
- **Limpiar datos** — eliminá todo para hacer pruebas y recargar
- **Descargar reporte** — Excel final con quién asistió, hora de llegada y plato

## Deploy en Vercel

1. Conectá el repo a [Vercel](https://vercel.com/new)
2. Agregá la variable de entorno `POSTGRES_URL`
3. Deploy automático en cada push

## Datos técnicos

- Una tabla: `registrations` con ~800 filas máximo
- Server Actions para todas las operaciones CRUD
- Export via API route `/api/export`
- Sin autenticación (repo público, control por URL del admin)
