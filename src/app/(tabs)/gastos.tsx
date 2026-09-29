// Gastos: compras de materiales agrupadas por mes.
import { iconoCategoria } from '@/componentes/iconos';
import { Lista } from '@/componentes/Lista';
import { useDatos } from '@/datos/DatosProvider';

export default function PantallaGastos() {
  const { datos } = useDatos();
  const items = (datos?.gastos ?? []).map((g) => ({
    id: g.id,
    fecha: g.fecha,
    icono: iconoCategoria(g.categoria),
    titulo: g.material,
    subtitulo: g.categoria,
    monto: g.monto,
    moneda: g.moneda,
    detalleMonto: g.estado ?? undefined,
  }));

  return <Lista titulo="Gastos" formulario="/gasto" items={items} textoVacio="Todavía no hay gastos." iconoVacio="receipt-outline" />;
}
