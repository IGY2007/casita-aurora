// Horas: jornadas de trabajo, propias y changas, agrupadas por mes.
import { Lista } from '@/componentes/Lista';
import { useDatos } from '@/datos/DatosProvider';
import { numeroATexto } from '@/datos/formato';

export default function PantallaHoras() {
  const { datos } = useDatos();
  const items = (datos?.horas_trabajo ?? []).map((h) => ({
    id: h.id,
    fecha: h.fecha,
    icono: h.tipo === 'Propio (sin costo)' ? ('person-outline' as const) : ('construct-outline' as const),
    titulo: h.tarea ?? h.persona,
    subtitulo: `${h.persona} · ${numeroATexto(h.horas)} hs`,
    monto: h.costo,
    moneda: h.moneda,
    detalleMonto: h.tipo === 'Propio (sin costo)' ? 'Propio' : 'Changa',
  }));

  return <Lista titulo="Horas" formulario="/hora" items={items} textoVacio="Todavía no hay horas cargadas." iconoVacio="time-outline" />;
}
