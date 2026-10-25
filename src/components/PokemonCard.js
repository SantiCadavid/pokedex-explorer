import { useState } from 'react';
import { View, Pressable, Image, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../theme';
import { formatId, capitalize } from '../utils/format';

// The card only receives props: it does not know the API
export default function PokemonCard({ pokemon, onPress }) {
  // If the image URL is missing or fails, show a placeholder instead of an empty hole
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(pokemon?.image) && !imageFailed;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
    >
      {showImage ? (
        // CONCEPT: a remote Image needs explicit width and height or it is not visible
        <Image
          source={{ uri: pokemon.image }}
          style={styles.image}
          onError={() => setImageFailed(true)}
        />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <Text style={styles.placeholderText}>?</Text>
        </View>
      )}
      <Text style={styles.number}>{formatId(pokemon?.id)}</Text>
      <Text style={styles.name}>{capitalize(pokemon?.name)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1, // each card takes half of the row
    maxWidth: '50%', // a single card (search result) does not stretch to full width
    margin: spacing.xs,
    padding: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.7,
  },
  image: {
    width: 96,
    height: 96,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
  },
  placeholderText: {
    color: colors.textMuted,
    fontSize: 36,
    fontWeight: 'bold',
  },
  number: {
    marginTop: spacing.sm,
    color: colors.primaryDark,
    fontSize: 18,
    fontWeight: 'bold',
  },
  name: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
});