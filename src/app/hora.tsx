// Formulario de jornada de trabajo: nueva (sin id) o edición (/hora?id=...).
import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { CampoFecha } from '@/componentes/CampoFecha';
import { Acciones, Campo, Formulario, Opciones, Seccion } from '@/componentes/formulario';
import { useGuardado } from '@/componentes/useGuardado';
import { useDatos } from '@/datos/DatosProvider';
import { esFechaValida, hoyISO, nuevoId, numeroATexto, parsearNumero, simboloMoneda, textoONull } from '@/datos/formato';
import { MONEDAS, PERSONAS, TIPOS_HORA, type HoraTrabajo, type Moneda, type Persona, type TipoHora } from '@/datos/tipos';

export default function FormularioHora() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { datos } = useDatos();
  const existente = datos?.horas_trabajo.find((h) => h.id === id);

  const [fecha, setFecha] = useState(existente?.fecha ?? hoyISO());
  const [persona, setPersona] = useState<Persona | null>(existente?.persona ?? null);
  const [tarea, setTarea] = useState(existente?.tarea ?? '');
  const [tipo, setTipo] = useState<TipoHora | null>(existente?.tipo ?? 'Changa / contratado');
  const [horas, setHoras] = useState(numeroATexto(existente?.horas ?? null));
  const [tarifa, setTarifa] = useState(numeroATexto(existente?.tarifa_hora ?? null));
  const [costo, setCosto] = useState(numeroATexto(existente?.costo ?? null));
  const [moneda, setMoneda] = useState<Moneda | null>(existente?.moneda ?? 'ARS');
  const [observaciones, setObservaciones] = useState(existente?.observaciones ?? '');
  const { guardando, error, setError, ejecutar } = useGuardado('/horas');

  const esPropio = tipo === 'Propio (sin costo)';

  function guardar() {
    const horasNum = parsearNumero(horas);
    // Como en el Excel, el costo lo anota el usuario; las horas propias no tienen costo.
    const costoNum = esPropio ? 0 : parsearNumero(costo);
    if (!esFechaValida(fecha)) return setError('Elegí una fecha válida.');
    if (!persona) return setError('Elegí quién trabajó.');
    if (!tipo) return setError('Elegí si es propio o changa.');
    if (horasNum === null) return setError('Escribí cuántas horas se trabajaron.');
    if (costoNum === null) return setError('Escribí cuánto se pagó (por ejemplo 500.000).');
    if (!moneda) return setError('Elegí la moneda.');

    const hora: HoraTrabajo = {
      id: existente?.id ?? nuevoId(),
      fecha,
      persona,
      tarea: textoONull(tarea),
      tipo,
      horas: horasNum,
      tarifa_hora: esPropio ? null : parsearNumero(tarifa),
      costo: costoNum,
      moneda,
      observaciones: textoONull(observaciones),
    };
    void ejecutar(
      (d) => ({
        ...d,
        horas_trabajo: existente ? d.horas_trabajo.map((h) => (h.id === hora.id ? hora : h)) : [...d.horas_trabajo, hora],
      }),
      `${existente ? 'Editar' : 'Nueva'} jornada: ${hora.persona} ${hora.fecha}`,
      existente ? 'Jornada actualizada' : 'Jornada guardada',
    );
  }

  function eliminar() {
    if (!existente) return;
    void ejecutar(
      (d) => ({ ...d, horas_trabajo: d.horas_trabajo.filter((h) => h.id !== existente.id) }),
      `Eliminar jornada: ${existente.persona} ${existente.fecha}`,
      'Jornada eliminada',
    );
  }

  return (
    <Formulario pie={<Acciones guardando={guardando} error={error} onGuardar={guardar} onEliminar={existente ? eliminar : undefined} />}>
      <Stack.Screen options={{ title: existente ? 'Editar jornada' : 'Nueva jornada' }} />
      <Seccion titulo="¿Quién trabajó?">
        <Opciones etiqueta="Persona" opciones={PERSONAS} valor={persona} onCambio={setPersona} />
        <Opciones etiqueta="Tipo" opciones={TIPOS_HORA} valor={tipo} onCambio={setTipo} />
        <CampoFecha etiqueta="Fecha" valor={fecha} onCambio={setFecha} />
      </Seccion>
      <Seccion titulo="Trabajo" retraso={60}>
        <Campo etiqueta="Etapa / tarea" valor={tarea} onCambio={setTarea} placeholder="Ej: Nivelación y limpieza" />
        <Campo etiqueta="Horas trabajadas" valor={horas} onCambio={setHoras} teclado="decimal-pad" placeholder="0" />
      </Seccion>
      {!esPropio && (
        <Seccion titulo="Pago" retraso={120}>
          <Campo etiqueta="Costo pagado" valor={costo} onCambio={setCosto} teclado="decimal-pad" placeholder="0" prefijo={simboloMoneda(moneda)} />
          <Opciones etiqueta="Moneda" opciones={MONEDAS} valor={moneda} onCambio={setMoneda} />
          <Campo etiqueta="Tarifa por hora" valor={tarifa} onCambio={setTarifa} teclado="decimal-pad" placeholder="Opcional" />
        </Seccion>
      )}
      <Seccion retraso={180}>
        <Campo etiqueta="Observaciones" valor={observaciones} onCambio={setObservaciones} placeholder="Opcional" multilinea />
      </Seccion>
    </Formulario>
  );
}
