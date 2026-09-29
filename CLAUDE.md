# Casita Aurora

App personal (Expo + React Native + TypeScript) para controlar los gastos y el avance de la construcción de una casa. Reemplaza un Excel de control de gastos: las categorías, presupuestos, listas de valores y estructura de datos salen de ahí. **No inventar categorías ni campos nuevos sin pedirlo.**

## Arquitectura

- **Solo web**, instalada en el iPhone con Safari → "Agregar a inicio". Se publica en **GitHub Pages** (`https://IGY2007.github.io/casita-aurora/`) con el workflow `.github/workflows/publicar.yml` en cada push a `main`.
- **Datos**: un único `datos.json` en el repositorio **privado** `IGY2007/casita-aurora-datos`. La app lo lee y escribe con la API de contenidos de GitHub, usando un token fine-grained que el usuario pega una vez en la app (queda en `localStorage`). Cada cambio es un commit, así que el historial del repo es el respaldo.
- **Este repositorio es público**: nunca commitear datos personales. `datos-privados/` está en `.gitignore`.
- Guardar requiere internet. Sin conexión se muestra la última copia guardada en `localStorage`.
- Expo SDK 57 + Expo Router, `web.output: "static"` y `experiments.baseUrl: "/casita-aurora"`. Ver también @AGENTS.md (reglas generales de Expo).

## Pantallas (5 tabs en `src/app/(tabs)/`)

1. **Resumen** (`index.tsx`): presupuesto total, cuánto se gastó (materiales + mano de obra), saldo y dinero enviado. Equivale a la hoja "Resumen".
2. **Gastos** (`gastos.tsx`): compras de materiales (hoja "Materiales"). Los montos se cargan normalmente en ARS.
3. **Horas** (`horas.tsx`): jornadas de trabajo, propias (sin costo) y changas pagas (hoja "Horas de trabajo"). Los costos se cargan normalmente en ARS.
4. **Transferencias** (`transferencias.tsx`): dinero enviado a Papá/Mamá: cuánto salió, cuánto llegó y para qué (hoja "Transferencias").
5. **Etapas** (`etapas.tsx`): presupuesto planificado contra gasto real por categoría (hoja "Presupuesto por etapa").

## Código

- `src/datos/tipos.ts`: estructura de `datos.json` (`BaseDatos`) y listas de valores permitidos (hoja "Config").
- `src/datos/github.ts`: leer y escribir `datos.json` (base64 UTF-8, `sha` para evitar pisar cambios).
- `src/datos/almacenamientoLocal.ts`: configuración de GitHub y copia offline en `localStorage`.
- `src/datos/DatosProvider.tsx`: contexto `useDatos()`. Para modificar datos, usar siempre `guardar(mutar, mensaje)`: relee la última versión, aplica el cambio y hace el commit.
- `src/componentes/PantallaConexion.tsx`: formulario de usuario, repositorio y token.
- `src/app/+html.tsx` y `public/`: ícono y manifest para la pantalla de inicio del iPhone. `BASE` en `+html.tsx` debe coincidir con `baseUrl`.

Monedas: ARS, USD, EUR, NOK. Fechas en texto ISO `AAAA-MM-DD`. El presupuesto está en USD. Los IDs son UUID (`crypto.randomUUID()`).

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
