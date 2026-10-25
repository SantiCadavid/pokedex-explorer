// CONCEPT: API base URL constant — one place to change the server address
export const BASE_URL = 'https://pokeapi.co/api/v2';

// CONCEPT: pagination — load 20 items at a time so the phone does not freeze
export const PAGE_SIZE = 20;

// Image for the list, so we don't need to request the full detail of each Pokémon
export const ARTWORK_URL =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';

// Bigger than the API "count" (~1300), so one request brings every name for the live search
export const INDEX_LIMIT = 2000;

// Last national Pokédex number in the API. Special forms use ids from 10001,
// so they have no "previous/next" in the detail view
export const LAST_POKEMON_ID = 1025;