export interface PokemonStat {
  name: string;
  value: number;
}

export interface Pokemon {
  id: number;
  name: string;
  image: string;
  types: string[];
  height: number; // metros
  weight: number; // kg
  stats: PokemonStat[];
}

export interface Filters {
  search: string;
  type: string;
  sort: SortOption;
}

export type SortOption = 'id-asc' | 'id-desc' | 'name-asc' | 'stats-desc';
