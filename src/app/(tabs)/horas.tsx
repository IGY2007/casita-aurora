// Horas: jornadas de trabajo, propias y changas, la más reciente primero (sin diseño todavía).
import { Lista } from '@/componentes/Lista';
import { useDatos } from '@/datos/DatosProvider';
import { numeroATexto } from '@/datos/formato';

export default function PantallaHoras() {
  const { datos } = useDatos();
  const filas = [...(datos?.horas_trabajo ?? [])]
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
    .map((h) => ({
      id: h.id,
      texto: `${h.fecha} · ${h.persona} · ${numeroATexto(h.horas)} hs · ${numeroATexto(h.costo)} ${h.moneda}`,
    }));

  return <Lista textoAgregar="+ Agregar jornada" formulario="/hora" filas={filas} textoVacio="Todavía no hay horas cargadas." />;
}
