// Estado común de los formularios: guardar en GitHub, avisar, mostrar errores y volver a la lista.
import { router, type Href } from 'expo-router';
import { useState } from 'react';

import { useDatos } from '@/datos/DatosProvider';
import type { BaseDatos } from '@/datos/tipos';

import { useAviso } from './Aviso';

export function useGuardado(rutaLista: Href) {
  const { guardar } = useDatos();
  const avisar = useAviso();
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // mensaje: texto del commit en GitHub; aviso: lo que ve el usuario al terminar.
  async function ejecutar(mutar: (datos: BaseDatos) => BaseDatos, mensaje: string, aviso: string) {
    setGuardando(true);
    setError(null);
    try {
      await guardar(mutar, mensaje);
      avisar(aviso);
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
