// Formulario de material de la lista: nuevo (/material?etapa=...) o edición (/material?id=...).
import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { Acciones, Campo, Formulario, Opciones, Seccion } from '@/componentes/formulario';
import { useGuardado } from '@/componentes/useGuardado';
import { aUSD, totalMaterial } from '@/datos/calculos';
import { useDatos } from '@/datos/DatosProvider';
import { formatoMoneda, nuevoId, numeroATexto, parsearNumero, simboloMoneda, textoONull } from '@/datos/formato';
import { MONEDAS, UNIDADES_SUGERIDAS, type MaterialLista, type Moneda } from '@/datos/tipos';
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
  const [precio, setPrecio] = useState(numeroATexto(existente?.precio_unitario ?? null));
  // Los materiales nuevos vienen en pesos (la mayoría se compra en ARS); los existentes conservan su moneda.
  const [moneda, setMoneda] = useState<Moneda | null>(existente?.moneda ?? 'ARS');
  const [observaciones, setObservaciones] = useState(existente?.observaciones ?? '');
  const [tipo, setTipo] = useState<(typeof TIPOS)[number] | null>(existente?.disponible ? 'Ya disponible' : 'A comprar');
  const [estado, setEstado] = useState<(typeof ESTADOS)[number] | null>(existente?.comprado ? 'Comprado' : 'Pendiente');
  const { guardando, error, setError, ejecutar } = useGuardado({ pathname: '/etapa', params: { id: etapaId } });

  // Sugerencias sacadas de la propia lista, no de valores fijos.
  const gruposDeEtapa = [...new Set((datos?.materiales ?? []).filter((m) => m.etapa_id === etapaId && m.grupo).map((m) => m.grupo as string))];
  const unidades = [...new Set([...(datos?.materiales ?? []).map((m) => m.unidad).filter((u): u is string => !!u), ...UNIDADES_SUGERIDAS])];
  const nombreEtapa = (eid: string) => etapas.find((e) => e.id === eid)?.nombre ?? null;

  // Vista previa del total estimado y su equivalente en dólares.
  const totalEstimado = totalMaterial({ cantidad: parsearNumero(cantidad), precio_unitario: parsearNumero(precio) });
  const totalEnUSD = moneda && moneda !== 'USD' ? aUSD(totalEstimado, moneda, datos?.tipos_cambio ?? []) : null;

  function guardar() {
    const cantidadNum = parsearNumero(cantidad);
    const precioNum = parsearNumero(precio);
    if (!nombre.trim()) return setError('Escribí el nombre del material.');
    if (!etapas.some((e) => e.id === etapaId)) return setError('Elegí una etapa.');
    if (cantidad.trim() && cantidadNum === null) return setError('La cantidad no es un número válido.');
    if (precio.trim() && precioNum === null) return setError('El precio no es un número válido.');
    if (!moneda) return setError('Elegí la moneda del precio.');

    const disponible = tipo === 'Ya disponible';
    const comprado = !disponible && estado === 'Comprado';
    const material: MaterialLista = {
      id: existente?.id ?? nuevoId(),
      etapa_id: etapaId,
      grupo: textoONull(grupo),
      nombre: nombre.trim(),
      cantidad: cantidadNum,
      unidad: textoONull(unidad),
      precio_unitario: precioNum,
      moneda,
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
        <Campo
          etiqueta="Precio unitario estimado"
          valor={precio}
          onCambio={setPrecio}
          teclado="decimal-pad"
          placeholder="Opcional"
          prefijo={simboloMoneda(moneda)}
        />
        <Opciones etiqueta="Moneda del precio" opciones={MONEDAS} valor={moneda} onCambio={setMoneda} />
        {parsearNumero(precio) !== null && moneda && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: espacio(1) }}>
            <Text style={texto.secundario}>Total estimado</Text>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={texto.monto}>{formatoMoneda(totalEstimado, moneda)}</Text>
              {moneda !== 'USD' && (
                <Text style={[texto.secundario, { fontSize: 13 }]}>
                  {totalEnUSD !== null ? `≈ ${formatoMoneda(totalEnUSD, 'USD')}` : `Cargá el tipo de cambio de ${moneda} para pasarlo a dólares`}
                </Text>
              )}
            </View>
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
