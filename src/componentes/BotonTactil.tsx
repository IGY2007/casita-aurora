// Botón que se achica levemente al tocarlo.
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRef, type ComponentProps, type ReactNode } from 'react';
import { ActivityIndicator, Animated, Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colores, espacio, radios } from '@/tema';

type Variante = 'primario' | 'acento' | 'peligro' | 'secundario';

const estilosVariante: Record<Variante, { fondo: string; texto: string }> = {
  primario: { fondo: colores.texto, texto: '#FFFFFF' },
  acento: { fondo: colores.acento, texto: '#FFFFFF' },
  peligro: { fondo: colores.peligroSuave, texto: colores.peligro },
  secundario: { fondo: colores.fondo, texto: colores.texto },
};

// Escala animada al presionar; reutilizable por cualquier elemento tocable.
export function useEscalaTactil() {
  const escala = useRef(new Animated.Value(1)).current;
  const animar = (valor: number) => Animated.spring(escala, { toValue: valor, useNativeDriver: false, speed: 40, bounciness: 6 }).start();
  return { escala, alPresionar: () => animar(0.97), alSoltar: () => animar(1) };
}

interface PropsTactil {
  onPress: () => void;
  children: ReactNode;
  estilo?: StyleProp<ViewStyle>;
  deshabilitado?: boolean;
}

// Envoltorio genérico con la animación de escala.
export function Tactil({ onPress, children, estilo, deshabilitado }: PropsTactil) {
  const { escala, alPresionar, alSoltar } = useEscalaTactil();
  return (
    <Pressable onPress={onPress} onPressIn={alPresionar} onPressOut={alSoltar} disabled={deshabilitado}>
      <Animated.View style={[estilo, { transform: [{ scale: escala }], opacity: deshabilitado ? 0.5 : 1 }]}>{children}</Animated.View>
    </Pressable>
  );
}

interface PropsBoton {
  titulo: string;
  onPress: () => void;
  variante?: Variante;
  icono?: ComponentProps<typeof Ionicons>['name'];
  cargando?: boolean;
  deshabilitado?: boolean;
}

export function BotonTactil({ titulo, onPress, variante = 'primario', icono, cargando, deshabilitado }: PropsBoton) {
  const { fondo, texto } = estilosVariante[variante];
  return (
    <Tactil
      onPress={onPress}
      deshabilitado={deshabilitado || cargando}
      estilo={{ backgroundColor: fondo, borderRadius: radios.campo, paddingVertical: espacio(4), paddingHorizontal: espacio(5) }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: espacio(2) }}>
        {cargando ? <ActivityIndicator color={texto} /> : icono && <Ionicons name={icono} size={20} color={texto} />}
        <Text style={{ color: texto, fontSize: 16, fontWeight: '600' }}>{titulo}</Text>
      </View>
    </Tactil>
  );
}
