// Navegación por tabs: Resumen, Gastos, Horas, Transferencias, Etapas.
import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colores } from '@/tema';

type Icono = ComponentProps<typeof Ionicons>['name'];

// Ícono relleno cuando la pestaña está activa, contorno cuando no.
function icono(activo: Icono, inactivo: Icono) {
  function IconoTab({ color, focused }: { color: ColorValue; focused: boolean }) {
    return <Ionicons name={focused ? activo : inactivo} size={24} color={color} />;
  }
  return IconoTab;
}

export default function LayoutTabs() {
  const margenes = useSafeAreaInsets();
  // 56 px para ícono + texto; abajo se suma el margen del iPhone (barra de inicio).
  const margenInferior = Math.max(8, margenes.bottom);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colores.texto,
        tabBarInactiveTintColor: colores.textoTenue,
        tabBarStyle: {
          backgroundColor: colores.tarjeta,
          borderTopColor: colores.borde,
          height: 56 + 6 + margenInferior,
          paddingTop: 6,
          paddingBottom: margenInferior,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Resumen', tabBarIcon: icono('home', 'home-outline') }} />
      <Tabs.Screen name="gastos" options={{ title: 'Gastos', tabBarIcon: icono('receipt', 'receipt-outline') }} />
      <Tabs.Screen name="horas" options={{ title: 'Horas', tabBarIcon: icono('time', 'time-outline') }} />
      <Tabs.Screen name="transferencias" options={{ title: 'Envíos', tabBarIcon: icono('paper-plane', 'paper-plane-outline') }} />
      <Tabs.Screen name="etapas" options={{ title: 'Etapas', tabBarIcon: icono('bar-chart', 'bar-chart-outline') }} />
    </Tabs>
  );
}
