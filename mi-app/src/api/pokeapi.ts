// Acceso a la PokeAPI (https://pokeapi.co). Solo este módulo hace peticiones de red.
import type { Pokemon } from '../types/pokemon.ts';

const BASE_URL = 'https://pokeapi.co/api/v2';
const TIMEOUT_MS = 10000;

/** Error con un mensaje apto para mostrar al usuario. */
export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// Forma (parcial) de las respuestas de la API que usamos.
interface ApiPokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: {
    front_default: string | null;
    other?: { 'official-artwork'?: { front_default: string | null } };
  };
  types: { type: { name: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
}

interface ApiPokemonList {
  next: string | null;
  results: { name: string; url: string }[];
}

/**
 * GET a la API que devuelve JSON. Convierte timeouts, fallos de red
 * y respuestas HTTP no-OK en ApiError.
 */
async function fetchJSON<T>(path: string, signal?: AbortSignal): Promise<T> {
  const timeout = AbortSignal.timeout(TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
    });
  } catch {
    if (timeout.aborted) {
      throw new ApiError('La API tardó demasiado en responder.');
    }
    throw new ApiError('No se pudo conectar con la PokeAPI. Revisa tu conexión.');
  }

  if (response.status === 404) {
    throw new ApiError('No se encontró ningún Pokémon con ese nombre o número.', 404);
  }
  if (!response.ok) {
    throw new ApiError(`La API respondió con un error (${response.status}).`, response.status);
  }
  return response.json() as Promise<T>;
}

/** Reduce la respuesta completa de la API a los campos que usa la app. */
function toPokemon(data: ApiPokemon): Pokemon {
  return {
    id: data.id,
    name: data.name,
    image:
      data.sprites.other?.['official-artwork']?.front_default ?? data.sprites.front_default ?? '',
    types: data.types.map((t) => t.type.name),
    height: data.height / 10, // decímetros -> metros
    weight: data.weight / 10, // hectogramos -> kg
    stats: data.stats.map((s) => ({ name: s.stat.name, value: s.base_stat })),
  };
}

/** Obtiene un Pokémon por nombre o número. */
export async function getPokemon(nameOrId: string | number, signal?: AbortSignal) {
  const query = String(nameOrId).trim().toLowerCase();
  const data = await fetchJSON<ApiPokemon>(`/pokemon/${encodeURIComponent(query)}`, signal);
  return toPokemon(data);
}

/**
 * Obtiene una página de Pokémon con sus detalles.
 * La lista solo trae nombre + url, así que pedimos los detalles en paralelo.
 */
export async function getPokemonPage(offset: number, limit: number, signal?: AbortSignal) {
  const { results, next } = await fetchJSON<ApiPokemonList>(
    `/pokemon?offset=${offset}&limit=${limit}`,
    signal,
  );
  const pokemon = await Promise.all(results.map(({ name }) => getPokemon(name, signal)));
  return { pokemon, hasMore: next !== null };
}

/** Mensaje legible para cualquier error capturado. */
export const errorMessage = (err: unknown) =>
  err instanceof ApiError ? err.message : 'Ocurrió un error inesperado.';
