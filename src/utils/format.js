// 25 -> "#025"
export const formatId = (id) => `#${String(id).padStart(3, '0')}`;

// "pikachu" -> "Pikachu"
export const capitalize = (text) =>
  text.charAt(0).toUpperCase() + text.slice(1);

// The API gives English names; the interface must be in Spanish
export const typeNames = {
  normal: 'Normal',
  fire: 'Fuego',
  water: 'Agua',
  electric: 'Eléctrico',
  grass: 'Planta',
  ice: 'Hielo',
  fighting: 'Lucha',
  poison: 'Veneno',
  ground: 'Tierra',
  flying: 'Volador',
  psychic: 'Psíquico',
  bug: 'Bicho',
  rock: 'Roca',
  ghost: 'Fantasma',
  dragon: 'Dragón',
  dark: 'Siniestro',
  steel: 'Acero',
  fairy: 'Hada',
};

export const statNames = {
  hp: 'PS',
  attack: 'Ataque',
  defense: 'Defensa',
  'special-attack': 'At. Especial',
  'special-defense': 'Def. Especial',
  speed: 'Velocidad',
};

// If a name is missing from the dictionaries, show the original text
export const translateType = (name) => typeNames[name] || capitalize(name);
export const translateStat = (name) => statNames[name] || capitalize(name);