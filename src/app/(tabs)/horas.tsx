// Horas: registro de jornadas de trabajo, propias y changas (sin diseño todavía).
import { Text, View } from 'react-native';

import { useDatos } from '@/datos/DatosProvider';

export default function PantallaHoras() {
  const { datos } = useDatos();
  const horas = [...(datos?.horas_trabajo ?? [])].sort((a, b) => b.fecha.localeCompare(a.fecha));

  return (
    <View style={{ padding: 16 }}>
      {horas.map((h) => (
        <Text key={h.id}>
          {h.fecha} · {h.persona} · {h.horas} hs · {h.costo} {h.moneda}
        </Text>
      ))}
    </View>
  );
}
