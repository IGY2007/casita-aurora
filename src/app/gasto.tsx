// Formulario de gasto: nuevo (sin id) o edición (/gasto?id=...).
import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { CampoFecha } from '@/componentes/CampoFecha';
import { Acciones, Campo, Formulario, Opciones, Seccion } from '@/componentes/formulario';
import { useGuardado } from '@/componentes/useGuardado';
import { useDatos } from '@/datos/DatosProvider';
import { esFechaValida, hoyISO, nuevoId, numeroATexto, parsearNumero, simboloMoneda, textoONull } from '@/datos/formato';
import { ESTADOS_GASTO, MONEDAS, UNIDADES_SUGERIDAS, type EstadoGasto, type Gasto, type Moneda } from '@/datos/tipos';

export default function FormularioGasto() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { datos } = useDatos();
  const existente = datos?.gastos.find((g) => g.id === id);
  const categorias = (datos?.presupuesto_categorias ?? []).filter((c) => !c.es_imprevistos).map((c) => c.nombre);

  const [fecha, setFecha] = useState(existente?.fecha ?? hoyISO());
  const [categoria, setCategoria] = useState<string | null>(existente?.categoria ?? null);
  const [material, setMaterial] = useState(existente?.material ?? '');
  const [descripcion, setDescripcion] = useState(existente?.descripcion ?? '');
  const [cantidad, setCantidad] = useState(numeroATexto(existente?.cantidad ?? null));
  const [unidad, setUnidad] = useState(existente?.unidad ?? '');
  const [monto, setMonto] = useState(numeroATexto(existente?.monto ?? null));
  const [moneda, setMoneda] = useState<Moneda | null>(existente?.moneda ?? 'ARS');
  const [proveedor, setProveedor] = useState(existente?.proveedor ?? '');
  const [estado, setEstado] = useState<EstadoGasto | null>(existente?.estado ?? null);
  const [notas, setNotas] = useState(existente?.notas ?? '');
  const { guardando, error, setError, ejecutar } = useGuardado('/gastos');

  function guardar() {
    const montoNum = parsearNumero(monto);
    if (!esFechaValida(fecha)) return setError('Elegí una fecha válida.');
    if (!categoria) return setError('Elegí una categoría.');
    if (!material.trim()) return setError('Escribí qué material compraste.');
    if (montoNum === null) return setError('Escribí el monto pagado (por ejemplo 248.000).');
    if (!moneda) return setError('Elegí la moneda.');

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
      proveedor: textoONull(proveedor),
      estado,
      notas: textoONull(notas),
    };
    void ejecutar(
      (d) => ({
        ...d,
        gastos: existente ? d.gastos.map((g) => (g.id === gasto.id ? gasto : g)) : [...d.gastos, gasto],
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
      <Seccion titulo="¿Qué compraste?">
        <Campo etiqueta="Material" valor={material} onCambio={setMaterial} placeholder="Ej: Hormigón H21" />
        <Opciones etiqueta="Categoría" opciones={categorias} valor={categoria} onCambio={setCategoria} />
        <CampoFecha etiqueta="Fecha" valor={fecha} onCambio={setFecha} />
      </Seccion>
      <Seccion titulo="Pago" retraso={60}>
        <Campo etiqueta="Monto pagado" valor={monto} onCambio={setMonto} teclado="decimal-pad" placeholder="0" prefijo={simboloMoneda(moneda)} />
        <Opciones etiqueta="Moneda" opciones={MONEDAS} valor={moneda} onCambio={setMoneda} />
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
