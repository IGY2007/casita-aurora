// Formulario de transferencia: nueva (sin id) o edición (/transferencia?id=...).
import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { Acciones, Campo, Formulario, Opciones } from '@/componentes/formulario';
import { useGuardado } from '@/componentes/useGuardado';
import { useDatos } from '@/datos/DatosProvider';
import { esFechaValida, hoyISO, nuevoId, numeroATexto, parsearNumero, textoONull } from '@/datos/formato';
import {
  DESTINATARIOS,
  METODOS_ENVIO,
  MONEDAS,
  PARA_QUE,
  type Destinatario,
  type MetodoEnvio,
  type Moneda,
  type ParaQue,
  type Transferencia,
} from '@/datos/tipos';

export default function FormularioTransferencia() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { datos } = useDatos();
  const existente = datos?.transferencias.find((t) => t.id === id);

  const [fecha, setFecha] = useState(existente?.fecha ?? hoyISO());
  const [destinatario, setDestinatario] = useState<Destinatario | null>(existente?.destinatario ?? null);
  const [montoEnviado, setMontoEnviado] = useState(numeroATexto(existente?.monto_enviado ?? null));
  const [monedaEnviada, setMonedaEnviada] = useState<Moneda | null>(existente?.moneda_enviada ?? 'NOK');
  const [montoRecibido, setMontoRecibido] = useState(numeroATexto(existente?.monto_recibido ?? null));
  const [monedaRecibida, setMonedaRecibida] = useState<Moneda | null>(existente ? existente.moneda_recibida : 'ARS');
  const [metodo, setMetodo] = useState<MetodoEnvio | null>(existente?.metodo_envio ?? null);
  const [paraQue, setParaQue] = useState<ParaQue | null>(existente?.para_que ?? null);
  const [observaciones, setObservaciones] = useState(existente?.observaciones ?? '');
  const { guardando, error, setError, ejecutar } = useGuardado('/transferencias');

  function guardar() {
    const enviadoNum = parsearNumero(montoEnviado);
    const recibidoNum = parsearNumero(montoRecibido);
    if (!esFechaValida(fecha)) return setError('La fecha tiene que ser AAAA-MM-DD, por ejemplo 2026-09-29.');
    if (!destinatario) return setError('Elegí el destinatario.');
    if (enviadoNum === null) return setError('El monto enviado no es un número válido.');
    if (!monedaEnviada) return setError('Elegí la moneda enviada.');
    if (montoRecibido.trim() && recibidoNum === null) return setError('El monto recibido no es un número válido.');

    const transferencia: Transferencia = {
      id: existente?.id ?? nuevoId(),
      fecha,
      destinatario,
      monto_enviado: enviadoNum,
      moneda_enviada: monedaEnviada,
      monto_recibido: recibidoNum,
      moneda_recibida: recibidoNum === null ? null : monedaRecibida,
      metodo_envio: metodo,
      para_que: paraQue,
      observaciones: textoONull(observaciones),
    };
    void ejecutar(
      (d) => ({
        ...d,
        transferencias: existente
          ? d.transferencias.map((t) => (t.id === transferencia.id ? transferencia : t))
          : [...d.transferencias, transferencia],
      }),
      `${existente ? 'Editar' : 'Nueva'} transferencia: ${transferencia.monto_enviado} ${transferencia.moneda_enviada} a ${transferencia.destinatario}`,
    );
  }

  function eliminar() {
    if (!existente) return;
    void ejecutar(
      (d) => ({ ...d, transferencias: d.transferencias.filter((t) => t.id !== existente.id) }),
      `Eliminar transferencia del ${existente.fecha}`,
    );
  }

  return (
    <Formulario>
      <Stack.Screen options={{ title: existente ? 'Editar transferencia' : 'Nueva transferencia' }} />
      <Campo etiqueta="Fecha (AAAA-MM-DD)" valor={fecha} onCambio={setFecha} />
      <Opciones etiqueta="Destinatario" opciones={DESTINATARIOS} valor={destinatario} onCambio={setDestinatario} />
      <Campo etiqueta="Monto enviado" valor={montoEnviado} onCambio={setMontoEnviado} teclado="decimal-pad" placeholder="5.000" />
      <Opciones etiqueta="Moneda enviada" opciones={MONEDAS} valor={monedaEnviada} onCambio={setMonedaEnviada} />
      <Campo etiqueta="Monto recibido (opcional)" valor={montoRecibido} onCambio={setMontoRecibido} teclado="decimal-pad" placeholder="854.000" />
      <Opciones etiqueta="Moneda recibida" opciones={MONEDAS} valor={monedaRecibida} onCambio={setMonedaRecibida} opcional />
      <Opciones etiqueta="Método de envío" opciones={METODOS_ENVIO} valor={metodo} onCambio={setMetodo} opcional />
      <Opciones etiqueta="Para qué" opciones={PARA_QUE} valor={paraQue} onCambio={setParaQue} opcional />
      <Campo etiqueta="Observaciones" valor={observaciones} onCambio={setObservaciones} multilinea />
      <Acciones guardando={guardando} error={error} onGuardar={guardar} onEliminar={existente ? eliminar : undefined} />
    </Formulario>
  );
}
