import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  Animated,
  PanResponder,
  useWindowDimensions,
  StyleSheet,
} from 'react-native';
import { fetchPokemonDetail } from '../services/pokemonService';
import { LAST_POKEMON_ID } from '../config/api';
import { getErrorMessage } from '../utils/errors';
import TypeBadge from '../components/TypeBadge';
import StatBar from '../components/StatBar';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { colors, spacing, radius } from '../theme';
import { formatId, formatMeasure, translateStat } from '../utils/format';

const MAX_STAT = 255; // highest possible base stat
const SWIPE_THRESHOLD = 80; // pixels the finger must travel to change Pokémon

export default function DetailScreen({ pokemonId, onBack, onChangePokemon }) {
  const [pokemon, setPokemon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0); // "Reintentar"

  const { width } = useWindowDimensions();
  // CONCEPT: Animated.Value — moves the card with the finger without re-rendering the screen
  const translateX = useRef(new Animated.Value(0)).current;

  // Only national numbers (1..LAST_POKEMON_ID) have a previous / next
  const canNavigate =
    Number.isInteger(pokemonId) && pokemonId >= 1 && pokemonId <= LAST_POKEMON_ID;
  const hasPrevious = canNavigate && pokemonId > 1;
  const hasNext = canNavigate && pokemonId < LAST_POKEMON_ID;

  // CONCEPT: useEffect dependency array — changing pokemonId (swipe or arrows) loads the new one
  useEffect(() => {
    const controller = new AbortController();

    const loadDetail = async () => {
      setLoading(true);
      setError(null);
      setNotFound(false);
      setImageFailed(false);
      try {
        const result = await fetchPokemonDetail(pokemonId, controller.signal);
        setPokemon(result);
      } catch (err) {
        // CONCEPT: a cancelled request (AbortError) is not a real error
        if (err.name === 'AbortError') return;
        // CONCEPT: HTTP 404 means "does not exist", not a connection error
        if (err.status === 404) {
          setNotFound(true);
        } else {
          setError(getErrorMessage(err, 'la ficha del Pokémon'));
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadDetail();
    // CONCEPT: cleanup — swiping fast cancels the previous request
    return () => controller.abort();
  }, [pokemonId, reloadKey]);

  const handleRetry = () => setReloadKey((prev) => prev + 1);

  // direction: +1 = next, -1 = previous
  const goTo = (direction) => {
    const allowed = direction === 1 ? hasNext : hasPrevious;
    if (!allowed) return;
    // Slide the card out to the side, then show the new Pokémon in the center
    Animated.timing(translateX, {
      toValue: -direction * width,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      translateX.setValue(0);
      onChangePokemon(pokemonId + direction);
    });
  };

  // The swipe was too short: go back to the center with a small bounce
  const resetPosition = () => {
    Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
  };

  // CONCEPT: PanResponder — reads the finger movement to detect a horizontal swipe
  const panResponder = PanResponder.create({
    // Take the gesture only if it is clearly horizontal, so vertical moves keep scrolling
    onMoveShouldSetPanResponderCapture: (_, gesture) =>
      canNavigate &&
      Math.abs(gesture.dx) > 15 &&
      Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.5,
    onPanResponderTerminationRequest: () => false, // the ScrollView cannot steal the swipe
    onPanResponderMove: (_, gesture) => {
      // Resistance at the edges: #001 has no previous, the last one has no next
      const blocked = (gesture.dx > 0 && !hasPrevious) || (gesture.dx < 0 && !hasNext);
      translateX.setValue(blocked ? gesture.dx * 0.25 : gesture.dx);
    },
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx < -SWIPE_THRESHOLD && hasNext) goTo(1); // swipe left -> next
      else if (gesture.dx > SWIPE_THRESHOLD && hasPrevious) goTo(-1); // swipe right -> previous
      else resetPosition();
    },
    onPanResponderTerminate: resetPosition,
  });

  // CONCEPT: interface states — loading, error, empty, success
  let content;
  if (loading) {
    content = <LoadingState message="Cargando ficha..." />;
  } else if (error) {
    content = <ErrorState message={error} onRetry={handleRetry} />;
  } else if (notFound || !pokemon) {
    content = <EmptyState message="Este Pokémon no existe." />;
  } else {
    // The UI does not trust the state either: missing arrays become empty arrays
    const types = Array.isArray(pokemon.types) ? pokemon.types : [];
    const stats = Array.isArray(pokemon.stats) ? pokemon.stats : [];
    const showImage = Boolean(pokemon.image) && !imageFailed;

    content = (
      // A ScrollView is fine here: it is one fixed card, not a long list
      <ScrollView contentContainerStyle={styles.content}>
        {showImage ? (
          // CONCEPT: a remote Image needs explicit width and height
          <Image
            source={{ uri: pokemon.image }}
            style={styles.image}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={styles.placeholderText}>Sin imagen</Text>
          </View>
        )}

        <Text style={styles.number}>{formatId(pokemon.id)}</Text>
        <Text style={styles.name}>{pokemon.name || 'Desconocido'}</Text>

        <View style={styles.types}>
          {types.length > 0 ? (
            types.map((type) => <TypeBadge key={type} type={type} />)
          ) : (
            <Text style={styles.emptyText}>Sin tipos registrados</Text>
          )}
        </View>

        <View style={styles.measures}>
          <View style={styles.measureBox}>
            <Text style={styles.measureLabel}>ALTURA</Text>
            <Text style={styles.measureValue}>{formatMeasure(pokemon.height, 'm')}</Text>
          </View>
          <View style={styles.measureBox}>
            <Text style={styles.measureLabel}>PESO</Text>
            <Text style={styles.measureValue}>{formatMeasure(pokemon.weight, 'kg')}</Text>
          </View>
        </View>

        <View style={styles.statsBox}>
          <Text style={styles.section}>ESTADÍSTICAS BASE</Text>
          {stats.length > 0 ? (
            stats.map((stat) => (
              <StatBar
                key={stat.name}
                label={translateStat(stat.name)}
                value={stat.value}
                max={MAX_STAT}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>Sin estadísticas disponibles</Text>
          )}
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Always visible, even while loading or after an error */}
      <Pressable
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        onPress={onBack}
      >
        <Text style={styles.backText}>← Volver a la lista</Text>
      </Pressable>

      {/* Hint + arrows: the swipe can also be done by tapping */}
      {canNavigate && (
        <View style={styles.navRow}>
          <Pressable
            style={[styles.navButton, !hasPrevious && styles.navDisabled]}
            onPress={() => goTo(-1)}
            disabled={!hasPrevious}
            accessibilityLabel="Pokémon anterior"
          >
            <Text style={styles.navText}>
              {hasPrevious ? `‹ ${formatId(pokemonId - 1)}` : '‹'}
            </Text>
          </Pressable>

          <Text style={styles.hint}>Desliza para cambiar</Text>

          <Pressable
            style={[styles.navButton, !hasNext && styles.navDisabled]}
            onPress={() => goTo(1)}
            disabled={!hasNext}
            accessibilityLabel="Pokémon siguiente"
          >
            <Text style={styles.navText}>
              {hasNext ? `${formatId(pokemonId + 1)} ›` : '›'}
            </Text>
          </Pressable>
        </View>
      )}

      {/* The card moves with the finger */}
      <Animated.View
        style={[styles.fill, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        {content}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  fill: {
    flex: 1,
  },
  backButton: {
    alignSelf: 'flex-start',
    margin: spacing.md,
    marginBottom: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
  },
  backText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  pressed: {
    opacity: 0.7,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  navButton: {
    minWidth: 84,
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.pill,
  },
  navDisabled: {
    opacity: 0.3,
  },
  navText: {
    color: colors.primaryDark,
    fontWeight: 'bold',
  },
  hint: {
    color: colors.textMuted,
    fontSize: 12,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  image: {
    width: 220,
    height: 220,
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.pill,
  },
  placeholderText: {
    color: colors.textMuted,
    fontWeight: 'bold',
  },
  number: {
    marginTop: spacing.sm,
    color: colors.primaryDark,
    fontSize: 20,
    fontWeight: 'bold',
  },
  name: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase', // "pikachu" -> "PIKACHU"
    marginBottom: spacing.sm,
  },
  types: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  emptyText: {
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  measures: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  measureBox: {
    alignItems: 'center',
    minWidth: 120,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.lg,
  },
  measureLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  measureValue: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  statsBox: {
    alignSelf: 'stretch',
    padding: spacing.md,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.lg,
  },
  section: {
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
});