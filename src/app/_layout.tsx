// Layout raíz: carga los datos desde GitHub y, si todavía no hay conexión configurada, pide los datos de acceso.
import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';

import { AvisoProvider } from '@/componentes/Aviso';
import { BotonTactil } from '@/componentes/BotonTactil';
import { PantallaConexion } from '@/componentes/PantallaConexion';
import { DatosProvider, useDatos } from '@/datos/DatosProvider';
import { colores, espacio, texto } from '@/tema';

const logo = require('../../assets/icon.png');

function PantallaCarga() {
  const pulso = useRef(new Animated.Value(0.6)).current;
  useEffect(() => {
    const animacion = Animated.loop(
      Animated.sequence([
        Animated.timing(pulso, { toValue: 1, duration: 700, useNativeDriver: false }),
        Animated.timing(pulso, { toValue: 0.6, duration: 700, useNativeDriver: false }),
      ]),
    );
    animacion.start();
    return () => animacion.stop();
  }, [pulso]);

  return (
    <View style={{ flex: 1, backgroundColor: '#000000', alignItems: 'center', justifyContent: 'center' }}>
      <Animated.Image source={logo} style={{ width: 140, height: 140, opacity: pulso, transform: [{ scale: pulso.interpolate({ inputRange: [0.6, 1], outputRange: [0.96, 1] }) }] }} />
    </View>
  );
}

function Contenido() {
  const { estado, datos, error, recargar, desconectar } = useDatos();

  // Sin datos todavía: logo animado. Con datos, las recargas no tapan la app.
  if (estado === 'iniciando' || (estado === 'cargando' && !datos)) return <PantallaCarga />;
  if (estado === 'sin-config') return <PantallaConexion />;
  if (estado === 'error' || !datos) {
    return (
      <View style={{ flex: 1, backgroundColor: colores.fondo, justifyContent: 'center', padding: espacio(6), gap: espacio(4) }}>
        <Ionicons name="cloud-offline-outline" size={48} color={colores.textoSecundario} style={{ alignSelf: 'center' }} />
        <Text style={[texto.subtitulo, { textAlign: 'center' }]}>No se pudieron cargar los datos</Text>
        <Text style={[texto.secundario, { textAlign: 'center' }]}>{error}</Text>
        <BotonTactil titulo="Reintentar" icono="refresh" onPress={recargar} />
        <BotonTactil titulo="Cambiar conexión" variante="secundario" onPress={desconectar} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colores.tarjeta },
        headerTintColor: colores.texto,
        headerTitleStyle: { fontWeight: '600' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colores.fondo },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="gasto" options={{ presentation: 'modal' }} />
      <Stack.Screen name="hora" options={{ presentation: 'modal' }} />
      <Stack.Screen name="transferencia" options={{ presentation: 'modal' }} />
      <Stack.Screen name="tipos-cambio" options={{ presentation: 'modal', title: 'Tipos de cambio' }} />
    </Stack>
  );
}

export default function LayoutRaiz() {
  return (
    <DatosProvider>
      <AvisoProvider>
        <Contenido />
      </AvisoProvider>
    </DatosProvider>
  );
}
