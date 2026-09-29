// Formulario de jornada de trabajo: nueva (sin id) o edición (/hora?id=...).
import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { Acciones, Campo, Formulario, Opciones } from '@/componentes/formulario';
import { useGuardado } from '@/componentes/useGuardado';
import { useDatos } from '@/datos/DatosProvider';
import { esFechaValida, hoyISO, nuevoId, numeroATexto, parsearNumero, textoONull } from '@/datos/formato';
import { MONEDAS, PERSONAS, TIPOS_HORA, type HoraTrabajo, type Moneda, type Persona, type TipoHora } from '@/datos/tipos';

export default function FormularioHora() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { datos } = useDatos();
  const existente = datos?.horas_trabajo.find((h) => h.id === id);

  const [fecha, setFecha] = useState(existente?.fecha ?? hoyISO());
  const [persona, setPersona] = useState<Persona | null>(existente?.persona ?? null);
  const [tarea, setTarea] = useState(existente?.tarea ?? '');
  const [tipo, setTipo] = useState<TipoHora | null>(existente?.tipo ?? null);
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
    if (!esFechaValida(fecha)) return setError('La fecha tiene que ser AAAA-MM-DD, por ejemplo 2026-09-29.');
    if (!persona) return setError('Elegí quién trabajó.');
    if (!tipo) return setError('Elegí el tipo de hora.');
    if (horasNum === null) return setError('Las horas no son un número válido.');
    if (costoNum === null) return setError('El costo no es un número válido.');
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
    );
  }

  function eliminar() {
    if (!existente) return;
    void ejecutar(
      (d) => ({ ...d, horas_trabajo: d.horas_trabajo.filter((h) => h.id !== existente.id) }),
      `Eliminar jornada: ${existente.persona} ${existente.fecha}`,
    );
  }

  return (
    <Formulario>
      <Stack.Screen options={{ title: existente ? 'Editar jornada' : 'Nueva jornada' }} />
      <Campo etiqueta="Fecha (AAAA-MM-DD)" valor={fecha} onCambio={setFecha} />
      <Opciones etiqueta="Persona" opciones={PERSONAS} valor={persona} onCambio={setPersona} />
      <Campo etiqueta="Etapa / tarea" valor={tarea} onCambio={setTarea} />
      <Opciones etiqueta="Tipo" opciones={TIPOS_HORA} valor={tipo} onCambio={setTipo} />
      <Campo etiqueta="Horas trabajadas" valor={horas} onCambio={setHoras} teclado="decimal-pad" />
      {!esPropio && (
        <>
          <Campo etiqueta="Tarifa por hora (opcional)" valor={tarifa} onCambio={setTarifa} teclado="decimal-pad" />
          <Campo etiqueta="Costo pagado" valor={costo} onCambio={setCosto} teclado="decimal-pad" placeholder="500.000" />
          <Opciones etiqueta="Moneda" opciones={MONEDAS} valor={moneda} onCambio={setMoneda} />
        </>
      )}
      <Campo etiqueta="Observaciones" valor={observaciones} onCambio={setObservaciones} multilinea />
      <Acciones guardando={guardando} error={error} onGuardar={guardar} onEliminar={existente ? eliminar : undefined} />
    </Formulario>
  );
}
