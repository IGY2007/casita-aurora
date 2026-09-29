// Transferencias: lista cruda de los envíos de dinero (sin diseño todavía).
import { Text, View } from 'react-native';

import { useDatos } from '@/datos/DatosProvider';

export default function PantallaTransferencias() {
  const { datos } = useDatos();
  const transferencias = [...(datos?.transferencias ?? [])].sort((a, b) => b.fecha.localeCompare(a.fecha));

  return (
    <View style={{ padding: 16 }}>
      {transferencias.map((t) => (
        <Text key={t.id}>
          {t.fecha} · {t.destinatario} · {t.monto_enviado} {t.moneda_enviada} → {t.monto_recibido ?? '?'}{' '}
          {t.moneda_recibida ?? ''}
        </Text>
      ))}
    </View>
  );
}
