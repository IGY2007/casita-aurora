// Lista de registros agrupados por mes, con total mensual y botón "+" flotante para agregar.
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { sumarARS } from '@/datos/calculos';
import { useDatos } from '@/datos/DatosProvider';
import { fechaCorta, formatoMoneda, mesYAnio } from '@/datos/formato';
import type { Moneda } from '@/datos/tipos';
import { colores, espacio, texto } from '@/tema';

import { BotonFlotante } from './BotonFlotante';
import { Encabezado } from './Encabezado';
import { FilaRegistro, type NombreIcono } from './FilaRegistro';
import { Tarjeta } from './Tarjeta';

export interface ItemLista {
  id: string;
  fecha: string;
  icono: NombreIcono;
  titulo: string;
  subtitulo: string;
  monto: number;
  moneda: Moneda;
  detalleMonto?: string;
}

interface PropsLista {
  titulo: string;
  formulario: '/gasto' | '/hora' | '/transferencia';
  items: ItemLista[];
  textoVacio: string;
  iconoVacio: NombreIcono;
}

export function Lista({ titulo, formulario, items, textoVacio, iconoVacio }: PropsLista) {
  const { datos } = useDatos();
  const margenes = useSafeAreaInsets();
  const tipos = datos?.tipos_cambio ?? [];

  // Agrupa por mes (AAAA-MM), del más reciente al más viejo.
  const ordenados = [...items].sort((a, b) => b.fecha.localeCompare(a.fecha));
  const grupos = new Map<string, ItemLista[]>();
  for (const item of ordenados) {
    const clave = item.fecha.slice(0, 7);
    grupos.set(clave, [...(grupos.get(clave) ?? []), item]);
  }
  const totalGeneral = sumarARS(items, tipos);

  return (
    <View style={{ flex: 1, backgroundColor: colores.fondo }}>
      <ScrollView contentContainerStyle={{ padding: espacio(4), paddingTop: margenes.top + espacio(4), paddingBottom: 120, gap: espacio(4) }}>
        <Encabezado
          titulo={titulo}
          subtitulo={items.length ? `${items.length} ${items.length === 1 ? 'registro' : 'registros'} · ${formatoMoneda(totalGeneral.ars, 'ARS')}${totalGeneral.incompleto ? ' *' : ''}` : undefined}
        />

        {items.length === 0 && (
          <Tarjeta estilo={{ alignItems: 'center', paddingVertical: espacio(10), gap: espacio(3) }}>
            <Ionicons name={iconoVacio} size={44} color={colores.textoTenue} />
            <Text style={texto.secundario}>{textoVacio}</Text>
            <Text style={[texto.secundario, { fontSize: 13 }]}>Tocá el botón + para agregar.</Text>
          </Tarjeta>
        )}

        {[...grupos.entries()].map(([clave, delMes], i) => {
          const total = sumarARS(delMes, tipos);
          return (
            <View key={clave} style={{ gap: espacio(2) }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: espacio(1) }}>
                <Text style={texto.etiqueta}>{mesYAnio(`${clave}-01`)}</Text>
                <Text style={texto.etiqueta}>{formatoMoneda(total.ars, 'ARS')}</Text>
              </View>
              <Tarjeta retraso={i * 80} estilo={{ paddingVertical: espacio(1) }}>
                {delMes.map((item, j) => (
                  <View key={item.id} style={j > 0 ? { borderTopWidth: 1, borderColor: colores.borde } : undefined}>
                    <FilaRegistro
                      icono={item.icono}
                      titulo={item.titulo}
                      subtitulo={`${fechaCorta(item.fecha)} · ${item.subtitulo}`}
                      monto={formatoMoneda(item.monto, item.moneda)}
                      detalleMonto={item.detalleMonto}
                      onPress={() => router.push({ pathname: formulario, params: { id: item.id } })}
                    />
                  </View>
                ))}
              </Tarjeta>
            </View>
          );
        })}

        {totalGeneral.incompleto && (
          <Text style={[texto.secundario, { fontSize: 12 }]}>* Hay montos en otra moneda sin tipo de cambio cargado; no se suman.</Text>
        )}
      </ScrollView>
      <BotonFlotante etiqueta="Agregar" onPress={() => router.push(formulario)} />
    </View>
  );
}
