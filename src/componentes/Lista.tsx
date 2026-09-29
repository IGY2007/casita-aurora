// Lista de registros con botón para agregar; tocar una fila abre su formulario de edición.
import { router } from 'expo-router';
import { Button, Pressable, ScrollView, Text } from 'react-native';

interface Fila {
  id: string;
  texto: string;
}

interface PropsLista {
  textoAgregar: string;
  // Ruta del formulario: '/gasto', '/hora' o '/transferencia'
  formulario: '/gasto' | '/hora' | '/transferencia';
  filas: Fila[];
  textoVacio: string;
}

export function Lista({ textoAgregar, formulario, filas, textoVacio }: PropsLista) {
  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 4 }}>
      <Button title={textoAgregar} onPress={() => router.push(formulario)} />
      {filas.length === 0 && <Text style={{ marginTop: 12 }}>{textoVacio}</Text>}
      {filas.map((f) => (
        <Pressable
          key={f.id}
          onPress={() => router.push({ pathname: formulario, params: { id: f.id } })}
          style={{ paddingVertical: 10, borderBottomWidth: 1, borderColor: '#ddd' }}
        >
          <Text>{f.texto}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
