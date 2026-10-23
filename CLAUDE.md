# Casita Aurora

App personal (Expo + React Native + TypeScript) para controlar los gastos y el avance de la construcción de una casa. Reemplaza un Excel de control de gastos: las categorías, presupuestos, listas de valores y estructura de datos salen de ahí. **No inventar categorías ni campos nuevos sin pedirlo.**

## Arquitectura

- **Solo web**, instalada en el iPhone con Safari → "Agregar a inicio". Se publica en **GitHub Pages** (`https://IGY2007.github.io/casita-aurora/`) con el workflow `.github/workflows/publicar.yml` en cada push a `main`.
- **Datos**: un único `datos.json` en el repositorio **privado** `IGY2007/casita-aurora-datos`. La app lo lee y escribe con la API de contenidos de GitHub, usando un token fine-grained que el usuario pega una vez en la app (queda en `localStorage`). Cada cambio es un commit, así que el historial del repo es el respaldo.
- **Este repositorio es público**: nunca commitear datos personales (ni la lista de materiales con precios). `datos-privados/` está en `.gitignore`; ahí está `migrar_v2.py`, que cargó la lista inicial en el repo privado.
- Guardar requiere internet. Sin conexión se muestra la última copia guardada en `localStorage`.
- Expo SDK 57 + Expo Router, `web.output: "static"` y `experiments.baseUrl: "/casita-aurora"`. Ver también @AGENTS.md (reglas generales de Expo).

## Pantallas (5 tabs en `src/app/(tabs)/`)

1. **Resumen** (`index.tsx`): presupuesto total, cuánto se gastó (materiales + mano de obra), saldo y dinero enviado. Equivale a la hoja "Resumen".
2. **Gastos** (`gastos.tsx`): compras de materiales (hoja "Materiales"). Los montos se cargan normalmente en ARS.
3. **Horas** (`horas.tsx`): jornadas de trabajo, propias (sin costo) y changas pagas (hoja "Horas de trabajo"). Los costos se cargan normalmente en ARS. Arriba, `TarjetaFichaje`: fichar entrada/salida (punch in/out); los fichajes viven en `datos.fichajes` y al terminar abren `/hora?fichaje=...` con las horas calculadas.
4. **Transferencias** (`transferencias.tsx`): dinero enviado a Papá/Mamá: cuánto salió, cuánto llegó y para qué (hoja "Transferencias").
5. **Etapas** (`etapas.tsx`): lista de materiales por etapa. Etapas ordenables (sin fechas), con subtotal, % del total, acumulado, imprevistos (% editable) y avance comprado vs. pendiente. Tocar una etapa abre `/etapa?id=...` con sus materiales agrupados y el casillero de comprado: al marcarlo pregunta si se añade a gastos y abre `/gasto?material=...` precargado (el monto pagado se escribe a mano, nunca cantidad × precio).

Etapas y materiales son 100% editables desde la app: **no hardcodear etapas, materiales ni precios**. Los gastos usan el nombre de la etapa como `categoria` (o "Otros"); al renombrar una etapa se actualizan sus gastos.

## Código

- `src/datos/tipos.ts`: estructura de `datos.json` (`BaseDatos` v3: etapas, materiales, imprevistos_porcentaje, gastos, horas_trabajo, transferencias, tipos_cambio, fichajes) y listas de valores permitidos (hoja "Config").
- `src/datos/migracion.ts`: `normalizarDatos` lleva cualquier versión (v1 o campos faltantes) al formato actual; se aplica al leer de GitHub y de la copia local. Si cambia el esquema, subir `version` y agregar la conversión acá.
- `src/datos/github.ts`: leer y escribir `datos.json` (base64 UTF-8, `sha` para evitar pisar cambios).
- `src/datos/almacenamientoLocal.ts`: configuración de GitHub y copia offline en `localStorage`.
- `src/datos/DatosProvider.tsx`: contexto `useDatos()`. Para modificar datos, usar siempre `guardar(mutar, mensaje)`: aplica el cambio al instante (optimista), relee la última versión de GitHub, vuelve a aplicar `mutar` y hace el commit; si falla, revierte. Por eso `mutar` tiene que ser una función pura que funcione sobre cualquier versión.
- `src/datos/formato.ts`: fechas, números en formato argentino (punto = miles, coma = decimales), `formatoMoneda` e IDs.
- `src/datos/calculos.ts`: `calcularLista` (subtotales por etapa en USD sin los "ya disponible", %, acumulado, imprevistos, comprado/pendiente), `calcularResumen` (presupuesto = total general de la lista) y conversión con `tipos_cambio`.
- `src/app/etapa.tsx` (detalle), `etapa-editar.tsx`, `material.tsx`, `imprevistos.tsx`: lista de materiales.
- `src/app/gasto.tsx`, `hora.tsx`, `transferencia.tsx`, `tipos-cambio.tsx`: formularios modales (`?id=` para editar). Usan `src/componentes/formulario.tsx` (Formulario, Seccion, Campo, Opciones, Acciones), `CampoFecha.tsx` y `useGuardado.ts` (guarda, muestra el aviso y vuelve).
- `src/componentes/Lista.tsx`: listas de las tabs agrupadas por mes, con botón flotante "+"; tocar una fila abre su formulario.

## Diseño

- Todo color, radio, sombra y estilo de texto sale de `src/tema.ts` (claro con negro como el logo, acento verde-aurora `#2BB39A`). No hardcodear colores nuevos.
- Componentes base en `src/componentes/`: `Tarjeta` (con animación de entrada), `BotonTactil`/`Tactil` (escala al tocar), `BotonFlotante`, `BarraProgreso`, `FilaRegistro`, `Encabezado`, `Aviso` (`useAviso()`), `iconos.ts` (ícono por categoría, Ionicons).
- `Dialogo` (modal con opciones; Alert/confirm no andan en web), `Casilla` (checkbox con rebote), `AnimacionInicio` (logo al abrir la app, mínimo 1,7 s y hasta que cargan los datos).
- Animaciones con `Animated` de React Native y `useNativeDriver: false` (es web).
- Las pantallas de tabs no usan header: dibujan su propio `Encabezado` respetando `useSafeAreaInsets()`.
- `src/app/+html.tsx` y `public/`: ícono y manifest para la pantalla de inicio del iPhone. `BASE` en `+html.tsx` debe coincidir con `baseUrl`.

Monedas: ARS, USD, EUR, NOK. Fechas en texto ISO `AAAA-MM-DD`. Cada material guarda su precio estimado con su propia `moneda` (los nuevos en ARS por defecto); los totales de etapas y el presupuesto se muestran en USD convirtiendo con `tipos_cambio` (`aUSD`, `totalMaterialUSD`). Si falta un tipo de cambio, ese material no suma y se avisa (`incompleto`). Los IDs son UUID (`crypto.randomUUID()`).

## Convenciones

- TypeScript estricto (`strict` + `noUncheckedIndexedAccess`). Nada de `any`.
- Solo componentes funcionales y hooks.
- Comentarios, nombres de variables, funciones y UI en español.
- Rutas solo en `src/app/`; el resto del código va fuera (`src/datos/`, `src/componentes/`). Importar con el alias `@/` (= `src/`).
- Antes de dar algo por terminado: `npm run typecheck` y `npx expo export --platform web`.

## Comandos

```bash
npx expo start --web             # desarrollo en el navegador
npm run typecheck                # chequeo de tipos
npx expo export --platform web   # compilación a dist/ (lo mismo que hace el workflow)
```
