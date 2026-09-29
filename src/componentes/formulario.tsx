// Piezas comunes de los formularios: secciones en tarjetas, campos, chips y botones fijos abajo.
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState, type ReactNode } from 'react';
import { ScrollView, Text, TextInput, View, type KeyboardTypeOptions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colores, espacio, radios, texto } from '@/tema';

import { BotonTactil, Tactil } from './BotonTactil';
import { Tarjeta } from './Tarjeta';

// Contenido desplazable arriba y acciones (Guardar/Eliminar) fijas abajo, siempre visibles.
export function Formulario({ children, pie }: { children: ReactNode; pie: ReactNode }) {
  const margenes = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: colores.fondo }}>
      <ScrollView contentContainerStyle={{ padding: espacio(4), gap: espacio(4), paddingBottom: espacio(8) }} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
      <View
        style={{
          padding: espacio(4),
          paddingBottom: Math.max(espacio(4), margenes.bottom),
          backgroundColor: colores.tarjeta,
          borderTopWidth: 1,
          borderColor: colores.borde,
        }}
      >
        {pie}
      </View>
    </View>
  );
}

export function Seccion({ titulo, children, retraso }: { titulo?: string; children: ReactNode; retraso?: number }) {
  return (
    <Tarjeta retraso={retraso} estilo={{ gap: espacio(4) }}>
      {titulo && <Text style={texto.subtitulo}>{titulo}</Text>}
      {children}
    </Tarjeta>
  );
}

interface PropsCampo {
  etiqueta: string;
  valor: string;
  onCambio: (texto: string) => void;
  teclado?: KeyboardTypeOptions;
  placeholder?: string;
  multilinea?: boolean;
  prefijo?: string;
}

export function Campo({ etiqueta, valor, onCambio, teclado, placeholder, multilinea, prefijo }: PropsCampo) {
  const [enfocado, setEnfocado] = useState(false);
  return (
    <View style={{ gap: espacio(1.5) }}>
      <Text style={texto.etiqueta}>{etiqueta}</Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: multilinea ? 'flex-start' : 'center',
          backgroundColor: colores.fondo,
          borderRadius: radios.campo,
          borderWidth: 1,
          borderColor: enfocado ? colores.texto : colores.borde,
          paddingHorizontal: espacio(3.5),
        }}
      >
        {prefijo && <Text style={[texto.cuerpo, { color: colores.textoSecundario, marginRight: espacio(1.5) }]}>{prefijo}</Text>}
        <TextInput
          style={[texto.cuerpo, { flex: 1, paddingVertical: espacio(3), minHeight: multilinea ? 80 : 48, outlineStyle: 'none' } as object]}
          value={valor}
          onChangeText={onCambio}
          keyboardType={teclado}
          placeholder={placeholder}
          placeholderTextColor={colores.textoTenue}
          multiline={multilinea}
          onFocus={() => setEnfocado(true)}
          onBlur={() => setEnfocado(false)}
        />
      </View>
    </View>
  );
}

interface PropsOpciones<T extends string> {
  etiqueta?: string;
  opciones: readonly T[];
  valor: T | null;
  onCambio: (valor: T | null) => void;
  // Si es opcional, tocar la opción elegida la deselecciona.
  opcional?: boolean;
}

export function Opciones<T extends string>({ etiqueta, opciones, valor, onCambio, opcional }: PropsOpciones<T>) {
  return (
    <View style={{ gap: espacio(2) }}>
      {etiqueta && <Text style={texto.etiqueta}>{etiqueta}</Text>}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: espacio(2) }}>
        {opciones.map((opcion) => {
          const elegida = opcion === valor;
          return (
            <Tactil
              key={opcion}
              onPress={() => onCambio(elegida && opcional ? null : opcion)}
              estilo={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: espacio(1),
                borderRadius: radios.chip,
                paddingVertical: espacio(2),
                paddingHorizontal: espacio(3.5),
                backgroundColor: elegida ? colores.texto : colores.fondo,
                borderWidth: 1,
                borderColor: elegida ? colores.texto : colores.borde,
              }}
            >
              {elegida && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
              <Text style={{ fontSize: 14, color: elegida ? '#FFFFFF' : colores.texto, fontWeight: elegida ? '600' : '400' }}>{opcion}</Text>
            </Tactil>
          );
        })}
      </View>
    </View>
  );
}

interface PropsAcciones {
  guardando: boolean;
  error: string | null;
  onGuardar: () => void;
  // Solo al editar un registro existente.
  onEliminar?: () => void;
}

export function Acciones({ guardando, error, onGuardar, onEliminar }: PropsAcciones) {
  // Eliminar pide un segundo toque: Alert/confirm no son confiables en la versión web.
  const [confirmando, setConfirmando] = useState(false);

  return (
    <View style={{ gap: espacio(3) }}>
      {error && (
        <View
          style={{
            flexDirection: 'row',
            gap: espacio(2),
            alignItems: 'center',
            backgroundColor: colores.peligroSuave,
            borderRadius: radios.campo,
            padding: espacio(3),
          }}
        >
          <Ionicons name="alert-circle" size={20} color={colores.peligro} />
          <Text style={{ flex: 1, color: colores.peligro, fontSize: 14 }}>{error}</Text>
        </View>
      )}
      <View style={{ flexDirection: 'row', gap: espacio(3) }}>
        {onEliminar && (
          <View style={{ flex: confirmando ? 2 : 1 }}>
            <BotonTactil
              titulo={confirmando ? '¿Seguro?' : 'Eliminar'}
              icono="trash-outline"
              variante="peligro"
              deshabilitado={guardando}
              onPress={() => (confirmando ? onEliminar() : setConfirmando(true))}
            />
          </View>
        )}
        <View style={{ flex: 2 }}>
          <BotonTactil titulo={guardando ? 'Guardando…' : 'Guardar'} icono="checkmark" cargando={guardando} onPress={onGuardar} />
        </View>
      </View>
    </View>
  );
}
