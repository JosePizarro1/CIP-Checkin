# CIP Check-in

Sistema de registro de asistencia para el almuerzo del Día del Ingeniero — CIP Tacna.

## Funcionalidades

- **Búsqueda por ticket**: buscás el número de ticket y te muestra los datos del colegiado
- **Confirmación de asistencia**: marcás quién vino, con horario y opción de elegir plato (pollo/chancho)
- **Carga desde Excel**: subís el archivo con los registros (hojas REGISTROS + COMPRADOS)
- **Exportación de resultados**: descargás un Excel con quién asistió, hora de llegada y plato
- **Limpieza de datos**: borrás todo para hacer pruebas y recargar

## Stack

Next.js 16 · Vercel Postgres · Drizzle ORM · Tailwind CSS · SheetJS

## Deploy

Conectá el repo a Vercel y configurá la variable `POSTGRES_URL`.
