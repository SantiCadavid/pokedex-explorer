import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import ListScreen from './src/screens/ListScreen';
import DetailScreen from './src/screens/DetailScreen';
import { colors } from './src/theme';

export default function App() {
  // CONCEPT: navigation with state — null shows the list, an id shows the detail
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const isDetailOpen = selectedPokemon !== null;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />

        {/* The list stays mounted (only hidden) so it keeps its data, search and scroll */}
        <View style={[styles.container, isDetailOpen && styles.hidden]}>
          <ListScreen onSelectPokemon={setSelectedPokemon} />
        </View>

        {isDetailOpen && (
          <DetailScreen
            pokemonId={selectedPokemon}
            onBack={() => setSelectedPokemon(null)}
          />
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
});