// Ícono de cada etapa según palabras de su nombre: como las etapas se pueden renombrar,
// no se asocia por nombre exacto.
import type { NombreIcono } from './FilaRegistro';

const REGLAS: [RegExp, NombreIcono][] = [
  [/platea|cimiento|fundaci/i, 'layers-outline'],
  [/estructura|techo|madera/i, 'home-outline'],
  [/cerramiento|puerta|ventana|abertura/i, 'browsers-outline'],
  [/el[eé]ctric/i, 'flash-outline'],
  [/instalaci|sanitari|agua/i, 'water-outline'],
  [/calefacci|caldera|radiador/i, 'flame-outline'],
  [/revestimiento|fen[oó]lico|enduido/i, 'grid-outline'],
  [/revoque|barro/i, 'brush-outline'],
  [/piso|pintura|terminaci/i, 'color-palette-outline'],
  [/baño|cocina/i, 'restaurant-outline'],
  [/electrodom/i, 'tv-outline'],
  [/mobiliario|dormitorio|living|mueble/i, 'bed-outline'],
  [/imprevisto/i, 'alert-circle-outline'],
];

export function iconoCategoria(nombre: string): NombreIcono {
  return REGLAS.find(([patron]) => patron.test(nombre))?.[1] ?? 'cube-outline';
}
