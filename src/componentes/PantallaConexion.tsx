// Formulario para conectar la app al repositorio privado de datos. Se completa una vez por dispositivo.
import { useState } from 'react';
import { Image, ScrollView, Text, View } from 'react-native';

import { useDatos } from '@/datos/DatosProvider';
import { colores, espacio, texto } from '@/tema';

import { Acciones, Campo, Seccion } from './formulario';

const logo = require('../../assets/icon.png');

export function PantallaConexion() {
  const { configurar } = useDatos();
  const [propietario, setPropietario] = useState('');
  const [repositorio, setRepositorio] = useState('casita-aurora-datos');
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [conectando, setConectando] = useState(false);

  async function conectar() {
    if (!propietario.trim() || !token.trim()) return setError('Completá el usuario y el token.');
    setConectando(true);
    setError(null);
    try {
      await configurar({ propietario: propietario.trim(), repositorio: repositorio.trim(), token: token.trim() });
    } catch (e) {
      setError(e instanceof TypeError ? 'Sin conexión a internet.' : e instanceof Error ? e.message : String(e));
      setConectando(false);
    }
  }

  return (
    <ScrollView style={{ backgroundColor: colores.fondo }} contentContainerStyle={{ padding: espacio(5), paddingTop: espacio(16), gap: espacio(5) }}>
      <View style={{ alignItems: 'center', gap: espacio(3) }}>
        <Image source={logo} style={{ width: 96, height: 96, borderRadius: 48 }} />
        <Text style={texto.titulo}>Casita Aurora</Text>
        <Text style={[texto.secundario, { textAlign: 'center' }]}>Conectá la app con tu repositorio privado de GitHub. Se hace una sola vez.</Text>
      </View>
      <Seccion>
        <Campo etiqueta="Usuario de GitHub" valor={propietario} onCambio={setPropietario} placeholder="IGY2007" />
        <Campo etiqueta="Repositorio de datos" valor={repositorio} onCambio={setRepositorio} />
        <Campo etiqueta="Token" valor={token} onCambio={setToken} placeholder="github_pat_…" />
      </Seccion>
      <Acciones guardando={conectando} error={error} onGuardar={conectar} />
    </ScrollView>
  );
}
