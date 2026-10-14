import { useState, type FormEvent } from 'react';
import Boton from './Button.tsx';

/** Busca directamente en la API cualquier Pokémon por nombre o número. */
export default function SearchForm({ onSearch }: { onSearch: (query: string) => void }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const value = query.trim().toLowerCase();
    if (!value) return;
    onSearch(value);
    setQuery('');
  };

  return (
    <form className="lookup" role="search" onSubmit={handleSubmit}>
      <label htmlFor="lookup-query" className="sr-only">
        Buscar en la PokeAPI por nombre o número
      </label>
      <input
        id="lookup-query"
        type="search"
        placeholder="Buscar en la API: pikachu, 25…"
        autoComplete="off"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <Boton type="submit" variante="oscuro">
        Buscar
      </Boton>
    </form>
  );
}
