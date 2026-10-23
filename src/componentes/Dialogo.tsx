// Cuadro de diálogo centrado con fondo oscurecido (reemplaza a Alert/confirm, que no andan bien en la web).
import { useEffect, useRef } from 'react';
import { Animated, Easing, Modal, Pressable, Text, View } from 'react-native';

import { colores, espacio, radios, sombra, texto } from '@/tema';

import { BotonTactil } from './BotonTactil';

export interface OpcionDialogo {
  texto: string;
  variante?: 'primario' | 'secundario' | 'peligro' | 'acento';
  onPress: () => void;
}

interface PropsDialogo {
  visible: boolean;
  titulo: string;
  mensaje?: string;
  opciones: OpcionDialogo[];
  onCerrar: () => void;
}

export function Dialogo({ visible, titulo, mensaje, opciones, onCerrar }: PropsDialogo) {
  const entrada = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      entrada.setValue(0);
      Animated.timing(entrada, { toValue: 1, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
    }
  }, [visible, entrada]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCerrar}>
      <Pressable onPress={onCerrar} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: espacio(6) }}>
        {/* Pressable interno vacío: evita que un toque en la tarjeta cierre el diálogo */}
        <Pressable onPress={() => {}}>
          <Animated.View
            style={{
              backgroundColor: colores.tarjeta,
              borderRadius: radios.tarjeta + 4,
              padding: espacio(5),
              gap: espacio(4),
              ...sombra,
              opacity: entrada,
              transform: [{ scale: entrada.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) }],
            }}
          >
            <View style={{ gap: espacio(2) }}>
              <Text style={[texto.subtitulo, { fontSize: 19 }]}>{titulo}</Text>
              {mensaje && <Text style={texto.secundario}>{mensaje}</Text>}
            </View>
            <View style={{ gap: espacio(2) }}>
              {opciones.map((o) => (
                <BotonTactil key={o.texto} titulo={o.texto} variante={o.variante ?? 'secundario'} onPress={o.onPress} />
              ))}
            </View>
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
