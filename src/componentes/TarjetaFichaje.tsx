// Fichaje de jornadas (punch in / punch out): se empieza, corre el reloj, se termina y se registra en Horas.
// Los fichajes viven en datos.json, así que se ven igual desde cualquier celular.
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Text, View } from 'react-native';

import { useDatos } from '@/datos/DatosProvider';
import { duracion, horaCorta, nuevoId } from '@/datos/formato';
import { PERSONAS, type Fichaje, type Persona } from '@/datos/tipos';
import { colores, espacio, radios, texto } from '@/tema';

import { useAviso } from './Aviso';
import { BotonTactil } from './BotonTactil';
import { Dialogo } from './Dialogo';
import { Opciones } from './formulario';
import { Tarjeta } from './Tarjeta';

// Reloj que se actualiza cada segundo mientras haya jornadas en curso.
function useAhora(activo: boolean) {
  const [ahora, setAhora] = useState(() => Date.now());
  useEffect(() => {
    if (!activo) return;
    const t = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(t);
  }, [activo]);
  return ahora;
}

function reloj(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const dos = (n: number) => String(n).padStart(2, '0');
  return `${dos(Math.floor(s / 3600))}:${dos(Math.floor((s % 3600) / 60))}:${dos(s % 60)}`;
}

// Punto verde que late mientras la jornada está en curso.
function PuntoEnVivo() {
  const pulso = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const animacion = Animated.loop(
      Animated.sequence([
        Animated.timing(pulso, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        Animated.timing(pulso, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
      ]),
    );
    animacion.start();
    return () => animacion.stop();
  }, [pulso]);
  return (
    <Animated.View
      style={{
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colores.acento,
        opacity: pulso.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }),
        transform: [{ scale: pulso.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1.15] }) }],
      }}
    />
  );
}

export function TarjetaFichaje() {
  const { datos, guardar } = useDatos();
  const avisar = useAviso();
  const [persona, setPersona] = useState<Persona | null>(null);
  const [descartando, setDescartando] = useState<Fichaje | null>(null);
  const fichajes = datos?.fichajes ?? [];
  const ahora = useAhora(fichajes.some((f) => f.fin === null));

  const enCurso = new Set(fichajes.map((f) => f.persona));
  const libres = PERSONAS.filter((p) => !enCurso.has(p));

  function avisarError(e: unknown) {
    avisar(e instanceof Error ? `No se guardó: ${e.message}` : 'No se guardó');
  }

  function empezar() {
    if (!persona) return;
    const nuevo: Fichaje = { id: nuevoId(), persona, inicio: new Date().toISOString(), fin: null };
    setPersona(null);
    guardar((d) => ({ ...d, fichajes: [...d.fichajes, nuevo] }), `Entrada: ${nuevo.persona}`).catch(avisarError);
  }

  function terminar(f: Fichaje) {
    const fin = new Date().toISOString();
    guardar((d) => ({ ...d, fichajes: d.fichajes.map((x) => (x.id === f.id ? { ...x, fin } : x)) }), `Salida: ${f.persona}`)
      .then(() => router.push({ pathname: '/hora', params: { fichaje: f.id } }))
      .catch(avisarError);
  }

  function descartar(f: Fichaje) {
    setDescartando(null);
    guardar((d) => ({ ...d, fichajes: d.fichajes.filter((x) => x.id !== f.id) }), `Descartar fichaje: ${f.persona}`).catch(avisarError);
  }

  return (
    <Tarjeta estilo={{ gap: espacio(4) }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: espacio(2) }}>
        <Ionicons name="timer-outline" size={22} color={colores.texto} />
        <Text style={texto.subtitulo}>Fichar jornada</Text>
      </View>

      {fichajes.map((f) => {
        const terminado = f.fin !== null;
        const ms = (terminado ? new Date(f.fin as string).getTime() : ahora) - new Date(f.inicio).getTime();
        return (
          <View key={f.id} style={{ backgroundColor: terminado ? colores.fondo : colores.texto, borderRadius: radios.campo, padding: espacio(4), gap: espacio(3) }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: espacio(2) }}>
                {!terminado && <PuntoEnVivo />}
                <Text style={{ fontSize: 16, fontWeight: '600', color: terminado ? colores.texto : '#FFFFFF' }}>{f.persona}</Text>
              </View>
              <Text style={{ fontSize: 13, color: terminado ? colores.textoSecundario : '#A8A8A8' }}>
                {horaCorta(f.inicio)}
                {terminado ? ` – ${horaCorta(f.fin as string)}` : ' – ahora'}
              </Text>
            </View>
            <Text style={{ fontSize: 34, fontWeight: '600', letterSpacing: 1, color: terminado ? colores.texto : '#FFFFFF', fontVariant: ['tabular-nums'] }}>
              {terminado ? duracion(ms) : reloj(ms)}
            </Text>
            {terminado ? (
              <View style={{ flexDirection: 'row', gap: espacio(2) }}>
                <View style={{ flex: 1 }}>
                  <BotonTactil titulo="Descartar" variante="peligro" onPress={() => setDescartando(f)} />
                </View>
                <View style={{ flex: 2 }}>
                  <BotonTactil titulo="Registrar horas" icono="checkmark" onPress={() => router.push({ pathname: '/hora', params: { fichaje: f.id } })} />
                </View>
              </View>
            ) : (
              <BotonTactil titulo="Terminar jornada" icono="stop" variante="acento" onPress={() => terminar(f)} />
            )}
          </View>
        );
      })}

      {libres.length > 0 && (
        <View style={{ gap: espacio(3) }}>
          <Opciones etiqueta="¿Quién empieza?" opciones={libres} valor={persona} onCambio={setPersona} />
          <BotonTactil titulo="Empezar jornada" icono="play" deshabilitado={!persona} onPress={empezar} />
        </View>
      )}

      <Dialogo
        visible={descartando !== null}
        titulo="¿Descartar esta jornada?"
        mensaje="No se va a registrar en Horas."
        onCerrar={() => setDescartando(null)}
        opciones={[
          { texto: 'Sí, descartar', variante: 'peligro', onPress: () => descartando && descartar(descartando) },
          { texto: 'Cancelar', onPress: () => setDescartando(null) },
        ]}
      />
    </Tarjeta>
  );
}
