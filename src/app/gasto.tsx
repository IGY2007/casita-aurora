// Formulario de gasto: nuevo (sin id), edición (/gasto?id=...) o desde la lista de materiales
// (/gasto?material=...), con los datos del material precargados y el gasto vinculado a él.
import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { CampoFecha } from '@/componentes/CampoFecha';
import { Acciones, Campo, Formulario, Opciones, Seccion } from '@/componentes/formulario';
import { Tarjeta } from '@/componentes/Tarjeta';
import { useGuardado } from '@/componentes/useGuardado';
import { totalMaterial, totalMaterialUSD } from '@/datos/calculos';
import { useDatos } from '@/datos/DatosProvider';
import { esFechaValida, formatoMoneda, hoyISO, nuevoId, numeroATexto, parsearNumero, simboloMoneda, textoONull } from '@/datos/formato';
import { CATEGORIA_OTROS, ESTADOS_GASTO, MONEDAS, UNIDADES_SUGERIDAS, type EstadoGasto, type Gasto, type Moneda } from '@/datos/tipos';
import { colores, espacio, texto } from '@/tema';

export default function FormularioGasto() {
  const params = useLocalSearchParams<{ id?: string; material?: string }>();
  const { datos } = useDatos();
  const existente = datos?.gastos.find((g) => g.id === params.id);
  // Material de la lista desde el que se carga este gasto (solo al crear).
  const desdeLista = existente ? undefined : datos?.materiales.find((m) => m.id === params.material);
  const etapaDeLista = datos?.etapas.find((e) => e.id === desdeLista?.etapa_id);
  const estimadoUSD = desdeLista && desdeLista.moneda !== 'USD' ? totalMaterialUSD(desdeLista, datos?.tipos_cambio ?? []) : null;
  // Categorías = etapas de la lista + "Otros"; si el gasto tiene una etapa que ya no existe, se conserva.
  const categorias = [...new Set([...(datos?.etapas ?? []).map((e) => e.nombre), CATEGORIA_OTROS, ...(existente ? [existente.categoria] : [])])];

  const [fecha, setFecha] = useState(existente?.fecha ?? hoyISO());
  const [categoria, setCategoria] = useState<string | null>(existente?.categoria ?? etapaDeLista?.nombre ?? null);
  const [material, setMaterial] = useState(existente?.material ?? desdeLista?.nombre ?? '');
  const [descripcion, setDescripcion] = useState(existente?.descripcion ?? desdeLista?.grupo ?? '');
  const [cantidad, setCantidad] = useState(numeroATexto(existente?.cantidad ?? desdeLista?.cantidad ?? null));
  const [unidad, setUnidad] = useState(existente?.unidad ?? desdeLista?.unidad ?? '');
  // El monto pagado se escribe a mano: nunca se calcula como cantidad × precio unitario.
  const [monto, setMonto] = useState(numeroATexto(existente?.monto ?? null));
  const [precioUnitario, setPrecioUnitario] = useState(numeroATexto(existente?.precio_unitario ?? null));
  const [moneda, setMoneda] = useState<Moneda | null>(existente?.moneda ?? 'ARS');
  const [proveedor, setProveedor] = useState(existente?.proveedor ?? '');
  const [estado, setEstado] = useState<EstadoGasto | null>(existente?.estado ?? (desdeLista ? 'Comprado' : null));
  const [notas, setNotas] = useState(existente?.notas ?? desdeLista?.observaciones ?? '');
  const { guardando, error, setError, ejecutar } = useGuardado('/gastos');

  function guardar() {
    const montoNum = parsearNumero(monto);
    if (!esFechaValida(fecha)) return setError('Elegí una fecha válida.');
    if (!categoria) return setError('Elegí una categoría.');
    if (!material.trim()) return setError('Escribí qué material compraste.');
    if (montoNum === null) return setError('Escribí el monto pagado (por ejemplo 248.000).');
    if (!moneda) return setError('Elegí la moneda.');
    if (precioUnitario.trim() && parsearNumero(precioUnitario) === null) return setError('El precio unitario no es un número válido.');

    const gasto: Gasto = {
      id: existente?.id ?? nuevoId(),
      fecha,
      categoria,
      material: material.trim(),
      descripcion: textoONull(descripcion),
      cantidad: parsearNumero(cantidad),
      unidad: textoONull(unidad),
      monto: montoNum,
      moneda,
      precio_unitario: parsearNumero(precioUnitario),
      proveedor: textoONull(proveedor),
      estado,
      notas: textoONull(notas),
    };
    void ejecutar(
      (d) => ({
        ...d,
        gastos: existente ? d.gastos.map((g) => (g.id === gasto.id ? gasto : g)) : [...d.gastos, gasto],
        // Desde la lista: el material queda comprado y vinculado, para no volver a preguntar.
        materiales: desdeLista
          ? d.materiales.map((m) => (m.id === desdeLista.id ? { ...m, comprado: true, gasto_id: gasto.id } : m))
          : d.materiales,
      }),
      `${existente ? 'Editar' : 'Nuevo'} gasto: ${gasto.material}`,
      existente ? 'Gasto actualizado' : 'Gasto guardado',
    );
  }

  function eliminar() {
    if (!existente) return;
    void ejecutar(
      (d) => ({ ...d, gastos: d.gastos.filter((g) => g.id !== existente.id) }),
      `Eliminar gasto: ${existente.material}`,
      'Gasto eliminado',
    );
  }

  return (
    <Formulario pie={<Acciones guardando={guardando} error={error} onGuardar={guardar} onEliminar={existente ? eliminar : undefined} />}>
      <Stack.Screen options={{ title: existente ? 'Editar gasto' : 'Nuevo gasto' }} />
      {desdeLista && (
        <Tarjeta estilo={{ flexDirection: 'row', gap: espacio(3), alignItems: 'center', backgroundColor: colores.acentoSuave }}>
          <Ionicons name="list-outline" size={22} color={colores.acento} />
          <View style={{ flex: 1 }}>
            <Text style={[texto.cuerpo, { fontWeight: '600' }]}>Desde la lista de materiales</Text>
            <Text style={[texto.secundario, { fontSize: 13 }]}>
              {desdeLista.precio_unitario !== null
                ? `Precio estimado: ${formatoMoneda(totalMaterial(desdeLista), desdeLista.moneda)}${
                    estimadoUSD !== null ? ` (≈ ${formatoMoneda(estimadoUSD, 'USD')})` : ''
                  }, solo de referencia. Escribí lo que pagaste realmente, en la moneda que pagaste.`
                : 'Escribí lo que pagaste realmente, en la moneda que pagaste.'}
            </Text>
          </View>
        </Tarjeta>
      )}
      <Seccion titulo="¿Qué compraste?">
        <Campo etiqueta="Material" valor={material} onCambio={setMaterial} placeholder="Ej: Hormigón H21" />
        <Opciones etiqueta="Categoría" opciones={categorias} valor={categoria} onCambio={setCategoria} />
        <CampoFecha etiqueta="Fecha" valor={fecha} onCambio={setFecha} />
      </Seccion>
      <Seccion titulo="Pago" retraso={60}>
        <Campo etiqueta="Monto pagado" valor={monto} onCambio={setMonto} teclado="decimal-pad" placeholder="0" prefijo={simboloMoneda(moneda)} />
        <Opciones etiqueta="Moneda" opciones={MONEDAS} valor={moneda} onCambio={setMoneda} />
        <Campo etiqueta="Precio unitario" valor={precioUnitario} onCambio={setPrecioUnitario} teclado="decimal-pad" placeholder="Opcional" prefijo={simboloMoneda(moneda)} />
        <Campo etiqueta="Proveedor" valor={proveedor} onCambio={setProveedor} placeholder="Opcional" />
        <Opciones etiqueta="Estado" opciones={ESTADOS_GASTO} valor={estado} onCambio={setEstado} opcional />
      </Seccion>
      <Seccion titulo="Detalle" retraso={120}>
        <Campo etiqueta="Cantidad" valor={cantidad} onCambio={setCantidad} teclado="decimal-pad" placeholder="Opcional" />
        <Campo etiqueta="Unidad" valor={unidad} onCambio={setUnidad} placeholder="Opcional" />
        <Opciones
          opciones={UNIDADES_SUGERIDAS}
          valor={(UNIDADES_SUGERIDAS as readonly string[]).includes(unidad) ? (unidad as (typeof UNIDADES_SUGERIDAS)[number]) : null}
          onCambio={(u) => setUnidad(u ?? '')}
          opcional
        />
        <Campo etiqueta="Descripción" valor={descripcion} onCambio={setDescripcion} placeholder="Opcional" />
        <Campo etiqueta="Notas" valor={notas} onCambio={setNotas} placeholder="Opcional" multilinea />
      </Seccion>
    </Formulario>
  );
}
