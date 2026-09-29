// Fila de una lista: ícono en círculo, título, subtítulo y monto a la derecha.
import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Text, View } from 'react-native';

import { colores, espacio, texto } from '@/tema';

import { Tactil } from './BotonTactil';

export type NombreIcono = ComponentProps<typeof Ionicons>['name'];

interface PropsFila {
  icono: NombreIcono;
  titulo: string;
  subtitulo: string;
  monto: string;
  detalleMonto?: string;
  onPress: () => void;
}

export function FilaRegistro({ icono, titulo, subtitulo, monto, detalleMonto, onPress }: PropsFila) {
  return (
    <Tactil onPress={onPress} estilo={{ flexDirection: 'row', alignItems: 'center', gap: espacio(3), paddingVertical: espacio(3) }}>
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 21,
          backgroundColor: colores.acentoSuave,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name={icono} size={20} color={colores.acento} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={texto.cuerpo} numberOfLines={1}>
          {titulo}
        </Text>
        <Text style={texto.secundario} numberOfLines={1}>
          {subtitulo}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={texto.monto}>{monto}</Text>
        {detalleMonto && <Text style={[texto.secundario, { fontSize: 12 }]}>{detalleMonto}</Text>}
      </View>
    </Tactil>
  );
}
