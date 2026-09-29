// Etapas: presupuesto planificado por categoría (hoja "Presupuesto por etapa").
import { Text, View } from 'react-native';

import { useDatos } from '@/datos/DatosProvider';

export default function PantallaEtapas() {
  const { datos } = useDatos();

  return (
    <View style={{ padding: 16 }}>
      {datos?.presupuesto_categorias.map((c) => (
        <Text key={c.nombre}>
          {c.nombre}: {c.presupuesto_usd} USD
        </Text>
      ))}
    </View>
  );
}
