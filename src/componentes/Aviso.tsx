// Aviso emergente ("Gasto guardado ✓") que entra desde arriba y se va solo.
import Ionicons from '@expo/vector-icons/Ionicons';
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { Animated, Text, View } from 'react-native';

import { colores, espacio, radios } from '@/tema';

const ContextoAviso = createContext<(mensaje: string) => void>(() => {});

export function AvisoProvider({ children }: { children: ReactNode }) {
  const [mensaje, setMensaje] = useState<string | null>(null);
  const posicion = useRef(new Animated.Value(0)).current;
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mostrar = useCallback(
    (texto: string) => {
      setMensaje(texto);
      if (temporizador.current) clearTimeout(temporizador.current);
      Animated.spring(posicion, { toValue: 1, useNativeDriver: false, bounciness: 8 }).start();
      temporizador.current = setTimeout(() => {
        Animated.timing(posicion, { toValue: 0, duration: 250, useNativeDriver: false }).start(() => setMensaje(null));
      }, 2200);
    },
    [posicion],
  );

  return (
    <ContextoAviso.Provider value={mostrar}>
      <View style={{ flex: 1 }}>
        {children}
        {mensaje && (
          <Animated.View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: espacio(3),
              left: espacio(4),
              right: espacio(4),
              alignItems: 'center',
              opacity: posicion,
              transform: [{ translateY: posicion.interpolate({ inputRange: [0, 1], outputRange: [-60, 0] }) }],
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: espacio(2),
                backgroundColor: colores.texto,
                borderRadius: radios.chip,
                paddingVertical: espacio(3),
                paddingHorizontal: espacio(5),
              }}
            >
              <Ionicons name="checkmark-circle" size={20} color={colores.acento} />
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>{mensaje}</Text>
            </View>
          </Animated.View>
        )}
      </View>
    </ContextoAviso.Provider>
  );
}

export function useAviso() {
  return useContext(ContextoAviso);
}
