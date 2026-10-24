import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius, typeColors } from '../theme';
import { translateType } from '../utils/format';

// One badge per type, each with its own color from the theme
export default function TypeBadge({ type }) {
  const backgroundColor = typeColors[type] || colors.textMuted;

  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <Text style={styles.text}>{translateType(type)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    marginHorizontal: spacing.xs,
  },
  text: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 14,
    // light colors (electric, ice) stay readable with a soft shadow
    textShadowColor: 'rgba(0, 0, 0, 0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});