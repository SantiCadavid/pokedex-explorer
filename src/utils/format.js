const NO_DATA = 'Sin dato';

// 25 -> "#025". Without a valid number -> "#???" (never "#undefined")
export const formatId = (id) =>
  Number.isInteger(id) && id > 0 ? `#${String(id).padStart(3, '0')}` : '#???';

// "pikachu" -> "Pikachu". Without a valid text -> "Desconocido" (never crashes)
export const capitalize = (text) => {
  if (typeof text !== 'string' || text.trim() === '') return 'Desconocido';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

// 0.4 -> "0,4 m". Without a valid number -> "Sin dato" (never "NaN m")
export const formatMeasure = (value, unit) =>
  Number.isFinite(value) ? `${value.toFixed(1).replace('.', ',')} ${unit}` : NO_DATA;

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

// If a name is missing from the dictionaries, show the original text (or "Desconocido")
export const translateType = (name) => typeNames[name] || capitalize(name);
export const translateStat = (name) => statNames[name] || capitalize(name);