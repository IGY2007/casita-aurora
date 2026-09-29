// Utilidades para formularios: fechas, números en formato argentino e IDs.

export function hoyISO(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export function esFechaValida(texto: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;
  const d = new Date(`${texto}T00:00:00`);
  return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(texto);
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

export function nuevoId(): string {
  return crypto.randomUUID();
}

// Campo de texto opcional: "" se guarda como null.
export function textoONull(texto: string): string | null {
  const t = texto.trim();
  return t === '' ? null : t;
}
