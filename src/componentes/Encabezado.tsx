// Título grande estilo iOS arriba de cada pestaña.
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { espacio, texto } from '@/tema';

interface PropsEncabezado {
  titulo: string;
  subtitulo?: string;
  izquierda?: ReactNode;
  derecha?: ReactNode;
}

export function Encabezado({ titulo, subtitulo, izquierda, derecha }: PropsEncabezado) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: espacio(3), marginBottom: espacio(2) }}>
      {izquierda}
      <View style={{ flex: 1 }}>
        <Text style={texto.titulo}>{titulo}</Text>
        {subtitulo && <Text style={texto.secundario}>{subtitulo}</Text>}
      </View>
      {derecha}
    </View>
  );
}
