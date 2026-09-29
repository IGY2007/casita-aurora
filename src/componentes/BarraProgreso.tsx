// Barra de progreso que se llena animada; cambia de color al acercarse o pasarse del presupuesto.
import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

import { colores } from '@/tema';

export function BarraProgreso({ fraccion, alto = 10 }: { fraccion: number; alto?: number }) {
  const ancho = useRef(new Animated.Value(0)).current;
  const limitada = Math.max(0, Math.min(fraccion, 1));

  useEffect(() => {
    Animated.timing(ancho, { toValue: limitada, duration: 900, delay: 150, useNativeDriver: false }).start();
  }, [ancho, limitada]);

  const color = fraccion > 1 ? colores.peligro : fraccion > 0.9 ? colores.advertencia : colores.acento;

  return (
    <View style={{ height: alto, borderRadius: alto / 2, backgroundColor: colores.borde, overflow: 'hidden' }}>
      <Animated.View
        style={{
          height: '100%',
          borderRadius: alto / 2,
          backgroundColor: color,
          width: ancho.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
        }}
      />
    </View>
  );
}
