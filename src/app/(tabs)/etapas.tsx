// Etapas: lista de etapas en orden, con subtotal estimado, % del total, acumulado y avance comprado.
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAviso } from '@/componentes/Aviso';
import { BarraProgreso } from '@/componentes/BarraProgreso';
import { BotonFlotante } from '@/componentes/BotonFlotante';
import { Tactil } from '@/componentes/BotonTactil';
import { Encabezado } from '@/componentes/Encabezado';
import { iconoCategoria } from '@/componentes/iconos';
import { Tarjeta } from '@/componentes/Tarjeta';
import { calcularLista, usdAEUR, type ResumenEtapa } from '@/datos/calculos';
import { useDatos } from '@/datos/DatosProvider';
import { formatoMoneda, numeroATexto } from '@/datos/formato';
import { colores, espacio, radios, texto } from '@/tema';

function porcentaje(fraccion: number) {
  return `${numeroATexto(Math.round(fraccion * 1000) / 10)}%`;
}

interface PropsTarjetaEtapa {
  r: ResumenEtapa;
  retraso: number;
  ordenando: boolean;
  primera: boolean;
  ultima: boolean;
  onMover: (direccion: -1 | 1) => void;
}

function TarjetaEtapa({ r, retraso, ordenando, primera, ultima, onMover }: PropsTarjetaEtapa) {
  const fraccionComprada = r.subtotal === 0 ? 0 : r.compradoUSD / r.subtotal;
  const contenido = (
    <Tarjeta retraso={retraso} estilo={{ gap: espacio(3) }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: espacio(3) }}>
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colores.acentoSuave, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name={iconoCategoria(r.etapa.nombre)} size={19} color={colores.acento} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={texto.etiqueta}>Etapa {r.numero}</Text>
          <Text style={[texto.cuerpo, { fontWeight: '600' }]} numberOfLines={2}>
            {r.etapa.nombre}
          </Text>
        </View>
        {ordenando ? (
          <View style={{ flexDirection: 'row', gap: espacio(1) }}>
            <Tactil onPress={() => onMover(-1)} deshabilitado={primera} estilo={{ padding: espacio(2), borderRadius: radios.campo, backgroundColor: colores.fondo }}>
              <Ionicons name="arrow-up" size={20} color={colores.texto} />
            </Tactil>
            <Tactil onPress={() => onMover(1)} deshabilitado={ultima} estilo={{ padding: espacio(2), borderRadius: radios.campo, backgroundColor: colores.fondo }}>
              <Ionicons name="arrow-down" size={20} color={colores.texto} />
            </Tactil>
          </View>
        ) : (
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={texto.monto}>{formatoMoneda(r.subtotal, 'USD')}</Text>
            <Text style={[texto.secundario, { fontSize: 12 }]}>{porcentaje(r.fraccionDelTotal)} del total</Text>
          </View>
        )}
      </View>
      {!ordenando && (
        <>
          <BarraProgreso fraccion={fraccionComprada} alto={8} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={[texto.secundario, { fontSize: 13 }]}>
              {r.comprados} de {r.aComprar} comprados
            </Text>
            <Text style={[texto.secundario, { fontSize: 13 }]}>Acumulado {formatoMoneda(r.acumulado, 'USD')}</Text>
          </View>
        </>
      )}
    </Tarjeta>
  );

  if (ordenando) return contenido;
  return <Tactil onPress={() => router.push({ pathname: '/etapa', params: { id: r.etapa.id } })}>{contenido}</Tactil>;
}

function Fila({ etiqueta, valor, fuerte, onPress }: { etiqueta: string; valor: string; fuerte?: boolean; onPress?: () => void }) {
  const fila = (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: espacio(1.5) }}>
        <Text style={{ color: fuerte ? '#FFFFFF' : '#BDBDBD', fontSize: fuerte ? 16 : 15, fontWeight: fuerte ? '600' : '400' }}>{etiqueta}</Text>
        {onPress && <Ionicons name="create-outline" size={15} color="#8A8A8A" />}
      </View>
      <Text style={{ color: '#FFFFFF', fontSize: fuerte ? 22 : 15, fontWeight: '600' }}>{valor}</Text>
    </View>
  );
  return onPress ? <Tactil onPress={onPress}>{fila}</Tactil> : fila;
}

export default function PantallaEtapas() {
  const { datos, guardar } = useDatos();
  const avisar = useAviso();
  const margenes = useSafeAreaInsets();
  const [ordenando, setOrdenando] = useState(false);
  if (!datos) return null;

  const lista = calcularLista(datos);
  const eur = usdAEUR(lista.totalGeneral, datos.tipos_cambio);
  const compradoTotal = lista.etapas.reduce((s, e) => s + e.compradoUSD, 0);

  function mover(id: string, direccion: -1 | 1) {
    guardar((d) => {
      const i = d.etapas.findIndex((e) => e.id === id);
      const j = i + direccion;
      if (i < 0 || j < 0 || j >= d.etapas.length) return d;
      const etapas = [...d.etapas];
      [etapas[i], etapas[j]] = [etapas[j]!, etapas[i]!];
      return { ...d, etapas };
    }, 'Reordenar etapas').catch((e: unknown) => avisar(e instanceof Error ? `No se guardó: ${e.message}` : 'No se guardó el orden'));
  }

  return (
    <View style={{ flex: 1, backgroundColor: colores.fondo }}>
      <ScrollView contentContainerStyle={{ padding: espacio(4), paddingTop: margenes.top + espacio(4), paddingBottom: 120, gap: espacio(3) }}>
        <Encabezado
          titulo="Etapas"
          subtitulo={`${datos.etapas.length} etapas · lista de materiales`}
          derecha={
            <Tactil
              onPress={() => setOrdenando((o) => !o)}
              estilo={{ paddingVertical: espacio(2), paddingHorizontal: espacio(3), borderRadius: radios.chip, backgroundColor: ordenando ? colores.texto : colores.tarjeta }}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: ordenando ? '#FFFFFF' : colores.texto }}>{ordenando ? 'Listo' : 'Ordenar'}</Text>
            </Tactil>
          }
        />

        {!ordenando && (
          <View style={{ backgroundColor: colores.texto, borderRadius: radios.tarjeta, padding: espacio(5), gap: espacio(3), marginBottom: espacio(1) }}>
            <Text style={[texto.etiqueta, { color: '#A8A8A8' }]}>Presupuesto estimado</Text>
            <Fila etiqueta="Subtotal general" valor={formatoMoneda(lista.subtotalGeneral, 'USD')} />
            <Fila
              etiqueta={`Imprevistos (${numeroATexto(datos.imprevistos_porcentaje)}%)`}
              valor={formatoMoneda(lista.imprevistos, 'USD')}
              onPress={() => router.push('/imprevistos')}
            />
            <View style={{ height: 1, backgroundColor: '#2A2A2A' }} />
            <Fila etiqueta="Total general" valor={formatoMoneda(lista.totalGeneral, 'USD')} fuerte />
            {eur !== null && <Text style={{ color: '#8A8A8A', fontSize: 13, textAlign: 'right' }}>≈ {formatoMoneda(eur, 'EUR')}</Text>}
            <BarraProgreso fraccion={lista.subtotalGeneral === 0 ? 0 : compradoTotal / lista.subtotalGeneral} />
            <Text style={{ color: '#A8A8A8', fontSize: 13 }}>
              Comprado {formatoMoneda(compradoTotal, 'USD')} · pendiente {formatoMoneda(lista.subtotalGeneral - compradoTotal, 'USD')}
            </Text>
            {lista.incompleto && (
              <Tactil onPress={() => router.push('/tipos-cambio')}>
                <Text style={{ color: colores.advertencia, fontSize: 13 }}>
                  * Hay precios en una moneda sin tipo de cambio cargado; no suman. Tocá para cargarlo.
                </Text>
              </Tactil>
            )}
          </View>
        )}

        {lista.etapas.map((r, i) => (
          <TarjetaEtapa
            key={r.etapa.id}
            r={r}
            retraso={ordenando ? 0 : i * 40}
            ordenando={ordenando}
            primera={i === 0}
            ultima={i === lista.etapas.length - 1}
            onMover={(dir) => mover(r.etapa.id, dir)}
          />
        ))}
      </ScrollView>
      {!ordenando && <BotonFlotante etiqueta="Agregar etapa" onPress={() => router.push('/etapa-editar')} />}
    </View>
  );
}
