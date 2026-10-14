import { useEffect, useRef, useState } from 'react';
import { errorMessage, getPokemon } from '../api/pokeapi.ts';
import type { Pokemon } from '../types/pokemon.ts';
import { accentStyle, capitalize, formatId, statLabel, totalStats } from '../utils/pokemon.ts';
import ErrorMessage from './ErrorMessage.tsx';
import TypeBadge from './TypeBadge.tsx';

const MAX_STAT = 255;

interface Props {
  query: string;
  /** Pokémon ya cargado, si existe; evita repetir la petición. */
  cached?: Pokemon;
  onClose: () => void;
}

type Result =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; pokemon: Pokemon };

/** Diálogo modal con el detalle. Se monta con key={query} para reiniciar el estado. */
export default function PokemonDetail({ query, cached, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [result, setResult] = useState<Result>(
    cached ? { status: 'success', pokemon: cached } : { status: 'loading' },
  );
  const needsFetch = !cached;

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  useEffect(() => {
    if (!needsFetch) return;
    const controller = new AbortController();

    async function load() {
      try {
        const pokemon = await getPokemon(query, controller.signal);
        setResult({ status: 'success', pokemon });
      } catch (err) {
        if (!controller.signal.aborted) setResult({ status: 'error', message: errorMessage(err) });
      }
    }

    load();
    return () => controller.abort();
  }, [query, needsFetch]);

  return (
    <dialog
      ref={dialogRef}
      className="detail"
      aria-label="Detalle del Pokémon"
      onClose={onClose}
      // Cerrar al hacer clic en el fondo (fuera del contenido)
      onClick={(e) => e.target === e.currentTarget && dialogRef.current?.close()}
    >
      <button
        type="button"
        className="detail__close"
        aria-label="Cerrar"
        onClick={() => dialogRef.current?.close()}
      >
        ×
      </button>

      {result.status === 'loading' && (
        <div className="detail__status">
          <div className="spinner" />
          <p>Buscando…</p>
        </div>
      )}

      {result.status === 'error' && (
        <div className="detail__status">
          <ErrorMessage title="No se pudo cargar" message={result.message} />
        </div>
      )}

      {result.status === 'success' && <DetailContent pokemon={result.pokemon} />}
    </dialog>
  );
}

function DetailContent({ pokemon }: { pokemon: Pokemon }) {
  const facts = [
    { label: 'Altura', value: `${pokemon.height} m` },
    { label: 'Peso', value: `${pokemon.weight} kg` },
    { label: 'Total', value: totalStats(pokemon) },
  ];

  return (
    <>
      <header className="detail__header" style={accentStyle(pokemon.types[0])}>
        <img
          className="detail__img"
          src={pokemon.image}
          alt={capitalize(pokemon.name)}
          width={200}
          height={200}
        />
        <span className="card__id">{formatId(pokemon.id)}</span>
        <h2 className="detail__name">{capitalize(pokemon.name)}</h2>
        <div className="types">
          {pokemon.types.map((type) => (
            <TypeBadge key={type} type={type} />
          ))}
        </div>
      </header>

      <div className="detail__body">
        <dl className="detail__facts">
          {facts.map(({ label, value }) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>

        <h3 className="detail__subtitle">Estadísticas base</h3>
        <ul className="stats">
          {pokemon.stats.map(({ name, value }) => (
            <li key={name} className="stat">
              <span className="stat__label">{statLabel(name)}</span>
              <span className="stat__value">{value}</span>
              <span className="stat__bar">
                <span style={{ width: `${(value / MAX_STAT) * 100}%` }} />
              </span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
