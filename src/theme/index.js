// CONCEPT: centralized theme — colors, spacing and radius live in one place
export const colors = {
  // Accent inside the screen (buttons, spinner, bars, links)
  primary: '#1E8DB5',
  primaryDark: '#14607C',

  // Device body (Pokédex from the series)
  body: '#DC0A2D',
  bodyDark: '#8B0A1E',
  frame: '#1A1A1A',

  // Screen (inspired by a light aqua style)
  background: '#A9E4EE',
  card: 'rgba(255, 255, 255, 0.45)', // translucent white
  border: 'rgba(255, 255, 255, 0.8)',
  text: '#0F3D4C',
  textMuted: '#2F6E82',
  danger: '#B00020',
  white: '#FFFFFF',

  // Header details
  lens: '#30A7D7',
  lensShine: '#BDEBFA',
  lightRed: '#FF1C1C',
  lightYellow: '#FFDE00',
  lightGreen: '#4DAD5B',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 6,
  md: 12,
  lg: 18,
  pill: 999,
};

// One color per Pokémon type (the team chooses the palette)
export const typeColors = {
  normal: '#A8A77A',
  fire: '#EE8130',
  water: '#6390F0',
  electric: '#F7D02C',
  grass: '#7AC74C',
  ice: '#96D9D6',
  fighting: '#C22E28',
  poison: '#A33EA1',
  ground: '#E2BF65',
  flying: '#A98FF3',
  psychic: '#F95587',
  bug: '#A6B91A',
  rock: '#B6A136',
  ghost: '#735797',
  dragon: '#6F35FC',
  dark: '#705746',
  steel: '#B7B7CE',
  fairy: '#D685AD',
};