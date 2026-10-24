// CONCEPT: API base URL constant — one place to change the server address
export const BASE_URL = 'https://pokeapi.co/api/v2';

// CONCEPT: pagination — load 20 items at a time so the phone does not freeze
export const PAGE_SIZE = 20;

// Image for the list, so we don't need to request the full detail of each Pokémon
export const ARTWORK_URL =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';