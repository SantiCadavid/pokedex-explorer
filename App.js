import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import ListScreen from './src/screens/ListScreen';
import { colors, spacing } from './src/theme';

export default function App() {
  // CONCEPT: navigation with state — null shows the list, an id shows the detail
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const isDetailOpen = selectedPokemon !== null;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />

        {/* The list stays mounted (only hidden) so it keeps its data and scroll */}
        <View style={[styles.container, isDetailOpen && styles.hidden]}>
          <ListScreen onSelectPokemon={setSelectedPokemon} />
        </View>

        {/* Temporary view until DetailScreen is built in step 7 */}
        {isDetailOpen && (
          <View style={styles.placeholder}>
            <Text>Pokémon seleccionado: {selectedPokemon}</Text>
            <Pressable onPress={() => setSelectedPokemon(null)}>
              <Text style={styles.back}>Volver a la lista</Text>
            </Pressable>
          </View>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hidden: {
    display: 'none',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  back: {
    marginTop: spacing.md,
    color: colors.primary,
    fontWeight: 'bold',
  },
});