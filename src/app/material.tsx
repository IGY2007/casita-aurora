// Formulario de material de la lista: nuevo (/material?etapa=...) o edición (/material?id=...).
import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { Acciones, Campo, Formulario, Opciones, Seccion } from '@/componentes/formulario';
import { useGuardado } from '@/componentes/useGuardado';
import { totalMaterial } from '@/datos/calculos';
import { useDatos } from '@/datos/DatosProvider';
import { formatoMoneda, nuevoId, numeroATexto, parsearNumero, textoONull } from '@/datos/formato';
import { UNIDADES_SUGERIDAS, type MaterialLista } from '@/datos/tipos';
import { colores, espacio, texto } from '@/tema';

const TIPOS = ['A comprar', 'Ya disponible'] as const;
const ESTADOS = ['Pendiente', 'Comprado'] as const;

export default function FormularioMaterial() {
  const params = useLocalSearchParams<{ id?: string; etapa?: string }>();
  const { datos } = useDatos();
  const existente = datos?.materiales.find((m) => m.id === params.id);
  const etapas = datos?.etapas ?? [];

  const [etapaId, setEtapaId] = useState(existente?.etapa_id ?? params.etapa ?? etapas[0]?.id ?? '');
  const [nombre, setNombre] = useState(existente?.nombre ?? '');
  const [grupo, setGrupo] = useState(existente?.grupo ?? '');
  const [cantidad, setCantidad] = useState(numeroATexto(existente?.cantidad ?? null));
  const [unidad, setUnidad] = useState(existente?.unidad ?? '');
  const [precio, setPrecio] = useState(numeroATexto(existente?.precio_unitario_usd ?? null));
  const [observaciones, setObservaciones] = useState(existente?.observaciones ?? '');
  const [tipo, setTipo] = useState<(typeof TIPOS)[number] | null>(existente?.disponible ? 'Ya disponible' : 'A comprar');
  const [estado, setEstado] = useState<(typeof ESTADOS)[number] | null>(existente?.comprado ? 'Comprado' : 'Pendiente');
  const { guardando, error, setError, ejecutar } = useGuardado({ pathname: '/etapa', params: { id: etapaId } });

  // Sugerencias sacadas de la propia lista, no de valores fijos.
  const gruposDeEtapa = [...new Set((datos?.materiales ?? []).filter((m) => m.etapa_id === etapaId && m.grupo).map((m) => m.grupo as string))];
  const unidades = [...new Set([...(datos?.materiales ?? []).map((m) => m.unidad).filter((u): u is string => !!u), ...UNIDADES_SUGERIDAS])];
  const nombreEtapa = (eid: string) => etapas.find((e) => e.id === eid)?.nombre ?? null;

  const vistaPrevia: MaterialLista = {
    id: '',
    etapa_id: etapaId,
    grupo: null,
    nombre,
    cantidad: parsearNumero(cantidad),
    unidad: null,
    precio_unitario_usd: parsearNumero(precio),
    observaciones: null,
    comprado: false,
    disponible: false,
    gasto_id: null,
  };

  function guardar() {
    const cantidadNum = parsearNumero(cantidad);
    const precioNum = parsearNumero(precio);
    if (!nombre.trim()) return setError('Escribí el nombre del material.');
    if (!etapas.some((e) => e.id === etapaId)) return setError('Elegí una etapa.');
    if (cantidad.trim() && cantidadNum === null) return setError('La cantidad no es un número válido.');
    if (precio.trim() && precioNum === null) return setError('El precio no es un número válido.');

    const disponible = tipo === 'Ya disponible';
    const comprado = !disponible && estado === 'Comprado';
    const material: MaterialLista = {
      id: existente?.id ?? nuevoId(),
      etapa_id: etapaId,
      grupo: textoONull(grupo),
      nombre: nombre.trim(),
      cantidad: cantidadNum,
      unidad: textoONull(unidad),
      precio_unitario_usd: precioNum,
      observaciones: textoONull(observaciones),
      comprado,
      disponible,
      gasto_id: comprado ? (existente?.gasto_id ?? null) : null,
    };
    void ejecutar(
      (d) => ({
        ...d,
        materiales: existente ? d.materiales.map((m) => (m.id === material.id ? material : m)) : [...d.materiales, material],
      }),
      `${existente ? 'Editar' : 'Nuevo'} material: ${material.nombre}`,
      existente ? 'Material actualizado' : 'Material agregado',
    );
  }

  function eliminar() {
    if (!existente) return;
    void ejecutar(
      (d) => ({ ...d, materiales: d.materiales.filter((m) => m.id !== existente.id) }),
      `Eliminar material: ${existente.nombre}`,
      'Material eliminado',
    );
  }

  return (
    <Formulario pie={<Acciones guardando={guardando} error={error} onGuardar={guardar} onEliminar={existente ? eliminar : undefined} />}>
      <Stack.Screen options={{ title: existente ? 'Editar material' : 'Nuevo material' }} />
      <Seccion titulo="Material">
        <Campo etiqueta="Nombre" valor={nombre} onCambio={setNombre} placeholder="Ej: Hormigón elaborado H21" />
        <Opciones
          etiqueta="Etapa"
          opciones={etapas.map((e) => e.nombre)}
          valor={nombreEtapa(etapaId)}
          onCambio={(n) => setEtapaId(etapas.find((e) => e.nombre === n)?.id ?? etapaId)}
        />
        <Campo etiqueta="Grupo dentro de la etapa" valor={grupo} onCambio={setGrupo} placeholder="Opcional, ej: Cañerías enterradas" />
        {gruposDeEtapa.length > 0 && (
          <Opciones opciones={gruposDeEtapa} valor={gruposDeEtapa.includes(grupo) ? grupo : null} onCambio={(g) => setGrupo(g ?? '')} opcional />
        )}
      </Seccion>
      <Seccion titulo="Cantidad y precio estimado" retraso={60}>
        <Campo etiqueta="Cantidad" valor={cantidad} onCambio={setCantidad} teclado="decimal-pad" placeholder="Opcional" />
        <Campo etiqueta="Unidad" valor={unidad} onCambio={setUnidad} placeholder="Opcional" />
        <Opciones opciones={unidades} valor={unidades.includes(unidad) ? unidad : null} onCambio={(u) => setUnidad(u ?? '')} opcional />
        <Campo etiqueta="Precio unitario estimado" valor={precio} onCambio={setPrecio} teclado="decimal-pad" placeholder="Opcional" prefijo="US$" />
        {parsearNumero(precio) !== null && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: espacio(1) }}>
            <Text style={texto.secundario}>Total estimado</Text>
            <Text style={texto.monto}>{formatoMoneda(totalMaterial(vistaPrevia), 'USD')}</Text>
          </View>
        )}
      </Seccion>
      <Seccion titulo="Estado" retraso={120}>
        <Opciones etiqueta="Tipo" opciones={TIPOS} valor={tipo} onCambio={setTipo} />
        {tipo === 'Ya disponible' ? (
          <Text style={[texto.secundario, { color: colores.textoTenue }]}>Se muestra en la lista pero no suma a los totales.</Text>
        ) : (
          <Opciones etiqueta="Compra" opciones={ESTADOS} valor={estado} onCambio={setEstado} />
        )}
        <Campo etiqueta="Observaciones" valor={observaciones} onCambio={setObservaciones} placeholder="Opcional" multilinea />
      </Seccion>
    </Formulario>
  );
}
