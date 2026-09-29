// Cálculos del resumen y del presupuesto por etapa, con las mismas fórmulas que el Excel.
import type { BaseDatos, Moneda, TipoCambio } from './tipos';

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
  const presupuestoUSD = datos.presupuesto_categorias.reduce((s, c) => s + c.presupuesto_usd, 0);
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

export interface Etapa {
  nombre: string;
  esImprevistos: boolean;
  presupuestoUSD: number;
  gastado: Total;
  gastadoUSD: number | null;
  fraccion: number | null;
}

// Hoja "Presupuesto por etapa": el gasto real por categoría sale solo de materiales.
export function calcularEtapas(datos: BaseDatos): Etapa[] {
  const tipos = datos.tipos_cambio;
  return datos.presupuesto_categorias.map((c) => {
    const gastado = sumarARS(
      datos.gastos.filter((g) => g.categoria === c.nombre),
      tipos,
    );
    const gastadoUSD = arsAUSD(gastado.ars, tipos);
    return {
      nombre: c.nombre,
      esImprevistos: c.es_imprevistos,
      presupuestoUSD: c.presupuesto_usd,
      gastado,
      gastadoUSD,
      fraccion: gastadoUSD === null || c.presupuesto_usd === 0 ? null : gastadoUSD / c.presupuesto_usd,
    };
  });
}
