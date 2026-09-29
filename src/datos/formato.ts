// Utilidades para formularios: fechas, números en formato argentino e IDs.

export function hoyISO(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

// Se valida en UTC de punta a punta: mezclar hora local con toISOString corre la fecha un día
// en zonas horarias adelantadas a UTC (Noruega) y rechazaba fechas válidas.
export function esFechaValida(texto: string): boolean {
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(texto);
  if (!partes) return false;
  const [anio, mes, dia] = [Number(partes[1]), Number(partes[2]), Number(partes[3])];
  const d = new Date(Date.UTC(anio, mes - 1, dia));
  return d.getUTCFullYear() === anio && d.getUTCMonth() === mes - 1 && d.getUTCDate() === dia;
}

// Formato argentino: el punto separa miles y la coma los decimales ("248.000", "12,5").
// Devuelve null si el texto está vacío o no es un número.
export function parsearNumero(texto: string): number | null {
  const limpio = texto.trim().replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
  if (limpio === '') return null;
  const n = Number(limpio);
  return Number.isFinite(n) ? n : null;
}

// Inverso de parsearNumero, para precargar un número en un campo de texto.
export function numeroATexto(n: number | null): string {
  if (n === null) return '';
  return n.toLocaleString('es-AR', { maximumFractionDigits: 2 });
}

const SIMBOLOS: Record<string, string> = { ARS: '$', USD: 'US$', EUR: '€', NOK: 'kr' };

export function simboloMoneda(moneda: string | null): string {
  return moneda ? (SIMBOLOS[moneda] ?? moneda) : '';
}

// "$ 248.000", "US$ 2.958,50". Sin decimales en montos grandes para que se lea rápido.
export function formatoMoneda(monto: number, moneda: string): string {
  const decimales = Math.abs(monto) >= 1000 ? 0 : 2;
  const numero = monto.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: decimales });
  return `${SIMBOLOS[moneda] ?? moneda} ${numero}`;
}

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

// "2026-09-20" → "20 sep"
export function fechaCorta(iso: string): string {
  const [, mes, dia] = iso.split('-');
  return `${Number(dia)} ${MESES[Number(mes) - 1]?.slice(0, 3) ?? ''}`;
}

// "2026-09-20" → "Septiembre 2026"
export function mesYAnio(iso: string): string {
  const [anio, mes] = iso.split('-');
  const nombre = MESES[Number(mes) - 1] ?? '';
  return `${nombre.charAt(0).toUpperCase()}${nombre.slice(1)} ${anio}`;
}

export function nuevoId(): string {
  return crypto.randomUUID();
}

// Campo de texto opcional: "" se guarda como null.
export function textoONull(texto: string): string | null {
  const t = texto.trim();
  return t === '' ? null : t;
}
