// Lectura y escritura de datos.json en el repositorio privado, usando la API de contenidos de GitHub.
import type { BaseDatos } from './tipos';

const ARCHIVO = 'datos.json';

export interface ConfigGitHub {
  propietario: string; // usuario de GitHub
  repositorio: string; // repositorio privado con datos.json
  token: string; // token fine-grained con permiso Contents: read/write solo sobre ese repositorio
}

export interface ArchivoDatos {
  datos: BaseDatos;
  sha: string; // versión del archivo en GitHub; hace falta para sobrescribirlo
}

export class ErrorGitHub extends Error {
  constructor(
    mensaje: string,
    readonly estado: number,
  ) {
    super(mensaje);
  }
}

function url(config: ConfigGitHub): string {
  return `https://api.github.com/repos/${encodeURIComponent(config.propietario)}/${encodeURIComponent(config.repositorio)}/contents/${ARCHIVO}`;
}

function encabezados(config: ConfigGitHub): HeadersInit {
  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${config.token}`,
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

// btoa/atob solo manejan Latin-1: se pasa por bytes UTF-8 para no romper tildes ni "m²".
function aBase64(texto: string): string {
  const bytes = new TextEncoder().encode(texto);
  let binario = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binario += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binario);
}

function desdeBase64(base64: string): string {
  const binario = atob(base64.replace(/\n/g, ''));
  const bytes = Uint8Array.from(binario, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

async function errorDeRespuesta(respuesta: Response): Promise<ErrorGitHub> {
  const mensajes: Record<number, string> = {
    401: 'El token no es válido o venció.',
    403: 'El token no tiene permiso sobre el repositorio.',
    404: 'No se encontró datos.json (revisá usuario, repositorio y permisos del token).',
    409: 'Los datos cambiaron en otro dispositivo.',
  };
  const detalle = await respuesta.text().catch(() => '');
  return new ErrorGitHub(mensajes[respuesta.status] ?? `Error de GitHub (${respuesta.status}): ${detalle}`, respuesta.status);
}

export async function leerDatos(config: ConfigGitHub): Promise<ArchivoDatos> {
  // no-store: la API cachea las respuestas y podría devolver datos viejos justo después de guardar
  const respuesta = await fetch(url(config), { headers: encabezados(config), cache: 'no-store' });
  if (!respuesta.ok) throw await errorDeRespuesta(respuesta);
  const cuerpo = (await respuesta.json()) as { content: string; sha: string };
  return { datos: JSON.parse(desdeBase64(cuerpo.content)) as BaseDatos, sha: cuerpo.sha };
}

export async function escribirDatos(
  config: ConfigGitHub,
  datos: BaseDatos,
  sha: string,
  mensaje: string,
): Promise<string> {
  const respuesta = await fetch(url(config), {
    method: 'PUT',
    headers: encabezados(config),
    body: JSON.stringify({ message: mensaje, content: aBase64(JSON.stringify(datos, null, 2) + '\n'), sha }),
  });
  if (!respuesta.ok) throw await errorDeRespuesta(respuesta);
  const cuerpo = (await respuesta.json()) as { content: { sha: string } };
  return cuerpo.content.sha;
}
