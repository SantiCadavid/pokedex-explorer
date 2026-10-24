// Returns true if the Pokémon name or number STARTS WITH the typed text.
// "term" arrives already normalized (trim + lowercase).
export const matchesSearch = (pokemon, term) => {
  if (/^\d+$/.test(term)) {
    // Number: "025" -> "25", then compare with the start of the id
    return String(pokemon.id).startsWith(String(Number(term)));
  }
  // Name: API names are always lowercase
  return pokemon.name.startsWith(term);
};