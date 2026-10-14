import type { Filters as FiltersState, SortOption } from '../types/pokemon.ts';
import { capitalize } from '../utils/pokemon.ts';

interface Props {
  filters: FiltersState;
  types: string[];
  onChange: (filters: FiltersState) => void;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'id-asc', label: 'Número ↑' },
  { value: 'id-desc', label: 'Número ↓' },
  { value: 'name-asc', label: 'Nombre A–Z' },
  { value: 'stats-desc', label: 'Estadísticas totales' },
];

export default function Filters({ filters, types, onChange }: Props) {
  return (
    <section className="toolbar" aria-label="Filtros">
      <label className="field">
        <span>Filtrar cargados</span>
        <input
          type="search"
          placeholder="Nombre o número"
          autoComplete="off"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
        />
      </label>
      <label className="field">
        <span>Tipo</span>
        <select value={filters.type} onChange={(e) => onChange({ ...filters, type: e.target.value })}>
          <option value="">Todos los tipos</option>
          {types.map((type) => (
            <option key={type} value={type}>
              {capitalize(type)}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Ordenar por</span>
        <select
          value={filters.sort}
          onChange={(e) => onChange({ ...filters, sort: e.target.value as SortOption })}
        >
          {SORT_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
    </section>
  );
}
