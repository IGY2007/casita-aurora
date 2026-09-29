// Tarjeta blanca con sombra que aparece con fundido y deslizamiento.
import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, type StyleProp, type ViewStyle } from 'react-native';

import { colores, espacio, radios, sombra } from '@/tema';

interface PropsTarjeta {
  children: ReactNode;
  // ms de espera antes de animar, para escalonar varias tarjetas
  retraso?: number;
  estilo?: StyleProp<ViewStyle>;
}

export function useEntrada(retraso = 0) {
  const progreso = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(progreso, { toValue: 1, duration: 380, delay: retraso, useNativeDriver: false }).start();
  }, [progreso, retraso]);
  return {
    opacity: progreso,
    transform: [{ translateY: progreso.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
  };
}

export function Tarjeta({ children, retraso = 0, estilo }: PropsTarjeta) {
  const entrada = useEntrada(retraso);
  return (
    <Animated.View
      style={[{ backgroundColor: colores.tarjeta, borderRadius: radios.tarjeta, padding: espacio(4), ...sombra }, entrada, estilo]}
    >
      {children}
    </Animated.View>
  );
}
