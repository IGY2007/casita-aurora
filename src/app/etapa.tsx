// Detalle de una etapa (/etapa?id=...): materiales agrupados, casillero de comprado, otros gastos y totales.
// Lo comprado y vinculado a un gasto cuenta lo pagado realmente; lo pendiente, el precio estimado.
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
import { aUSD, calcularLista, totalMaterial, totalMaterialUSD, type ValorMaterial } from '@/datos/calculos';
import { useDatos } from '@/datos/DatosProvider';
import { fechaCorta, formatoMoneda, numeroATexto } from '@/datos/formato';
import type { Gasto, MaterialLista, Moneda, TipoCambio } from '@/datos/tipos';
import { colores, espacio, radios, texto } from '@/tema';

function detalleCantidad(m: MaterialLista): string {
  const partes: string[] = [];
  if (m.cantidad !== null) partes.push(`${numeroATexto(m.cantidad)} ${m.unidad ?? ''}`.trim());
  if (m.precio_unitario !== null) partes.push(`${formatoMoneda(m.precio_unitario, m.moneda)} c/u`);
  return partes.join(' × ');
}

// "≈ US$ 81" si la moneda no es USD y hay tipo de cambio.
function enDolares(monto: number, moneda: Moneda, tipos: TipoCambio[]): string | null {
  if (moneda === 'USD') return null;
  const usd = aUSD(monto, moneda, tipos);
  return usd === null ? 'sin tipo de cambio' : `≈ ${formatoMoneda(usd, 'USD')}`;
}

interface PropsFila {
  v: ValorMaterial;
  tipos: TipoCambio[];
  onMarcar: () => void;
}

function FilaMaterial({ v, tipos, onMarcar }: PropsFila) {
  const { material: m, gasto } = v;
  const abrir = () => router.push({ pathname: '/material', params: { id: m.id } });

  // Comprado con gasto: manda lo pagado; si no, el estimado.
  const montoPrincipal = gasto ? formatoMoneda(gasto.monto, gasto.moneda) : m.precio_unitario === null ? '—' : formatoMoneda(totalMaterial(m), m.moneda);
  const equivalente = gasto ? enDolares(gasto.monto, gasto.moneda, tipos) : m.precio_unitario === null ? null : enDolares(totalMaterial(m), m.moneda, tipos);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: espacio(3), paddingVertical: espacio(3) }}>
      {m.disponible ? (
        <View style={{ width: 28, alignItems: 'center' }}>
          <Ionicons name="checkmark-done" size={22} color={colores.textoTenue} />
        </View>
      ) : (
        <Casilla marcada={m.comprado} onPress={onMarcar} etiqueta={`Comprado: ${m.nombre}`} />
      )}
      <Tactil onPress={abrir} estiloContenedor={{ flex: 1 }} estilo={{ flexDirection: 'row', alignItems: 'center', gap: espacio(2) }}>
        <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
          <Text style={[texto.cuerpo, m.comprado && !m.disponible ? { color: colores.textoSecundario } : null]} numberOfLines={2}>
            {m.nombre}
          </Text>
          {detalleCantidad(m) !== '' && (
            <Text style={[texto.secundario, { fontSize: 13 }, gasto ? { textDecorationLine: 'line-through', color: colores.textoTenue } : null]}>
              {detalleCantidad(m)}
            </Text>
          )}
          {m.observaciones && (
            <Text style={[texto.secundario, { fontSize: 12, color: colores.textoTenue }]} numberOfLines={2}>
              {m.observaciones}
            </Text>
          )}
          {gasto && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <Ionicons name="receipt" size={12} color={colores.acento} />
              <Text style={{ flexShrink: 1, fontSize: 12, color: colores.acento, fontWeight: '600' }}>
                Pagado el {fechaCorta(gasto.fecha)}
                {gasto.cantidad !== null ? ` · ${numeroATexto(gasto.cantidad)} ${gasto.unidad ?? ''}`.trimEnd() : ''}
              </Text>
            </View>
          )}
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[texto.monto, m.disponible ? { color: colores.textoTenue, fontWeight: '400', fontSize: 14 } : null]}>
            {m.disponible && m.precio_unitario !== null ? `ref. ${montoPrincipal}` : montoPrincipal}
          </Text>
          {equivalente && <Text style={[texto.secundario, { fontSize: 12 }]}>{equivalente}</Text>}
          {gasto && v.estimadoUSD !== null && (
            <Text style={{ fontSize: 12, color: colores.textoTenue, textDecorationLine: 'line-through' }}>est. {formatoMoneda(v.estimadoUSD, 'USD')}</Text>
          )}
        </View>
      </Tactil>
    </View>
  );
}

function FilaOtroGasto({ g, tipos }: { g: Gasto; tipos: TipoCambio[] }) {
  const equivalente = enDolares(g.monto, g.moneda, tipos);
  return (
    <Tactil
      onPress={() => router.push({ pathname: '/gasto', params: { id: g.id } })}
      estilo={{ flexDirection: 'row', alignItems: 'center', gap: espacio(3), paddingVertical: espacio(3) }}
    >
      <View style={{ width: 28, alignItems: 'center' }}>
        <Ionicons name="receipt-outline" size={20} color={colores.acento} />
      </View>
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <Text style={texto.cuerpo} numberOfLines={2}>
          {g.material}
        </Text>
        <Text style={[texto.secundario, { fontSize: 13 }]}>
          {fechaCorta(g.fecha)}
          {g.cantidad !== null ? ` · ${numeroATexto(g.cantidad)} ${g.unidad ?? ''}`.trimEnd() : ''}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={texto.monto}>{formatoMoneda(g.monto, g.moneda)}</Text>
        {equivalente && <Text style={[texto.secundario, { fontSize: 12 }]}>{equivalente}</Text>}
      </View>
    </Tactil>
  );
}

function Encabezado({ titulo, subtitulo }: { titulo: string; subtitulo?: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: espacio(3), paddingHorizontal: espacio(1) }}>
      <Text style={[texto.etiqueta, { flex: 1 }]}>{titulo}</Text>
      {subtitulo && <Text style={[texto.etiqueta, { flexShrink: 0 }]}>{subtitulo}</Text>}
    </View>
  );
}

function Grupo({ titulo, subtitulo, valores, retraso, tipos, onMarcar }: {
  titulo: string | null;
  subtitulo?: string;
  valores: ValorMaterial[];
  retraso: number;
  tipos: TipoCambio[];
  onMarcar: (m: MaterialLista) => void;
}) {
  return (
    <View style={{ gap: espacio(2) }}>
      {titulo && <Encabezado titulo={titulo} subtitulo={subtitulo} />}
      <Tarjeta retraso={retraso} estilo={{ paddingVertical: espacio(1) }}>
        {valores.map((v, j) => (
          <View key={v.material.id} style={j > 0 ? { borderTopWidth: 1, borderColor: colores.borde } : undefined}>
            <FilaMaterial v={v} tipos={tipos} onMarcar={() => onMarcar(v.material)} />
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
  const tipos = datos.tipos_cambio;
  // Los "ya disponible" no suman: se muestran aparte con su precio de referencia.
  const disponibles: ValorMaterial[] = datos.materiales
    .filter((m) => m.etapa_id === etapa.id && m.disponible)
    .map((m) => ({ material: m, gasto: undefined, estimadoUSD: totalMaterialUSD(m, tipos), realUSD: null, valorUSD: null }));
  const vacia = resumen.materiales.length === 0 && disponibles.length === 0 && resumen.otrosGastos.length === 0;

  // Grupos en el orden en que aparecen.
  const grupos = new Map<string | null, ValorMaterial[]>();
  for (const v of resumen.materiales) grupos.set(v.material.grupo, [...(grupos.get(v.material.grupo) ?? []), v]);

  function marcar(m: MaterialLista) {
    const comprado = !m.comprado;
    const tieneGasto = m.gasto_id !== null && datos?.gastos.some((g) => g.id === m.gasto_id);
    guardar(
      (d) => ({
        ...d,
        // Al desmarcar se olvida el vínculo con el gasto (el gasto queda en Gastos y pasa a "otros gastos").
        materiales: d.materiales.map((x) => (x.id === m.id ? { ...x, comprado, gasto_id: comprado ? x.gasto_id : null } : x)),
      }),
      `${comprado ? 'Comprado' : 'Pendiente'}: ${m.nombre}`,
    ).catch((e: unknown) => avisar(e instanceof Error ? `No se guardó: ${e.message}` : 'No se guardó'));
    if (comprado && !tieneGasto) setPreguntando(m);
  }

  const fraccionComprada = resumen.subtotal === 0 ? 0 : resumen.compradoUSD / resumen.subtotal;
  const ahorro = resumen.diferenciaComprados;

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
            {resumen.comprados} de {resumen.aComprar} comprados · gastado {formatoMoneda(resumen.compradoUSD, 'USD')} · pendiente{' '}
            {formatoMoneda(resumen.pendienteUSD, 'USD')}
          </Text>
          {Math.abs(resumen.subtotal - resumen.estimadoOriginal) >= 0.5 && (
            <Text style={{ color: '#A8A8A8', fontSize: 13 }}>Estimado original de la lista: {formatoMoneda(resumen.estimadoOriginal, 'USD')}</Text>
          )}
          {Math.abs(ahorro) >= 0.5 && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: espacio(1.5) }}>
              <Ionicons name={ahorro > 0 ? 'trending-down' : 'trending-up'} size={16} color={ahorro > 0 ? colores.acento : colores.peligro} />
              <Text style={{ color: ahorro > 0 ? colores.acento : colores.peligro, fontSize: 14, fontWeight: '600' }}>
                {ahorro > 0 ? 'Ahorraste' : 'Te pasaste'} {formatoMoneda(Math.abs(ahorro), 'USD')} en lo comprado
              </Text>
            </View>
          )}
          {resumen.incompleto && (
            <Text style={{ color: colores.advertencia, fontSize: 13 }}>* Hay montos en una moneda sin tipo de cambio cargado; no suman al total.</Text>
          )}
        </View>

        {etapa.notas && (
          <Tarjeta estilo={{ flexDirection: 'row', gap: espacio(3), backgroundColor: colores.acentoSuave }}>
            <Ionicons name="bulb-outline" size={20} color={colores.acento} />
            <Text style={[texto.cuerpo, { flex: 1, fontSize: 14, lineHeight: 20 }]}>{etapa.notas}</Text>
          </Tarjeta>
        )}

        {vacia && (
          <Tarjeta estilo={{ alignItems: 'center', paddingVertical: espacio(10), gap: espacio(3) }}>
            <Ionicons name="cube-outline" size={44} color={colores.textoTenue} />
            <Text style={texto.secundario}>Todavía no hay materiales en esta etapa.</Text>
            <Text style={[texto.secundario, { fontSize: 13 }]}>Tocá el botón + para agregar.</Text>
          </Tarjeta>
        )}

        {[...grupos.entries()].map(([grupo, valores], i) => (
          <Grupo
            key={grupo ?? '_'}
            titulo={grupo}
            subtitulo={grupo ? formatoMoneda(valores.reduce((s, v) => s + (v.valorUSD ?? 0), 0), 'USD') : undefined}
            valores={valores}
            retraso={i * 60}
            tipos={tipos}
            onMarcar={marcar}
          />
        ))}

        {resumen.otrosGastos.length > 0 && (
          <View style={{ gap: espacio(2) }}>
            <Encabezado titulo="Otros gastos de esta etapa" subtitulo={formatoMoneda(resumen.otrosGastosUSD, 'USD')} />
            <Tarjeta retraso={grupos.size * 60} estilo={{ paddingVertical: espacio(1) }}>
              {resumen.otrosGastos.map((g, j) => (
                <View key={g.id} style={j > 0 ? { borderTopWidth: 1, borderColor: colores.borde } : undefined}>
                  <FilaOtroGasto g={g} tipos={tipos} />
                </View>
              ))}
            </Tarjeta>
            <Text style={[texto.secundario, { fontSize: 12, paddingHorizontal: espacio(1) }]}>
              Gastos cargados en esta etapa que no están en la lista. Suman al total; tocá uno para vincularlo con un material.
            </Text>
          </View>
        )}

        {disponibles.length > 0 && (
          <Grupo titulo="Ya disponible (no suma)" valores={disponibles} retraso={(grupos.size + 1) * 60} tipos={tipos} onMarcar={marcar} />
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
