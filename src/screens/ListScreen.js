import { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { fetchPokemonList } from '../services/pokemonService';
import PokemonCard from '../components/PokemonCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { colors, spacing } from '../theme';

export default function ListScreen({ onSelectPokemon }) {
  const [pokemons, setPokemons] = useState([]);
  const [offset, setOffset] = useState(0); // where the next page starts
  const [hasMore, setHasMore] = useState(true); // false when "next" is null
  const [loading, setLoading] = useState(true); // first page
  const [loadingMore, setLoadingMore] = useState(false); // next pages
  const [error, setError] = useState(null);
  // Changing this number runs the useEffect again (used by "Reintentar")
  const [reloadKey, setReloadKey] = useState(0);

  // CONCEPT: useEffect dependency array — a new request only when offset or reloadKey change
  useEffect(() => {
    const controller = new AbortController();
    const isFirstPage = offset === 0;

    const loadPage = async () => {
      if (isFirstPage) setLoading(true);
      else setLoadingMore(true);
      setError(null);

      try {
        const result = await fetchPokemonList(offset, controller.signal);
        // The first page replaces the list; the next ones are added at the end
        setPokemons((prev) =>
          isFirstPage ? result.results : [...prev, ...result.results]
        );
        setHasMore(result.hasMore);
      } catch (err) {
        // CONCEPT: a cancelled request (AbortError) is not a real error
        if (err.name !== 'AbortError') {
          setError('No se pudo cargar la lista de Pokémon. Revisa tu internet.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    };

    loadPage();
    // CONCEPT: cleanup — cancel the request if the screen unmounts
    return () => controller.abort();
  }, [offset, reloadKey]);

  // CONCEPT: infinite scroll — onEndReached can fire several times in a row,
  // so we block it while loading, after an error, or when there are no more pages
  const handleLoadMore = () => {
    if (loading || loadingMore || !hasMore || error) return;
    // Using the list length (not offset + 20) means repeated calls ask for the same page
    setOffset(pokemons.length);
  };

  const handleRetry = () => setReloadKey((prev) => prev + 1);

  // Shown at the end of the list
  const renderFooter = () => {
    if (loadingMore) return <LoadingState message="Cargando más Pokémon..." />;
    if (error) return <ErrorState message={error} onRetry={handleRetry} />;
    if (!hasMore) return <Text style={styles.endText}>No hay más Pokémon.</Text>;
    return null;
  };

  // CONCEPT: interface states — loading, error, success
  let content;
  if (loading) {
    content = <LoadingState message="Cargando Pokémon..." />;
  } else if (error && pokemons.length === 0) {
    // Error on the first page: nothing to show yet
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
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5} // start loading when half a screen is left
        ListFooterComponent={renderFooter}
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
  endText: {
    textAlign: 'center',
    color: colors.textMuted,
    padding: spacing.lg,
  },
});