// Sistema de diseño: claro con negro como el logo, acento verde-aurora.
import type { ViewStyle } from 'react-native';

export const colores = {
  fondo: '#F6F5F1',
  tarjeta: '#FFFFFF',
  texto: '#111111',
  textoSecundario: '#6B6B6B',
  textoTenue: '#A3A19B',
  borde: '#E6E4DE',
  acento: '#2BB39A',
  acentoSuave: '#E3F5F0',
  peligro: '#D9534F',
  peligroSuave: '#FBEAEA',
  advertencia: '#E0A100',
  advertenciaSuave: '#FDF4DC',
} as const;

export const radios = { tarjeta: 16, campo: 12, chip: 999 } as const;

export const espacio = (n: number) => n * 4;

export const sombra: ViewStyle = {
  shadowColor: '#000',
  shadowOpacity: 0.06,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
};

export const texto = {
  titulo: { fontSize: 28, fontWeight: '700', color: colores.texto, letterSpacing: -0.5 },
  subtitulo: { fontSize: 17, fontWeight: '600', color: colores.texto },
  montoGrande: { fontSize: 32, fontWeight: '600', color: colores.texto, letterSpacing: -0.5 },
  monto: { fontSize: 16, fontWeight: '600', color: colores.texto },
  cuerpo: { fontSize: 16, color: colores.texto },
  secundario: { fontSize: 14, color: colores.textoSecundario },
  etiqueta: { fontSize: 12, fontWeight: '600', color: colores.textoSecundario, letterSpacing: 0.8, textTransform: 'uppercase' },
} as const;
