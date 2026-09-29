// Formulario para conectar la app al repositorio privado de datos. Se completa una vez por dispositivo.
import { useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';

import { useDatos } from '@/datos/DatosProvider';

const estiloCampo = { borderWidth: 1, borderColor: '#999', padding: 8, marginBottom: 12 } as const;

export function PantallaConexion() {
  const { configurar } = useDatos();
  const [propietario, setPropietario] = useState('');
  const [repositorio, setRepositorio] = useState('casita-aurora-datos');
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [conectando, setConectando] = useState(false);

  async function conectar() {
    setConectando(true);
    setError(null);
    try {
      await configurar({ propietario: propietario.trim(), repositorio: repositorio.trim(), token: token.trim() });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setConectando(false);
    }
  }

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 20, marginBottom: 16 }}>Conectar con GitHub</Text>
      <Text>Usuario de GitHub</Text>
      <TextInput style={estiloCampo} value={propietario} onChangeText={setPropietario} autoCapitalize="none" autoCorrect={false} />
      <Text>Repositorio de datos</Text>
      <TextInput style={estiloCampo} value={repositorio} onChangeText={setRepositorio} autoCapitalize="none" autoCorrect={false} />
      <Text>Token</Text>
      <TextInput style={estiloCampo} value={token} onChangeText={setToken} autoCapitalize="none" autoCorrect={false} secureTextEntry />
      <Button title={conectando ? 'Conectando…' : 'Conectar'} onPress={conectar} disabled={conectando || !propietario || !token} />
      {error && <Text style={{ color: 'red', marginTop: 12 }}>{error}</Text>}
    </View>
  );
}
