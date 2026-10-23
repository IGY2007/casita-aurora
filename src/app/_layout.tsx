// Layout raíz: carga los datos desde GitHub y, si todavía no hay conexión configurada, pide los datos de acceso.
import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack } from 'expo-router';
import { Text, View } from 'react-native';

import { AnimacionInicio } from '@/componentes/AnimacionInicio';
import { AvisoProvider } from '@/componentes/Aviso';
import { BotonTactil } from '@/componentes/BotonTactil';
import { PantallaConexion } from '@/componentes/PantallaConexion';
import { DatosProvider, useDatos } from '@/datos/DatosProvider';
import { colores, espacio, texto } from '@/tema';

function cargandoSinDatos(estado: string, hayDatos: boolean) {
  return estado === 'iniciando' || (estado === 'cargando' && !hayDatos);
}

function Contenido() {
  const { estado, datos, error, recargar, desconectar } = useDatos();

  // Mientras carga, la animación de inicio tapa la pantalla (fondo negro debajo para que no parpadee).
  if (cargandoSinDatos(estado, datos !== null)) return <View style={{ flex: 1, backgroundColor: '#000000' }} />;
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
      <Stack.Screen name="etapa" options={{ title: 'Etapa' }} />
      <Stack.Screen name="gasto" options={{ presentation: 'modal' }} />
      <Stack.Screen name="hora" options={{ presentation: 'modal' }} />
      <Stack.Screen name="transferencia" options={{ presentation: 'modal' }} />
      <Stack.Screen name="material" options={{ presentation: 'modal' }} />
      <Stack.Screen name="etapa-editar" options={{ presentation: 'modal' }} />
      <Stack.Screen name="imprevistos" options={{ presentation: 'modal', title: 'Imprevistos' }} />
      <Stack.Screen name="tipos-cambio" options={{ presentation: 'modal', title: 'Tipos de cambio' }} />
    </Stack>
  );
}

function Inicio() {
  const { estado, datos } = useDatos();
  return <AnimacionInicio listo={!cargandoSinDatos(estado, datos !== null)} />;
}

export default function LayoutRaiz() {
  return (
    <DatosProvider>
      <AvisoProvider>
        <Contenido />
        <Inicio />
      </AvisoProvider>
    </DatosProvider>
  );
}
