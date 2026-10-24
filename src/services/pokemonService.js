import { BASE_URL, PAGE_SIZE, ARTWORK_URL } from '../config/api';

// The list only gives "name" and "url". The id is the last number of the url:
// ".../pokemon/25/" -> 25
const getIdFromUrl = (url) => {
  const parts = url.split('/').filter(Boolean); // remove empty pieces
  return Number(parts[parts.length - 1]);
};

// CONCEPT: async function + AbortController signal — the screen can cancel the request
export const fetchPokemonList = async (offset, signal) => {
  // CONCEPT: URL built in a separate variable (as taught in class)
  const url = `${BASE_URL}/pokemon?limit=${PAGE_SIZE}&offset=${offset}`;

  const response = await fetch(url, { signal });

  // CONCEPT: check response.ok BEFORE response.json()
  if (!response.ok) {
    throw new Error(`Error HTTP ${response.status}`);
  }

  const data = await response.json();

  // CONCEPT: mapping — return only what the app uses
  const results = data.results.map((item) => {
    const id = getIdFromUrl(item.url);
    return { id, name: item.name, image: `${ARTWORK_URL}/${id}.png` };
  });

  // "next" is null when there are no more pages
  return { results, hasMore: data.next !== null };
};

export const fetchPokemonDetail = async (query, signal) => {
  // Normalize: no spaces at the ends, lowercase
  let search = String(query).trim().toLowerCase();

  // CONCEPT: encodeURIComponent only for text; numeric ids are NOT encoded
  if (/^\d+$/.test(search)) {
    search = String(Number(search)); // "025" -> "25"
  } else {
    search = encodeURIComponent(search);
  }

  const url = `${BASE_URL}/pokemon/${search}`;
  const response = await fetch(url, { signal });

  // CONCEPT: HTTP status codes — a missing name returns 404 with plain text, not JSON
  if (!response.ok) {
    const error = new Error(`Error HTTP ${response.status}`);
    error.status = response.status; // the screen uses it to tell "not found" from other errors
    throw error;
  }

  const data = await response.json();

  return {
    id: data.id,
    name: data.name,
    height: data.height / 10, // decimeters -> meters
    weight: data.weight / 10, // hectograms -> kilograms
    image:
      data.sprites.other['official-artwork'].front_default ||
      `${ARTWORK_URL}/${data.id}.png`,
    types: data.types.map((item) => item.type.name),
    stats: data.stats.map((item) => ({
      name: item.stat.name,
      value: item.base_stat,
    })),
  };
};