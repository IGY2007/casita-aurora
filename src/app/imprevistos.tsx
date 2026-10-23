// Porcentaje de imprevistos que se suma al subtotal general de la lista de materiales.
import { useState } from 'react';
import { Text, View } from 'react-native';

import { Acciones, Campo, Formulario, Seccion } from '@/componentes/formulario';
import { useGuardado } from '@/componentes/useGuardado';
import { calcularLista } from '@/datos/calculos';
import { useDatos } from '@/datos/DatosProvider';
import { formatoMoneda, numeroATexto, parsearNumero } from '@/datos/formato';
import { texto } from '@/tema';

export default function FormularioImprevistos() {
  const { datos } = useDatos();
  const [porcentaje, setPorcentaje] = useState(numeroATexto(datos?.imprevistos_porcentaje ?? 10));
  const { guardando, error, setError, ejecutar } = useGuardado('/etapas');

  const subtotal = datos ? calcularLista(datos).subtotalGeneral : 0;
  const pct = parsearNumero(porcentaje);

  function guardar() {
    if (pct === null || pct < 0) return setError('Escribí un porcentaje válido, por ejemplo 10.');
    void ejecutar((d) => ({ ...d, imprevistos_porcentaje: pct }), `Imprevistos: ${pct}%`, 'Imprevistos actualizados');
  }

  return (
    <Formulario pie={<Acciones guardando={guardando} error={error} onGuardar={guardar} />}>
      <Seccion titulo="Porcentaje de imprevistos">
        <Text style={texto.secundario}>Se suma al subtotal de todas las etapas para el total general.</Text>
        <Campo etiqueta="Porcentaje" valor={porcentaje} onCambio={setPorcentaje} teclado="decimal-pad" placeholder="10" prefijo="%" />
        {pct !== null && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={texto.secundario}>Imprevistos</Text>
            <Text style={texto.monto}>{formatoMoneda((subtotal * pct) / 100, 'USD')}</Text>
          </View>
        )}
        {pct !== null && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={texto.secundario}>Total general</Text>
            <Text style={texto.monto}>{formatoMoneda(subtotal * (1 + pct / 100), 'USD')}</Text>
          </View>
        )}
      </Seccion>
    </Formulario>
  );
}
