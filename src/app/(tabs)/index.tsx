// Resumen: por ahora muestra cuántos registros hay de cada tipo, para verificar la conexión con GitHub.
import { Button, Text, View } from 'react-native';

import { useDatos } from '@/datos/DatosProvider';

export default function PantallaResumen() {
  const { datos, sinConexion, error, recargar } = useDatos();
  if (!datos) return null;

  return (
    <View style={{ padding: 16, gap: 4 }}>
      {sinConexion && <Text style={{ color: 'orange' }}>Sin conexión, mostrando la última copia guardada. ({error})</Text>}
      <Text>presupuesto_categorias: {datos.presupuesto_categorias.length}</Text>
      <Text>gastos: {datos.gastos.length}</Text>
      <Text>horas_trabajo: {datos.horas_trabajo.length}</Text>
      <Text>transferencias: {datos.transferencias.length}</Text>
      <Text>tipos_cambio: {datos.tipos_cambio.length}</Text>
      <Button title="Recargar" onPress={recargar} />
    </View>
  );
}
