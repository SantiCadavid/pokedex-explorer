import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import PokedexHeader from './src/components/PokedexHeader';
import ListScreen from './src/screens/ListScreen';
import DetailScreen from './src/screens/DetailScreen';
import { colors, spacing, radius } from './src/theme';

export default function App() {
  // CONCEPT: navigation with state — null shows the list, an id shows the detail
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const isDetailOpen = selectedPokemon !== null;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.body}>
        <StatusBar style="light" />

        {/* Shared header: it is the "PokéDex Explorer" title of both views */}
        <PokedexHeader />

        {/* The framed "screen" of the device */}
        <View style={styles.screen}>
          {/* The list stays mounted (only hidden) so it keeps its data, search and scroll */}
          <View style={[styles.fill, isDetailOpen && styles.hidden]}>
            <ListScreen onSelectPokemon={setSelectedPokemon} />
          </View>

          {isDetailOpen && (
            <DetailScreen
              pokemonId={selectedPokemon}
              onBack={() => setSelectedPokemon(null)}
            />
          )}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: colors.body,
  },
  screen: {
    flex: 1,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.background,
    borderWidth: 4,
    borderColor: colors.frame,
    borderRadius: radius.lg,
    overflow: 'hidden', // the lists stay inside the rounded frame
  },
  fill: {
    flex: 1,
  },
  hidden: {
    display: 'none',
  },
});