// Returns true if the Pokémon name or number STARTS WITH the typed text.
// "term" arrives already normalized (trim + lowercase, without "#").
// Incomplete items never crash the search: they just do not match.
export const matchesSearch = (pokemon, term) => {
  if (!pokemon) return false;

  if (/^\d+$/.test(term)) {
    // Number: "025" -> "25", then compare with the start of the id
    return Number.isInteger(pokemon.id) && String(pokemon.id).startsWith(String(Number(term)));
  }
  // Name: API names are always lowercase
  return typeof pokemon.name === 'string' && pokemon.name.startsWith(term);
};