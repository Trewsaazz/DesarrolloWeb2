// Funciones puras para filtrar, ordenar y formatear datos. No tocan el DOM ni la red.
import type { CSSProperties } from 'react';
import type { Filters, Pokemon, SortOption } from '../types/pokemon.ts';

export const formatId = (id: number) => `#${String(id).padStart(4, '0')}`;

export const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

const STAT_LABELS: Record<string, string> = {
  hp: 'PS',
  attack: 'Ataque',
  defense: 'Defensa',
  'special-attack': 'At. Esp.',
  'special-defense': 'Def. Esp.',
  speed: 'Velocidad',
};

export const statLabel = (name: string) => STAT_LABELS[name] ?? name;

/** Suma de las estadísticas base de un Pokémon. */
export const totalStats = (pokemon: Pokemon) =>
  pokemon.stats.reduce((sum, stat) => sum + stat.value, 0);

/** Lista ordenada y sin duplicados de todos los tipos presentes. */
export const uniqueTypes = (list: Pokemon[]) =>
  [...new Set(list.flatMap((p) => p.types))].sort((a, b) => a.localeCompare(b));

const SORTERS: Record<SortOption, (a: Pokemon, b: Pokemon) => number> = {
  'id-asc': (a, b) => a.id - b.id,
  'id-desc': (a, b) => b.id - a.id,
  'name-asc': (a, b) => a.name.localeCompare(b.name),
  'stats-desc': (a, b) => totalStats(b) - totalStats(a),
};

/** Aplica búsqueda por texto, filtro por tipo y orden, sin mutar la lista original. */
export function applyFilters(list: Pokemon[], { search, type, sort }: Filters) {
  const term = search.trim().toLowerCase();

  return list
    .filter((p) => !term || p.name.includes(term) || String(p.id) === term)
    .filter((p) => !type || p.types.includes(type))
    .toSorted(SORTERS[sort]);
}

/** Estilo inline que expone el color de un tipo como la variable CSS --accent. */
export const accentStyle = (type: string) =>
  ({ '--accent': `var(--type-${type}, var(--type-normal))` }) as CSSProperties;
