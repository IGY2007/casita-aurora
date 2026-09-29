// Tipos de cambio a pesos, cargados a mano para convertir sin internet.
import { useState } from 'react';
import { Text } from 'react-native';

import { Acciones, Campo, Formulario, Seccion } from '@/componentes/formulario';
import { useGuardado } from '@/componentes/useGuardado';
import { useDatos } from '@/datos/DatosProvider';
import { hoyISO, numeroATexto, parsearNumero } from '@/datos/formato';
import type { TipoCambio } from '@/datos/tipos';
import { texto } from '@/tema';

const MONEDAS_CAMBIO: TipoCambio['moneda'][] = ['USD', 'EUR', 'NOK'];

export default function FormularioTiposCambio() {
  const { datos } = useDatos();
  const inicial = (m: TipoCambio['moneda']) => numeroATexto(datos?.tipos_cambio.find((t) => t.moneda === m)?.ars_por_unidad ?? null);
  const [valores, setValores] = useState<Record<TipoCambio['moneda'], string>>({
    USD: inicial('USD'),
    EUR: inicial('EUR'),
    NOK: inicial('NOK'),
  });
  const { guardando, error, setError, ejecutar } = useGuardado('/');

  function guardar() {
    const nuevos: TipoCambio[] = [];
    for (const moneda of MONEDAS_CAMBIO) {
      const texto = valores[moneda].trim();
      const numero = parsearNumero(texto);
      if (texto && (numero === null || numero <= 0)) return setError(`El valor de ${moneda} no es un número válido.`);
      const anterior = datos?.tipos_cambio.find((t) => t.moneda === moneda);
      // Solo cambia la fecha de actualización si cambió el valor.
      const cambio = numero !== (anterior?.ars_por_unidad ?? null);
      nuevos.push({ moneda, ars_por_unidad: numero, actualizado: cambio ? (numero === null ? null : hoyISO()) : (anterior?.actualizado ?? null) });
    }
    void ejecutar((d) => ({ ...d, tipos_cambio: nuevos }), 'Actualizar tipos de cambio', 'Tipos de cambio guardados');
  }

  return (
    <Formulario pie={<Acciones guardando={guardando} error={error} onGuardar={guardar} />}>
      <Seccion titulo="¿Cuántos pesos vale cada moneda?">
        <Text style={texto.secundario}>Se usan para comparar tus gastos en pesos con el presupuesto en dólares.</Text>
        {MONEDAS_CAMBIO.map((m) => (
          <Campo
            key={m}
            etiqueta={`1 ${m} =`}
            valor={valores[m]}
            onCambio={(v) => setValores((actuales) => ({ ...actuales, [m]: v }))}
            teclado="decimal-pad"
            placeholder="Sin cargar"
            prefijo="$"
          />
        ))}
      </Seccion>
    </Formulario>
  );
}
