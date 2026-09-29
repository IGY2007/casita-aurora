// Estado común de los formularios: guardar en GitHub, mostrar errores y volver a la lista.
import { router, type Href } from 'expo-router';
import { useState } from 'react';

import { useDatos } from '@/datos/DatosProvider';
import type { BaseDatos } from '@/datos/tipos';

export function useGuardado(rutaLista: Href) {
  const { guardar } = useDatos();
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function ejecutar(mutar: (datos: BaseDatos) => BaseDatos, mensaje: string) {
    setGuardando(true);
    setError(null);
    try {
      await guardar(mutar, mensaje);
      // Si se abrió el formulario directo (sin historial), se va a la lista.
      if (router.canGoBack()) router.back();
      else router.replace(rutaLista);
    } catch (e) {
      setError(e instanceof TypeError ? 'Sin conexión a internet. No se guardó.' : e instanceof Error ? e.message : String(e));
      setGuardando(false);
    }
  }

  return { guardando, error, setError, ejecutar };
}
