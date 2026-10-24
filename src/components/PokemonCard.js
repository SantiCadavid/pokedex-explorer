import { Pressable, Image, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../theme';
import { formatId, capitalize } from '../utils/format';

// The card only receives props: it does not know the API
export default function PokemonCard({ pokemon, onPress }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
    >
      {/* CONCEPT: a remote Image needs explicit width and height or it is not visible */}
      <Image source={{ uri: pokemon.image }} style={styles.image} />
      <Text style={styles.number}>{formatId(pokemon.id)}</Text>
      <Text style={styles.name}>{capitalize(pokemon.name)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1, // each card takes half of the row
    margin: spacing.xs,
    padding: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.7,
  },
  image: {
    width: 96,
    height: 96,
  },
  number: {
    marginTop: spacing.sm,
    color: colors.textMuted,
    fontSize: 13,
  },
  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
});