import { View, TextInput, Pressable, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../theme';

// Only receives props: the screen decides what happens when searching
export default function SearchBar({ value, onChangeText, onSearch }) {
  // CONCEPT: autoCapitalize="none" and autoCorrect={false} — the API needs exact lowercase names
  return (
    <View style={styles.row}>
      <TextInput
        style={styles.input}
        placeholder="Busca por nombre o número..."
        placeholderTextColor={colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSearch}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Pressable style={styles.button} onPress={onSearch}>
        <Text style={styles.buttonText}>Buscar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    height: 44,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    color: colors.text,
  },
  button: {
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
  },
  buttonText: {
    color: colors.white,
    fontWeight: 'bold',
  },
});