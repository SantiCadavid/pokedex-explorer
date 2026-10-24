import { useState, useEffect, useRef } from 'react';
import { Text, FlatList, Pressable, Keyboard, StyleSheet } from 'react-native';
import { fetchPokemonList, fetchPokemonIndex } from '../services/pokemonService';
import { matchesSearch } from '../utils/search';
import PokemonCard from '../components/PokemonCard';
import SearchBar from '../components/SearchBar';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { colors, spacing, radius } from '../theme';

// After this many pixels scrolled down, the "back to top" button appears (~5 rows)
const SCROLL_TOP_THRESHOLD = 800;

export default function ListScreen({ onSelectPokemon }) {
  // ---------- Paginated list ----------
  const [pokemons, setPokemons] = useState([]);
  const [offset, setOffset] = useState(0); // where the next page starts
  const [hasMore, setHasMore] = useState(true); // false when "next" is null
  const [loading, setLoading] = useState(true); // first page
  const [loadingMore, setLoadingMore] = useState(false); // next pages
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0); // "Reintentar" for the list

  // ---------- Live search ----------
  const [searchText, setSearchText] = useState(''); // what the user types
  const [allPokemons, setAllPokemons] = useState([]); // index: every name + id
  const [indexLoading, setIndexLoading] = useState(true);
  const [indexError, setIndexError] = useState(null);
  const [indexKey, setIndexKey] = useState(0); // "Reintentar" for the index

  // ---------- Back to top ----------
  // CONCEPT: useRef — a direct reference to the FlatList to call its methods (scrollToOffset).
  // Changing a ref does NOT re-render the screen
  const listRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // CONCEPT: useEffect dependency array — a new page only when offset or reloadKey change
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

  // CONCEPT: useEffect dependency array — the index is requested once (and again only on retry)
  useEffect(() => {
    const controller = new AbortController();

    const loadIndex = async () => {
      setIndexLoading(true);
      setIndexError(null);
      try {
        const result = await fetchPokemonIndex(controller.signal);
        setAllPokemons(result);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setIndexError('No se pudo preparar la búsqueda. Revisa tu internet.');
        }
      } finally {
        if (!controller.signal.aborted) setIndexLoading(false);
      }
    };

    loadIndex();
    return () => controller.abort();
  }, [indexKey]);

  // Ignore uppercase and spaces at the start or end
  const searchTerm = searchText.trim().toLowerCase();
  const isSearchActive = searchTerm !== '';

  // CONCEPT: derived data — results are calculated on every keystroke from searchText,
  // filtering on the phone, so typing does NOT send requests to the API
  const searchResults = isSearchActive
    ? allPokemons.filter((pokemon) => matchesSearch(pokemon, searchTerm))
    : [];

  // CONCEPT: infinite scroll — onEndReached can fire several times in a row,
  // so we block it while loading, after an error, with no more pages, or during a search
  const handleLoadMore = () => {
    if (isSearchActive || loading || loadingMore || !hasMore || error) return;
    // Using the list length (not offset + 20) means repeated calls ask for the same page
    setOffset(pokemons.length);
  };

  const handleRetry = () => setReloadKey((prev) => prev + 1);
  const handleIndexRetry = () => setIndexKey((prev) => prev + 1);

  const handleClearSearch = () => {
    setSearchText('');
    Keyboard.dismiss();
  };

  // Results already appear while typing; the button only hides the keyboard
  const handleSearch = () => Keyboard.dismiss();

  // Show the button only when crossing the threshold (not on every pixel),
  // so the screen does not re-render all the time while scrolling
  const handleScroll = (event) => {
    const shouldShow = event.nativeEvent.contentOffset.y > SCROLL_TOP_THRESHOLD;
    if (shouldShow !== showScrollTop) setShowScrollTop(shouldShow);
  };

  const handleScrollToTop = () => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  // Shown at the end of the paginated list
  const renderFooter = () => {
    if (loadingMore) return <LoadingState message="Cargando más Pokémon..." />;
    if (error) return <ErrorState message={error} onRetry={handleRetry} />;
    if (!hasMore) return <Text style={styles.endText}>No hay más Pokémon.</Text>;
    return null;
  };

  const renderGrid = (data, isPaginated) => (
    // CONCEPT: FlatList renders only what is on screen (better than ScrollView + map)
    <FlatList
      ref={listRef}
      data={data}
      keyExtractor={(item) => String(item.id)}
      numColumns={2}
      renderItem={({ item }) => (
        <PokemonCard
          pokemon={item}
          onPress={() => {
            Keyboard.dismiss(); // do not carry the keyboard into the detail view
            onSelectPokemon(item.id);
          }}
        />
      )}
      onEndReached={isPaginated ? handleLoadMore : undefined}
      onEndReachedThreshold={0.5}
      ListFooterComponent={isPaginated ? renderFooter : null}
      onScroll={handleScroll}
      scrollEventThrottle={100} // check the position every 100 ms, not on every frame
      keyboardShouldPersistTaps="handled" // taps on cards work even with the keyboard open
      keyboardDismissMode="on-drag" // CONCEPT: start scrolling = hide the keyboard
      contentContainerStyle={styles.list}
    />
  );

  // CONCEPT: interface states — loading, error, empty, success
  let content = null;
  let hasGrid = false; // the button only makes sense when a list is on screen
  if (isSearchActive) {
    if (indexLoading) {
      content = <LoadingState message="Preparando búsqueda..." />;
    } else if (indexError) {
      content = <ErrorState message={indexError} onRetry={handleIndexRetry} />;
    } else if (searchResults.length === 0) {
      content = (
        <EmptyState message={`No se encontró ningún Pokémon que empiece por "${searchTerm}".`} />
      );
    } else {
      content = renderGrid(searchResults, false); // search results: no pagination
      hasGrid = true;
    }
  } else if (loading) {
    content = <LoadingState message="Cargando Pokémon..." />;
  } else if (error && pokemons.length === 0) {
    // Error on the first page: nothing to show yet
    content = <ErrorState message={error} onRetry={handleRetry} />;
  } else {
    content = renderGrid(pokemons, true);
    hasGrid = true;
  }

  return (
    // CONCEPT: tapping any empty area of the screen hides the keyboard
    <Pressable style={styles.container} onPress={Keyboard.dismiss} accessible={false}>
      <Text style={styles.title}>PokéDex Explorer</Text>

      <SearchBar
        value={searchText}
        onChangeText={setSearchText}
        onSearch={handleSearch}
      />

      {isSearchActive && (
        <Pressable onPress={handleClearSearch}>
          <Text style={styles.clear}>Ver todos los Pokémon</Text>
        </Pressable>
      )}

      {content}

      {/* Floating button over the list, bottom right corner */}
      {hasGrid && showScrollTop && (
        <Pressable
          style={({ pressed }) => [styles.scrollTopButton, pressed && styles.pressed]}
          onPress={handleScrollToTop}
          accessibilityLabel="Volver al inicio de la lista"
        >
          <Text style={styles.scrollTopText}>↑</Text>
        </Pressable>
      )}
    </Pressable>
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
  clear: {
    textAlign: 'center',
    color: colors.primary,
    fontWeight: 'bold',
    paddingBottom: spacing.sm,
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
  scrollTopButton: {
    position: 'absolute', // floats over the list instead of taking space
    right: spacing.lg,
    bottom: spacing.lg,
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    // shadow (iOS) and elevation (Android) so it stands out from the cards
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  scrollTopText: {
    color: colors.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
  pressed: {
    opacity: 0.7,
  },
});