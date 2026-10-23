// Lleva cualquier versión de datos.json (o de la copia local) al formato actual (v3).
import { nuevoId } from './formato';
import type { BaseDatos, BaseDatosV1, MaterialLista } from './tipos';

// v2 guardaba el precio estimado siempre en USD (precio_unitario_usd); v3 guarda precio + moneda.
type MaterialGuardado = Partial<MaterialLista> & { precio_unitario_usd?: number | null };

function normalizarMaterial(m: MaterialGuardado): MaterialLista {
  const { precio_unitario_usd, ...resto } = m;
  return {
    ...(resto as MaterialLista),
    precio_unitario: m.precio_unitario !== undefined ? m.precio_unitario : (precio_unitario_usd ?? null),
    moneda: m.moneda ?? 'USD',
  };
}

export function normalizarDatos(crudo: unknown): BaseDatos {
  const d = crudo as Partial<BaseDatos> | BaseDatosV1;

  if (d.version === 1) {
    const v1 = d as BaseDatosV1;
    // v1 tenía categorías con presupuesto fijo; pasan a ser etapas sin materiales.
    return {
      version: 3,
      etapas: v1.presupuesto_categorias.filter((c) => !c.es_imprevistos).map((c) => ({ id: nuevoId(), nombre: c.nombre, notas: null })),
      materiales: [],
      imprevistos_porcentaje: 10,
      gastos: v1.gastos,
      horas_trabajo: v1.horas_trabajo,
      transferencias: v1.transferencias,
      tipos_cambio: v1.tipos_cambio,
      fichajes: [],
    };
  }

  const v2 = d as Omit<Partial<BaseDatos>, 'materiales'> & { materiales?: MaterialGuardado[] };
  // Campos faltantes (archivo editado a mano o versión intermedia) toman valores vacíos.
  return {
    version: 3,
    etapas: v2.etapas ?? [],
    materiales: (v2.materiales ?? []).map(normalizarMaterial),
    imprevistos_porcentaje: v2.imprevistos_porcentaje ?? 10,
    gastos: v2.gastos ?? [],
    horas_trabajo: v2.horas_trabajo ?? [],
    transferencias: v2.transferencias ?? [],
    tipos_cambio: v2.tipos_cambio ?? [],
    fichajes: v2.fichajes ?? [],
  };
}
