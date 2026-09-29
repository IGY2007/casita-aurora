// Gastos: lista cruda de los gastos cargados (sin diseño todavía).
import { Text, View } from 'react-native';

import { useDatos } from '@/datos/DatosProvider';

export default function PantallaGastos() {
  const { datos } = useDatos();
  const gastos = [...(datos?.gastos ?? [])].sort((a, b) => b.fecha.localeCompare(a.fecha));

  return (
    <View style={{ padding: 16 }}>
      {gastos.map((g) => (
        <Text key={g.id}>
          {g.fecha} · {g.material} · {g.monto} {g.moneda}
        </Text>
      ))}
    </View>
  );
}
