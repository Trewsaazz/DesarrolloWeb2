import { useState } from "react";
import "./App.css";
import Boton from "./components/Button.tsx";
import ErrorMessage from "./components/ErrorMessage.tsx";
import Filters from "./components/Filters.tsx";
import PokemonDetail from "./components/PokemonDetail.tsx";
import PokemonGrid from "./components/PokemonGrid.tsx";
import Saludo from "./components/Saludo.tsx";
import SearchForm from "./components/SearchForm.tsx";
import { usePokemonList } from "./hooks/usePokemonList.ts";
import type { Filters as FiltersState } from "./types/pokemon.ts";
import { applyFilters, uniqueTypes } from "./utils/pokemon.ts";

const PAGE_SIZE = 24;

export default function App(){
  const { pokemon, status, error, hasMore, loadMore, retry } = usePokemonList(PAGE_SIZE);
  const [filters, setFilters] = useState<FiltersState>({ search: "", type: "", sort: "id-asc" });
  const [selected, setSelected] = useState<string | null>(null); // nombre o número

  const visible = applyFilters(pokemon, filters);
  const cached = pokemon.find((p) => p.name === selected || String(p.id) === selected);
  const loading = status === "loading";

  return(
    <>
      <header className="topbar">
        <div className="container topbar__inner">
          <div>
            <h1 className="logo">Pokédex</h1>
            <Saludo nombre = "Trew" apellido= "el papa"/>
          </div>
          <SearchForm onSearch={setSelected} />
        </div>
      </header>

      <main className="container">
        <Filters filters={filters} types={uniqueTypes(pokemon)} onChange={setFilters} />

        <p className="status" aria-live="polite">
          {loading
            ? "Cargando Pokémon…"
            : `Mostrando ${visible.length} de ${pokemon.length} Pokémon cargados`}
        </p>

        {(pokemon.length > 0 || loading) && (
          <PokemonGrid
            pokemon={visible}
            loading={loading}
            skeletons={PAGE_SIZE}
            onSelect={(id) => setSelected(String(id))}
          />
        )}

        {status === "error" && error && <ErrorMessage message={error} onRetry={retry} />}

        {status === "success" && hasMore && (
          <div className="more">
            <Boton className="boton--grande" onClick={loadMore}>
              Cargar más
            </Boton>
          </div>
        )}
      </main>

      <footer className="footer">
        Datos de <a href="https://pokeapi.co" target="_blank" rel="noopener">PokeAPI</a>
      </footer>

      {selected && (
        <PokemonDetail
          key={selected}
          query={selected}
          cached={cached}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )
}
