// Piezas comunes de los formularios de carga (sin diseño todavía).
import { useState, type ReactNode } from 'react';
import { Button, Pressable, ScrollView, Text, TextInput, View, type KeyboardTypeOptions } from 'react-native';

export function Formulario({ children }: { children: ReactNode }) {
  return <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 48 }}>{children}</ScrollView>;
}

interface PropsCampo {
  etiqueta: string;
  valor: string;
  onCambio: (texto: string) => void;
  teclado?: KeyboardTypeOptions;
  placeholder?: string;
  multilinea?: boolean;
}

export function Campo({ etiqueta, valor, onCambio, teclado, placeholder, multilinea }: PropsCampo) {
  return (
    <View>
      <Text>{etiqueta}</Text>
      <TextInput
        style={{ borderWidth: 1, borderColor: '#999', padding: 8, minHeight: multilinea ? 64 : undefined }}
        value={valor}
        onChangeText={onCambio}
        keyboardType={teclado}
        placeholder={placeholder}
        multiline={multilinea}
      />
    </View>
  );
}

interface PropsOpciones<T extends string> {
  etiqueta: string;
  opciones: readonly T[];
  valor: T | null;
  onCambio: (valor: T | null) => void;
  // Si es opcional, tocar la opción elegida la deselecciona.
  opcional?: boolean;
}

export function Opciones<T extends string>({ etiqueta, opciones, valor, onCambio, opcional }: PropsOpciones<T>) {
  return (
    <View>
      <Text>{etiqueta}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
        {opciones.map((opcion) => {
          const elegida = opcion === valor;
          return (
            <Pressable
              key={opcion}
              onPress={() => onCambio(elegida && opcional ? null : opcion)}
              style={{ borderWidth: 1, borderColor: '#999', paddingVertical: 6, paddingHorizontal: 10, backgroundColor: elegida ? '#222' : 'transparent' }}
            >
              <Text style={{ color: elegida ? '#fff' : '#000' }}>{opcion}</Text>
            </Pressable>
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
    <View style={{ gap: 12, marginTop: 8 }}>
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
      <Button title={guardando ? 'Guardando…' : 'Guardar'} onPress={onGuardar} disabled={guardando} />
      {onEliminar && (
        <Button
          title={confirmando ? 'Tocá de nuevo para eliminar' : 'Eliminar'}
          color="red"
          disabled={guardando}
          onPress={() => (confirmando ? onEliminar() : setConfirmando(true))}
        />
      )}
    </View>
  );
}
