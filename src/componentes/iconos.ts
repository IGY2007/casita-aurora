// Ícono de cada categoría de la hoja "Config", para listas y etapas.
import type { NombreIcono } from './FilaRegistro';

const ICONOS_CATEGORIA: Record<string, NombreIcono> = {
  'Platea / Cimientos': 'layers-outline',
  'Madera a comprar': 'hammer-outline',
  'Cerramientos (puertas/ventanas)': 'browsers-outline',
  'Instalación eléctrica': 'flash-outline',
  'Instalación sanitaria': 'water-outline',
  'Calefacción (caldera/radiadores)': 'flame-outline',
  'Cocina (artefactos)': 'restaurant-outline',
  Electrodomésticos: 'tv-outline',
  'Dormitorio (mobiliario)': 'bed-outline',
  'Living (mobiliario)': 'cafe-outline',
  'Terminaciones (pintura/pisos)': 'color-palette-outline',
  'Exterior / techo': 'umbrella-outline',
  'Imprevistos (10%)': 'alert-circle-outline',
};

export function iconoCategoria(nombre: string): NombreIcono {
  return ICONOS_CATEGORIA[nombre] ?? 'cube-outline';
}
