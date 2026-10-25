import { BASE_URL, PAGE_SIZE, ARTWORK_URL, INDEX_LIMIT } from '../config/api';

// After 10 s without an answer, show an error instead of loading forever
const REQUEST_TIMEOUT_MS = 10000;

// Error with a "kind" (http, timeout, data) so the screens can show the right message
const createError = (kind, message, status) => {
  const error = new Error(message);
  error.kind = kind;
  if (status) error.status = status;
  return error;
};

// CONCEPT: one helper for every request — timeout, response.ok and JSON in one place
const requestJson = async (url, signal) => {
  // Own controller: it is aborted by the timer OR when the screen cancels
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const cancelFromScreen = () => controller.abort();
  signal?.addEventListener('abort', cancelFromScreen);
  if (signal?.aborted) controller.abort();

  try {
    // CONCEPT: fetch with a cancel signal (AbortController)
    const response = await fetch(url, { signal: controller.signal });

    // CONCEPT: check response.ok BEFORE response.json() (a 404 answers plain text, not JSON)
    if (!response.ok) {
      throw createError('http', `Error HTTP ${response.status}`, response.status);
    }

    try {
      return await response.json();
    } catch (parseError) {
      throw createError('data', 'La respuesta no es JSON válido');
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      // Cancelled by the screen: keep it as AbortError (the screen ignores it)
      if (signal?.aborted) throw err;
      // Cancelled by our timer: it is a timeout
      throw createError('timeout', 'Tiempo de espera agotado');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener('abort', cancelFromScreen);
  }
};

// The list only gives "name" and "url". The id is the last number of the url:
// ".../pokemon/25/" -> 25. Invalid url -> null
const getIdFromUrl = (url) => {
  if (typeof url !== 'string') return null;
  const parts = url.split('/').filter(Boolean); // remove empty pieces
  const id = Number(parts[parts.length - 1]);
  return Number.isInteger(id) && id > 0 ? id : null;
};

// CONCEPT: mapping — return only what the app uses, with safe values (never undefined)
const mapListItem = (item) => {
  const id = getIdFromUrl(item?.url);
  return {
    id,
    name: typeof item?.name === 'string' ? item.name : null,
    image: id ? `${ARTWORK_URL}/${id}.png` : null,
  };
};

// Validates the array and drops items without id (they cannot be shown, opened or used as keys)
const mapList = (results) => {
  if (!Array.isArray(results)) {
    throw createError('data', 'La respuesta no trae la lista de resultados');
  }
  return results.map(mapListItem).filter((pokemon) => pokemon.id !== null);
};

// CONCEPT: defensive mapping — every missing field becomes null or [] instead of crashing the UI
const mapDetail = (data) => {
  if (!data || typeof data !== 'object') {
    throw createError('data', 'La ficha llegó vacía');
  }

  const id = Number.isInteger(data.id) ? data.id : null;
  const name = typeof data.name === 'string' ? data.name : null;
  // Without id and name there is nothing reliable to show
  if (id === null && name === null) {
    throw createError('data', 'La ficha no trae id ni nombre');
  }

  return {
    id,
    name,
    height: Number.isFinite(data.height) ? data.height / 10 : null, // decimeters -> meters
    weight: Number.isFinite(data.weight) ? data.weight / 10 : null, // hectograms -> kilograms
    image:
      data.sprites?.other?.['official-artwork']?.front_default ||
      (id ? `${ARTWORK_URL}/${id}.png` : null),
    types: Array.isArray(data.types)
      ? data.types.map((item) => item?.type?.name).filter((type) => typeof type === 'string')
      : [],
    stats: Array.isArray(data.stats)
      ? data.stats
          .filter((item) => typeof item?.stat?.name === 'string' && Number.isFinite(item?.base_stat))
          .map((item) => ({ name: item.stat.name, value: item.base_stat }))
      : [],
  };
};

// CONCEPT: async function + AbortController signal — the screen can cancel the request
export const fetchPokemonList = async (offset, signal) => {
  // CONCEPT: URL built in a separate variable (as taught in class)
  const url = `${BASE_URL}/pokemon?limit=${PAGE_SIZE}&offset=${offset}`;
  const data = await requestJson(url, signal);

  // "next" is null (or missing) when there are no more pages
  return { results: mapList(data?.results), hasMore: Boolean(data?.next) };
};

// CONCEPT: one request for every name (only name + url, very light),
// so the live search filters on the phone instead of calling the API on each letter
export const fetchPokemonIndex = async (signal) => {
  const url = `${BASE_URL}/pokemon?limit=${INDEX_LIMIT}`;
  const data = await requestJson(url, signal);
  return mapList(data?.results);
};

export const fetchPokemonDetail = async (query, signal) => {
  // Normalize: no spaces at the ends, lowercase. Missing query -> empty text
  let search = String(query ?? '').trim().toLowerCase();

  // Nothing to ask for: treat it as "not found" instead of calling /pokemon/
  if (search === '') {
    throw createError('http', 'Búsqueda vacía', 404);
  }

  // CONCEPT: encodeURIComponent only for text; numeric ids are NOT encoded
  if (/^\d+$/.test(search)) {
    search = String(Number(search)); // "025" -> "25"
  } else {
    search = encodeURIComponent(search);
  }

  const url = `${BASE_URL}/pokemon/${search}`;
  const data = await requestJson(url, signal);
  return mapDetail(data);
};