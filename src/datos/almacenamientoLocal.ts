// Guarda en el navegador la configuración de GitHub y la última copia de los datos (para ver sin internet).
import type { ConfigGitHub } from './github';
import type { BaseDatos } from './tipos';

const CLAVE_CONFIG = 'casita-aurora:config';
const CLAVE_DATOS = 'casita-aurora:datos';

// localStorage puede no existir (render estático) o fallar (modo privado): nunca debe romper la app.
function leer<T>(clave: string): T | null {
  try {
    const valor = globalThis.localStorage?.getItem(clave);
    return valor ? (JSON.parse(valor) as T) : null;
  } catch {
    return null;
  }
}

function escribir(clave: string, valor: unknown): void {
  try {
    if (valor === null) globalThis.localStorage?.removeItem(clave);
    else globalThis.localStorage?.setItem(clave, JSON.stringify(valor));
  } catch {
    // Sin almacenamiento local la app sigue funcionando, solo que sin copia offline.
  }
}

export const leerConfig = () => leer<ConfigGitHub>(CLAVE_CONFIG);
export const guardarConfig = (config: ConfigGitHub | null) => escribir(CLAVE_CONFIG, config);

export const leerCopiaDatos = () => leer<BaseDatos>(CLAVE_DATOS);
export const guardarCopiaDatos = (datos: BaseDatos | null) => escribir(CLAVE_DATOS, datos);
