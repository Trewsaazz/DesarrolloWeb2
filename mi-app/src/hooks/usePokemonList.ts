import { useEffect, useState } from 'react';
import { errorMessage, getPokemonPage } from '../api/pokeapi.ts';
import type { Pokemon } from '../types/pokemon.ts';

type Status = 'loading' | 'success' | 'error';

/** Carga la lista de Pokémon por páginas y expone los estados de carga y error. */
export function usePokemonList(pageSize: number) {
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [page, setPage] = useState(0);
  const [attempt, setAttempt] = useState(0); // cambia para forzar un reintento
  const [hasMore, setHasMore] = useState(true);
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const result = await getPokemonPage(page * pageSize, pageSize, controller.signal);
        setPokemon((prev) => [...prev, ...result.pokemon]);
        setHasMore(result.hasMore);
        setStatus('success');
      } catch (err) {
        // Si el efecto se limpió (desmontaje o StrictMode) ignoramos el resultado.
        if (controller.signal.aborted) return;
        setError(errorMessage(err));
        setStatus('error');
      }
    }

    load();
    return () => controller.abort();
  }, [page, pageSize, attempt]);

  const loadMore = () => {
    setStatus('loading');
    setPage((p) => p + 1);
  };

  const retry = () => {
    setError(null);
    setStatus('loading');
    setAttempt((a) => a + 1);
  };

  return { pokemon, status, error, hasMore, loadMore, retry };
}
