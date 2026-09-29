// Contexto con los datos de la obra: los lee de GitHub, guarda cambios y mantiene una copia local.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { guardarConfig, guardarCopiaDatos, leerConfig, leerCopiaDatos } from './almacenamientoLocal';
import { ErrorGitHub, escribirDatos, leerDatos, type ConfigGitHub } from './github';
import type { BaseDatos } from './tipos';

type Estado = 'iniciando' | 'sin-config' | 'cargando' | 'listo' | 'error';

interface ValorDatos {
  estado: Estado;
  datos: BaseDatos | null;
  error: string | null;
  // true si se muestran datos de la copia local porque GitHub no respondió
  sinConexion: boolean;
  configurar: (config: ConfigGitHub) => Promise<void>;
  desconectar: () => void;
  recargar: () => Promise<void>;
  // Aplica un cambio sobre la versión más reciente de GitHub y la guarda (un commit por cambio).
  guardar: (mutar: (datos: BaseDatos) => BaseDatos, mensaje: string) => Promise<void>;
}

const ContextoDatos = createContext<ValorDatos | null>(null);

function textoError(e: unknown): string {
  if (e instanceof ErrorGitHub) return e.message;
  if (e instanceof TypeError) return 'Sin conexión a internet.';
  return e instanceof Error ? e.message : String(e);
}

export function DatosProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ConfigGitHub | null>(null);
  const [estado, setEstado] = useState<Estado>('iniciando');
  const [datos, setDatos] = useState<BaseDatos | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sinConexion, setSinConexion] = useState(false);

  const aplicarDatos = useCallback((nuevos: BaseDatos) => {
    setDatos(nuevos);
    guardarCopiaDatos(nuevos);
    setSinConexion(false);
    setError(null);
    setEstado('listo');
  }, []);

  const cargarDesde = useCallback(
    async (cfg: ConfigGitHub) => {
      setEstado('cargando');
      try {
        aplicarDatos((await leerDatos(cfg)).datos);
      } catch (e) {
        const copia = leerCopiaDatos();
        setError(textoError(e));
        if (copia) {
          setDatos(copia);
          setSinConexion(true);
          setEstado('listo');
        } else {
          setEstado('error');
        }
      }
    },
    [aplicarDatos],
  );

  // localStorage solo existe en el navegador: se lee después del primer render.
  useEffect(() => {
    const guardada = leerConfig();
    if (!guardada) {
      setEstado('sin-config');
      return;
    }
    setConfig(guardada);
    setDatos(leerCopiaDatos());
    void cargarDesde(guardada);
  }, [cargarDesde]);

  const configurar = useCallback(
    async (nueva: ConfigGitHub) => {
      // Se valida antes de guardar, así un token mal copiado no queda persistido.
      aplicarDatos((await leerDatos(nueva)).datos);
      guardarConfig(nueva);
      setConfig(nueva);
    },
    [aplicarDatos],
  );

  const desconectar = useCallback(() => {
    guardarConfig(null);
    guardarCopiaDatos(null);
    setConfig(null);
    setDatos(null);
    setEstado('sin-config');
  }, []);

  const recargar = useCallback(async () => {
    if (config) await cargarDesde(config);
  }, [config, cargarDesde]);

  const guardar = useCallback(
    async (mutar: (datos: BaseDatos) => BaseDatos, mensaje: string) => {
      if (!config) throw new Error('Falta configurar GitHub.');
      // Un reintento si otro dispositivo guardó en el medio (409).
      for (let intento = 0; ; intento++) {
        const actual = await leerDatos(config);
        const nuevos = mutar(actual.datos);
        try {
          await escribirDatos(config, nuevos, actual.sha, mensaje);
          aplicarDatos(nuevos);
          return;
        } catch (e) {
          if (!(e instanceof ErrorGitHub && e.estado === 409) || intento >= 1) throw e;
        }
      }
    },
    [config, aplicarDatos],
  );

  const valor = useMemo<ValorDatos>(
    () => ({ estado, datos, error, sinConexion, configurar, desconectar, recargar, guardar }),
    [estado, datos, error, sinConexion, configurar, desconectar, recargar, guardar],
  );

  return <ContextoDatos.Provider value={valor}>{children}</ContextoDatos.Provider>;
}

export function useDatos(): ValorDatos {
  const valor = useContext(ContextoDatos);
  if (!valor) throw new Error('useDatos debe usarse dentro de DatosProvider');
  return valor;
}
