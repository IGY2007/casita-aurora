// Botón "+" redondo, fijo abajo a la derecha, para agregar un registro.
import Ionicons from '@expo/vector-icons/Ionicons';
import { View } from 'react-native';

import { colores, espacio } from '@/tema';

import { Tactil } from './BotonTactil';

export function BotonFlotante({ onPress, etiqueta }: { onPress: () => void; etiqueta: string }) {
  return (
    <View style={{ position: 'absolute', right: espacio(5), bottom: espacio(5) }}>
      <Tactil
        onPress={onPress}
        estilo={{
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: colores.texto,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOpacity: 0.25,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 6 },
        }}
      >
        <Ionicons name="add" size={32} color="#FFFFFF" accessibilityLabel={etiqueta} />
      </Tactil>
    </View>
  );
}
