import { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { fetchPokemonList } from '../services/pokemonService';
import PokemonCard from '../components/PokemonCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { colors, spacing } from '../theme';

export default function ListScreen({ onSelectPokemon }) {
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Changing this number runs the useEffect again (used by "Reintentar")
  const [reloadKey, setReloadKey] = useState(0);

  // CONCEPT: useEffect dependency array — runs on mount and only when reloadKey changes
  useEffect(() => {
    const controller = new AbortController();

    const loadPokemons = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchPokemonList(0, controller.signal);
        setPokemons(result.results);
      } catch (err) {
        // CONCEPT: a cancelled request (AbortError) is not a real error
        if (err.name !== 'AbortError') {
          setError('No se pudo cargar la lista de Pokémon. Revisa tu internet.');
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadPokemons();
    // CONCEPT: cleanup — cancel the request if the screen unmounts
    return () => controller.abort();
  }, [reloadKey]);

  const handleRetry = () => setReloadKey((prev) => prev + 1);

  // CONCEPT: interface states — loading, error, success
  let content;
  if (loading) {
    content = <LoadingState message="Cargando Pokémon..." />;
  } else if (error) {
    content = <ErrorState message={error} onRetry={handleRetry} />;
  } else {
    content = (
      // CONCEPT: FlatList renders only what is on screen (better than ScrollView + map)
      <FlatList
        data={pokemons}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        renderItem={({ item }) => (
          <PokemonCard pokemon={item} onPress={() => onSelectPokemon(item.id)} />
        )}
        contentContainerStyle={styles.list}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PokéDex Explorer</Text>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  list: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.lg,
  },
});