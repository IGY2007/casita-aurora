// Casillero redondo para marcar un material como comprado, con un pequeño rebote al tildarlo.
import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useRef } from 'react';
import { Animated, Pressable } from 'react-native';

import { colores } from '@/tema';

export function Casilla({ marcada, onPress, etiqueta }: { marcada: boolean; onPress: () => void; etiqueta: string }) {
  const escala = useRef(new Animated.Value(1)).current;
  const primerRender = useRef(true);

  useEffect(() => {
    if (primerRender.current) {
      primerRender.current = false;
      return;
    }
    escala.setValue(0.8);
    Animated.spring(escala, { toValue: 1, useNativeDriver: false, speed: 18, bounciness: 14 }).start();
  }, [marcada, escala]);

  return (
    <Pressable onPress={onPress} hitSlop={10} accessibilityRole="checkbox" accessibilityState={{ checked: marcada }} accessibilityLabel={etiqueta}>
      <Animated.View
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          borderWidth: 2,
          borderColor: marcada ? colores.acento : colores.textoTenue,
          backgroundColor: marcada ? colores.acento : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ scale: escala }],
        }}
      >
        {marcada && <Ionicons name="checkmark" size={18} color="#FFFFFF" />}
      </Animated.View>
    </Pressable>
  );
}
