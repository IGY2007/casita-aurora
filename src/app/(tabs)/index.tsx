// Resumen: gasto total, avance del presupuesto, dinero enviado y tipos de cambio (hoja "Resumen" del Excel).
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Image, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BarraProgreso } from '@/componentes/BarraProgreso';
import { BotonTactil, Tactil } from '@/componentes/BotonTactil';
import { Encabezado } from '@/componentes/Encabezado';
import { Tarjeta } from '@/componentes/Tarjeta';
import { calcularResumen, usdAARS, type Total } from '@/datos/calculos';
import { useDatos } from '@/datos/DatosProvider';
import { fechaCorta, formatoMoneda, numeroATexto } from '@/datos/formato';
import { colores, espacio, radios, texto } from '@/tema';

const logo = require('../../../assets/icon.png');

function montoARS(total: Total): string {
  return `${formatoMoneda(total.ars, 'ARS')}${total.incompleto ? ' *' : ''}`;
}

function Dato({ etiqueta, valor, detalle, color, retraso }: { etiqueta: string; valor: string; detalle?: string; color?: string; retraso: number }) {
  return (
    <Tarjeta retraso={retraso} estilo={{ flex: 1, minWidth: 150, gap: espacio(1) }}>
      <Text style={texto.etiqueta}>{etiqueta}</Text>
      <Text style={[texto.subtitulo, { fontSize: 19, color: color ?? colores.texto }]} numberOfLines={1} adjustsFontSizeToFit>
        {valor}
      </Text>
      {detalle && <Text style={[texto.secundario, { fontSize: 12 }]}>{detalle}</Text>}
    </Tarjeta>
  );
}

export default function PantallaResumen() {
  const { datos, sinConexion, recargar, estado } = useDatos();
  const margenes = useSafeAreaInsets();
  if (!datos) return null;

  const r = calcularResumen(datos);
  const presupuestoARS = usdAARS(r.presupuestoUSD, datos.tipos_cambio);
  const hayIncompletos = r.gastoTotal.incompleto || r.enviado.incompleto;

  return (
    <ScrollView
      style={{ backgroundColor: colores.fondo }}
      contentContainerStyle={{ padding: espacio(4), paddingTop: margenes.top + espacio(4), paddingBottom: espacio(10), gap: espacio(4) }}
    >
      <Encabezado
        titulo="Casita Aurora"
        subtitulo="Control de obra · Bariloche"
        izquierda={<Image source={logo} style={{ width: 48, height: 48, borderRadius: 24 }} />}
        derecha={
          <Tactil onPress={recargar} estilo={{ padding: espacio(2) }} deshabilitado={estado === 'cargando'}>
            <Ionicons name="refresh" size={22} color={colores.texto} />
          </Tactil>
        }
      />

      {sinConexion && (
        <View style={{ flexDirection: 'row', gap: espacio(2), alignItems: 'center', backgroundColor: colores.advertenciaSuave, borderRadius: radios.campo, padding: espacio(3) }}>
          <Ionicons name="cloud-offline-outline" size={20} color={colores.advertencia} />
          <Text style={{ flex: 1, fontSize: 14, color: colores.texto }}>Sin conexión: estás viendo la última copia guardada.</Text>
        </View>
      )}

      {/* Tarjeta principal: gasto total y avance del presupuesto */}
      <View style={{ backgroundColor: colores.texto, borderRadius: radios.tarjeta, padding: espacio(5), gap: espacio(3) }}>
        <Text style={[texto.etiqueta, { color: '#A8A8A8' }]}>Gasto total de obra</Text>
        <Text style={[texto.montoGrande, { color: '#FFFFFF', fontSize: 36 }]}>{montoARS(r.gastoTotal)}</Text>
        <Text style={{ color: '#A8A8A8', fontSize: 13 }}>Materiales + changas</Text>
        <View style={{ height: 1, backgroundColor: '#2A2A2A', marginVertical: espacio(1) }} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: '#FFFFFF', fontSize: 15 }}>Presupuesto</Text>
          <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>{formatoMoneda(r.presupuestoUSD, 'USD')}</Text>
        </View>
        {r.fraccionEjecutada !== null ? (
          <>
            <BarraProgreso fraccion={r.fraccionEjecutada} />
            <Text style={{ color: '#A8A8A8', fontSize: 13 }}>
              {numeroATexto(Math.round(r.fraccionEjecutada * 1000) / 10)}% ejecutado en materiales
              {presupuestoARS !== null && ` · presupuesto ≈ ${formatoMoneda(presupuestoARS, 'ARS')}`}
            </Text>
          </>
        ) : (
          <Tactil onPress={() => router.push('/tipos-cambio')} estilo={{ flexDirection: 'row', alignItems: 'center', gap: espacio(2), backgroundColor: '#2A2A2A', borderRadius: radios.campo, padding: espacio(3) }}>
            <Ionicons name="swap-horizontal" size={18} color={colores.acento} />
            <Text style={{ flex: 1, color: '#FFFFFF', fontSize: 14 }}>Cargá el tipo de cambio del dólar para ver el avance del presupuesto</Text>
            <Ionicons name="chevron-forward" size={18} color="#A8A8A8" />
          </Tactil>
        )}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: espacio(3) }}>
        <Dato etiqueta="Materiales" valor={montoARS(r.materiales)} detalle={`${datos.gastos.length} compras`} retraso={80} />
        <Dato
          etiqueta="Changas"
          valor={montoARS(r.changas)}
          detalle={`${numeroATexto(r.horasChangas)} hs pagas · ${numeroATexto(r.horasPropias)} hs propias`}
          retraso={140}
        />
        <Dato etiqueta="Enviado" valor={montoARS(r.enviado)} detalle={`${datos.transferencias.length} transferencias`} retraso={200} />
        <Dato
          etiqueta="Saldo de tus viejos"
          valor={formatoMoneda(r.saldo, 'ARS')}
          detalle="Enviado − gastado"
          color={r.saldo < 0 ? colores.peligro : colores.acento}
          retraso={260}
        />
      </View>

      <Tarjeta retraso={320} estilo={{ gap: espacio(3) }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={texto.subtitulo}>Tipos de cambio</Text>
          <Ionicons name="swap-horizontal" size={20} color={colores.textoSecundario} />
        </View>
        {datos.tipos_cambio.map((t) => (
          <View key={t.moneda} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={texto.cuerpo}>1 {t.moneda}</Text>
            <Text style={[texto.cuerpo, { color: t.ars_por_unidad ? colores.texto : colores.textoTenue }]}>
              {t.ars_por_unidad ? `${formatoMoneda(t.ars_por_unidad, 'ARS')}${t.actualizado ? ` · ${fechaCorta(t.actualizado)}` : ''}` : 'Sin cargar'}
            </Text>
          </View>
        ))}
        <BotonTactil titulo="Actualizar" icono="create-outline" variante="secundario" onPress={() => router.push('/tipos-cambio')} />
      </Tarjeta>

      {hayIncompletos && (
        <Text style={[texto.secundario, { fontSize: 12 }]}>* Hay montos en otra moneda sin tipo de cambio cargado; no se suman.</Text>
      )}
    </ScrollView>
  );
}
