// Helpers de formato para fechas y precios.
// El campo `date` de Postgres se almacena como "YYYY-MM-DD" sin zona.
// new Date("YYYY-MM-DD") lo parsea como UTC, lo que muestra el día anterior
// en zonas con offset negativo (Argentina). parseDate corrige eso.

export function parseDate(value) {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split('-').map(Number)
    return new Date(y, m - 1, d)
  }
  return new Date(value)
}

const priceFmt = new Intl.NumberFormat('es-AR')

export function formatPrice(value) {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? priceFmt.format(n) : ''
}
