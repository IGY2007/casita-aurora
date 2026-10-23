// Formulario de etapa: nueva (sin id) o edición (/etapa-editar?id=...): nombre, notas y borrado.
import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';

import { Acciones, Campo, Formulario, Seccion } from '@/componentes/formulario';
import { useGuardado } from '@/componentes/useGuardado';
import { useDatos } from '@/datos/DatosProvider';
import { nuevoId, textoONull } from '@/datos/formato';
import { CATEGORIA_OTROS, type Etapa } from '@/datos/tipos';
import { texto } from '@/tema';

export default function FormularioEtapa() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { datos } = useDatos();
  const existente = datos?.etapas.find((e) => e.id === id);
  const cantidadMateriales = datos?.materiales.filter((m) => m.etapa_id === id).length ?? 0;

  const [nombre, setNombre] = useState(existente?.nombre ?? '');
  const [notas, setNotas] = useState(existente?.notas ?? '');
  const { guardando, error, setError, ejecutar } = useGuardado('/etapas');

  function guardar() {
    const limpio = nombre.trim();
    if (!limpio) return setError('Escribí el nombre de la etapa.');
    // Los gastos se asocian a la etapa por nombre: no puede repetirse.
    if (limpio === CATEGORIA_OTROS || datos?.etapas.some((e) => e.nombre === limpio && e.id !== existente?.id)) {
      return setError('Ya existe una etapa con ese nombre.');
    }

    const etapa: Etapa = { id: existente?.id ?? nuevoId(), nombre: limpio, notas: textoONull(notas) };
    const nombreAnterior = existente?.nombre;
    void ejecutar(
      (d) => ({
        ...d,
        etapas: existente ? d.etapas.map((e) => (e.id === etapa.id ? etapa : e)) : [...d.etapas, etapa],
        // Al renombrar, los gastos de esa etapa pasan al nombre nuevo.
        gastos: nombreAnterior && nombreAnterior !== limpio ? d.gastos.map((g) => (g.categoria === nombreAnterior ? { ...g, categoria: limpio } : g)) : d.gastos,
      }),
      existente ? `Editar etapa: ${limpio}` : `Nueva etapa: ${limpio}`,
      existente ? 'Etapa actualizada' : 'Etapa creada',
    );
  }

  function eliminar() {
    if (!existente) return;
    void ejecutar(
      (d) => ({
        ...d,
        etapas: d.etapas.filter((e) => e.id !== existente.id),
        materiales: d.materiales.filter((m) => m.etapa_id !== existente.id),
      }),
      `Eliminar etapa: ${existente.nombre}`,
      'Etapa eliminada',
      '/etapas',
    );
  }

  return (
    <Formulario pie={<Acciones guardando={guardando} error={error} onGuardar={guardar} onEliminar={existente ? eliminar : undefined} />}>
      <Stack.Screen options={{ title: existente ? 'Editar etapa' : 'Nueva etapa' }} />
      <Seccion>
        <Campo etiqueta="Nombre" valor={nombre} onCambio={setNombre} placeholder="Ej: Estructura y techo" />
        <Campo etiqueta="Notas" valor={notas} onCambio={setNotas} placeholder="Opcional: qué comprar antes, qué coordinar…" multilinea />
        {existente && (
          <Text style={[texto.secundario, { fontSize: 13 }]}>
            {cantidadMateriales > 0
              ? `Si la eliminás se borran también sus ${cantidadMateriales} materiales. Los gastos ya cargados no se borran.`
              : 'No tiene materiales cargados.'}
          </Text>
        )}
      </Seccion>
    </Formulario>
  );
}
