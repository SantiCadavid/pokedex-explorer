import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';

// CONCEPT: empty state — the request worked, but there is nothing to show
export default function EmptyState({ message = 'No se encontraron resultados.' }) {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  message: {
    color: colors.textMuted,
    fontSize: 16,
    textAlign: 'center',
  },
});