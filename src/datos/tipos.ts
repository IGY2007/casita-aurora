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

// Etapa de obra de la lista de materiales. El orden del arreglo es el orden de las etapas (sin fechas).
export interface Etapa {
  id: string;
  nombre: string;
  notas: string | null;
}

// Material de la lista por etapa. El total estimado es cantidad × precio unitario.
export interface MaterialLista {
  id: string;
  etapa_id: string;
  grupo: string | null; // subgrupo dentro de la etapa, ej. "Cimientos", "Cañerías enterradas"
  nombre: string;
  cantidad: number | null;
  unidad: string | null;
  precio_unitario_usd: number | null;
  observaciones: string | null;
  comprado: boolean;
  // "Ya disponible": se muestra en la lista pero no suma a los totales
  disponible: boolean;
  // Gasto creado al marcarlo como comprado, para no volver a preguntar
  gasto_id: string | null;
}

// Jornada fichada (punch in / punch out) todavía no registrada en horas_trabajo.
export interface Fichaje {
  id: string;
  persona: Persona;
  inicio: string; // fecha y hora ISO
  fin: string | null;
}

export interface Gasto {
  id: string;
  fecha: string; // ISO AAAA-MM-DD
  categoria: string; // nombre de una Etapa (u "Otros")
  material: string;
  descripcion: string | null;
  cantidad: number | null;
  unidad: string | null;
  monto: number;
  moneda: Moneda;
  precio_unitario?: number | null; // opcional, en la misma moneda que el monto
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

// Categoría para gastos que no corresponden a ninguna etapa.
export const CATEGORIA_OTROS = 'Otros';

export interface BaseDatos {
  version: 2;
  etapas: Etapa[];
  materiales: MaterialLista[];
  imprevistos_porcentaje: number;
  gastos: Gasto[];
  horas_trabajo: HoraTrabajo[];
  transferencias: Transferencia[];
  tipos_cambio: TipoCambio[];
  fichajes: Fichaje[];
}

// Formato anterior (v1), solo para migrar copias viejas.
export interface BaseDatosV1 {
  version: 1;
  presupuesto_categorias: { nombre: string; presupuesto_usd: number; es_imprevistos: boolean }[];
  gastos: Gasto[];
  horas_trabajo: HoraTrabajo[];
  transferencias: Transferencia[];
  tipos_cambio: TipoCambio[];
}
