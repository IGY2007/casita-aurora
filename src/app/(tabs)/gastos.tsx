// Gastos: lista de compras de materiales, la más reciente primero (sin diseño todavía).
import { Lista } from '@/componentes/Lista';
import { useDatos } from '@/datos/DatosProvider';
import { numeroATexto } from '@/datos/formato';

export default function PantallaGastos() {
  const { datos } = useDatos();
  const filas = [...(datos?.gastos ?? [])]
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
    .map((g) => ({ id: g.id, texto: `${g.fecha} · ${g.material} · ${numeroATexto(g.monto)} ${g.moneda}` }));

  return <Lista textoAgregar="+ Agregar gasto" formulario="/gasto" filas={filas} textoVacio="Todavía no hay gastos." />;
}
