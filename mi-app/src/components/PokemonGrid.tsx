import type { Pokemon } from '../types/pokemon.ts';
import PokemonCard from './PokemonCard.tsx';

interface Props {
  pokemon: Pokemon[];
  loading: boolean;
  skeletons: number;
  onSelect: (id: number) => void;
}

export default function PokemonGrid({ pokemon, loading, skeletons, onSelect }: Props) {
  if (!loading && pokemon.length === 0) {
    return <p className="empty">Ningún Pokémon cargado coincide con los filtros.</p>;
  }

  return (
    <div className="grid" aria-busy={loading}>
      {pokemon.map((p) => (
        <PokemonCard key={p.id} pokemon={p} onSelect={onSelect} />
      ))}
      {loading &&
        Array.from({ length: skeletons }, (_, i) => (
          <div key={`skeleton-${i}`} className="card card--skeleton" aria-hidden="true" />
        ))}
    </div>
  );
}
