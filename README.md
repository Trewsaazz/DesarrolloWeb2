# Pokédex — React + TypeScript + Vite

Una Pokédex web que consume la [PokeAPI](https://pokeapi.co). Muestra los Pokémon en tarjetas, deja filtrarlos y ordenarlos, buscar cualquiera por nombre o número y ver su ficha con estadísticas.

## Cómo arrancarlo

Necesitas Node 20 o superior.

```bash
cd mi-app
npm install
npm run dev       # abre http://localhost:5173
```

Otros comandos:

```bash
npm run build     # comprueba tipos y genera dist/
npm run lint      # ESLint
npm run preview   # sirve el build
```

## Qué hace

- Carga los Pokémon de 24 en 24 con un botón **Cargar más**.
- Filtra lo ya cargado por nombre o número y por tipo, y lo ordena por número, nombre o estadísticas totales.
- El buscador de la cabecera consulta la API directamente, así que encuentra Pokémon que todavía no se han cargado.
- Al pulsar una tarjeta se abre una ficha con altura, peso y estadísticas base.
- **Carga:** tarjetas esqueleto mientras llega la lista y un spinner en la ficha.
- **Error:** mensajes distintos para sin conexión, tiempo agotado (10 s), Pokémon inexistente (404) y otros errores HTTP, con botón **Reintentar**.

## Estructura

```
mi-app/src/
├── api/pokeapi.ts           # fetch + async/await, timeout y errores
├── hooks/usePokemonList.ts  # paginación y estados de carga/error
├── utils/pokemon.ts         # funciones puras: filtrar, ordenar, formatear
├── types/pokemon.ts         # tipos compartidos
├── components/              # Saludo, Boton, PokemonGrid, PokemonCard, PokemonDetail,
│                            # Filters, SearchForm, TypeBadge, ErrorMessage
└── App.tsx                  # une todo
```

## Decisiones

- **Capas separadas.** Solo `api/` hace peticiones de red, `utils/` son funciones puras (sin React ni red) y los componentes solo pintan. Así cada parte se puede probar y cambiar sin tocar las demás.
- **Convierto la respuesta de la API a mi propio tipo `Pokemon`.** La API devuelve objetos enormes; `toPokemon()` se queda con lo que uso (y pasa la altura y el peso a metros y kg). Si la API cambia, solo hay que tocar esa función.
- **Errores pensados para el usuario.** `fetchJSON` convierte cualquier fallo en un `ApiError` con un mensaje en castellano, de modo que la interfaz nunca muestra un error técnico.
- **Peticiones cancelables.** Cada petición recibe un `AbortSignal`. Si el componente se desmonta (o React en modo `StrictMode` ejecuta el efecto dos veces en desarrollo), la respuesta vieja se descarta y no se duplica la lista.
- **Métodos de array en lugar de bucles:** `map`, `filter`, `reduce`, `find`, `flatMap` y `toSorted`. `toSorted` en vez de `sort` porque no modifica el estado original.
- **`<dialog>` nativo para la ficha.** Ya trae el foco, el cierre con Escape y el fondo oscurecido, sin librerías.

## Uso de IA

**Herramienta:** Claude Code (modelo Claude Opus) desde la terminal, dentro del repositorio.

**Qué hice con IA:** la mayor parte del código de la Pokédex: la capa `api/`, el hook `usePokemonList`, las funciones de `utils/`, los componentes nuevos y el CSS.

**El error que cometió y cómo lo corregí:** con el primer prompt, la IA no usó mi proyecto. Vio que `mi-app` tenía cambios sin guardar y, para «no tocarlos», creó una carpeta nueva `pokedex/` con JavaScript sin React. Interpretó «renderiza en el DOM» como manipular el DOM a mano. La app funcionaba, pero no era mi proyecto, no usaba TypeScript ni mis componentes. Al principio ni la encontraba, porque buscaba los cambios dentro de `mi-app`. Le pedí que lo rehiciera dentro de `mi-app` con TSX y reutilizando mis archivos, y después borré la carpeta `pokedex/`. Lo que aprendí: hay que decir explícitamente dónde y con qué tecnología trabajar, porque la IA rellena los huecos por su cuenta.

**Cómo verifiqué lo generado:**

- `npm run build` (incluye la comprobación de tipos de TypeScript) y `npm run lint` terminan sin errores ni avisos.
- Probé las funciones de `api/` y `utils/` con un script de Node contra la PokeAPI real: carga una página de 24, el filtro por tipo y el orden por estadísticas dan el resultado esperado, buscar «noexiste» devuelve el mensaje de 404 y una petición cancelada se descarta.
- Lo usé en el navegador: cargar más páginas, filtrar, buscar un Pokémon no cargado y simular un fallo de red desde DevTools (Network → Offline) para ver el mensaje de error y el botón Reintentar.
- Leí el código antes de aceptarlo, sobre todo el hook y el manejo de errores, que es lo que más me costaría defender si no lo entendiera.

## Autopsia

**1. Pedir el detalle de cada Pokémon por separado (24 peticiones por página).**
El endpoint de lista de la PokeAPI solo devuelve nombre y URL, así que por cada página hago 1 petición para la lista y 24 más en paralelo con `Promise.all` para tener imagen, tipos y estadísticas. Es el clásico problema «N+1»: muchas peticiones, y si falla una sola, falla la página entera.
*Alternativa descartada:* la API GraphQL de PokeAPI, que permite pedir todo en una sola consulta. La descarté porque el enunciado pide `fetch` sobre una API REST pública, porque esa API está marcada como beta y porque el código con `Promise.all` es más fácil de leer y explicar. Con 24 por página la carga sigue siendo rápida.

**2. Gestionar la carga con un hook propio (`useEffect` + `AbortController`) en vez de una librería.**
`usePokemonList` controla a mano la página, los estados de carga y error, los reintentos y la cancelación. Funciona, pero es justo el tipo de código donde se cuelan errores sutiles; de hecho hubo que pensar el caso de `StrictMode`, que ejecuta el efecto dos veces en desarrollo y duplicaría la primera página si no se cancelara.
*Alternativa descartada:* TanStack Query (React Query), que resuelve caché, reintentos, paginación y cancelación de serie. La descarté porque añade una dependencia grande para una app pequeña y porque la práctica busca precisamente usar `fetch` y `async/await` directamente, no esconderlos detrás de una librería. En un proyecto real con más pantallas sí la usaría.

*Consecuencia de las dos decisiones:* el filtro de nombre solo busca entre los Pokémon ya cargados, no entre los más de 1000 que existen. Para compensarlo está el buscador de la cabecera, que consulta la API directamente.
