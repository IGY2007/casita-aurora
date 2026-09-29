// Transferencias: envíos de dinero, el más reciente primero (sin diseño todavía).
import { Lista } from '@/componentes/Lista';
import { useDatos } from '@/datos/DatosProvider';
import { numeroATexto } from '@/datos/formato';

export default function PantallaTransferencias() {
  const { datos } = useDatos();
  const filas = [...(datos?.transferencias ?? [])]
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
    .map((t) => {
      const recibido = t.monto_recibido === null ? '?' : `${numeroATexto(t.monto_recibido)} ${t.moneda_recibida ?? ''}`;
      return {
        id: t.id,
        texto: `${t.fecha} · ${t.destinatario} · ${numeroATexto(t.monto_enviado)} ${t.moneda_enviada} → ${recibido}`,
      };
    });

  return (
    <Lista
      textoAgregar="+ Agregar transferencia"
      formulario="/transferencia"
      filas={filas}
      textoVacio="Todavía no hay transferencias."
    />
  );
}
