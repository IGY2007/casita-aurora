// Transferencias: envíos de dinero agrupados por mes. El monto principal es lo que llegó.
import { Lista } from '@/componentes/Lista';
import { useDatos } from '@/datos/DatosProvider';
import { formatoMoneda } from '@/datos/formato';

export default function PantallaTransferencias() {
  const { datos } = useDatos();
  const items = (datos?.transferencias ?? []).map((t) => {
    const recibido =
      t.monto_recibido !== null && t.moneda_recibida !== null ? { monto: t.monto_recibido, moneda: t.moneda_recibida } : null;
    return {
      id: t.id,
      fecha: t.fecha,
      icono: 'paper-plane-outline' as const,
      titulo: `Para ${t.destinatario}`,
      subtitulo: t.para_que ?? t.metodo_envio ?? 'Transferencia',
      monto: recibido?.monto ?? t.monto_enviado,
      moneda: recibido?.moneda ?? t.moneda_enviada,
      detalleMonto: recibido ? `enviado ${formatoMoneda(t.monto_enviado, t.moneda_enviada)}` : undefined,
    };
  });

  return (
    <Lista
      titulo="Transferencias"
      formulario="/transferencia"
      items={items}
      textoVacio="Todavía no hay transferencias."
      iconoVacio="paper-plane-outline"
    />
  );
}
