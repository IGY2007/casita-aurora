// Estructura de datos.json (repositorio privado de GitHub).
// Los valores permitidos salen de la hoja "Config" del Excel.

export const MONEDAS = ['ARS', 'USD', 'EUR', 'NOK'] as const;
export type Moneda = (typeof MONEDAS)[number];

export const ESTADOS_GASTO = ['Pendiente', 'Comprado', 'Instalado'] as const;
export type EstadoGasto = (typeof ESTADOS_GASTO)[number];

export const PERSONAS = ['Papá', 'Julius', 'Changa / contratado', 'Otro'] as const;
export type Persona = (typeof PERSONAS)[number];

export const TIPOS_HORA = ['Propio (sin costo)', 'Changa / contratado'] as const;
export type TipoHora = (typeof TIPOS_HORA)[number];

export const DESTINATARIOS = ['Papá', 'Mamá', 'Ambos', 'Otro'] as const;
export type Destinatario = (typeof DESTINATARIOS)[number];

export const METODOS_ENVIO = ['Transferencia bancaria', 'Western Union', 'Efectivo (viaje)', 'Otro'] as const;
export type MetodoEnvio = (typeof METODOS_ENVIO)[number];

export const PARA_QUE = [
  'Materiales',
  'Changas / mano de obra',
  'Gastos varios de obra',
  'Varios (ver observaciones)',
  'Otro',
] as const;
export type ParaQue = (typeof PARA_QUE)[number];

// Sugerencias de unidades; la unidad es texto libre.
export const UNIDADES_SUGERIDAS = [
  'kg', 'm', 'm²', 'm³', 'unidad', 'litro', 'bolsa', 'rollo', 'placa', 'caja', 'global', 'set',
] as const;

export interface PresupuestoCategoria {
  nombre: string;
  presupuesto_usd: number;
  // true para "Imprevistos (10%)": suma al presupuesto pero no se usa en gastos
  es_imprevistos: boolean;
}

export interface Gasto {
  id: string;
  fecha: string; // ISO AAAA-MM-DD
  categoria: string; // nombre de una PresupuestoCategoria
  material: string;
  descripcion: string | null;
  cantidad: number | null;
  unidad: string | null;
  monto: number;
  moneda: Moneda;
  proveedor: string | null;
  estado: EstadoGasto | null;
  notas: string | null;
}

export interface HoraTrabajo {
  id: string;
  fecha: string;
  persona: Persona;
  tarea: string | null;
  tipo: TipoHora;
  horas: number;
  tarifa_hora: number | null;
  costo: number;
  moneda: Moneda;
  observaciones: string | null;
}

export interface Transferencia {
  id: string;
  fecha: string;
  destinatario: Destinatario;
  monto_enviado: number;
  moneda_enviada: Moneda;
  monto_recibido: number | null;
  moneda_recibida: Moneda | null;
  metodo_envio: MetodoEnvio | null;
  para_que: ParaQue | null;
  observaciones: string | null;
}

export interface TipoCambio {
  moneda: Exclude<Moneda, 'ARS'>;
  // Cuántos ARS vale 1 unidad de la moneda. null hasta que lo cargues a mano.
  ars_por_unidad: number | null;
  actualizado: string | null;
}

export interface BaseDatos {
  version: 1;
  presupuesto_categorias: PresupuestoCategoria[];
  gastos: Gasto[];
  horas_trabajo: HoraTrabajo[];
  transferencias: Transferencia[];
  tipos_cambio: TipoCambio[];
}
