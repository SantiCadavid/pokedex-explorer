import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../theme';

// CONCEPT: error state — clear message in Spanish + a way to try again
export default function ErrorState({
  message = 'No se pudo conectar con la API. Revisa tu internet.',
  onRetry,
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
      <Pressable style={styles.button} onPress={onRetry}>
        <Text style={styles.buttonText}>Reintentar</Text>
      </Pressable>
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
    color: colors.danger,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  buttonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 15,
  },
});