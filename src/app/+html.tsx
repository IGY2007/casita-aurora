// HTML base de la versión web: ícono y ajustes para "Agregar a inicio" en el iPhone.
import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

// Debe coincidir con experiments.baseUrl de app.json (ruta de GitHub Pages).
const BASE = '/casita-aurora';

export default function Html({ children }: PropsWithChildren) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Casita Aurora" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href={`${BASE}/apple-touch-icon.png`} />
        <link rel="manifest" href={`${BASE}/manifest.json`} />
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
