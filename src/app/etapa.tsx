// Detalle de una etapa (/etapa?id=...): materiales agrupados, casillero de comprado y totales.
import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { useAviso } from '@/componentes/Aviso';
import { BarraProgreso } from '@/componentes/BarraProgreso';
import { BotonFlotante } from '@/componentes/BotonFlotante';
import { Tactil } from '@/componentes/BotonTactil';
import { Casilla } from '@/componentes/Casilla';
import { Dialogo } from '@/componentes/Dialogo';
import { Tarjeta } from '@/componentes/Tarjeta';
import { aUSD, calcularLista, totalMaterial, totalMaterialUSD } from '@/datos/calculos';
import { useDatos } from '@/datos/DatosProvider';
import { formatoMoneda, numeroATexto } from '@/datos/formato';
import type { Gasto, MaterialLista, TipoCambio } from '@/datos/tipos';
import { colores, espacio, radios, texto } from '@/tema';

function detalleCantidad(m: MaterialLista): string {
  const partes: string[] = [];
  if (m.cantidad !== null) partes.push(`${numeroATexto(m.cantidad)} ${m.unidad ?? ''}`.trim());
  if (m.precio_unitario !== null) partes.push(`${formatoMoneda(m.precio_unitario, m.moneda)} c/u`);
  return partes.join(' × ');
}

interface PropsFila {
  m: MaterialLista;
  gasto: Gasto | undefined; // gasto vinculado, si se añadió a gastos
  tipos: TipoCambio[];
  onMarcar: () => void;
}

// Monto en su moneda, con el equivalente en dólares si es otra moneda.
function conDolares(monto: number, moneda: Gasto['moneda'], tipos: TipoCambio[]): string {
  const usd = moneda === 'USD' ? null : aUSD(monto, moneda, tipos);
  return `${formatoMoneda(monto, moneda)}${usd !== null ? ` ≈ ${formatoMoneda(usd, 'USD')}` : ''}`;
}

function FilaMaterial({ m, gasto, tipos, onMarcar }: PropsFila) {
  const totalUSD = m.moneda === 'USD' ? null : totalMaterialUSD(m, tipos);
  const abrir = () => router.push({ pathname: '/material', params: { id: m.id } });
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: espacio(3), paddingVertical: espacio(3) }}>
      {m.disponible ? (
        <View style={{ width: 28, alignItems: 'center' }}>
          <Ionicons name="checkmark-done" size={22} color={colores.textoTenue} />
        </View>
      ) : (
        <Casilla marcada={m.comprado} onPress={onMarcar} etiqueta={`Comprado: ${m.nombre}`} />
      )}
      {/* View con flex: el Pressable de Tactil no se estira solo y los montos quedaban desalineados */}
      <View style={{ flex: 1 }}>
        <Tactil onPress={abrir} estilo={{ flexDirection: 'row', alignItems: 'center', gap: espacio(2) }}>
          <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
            <Text
              style={[texto.cuerpo, m.comprado && !m.disponible ? { color: colores.textoSecundario, textDecorationLine: 'line-through' } : null]}
              numberOfLines={2}
            >
              {m.nombre}
            </Text>
            {detalleCantidad(m) !== '' && <Text style={[texto.secundario, { fontSize: 13 }]}>{detalleCantidad(m)}</Text>}
            {m.observaciones && (
              <Text style={[texto.secundario, { fontSize: 12, color: colores.textoTenue }]} numberOfLines={2}>
                {m.observaciones}
              </Text>
            )}
            {gasto && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <Ionicons name="receipt" size={12} color={colores.acento} />
                <Text style={{ flexShrink: 1, fontSize: 12, color: colores.acento, fontWeight: '600' }}>
                  En gastos · pagado {conDolares(gasto.monto, gasto.moneda, tipos)}
                </Text>
              </View>
            )}
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[texto.monto, m.disponible ? { color: colores.textoTenue, fontWeight: '400', fontSize: 14 } : null]}>
              {m.precio_unitario === null ? '—' : `${m.disponible ? 'ref. ' : ''}${formatoMoneda(totalMaterial(m), m.moneda)}`}
            </Text>
            {m.precio_unitario !== null && m.moneda !== 'USD' && (
              <Text style={[texto.secundario, { fontSize: 12 }]}>{totalUSD !== null ? `≈ ${formatoMoneda(totalUSD, 'USD')}` : 'sin tipo de cambio'}</Text>
            )}
          </View>
        </Tactil>
      </View>
    </View>
  );
}

function Grupo({ titulo, subtitulo, materiales, retraso, gastoDe, tipos, onMarcar }: {
  titulo: string | null;
  subtitulo?: string;
  materiales: MaterialLista[];
  retraso: number;
  gastoDe: (m: MaterialLista) => Gasto | undefined;
  tipos: TipoCambio[];
  onMarcar: (m: MaterialLista) => void;
}) {
  return (
    <View style={{ gap: espacio(2) }}>
      {titulo && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: espacio(3), paddingHorizontal: espacio(1) }}>
          <Text style={[texto.etiqueta, { flex: 1 }]}>{titulo}</Text>
          {subtitulo && <Text style={[texto.etiqueta, { flexShrink: 0 }]}>{subtitulo}</Text>}
        </View>
      )}
      <Tarjeta retraso={retraso} estilo={{ paddingVertical: espacio(1) }}>
        {materiales.map((m, j) => (
          <View key={m.id} style={j > 0 ? { borderTopWidth: 1, borderColor: colores.borde } : undefined}>
            <FilaMaterial m={m} gasto={gastoDe(m)} tipos={tipos} onMarcar={() => onMarcar(m)} />
          </View>
        ))}
      </Tarjeta>
    </View>
  );
}

export default function PantallaEtapa() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { datos, guardar } = useDatos();
  const avisar = useAviso();
  const [preguntando, setPreguntando] = useState<MaterialLista | null>(null);

  const resumen = datos ? calcularLista(datos).etapas.find((e) => e.etapa.id === id) : undefined;
  if (!datos || !resumen) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: espacio(6) }}>
        <Text style={texto.secundario}>Esta etapa ya no existe.</Text>
      </View>
    );
  }
  const etapa = resumen.etapa;
  const materiales = datos.materiales.filter((m) => m.etapa_id === etapa.id);
  const aComprar = materiales.filter((m) => !m.disponible);
  const disponibles = materiales.filter((m) => m.disponible);
  const tipos = datos.tipos_cambio;
  const gastosPorId = new Map(datos.gastos.map((g) => [g.id, g]));
  const gastoDe = (m: MaterialLista) => (m.gasto_id === null ? undefined : gastosPorId.get(m.gasto_id));
  // Subtotal de un grupo en USD (los que no tienen tipo de cambio no suman).
  const subtotalUSD = (ms: MaterialLista[]) => ms.reduce((s, m) => s + (totalMaterialUSD(m, tipos) ?? 0), 0);

  // Grupos en el orden en que aparecen; los materiales sin grupo van primero.
  const grupos = new Map<string | null, MaterialLista[]>();
  for (const m of aComprar) grupos.set(m.grupo, [...(grupos.get(m.grupo) ?? []), m]);

  function marcar(m: MaterialLista) {
    const comprado = !m.comprado;
    guardar(
      (d) => ({
        ...d,
        // Al desmarcar se olvida el vínculo con el gasto: si se vuelve a marcar, se pregunta de nuevo.
        materiales: d.materiales.map((x) => (x.id === m.id ? { ...x, comprado, gasto_id: comprado ? x.gasto_id : null } : x)),
      }),
      `${comprado ? 'Comprado' : 'Pendiente'}: ${m.nombre}`,
    ).catch((e: unknown) => avisar(e instanceof Error ? `No se guardó: ${e.message}` : 'No se guardó'));
    if (comprado && !gastoDe(m)) setPreguntando(m);
  }

  const fraccionComprada = resumen.subtotal === 0 ? 0 : resumen.compradoUSD / resumen.subtotal;

  return (
    <View style={{ flex: 1, backgroundColor: colores.fondo }}>
      <Stack.Screen
        options={{
          title: `Etapa ${resumen.numero}`,
          headerRight: () => (
            <Tactil onPress={() => router.push({ pathname: '/etapa-editar', params: { id: etapa.id } })} estilo={{ padding: espacio(2), marginRight: espacio(2) }}>
              <Ionicons name="create-outline" size={22} color={colores.texto} />
            </Tactil>
          ),
        }}
      />
      <ScrollView contentContainerStyle={{ padding: espacio(4), paddingBottom: 120, gap: espacio(4) }}>
        <View style={{ backgroundColor: colores.texto, borderRadius: radios.tarjeta, padding: espacio(5), gap: espacio(3) }}>
          <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '700' }}>{etapa.nombre}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <Text style={[texto.montoGrande, { color: '#FFFFFF' }]}>{formatoMoneda(resumen.subtotal, 'USD')}</Text>
            <Text style={{ color: '#A8A8A8', fontSize: 13 }}>
              {numeroATexto(Math.round(resumen.fraccionDelTotal * 1000) / 10)}% del total
            </Text>
          </View>
          <BarraProgreso fraccion={fraccionComprada} />
          <Text style={{ color: '#A8A8A8', fontSize: 13 }}>
            {resumen.comprados} de {resumen.aComprar} comprados · pendiente {formatoMoneda(resumen.pendienteUSD, 'USD')}
          </Text>
          {resumen.incompleto && (
            <Text style={{ color: colores.advertencia, fontSize: 13 }}>
              * Hay precios en una moneda sin tipo de cambio cargado; no suman al total.
            </Text>
          )}
          {resumen.gastadoReal.ars > 0 && (
            <Text style={{ color: '#A8A8A8', fontSize: 13 }}>
              Gastado real: {formatoMoneda(resumen.gastadoReal.ars, 'ARS')}
              {resumen.gastadoRealUSD !== null && ` ≈ ${formatoMoneda(resumen.gastadoRealUSD, 'USD')}`}
            </Text>
          )}
        </View>

        {etapa.notas && (
          <Tarjeta estilo={{ flexDirection: 'row', gap: espacio(3), backgroundColor: colores.acentoSuave }}>
            <Ionicons name="bulb-outline" size={20} color={colores.acento} />
            <Text style={[texto.cuerpo, { flex: 1, fontSize: 14, lineHeight: 20 }]}>{etapa.notas}</Text>
          </Tarjeta>
        )}

        {materiales.length === 0 && (
          <Tarjeta estilo={{ alignItems: 'center', paddingVertical: espacio(10), gap: espacio(3) }}>
            <Ionicons name="cube-outline" size={44} color={colores.textoTenue} />
            <Text style={texto.secundario}>Todavía no hay materiales en esta etapa.</Text>
            <Text style={[texto.secundario, { fontSize: 13 }]}>Tocá el botón + para agregar.</Text>
          </Tarjeta>
        )}

        {[...grupos.entries()].map(([grupo, delGrupo], i) => (
          <Grupo
            key={grupo ?? '_'}
            titulo={grupo}
            subtitulo={grupo ? formatoMoneda(subtotalUSD(delGrupo), 'USD') : undefined}
            materiales={delGrupo}
            retraso={i * 60}
            gastoDe={gastoDe}
            tipos={tipos}
            onMarcar={marcar}
          />
        ))}

        {disponibles.length > 0 && (
          <Grupo titulo="Ya disponible (no suma)" materiales={disponibles} retraso={grupos.size * 60} gastoDe={gastoDe} tipos={tipos} onMarcar={marcar} />
        )}
      </ScrollView>
      <BotonFlotante etiqueta="Agregar material" onPress={() => router.push({ pathname: '/material', params: { etapa: etapa.id } })} />

      <Dialogo
        visible={preguntando !== null}
        titulo="¿Querés añadirlo a la página de gastos?"
        mensaje={preguntando ? `${preguntando.nombre} quedó marcado como comprado.` : undefined}
        onCerrar={() => setPreguntando(null)}
        opciones={[
          {
            texto: 'Sí, añadir a gastos',
            variante: 'primario',
            onPress: () => {
              const material = preguntando;
              setPreguntando(null);
              if (material) router.push({ pathname: '/gasto', params: { material: material.id } });
            },
          },
          { texto: 'No, solo marcarlo', variante: 'secundario', onPress: () => setPreguntando(null) },
        ]}
      />
    </View>
  );
}
