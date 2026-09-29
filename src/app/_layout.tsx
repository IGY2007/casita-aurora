// Layout raíz: carga los datos desde GitHub y, si todavía no hay conexión configurada, pide los datos de acceso.
import { Stack } from 'expo-router';
import { Button, Text, View } from 'react-native';

import { PantallaConexion } from '@/componentes/PantallaConexion';
import { DatosProvider, useDatos } from '@/datos/DatosProvider';

function Contenido() {
  const { estado, error, recargar, desconectar } = useDatos();

  if (estado === 'iniciando' || (estado === 'cargando' && !error)) {
    return <Text style={{ padding: 16 }}>Cargando…</Text>;
  }
  if (estado === 'sin-config') return <PantallaConexion />;
  if (estado === 'error') {
    return (
      <View style={{ padding: 16, gap: 12 }}>
        <Text>No se pudieron cargar los datos: {error}</Text>
        <Button title="Reintentar" onPress={recargar} />
        <Button title="Cambiar conexión" onPress={desconectar} />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function LayoutRaiz() {
  return (
    <DatosProvider>
      <Contenido />
    </DatosProvider>
  );
}
