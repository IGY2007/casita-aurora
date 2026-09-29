// Etapas: presupuesto planificado vs. gasto real por categoría (hoja "Presupuesto por etapa").
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BarraProgreso } from '@/componentes/BarraProgreso';
import { Tactil } from '@/componentes/BotonTactil';
import { Encabezado } from '@/componentes/Encabezado';
import { iconoCategoria } from '@/componentes/iconos';
import { Tarjeta } from '@/componentes/Tarjeta';
import { calcularEtapas, type Etapa } from '@/datos/calculos';
import { useDatos } from '@/datos/DatosProvider';
import { formatoMoneda, numeroATexto } from '@/datos/formato';
import { colores, espacio, radios, texto } from '@/tema';

function TarjetaEtapa({ etapa, retraso }: { etapa: Etapa; retraso: number }) {
  const diferencia = etapa.gastadoUSD === null ? null : etapa.presupuestoUSD - etapa.gastadoUSD;
  return (
    <Tarjeta retraso={retraso} estilo={{ gap: espacio(3) }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: espacio(3) }}>
        <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: colores.acentoSuave, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name={iconoCategoria(etapa.nombre)} size={18} color={colores.acento} />
        </View>
        <Text style={[texto.cuerpo, { flex: 1, fontWeight: '600' }]} numberOfLines={2}>
          {etapa.nombre}
        </Text>
        {etapa.fraccion !== null && <Text style={texto.monto}>{numeroATexto(Math.round(etapa.fraccion * 100))}%</Text>}
      </View>
      {!etapa.esImprevistos && <BarraProgreso fraccion={etapa.fraccion ?? 0} alto={8} />}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View>
          <Text style={texto.etiqueta}>Gastado</Text>
          <Text style={texto.cuerpo}>
            {etapa.gastadoUSD !== null ? formatoMoneda(etapa.gastadoUSD, 'USD') : formatoMoneda(etapa.gastado.ars, 'ARS')}
          </Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={texto.etiqueta}>Presupuesto</Text>
          <Text style={texto.cuerpo}>{formatoMoneda(etapa.presupuestoUSD, 'USD')}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={texto.etiqueta}>Disponible</Text>
          <Text style={[texto.cuerpo, { color: diferencia !== null && diferencia < 0 ? colores.peligro : colores.texto }]}>
            {diferencia !== null ? formatoMoneda(diferencia, 'USD') : '—'}
          </Text>
        </View>
      </View>
    </Tarjeta>
  );
}

export default function PantallaEtapas() {
  const { datos } = useDatos();
  const margenes = useSafeAreaInsets();
  if (!datos) return null;

  const etapas = calcularEtapas(datos);
  const sinDolar = etapas.some((e) => e.gastadoUSD === null);
  const presupuestoTotal = etapas.reduce((s, e) => s + e.presupuestoUSD, 0);

  return (
    <ScrollView
      style={{ backgroundColor: colores.fondo }}
      contentContainerStyle={{ padding: espacio(4), paddingTop: margenes.top + espacio(4), paddingBottom: espacio(10), gap: espacio(3) }}
    >
      <Encabezado titulo="Etapas" subtitulo={`Presupuesto total ${formatoMoneda(presupuestoTotal, 'USD')}`} />

      {sinDolar && (
        <Tactil
          onPress={() => router.push('/tipos-cambio')}
          estilo={{ flexDirection: 'row', gap: espacio(2), alignItems: 'center', backgroundColor: colores.advertenciaSuave, borderRadius: radios.campo, padding: espacio(3) }}
        >
          <Ionicons name="information-circle-outline" size={20} color={colores.advertencia} />
          <Text style={{ flex: 1, fontSize: 14, color: colores.texto }}>
            Los gastos están en pesos y el presupuesto en dólares. Cargá el tipo de cambio del dólar para comparar.
          </Text>
          <Ionicons name="chevron-forward" size={18} color={colores.textoSecundario} />
        </Tactil>
      )}

      {etapas.map((e, i) => (
        <TarjetaEtapa key={e.nombre} etapa={e} retraso={i * 50} />
      ))}
    </ScrollView>
  );
}
