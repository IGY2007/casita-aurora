// Selector de fecha nativo del navegador: en el iPhone abre la ruedita de iOS.
// La app es solo web, así que se usa directamente un <input type="date"> del DOM.
import { createElement } from 'react';
import { Text, View } from 'react-native';

import { colores, espacio, radios, texto } from '@/tema';

export function CampoFecha({ etiqueta, valor, onCambio }: { etiqueta: string; valor: string; onCambio: (v: string) => void }) {
  return (
    <View style={{ gap: espacio(1.5) }}>
      <Text style={texto.etiqueta}>{etiqueta}</Text>
      {createElement('input', {
        type: 'date',
        value: valor,
        onChange: (e: { target: { value: string } }) => onCambio(e.target.value),
        style: {
          fontSize: 16,
          fontFamily: 'inherit',
          color: colores.texto,
          backgroundColor: colores.fondo,
          border: `1px solid ${colores.borde}`,
          borderRadius: radios.campo,
          padding: '12px 14px',
          minHeight: 48,
          boxSizing: 'border-box',
          width: '100%',
          WebkitAppearance: 'none',
        },
      })}
    </View>
  );
}
