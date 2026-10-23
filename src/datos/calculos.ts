// Cálculos del resumen y del presupuesto por etapa, con las mismas fórmulas que el Excel.
import type { BaseDatos, Etapa, MaterialLista, Moneda, TipoCambio } from './tipos';

interface MontoConMoneda {
  monto: number;
  moneda: Moneda;
}

export interface Total {
  ars: number;
  // true si algún monto en moneda extranjera no se pudo convertir por falta de tipo de cambio
  incompleto: boolean;
}

function tasa(tipos: TipoCambio[], moneda: Moneda): number | null {
  if (moneda === 'ARS') return 1;
  const t = tipos.find((x) => x.moneda === moneda)?.ars_por_unidad ?? null;
  return t && t > 0 ? t : null;
}

export function aARS(monto: number, moneda: Moneda, tipos: TipoCambio[]): number | null {
  const t = tasa(tipos, moneda);
  return t === null ? null : monto * t;
}

export function arsAUSD(ars: number, tipos: TipoCambio[]): number | null {
  const t = tasa(tipos, 'USD');
  return t === null ? null : ars / t;
}

export function usdAARS(usd: number, tipos: TipoCambio[]): number | null {
  const t = tasa(tipos, 'USD');
  return t === null ? null : usd * t;
}

export function sumarARS(montos: MontoConMoneda[], tipos: TipoCambio[]): Total {
  let ars = 0;
  let incompleto = false;
  for (const m of montos) {
    const convertido = aARS(m.monto, m.moneda, tipos);
    if (convertido === null) incompleto = true;
    else ars += convertido;
  }
  return { ars, incompleto };
}

// Lo que llegó en cada transferencia; si no se anotó lo recibido, se usa lo enviado.
function montoTransferencia(t: BaseDatos['transferencias'][number]): MontoConMoneda {
  return t.monto_recibido !== null && t.moneda_recibida !== null
    ? { monto: t.monto_recibido, moneda: t.moneda_recibida }
    : { monto: t.monto_enviado, moneda: t.moneda_enviada };
}

// --- Lista de materiales por etapa ---

// Total estimado de un material en SU moneda: cantidad × precio unitario (sin cantidad cuenta como 1).
export function totalMaterial(m: Pick<MaterialLista, 'cantidad' | 'precio_unitario'>): number {
  if (m.precio_unitario === null) return 0;
  return (m.cantidad ?? 1) * m.precio_unitario;
}

// Convierte un monto de cualquier moneda a USD pasando por pesos; null si falta un tipo de cambio.
export function aUSD(monto: number, moneda: Moneda, tipos: TipoCambio[]): number | null {
  if (moneda === 'USD') return monto;
  const ars = aARS(monto, moneda, tipos);
  return ars === null ? null : arsAUSD(ars, tipos);
}

// Total estimado de un material en USD (lo que usan los totales de etapas).
export function totalMaterialUSD(m: MaterialLista, tipos: TipoCambio[]): number | null {
  return aUSD(totalMaterial(m), m.moneda, tipos);
}

// Suma en USD; los que no se pueden convertir no suman y marcan el total como incompleto.
function sumarUSD(materiales: MaterialLista[], tipos: TipoCambio[]): { usd: number; incompleto: boolean } {
  let usd = 0;
  let incompleto = false;
  for (const m of materiales) {
    const v = totalMaterialUSD(m, tipos);
    if (v === null) incompleto = true;
    else usd += v;
  }
  return { usd, incompleto };
}

export interface ResumenEtapa {
  etapa: Etapa;
  numero: number; // 1, 2, 3… según el orden
  subtotal: number; // USD, sin los "ya disponible"
  fraccionDelTotal: number; // sobre el subtotal general
  acumulado: number; // USD, suma de esta etapa y las anteriores
  compradoUSD: number;
  pendienteUSD: number;
  comprados: number;
  aComprar: number;
  gastadoReal: Total; // gastos cargados con esta etapa como categoría, en ARS
  gastadoRealUSD: number | null;
  // true si algún material está en una moneda sin tipo de cambio cargado (no suma)
  incompleto: boolean;
}

export interface ResumenLista {
  etapas: ResumenEtapa[];
  subtotalGeneral: number;
  imprevistos: number;
  totalGeneral: number;
  incompleto: boolean;
}

export function calcularLista(datos: BaseDatos): ResumenLista {
  const tipos = datos.tipos_cambio;
  const parciales = datos.etapas.map((etapa) => {
    const aComprar = datos.materiales.filter((m) => m.etapa_id === etapa.id && !m.disponible);
    const comprados = aComprar.filter((m) => m.comprado);
    const gastadoReal = sumarARS(
      datos.gastos.filter((g) => g.categoria === etapa.nombre),
      tipos,
    );
    const subtotal = sumarUSD(aComprar, tipos);
    return {
      etapa,
      subtotal: subtotal.usd,
      incompleto: subtotal.incompleto,
      compradoUSD: sumarUSD(comprados, tipos).usd,
      comprados: comprados.length,
      aComprar: aComprar.length,
      gastadoReal,
      gastadoRealUSD: arsAUSD(gastadoReal.ars, tipos),
    };
  });
  const subtotalGeneral = parciales.reduce((s, e) => s + e.subtotal, 0);
  const imprevistos = (subtotalGeneral * datos.imprevistos_porcentaje) / 100;

  let acumulado = 0;
  const etapas = parciales.map((e, i) => {
    acumulado += e.subtotal;
    return {
      ...e,
      numero: i + 1,
      fraccionDelTotal: subtotalGeneral === 0 ? 0 : e.subtotal / subtotalGeneral,
      acumulado,
      pendienteUSD: e.subtotal - e.compradoUSD,
    };
  });

  return {
    etapas,
    subtotalGeneral,
    imprevistos,
    totalGeneral: subtotalGeneral + imprevistos,
    incompleto: etapas.some((e) => e.incompleto),
  };
}

// USD → EUR pasando por los tipos de cambio a pesos; null si falta alguno.
export function usdAEUR(usd: number, tipos: TipoCambio[]): number | null {
  const ars = usdAARS(usd, tipos);
  const tasaEUR = tasa(tipos, 'EUR');
  return ars === null || tasaEUR === null ? null : ars / tasaEUR;
}

export interface Resumen {
  materiales: Total;
  changas: Total;
  gastoTotal: Total; // materiales + changas (celda C20 del Excel)
  enviado: Total;
  saldo: number; // enviado - gastado (celda C25)
  horasPropias: number;
  horasChangas: number;
  presupuestoUSD: number;
  materialesUSD: number | null;
  // % ejecutado = materiales / presupuesto (celda C10); null sin tipo de cambio USD
  fraccionEjecutada: number | null;
}

export function calcularResumen(datos: BaseDatos): Resumen {
  const tipos = datos.tipos_cambio;
  const materiales = sumarARS(datos.gastos, tipos);
  const changas = sumarARS(
    datos.horas_trabajo.filter((h) => h.tipo === 'Changa / contratado').map((h) => ({ monto: h.costo, moneda: h.moneda })),
    tipos,
  );
  const enviado = sumarARS(datos.transferencias.map(montoTransferencia), tipos);
  const gastoTotal = { ars: materiales.ars + changas.ars, incompleto: materiales.incompleto || changas.incompleto };
  const presupuestoUSD = calcularLista(datos).totalGeneral;
  const materialesUSD = arsAUSD(materiales.ars, tipos);

  return {
    materiales,
    changas,
    gastoTotal,
    enviado,
    saldo: enviado.ars - gastoTotal.ars,
    horasPropias: datos.horas_trabajo.filter((h) => h.tipo === 'Propio (sin costo)').reduce((s, h) => s + h.horas, 0),
    horasChangas: datos.horas_trabajo.filter((h) => h.tipo === 'Changa / contratado').reduce((s, h) => s + h.horas, 0),
    presupuestoUSD,
    materialesUSD,
    fraccionEjecutada: materialesUSD === null || presupuestoUSD === 0 ? null : materialesUSD / presupuestoUSD,
  };
}
