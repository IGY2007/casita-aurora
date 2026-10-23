// Animación de apertura: el logo aparece suave sobre negro, después el nombre, y todo se desvanece
// dejando ver la app. Dura al menos DURACION_MINIMA y espera a que los datos estén listos.
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text } from 'react-native';

const logo = require('../../assets/icon.png');

const DURACION_MINIMA = 1700;
const suave = Easing.bezier(0.22, 1, 0.36, 1); // ease-out "expo": arranca ágil y frena muy suave

export function AnimacionInicio({ listo }: { listo: boolean }) {
  const logoEntrada = useRef(new Animated.Value(0)).current;
  const tituloEntrada = useRef(new Animated.Value(0)).current;
  const salida = useRef(new Animated.Value(0)).current;
  const [minimoCumplido, setMinimoCumplido] = useState(false);
  const [terminada, setTerminada] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoEntrada, { toValue: 1, duration: 1100, easing: suave, useNativeDriver: false }),
      Animated.timing(tituloEntrada, { toValue: 1, duration: 900, delay: 450, easing: suave, useNativeDriver: false }),
    ]).start();
    const t = setTimeout(() => setMinimoCumplido(true), DURACION_MINIMA);
    return () => clearTimeout(t);
  }, [logoEntrada, tituloEntrada]);

  useEffect(() => {
    if (!listo || !minimoCumplido) return;
    Animated.timing(salida, { toValue: 1, duration: 650, easing: Easing.inOut(Easing.cubic), useNativeDriver: false }).start(() =>
      setTerminada(true),
    );
  }, [listo, minimoCumplido, salida]);

  if (terminada) return null;

  return (
    <Animated.View
      pointerEvents={listo && minimoCumplido ? 'none' : 'auto'}
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: '#000000', alignItems: 'center', justifyContent: 'center', opacity: salida.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) },
      ]}
    >
      <Animated.Image
        source={logo}
        style={{
          width: 150,
          height: 150,
          opacity: logoEntrada,
          transform: [
            { scale: Animated.add(logoEntrada.interpolate({ inputRange: [0, 1], outputRange: [0.86, 1] }), salida.interpolate({ inputRange: [0, 1], outputRange: [0, 0.06] })) },
            { translateY: logoEntrada.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) },
          ],
        }}
      />
      <Animated.View
        style={{
          marginTop: 22,
          opacity: tituloEntrada,
          transform: [{ translateY: tituloEntrada.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }],
        }}
      >
        <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '600', letterSpacing: 4 }}>CASITA AURORA</Text>
        <Text style={{ color: '#8A8A8A', fontSize: 12, letterSpacing: 3, textAlign: 'center', marginTop: 6 }}>BARILOCHE</Text>
      </Animated.View>
    </Animated.View>
  );
}
