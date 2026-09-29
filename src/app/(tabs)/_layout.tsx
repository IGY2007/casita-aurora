// Navegación por tabs: Resumen, Gastos, Horas, Transferencias, Etapas.
import { Tabs } from 'expo-router';

export default function LayoutTabs() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'Resumen' }} />
      <Tabs.Screen name="gastos" options={{ title: 'Gastos' }} />
      <Tabs.Screen name="horas" options={{ title: 'Horas' }} />
      <Tabs.Screen name="transferencias" options={{ title: 'Transferencias' }} />
      <Tabs.Screen name="etapas" options={{ title: 'Etapas' }} />
    </Tabs>
  );
}
