import type { Pokemon } from '../types/pokemon.ts';
import { accentStyle, capitalize, formatId } from '../utils/pokemon.ts';
import TypeBadge from './TypeBadge.tsx';

interface Props {
  pokemon: Pokemon;
  onSelect: (id: number) => void;
}

export default function PokemonCard({ pokemon, onSelect }: Props) {
  return (
    <button
      type="button"
      className="card"
      style={accentStyle(pokemon.types[0])}
      onClick={() => onSelect(pokemon.id)}
      aria-label={`Ver detalles de ${capitalize(pokemon.name)}`}
    >
      <span className="card__id">{formatId(pokemon.id)}</span>
      <img className="card__img" src={pokemon.image} alt="" loading="lazy" width={120} height={120} />
      <h2 className="card__name">{capitalize(pokemon.name)}</h2>
      <div className="types">
        {pokemon.types.map((type) => (
          <TypeBadge key={type} type={type} />
        ))}
      </div>
    </button>
  );
}
