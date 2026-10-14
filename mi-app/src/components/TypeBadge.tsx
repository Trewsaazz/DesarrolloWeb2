import { accentStyle, capitalize } from '../utils/pokemon.ts';

export default function TypeBadge({ type }: { type: string }) {
  return (
    <span className="type" style={accentStyle(type)}>
      {capitalize(type)}
    </span>
  );
}
