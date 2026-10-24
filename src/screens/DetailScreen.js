import { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, Pressable, StyleSheet } from 'react-native';
import { fetchPokemonDetail } from '../services/pokemonService';
import TypeBadge from '../components/TypeBadge';
import StatBar from '../components/StatBar';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { colors, spacing, radius } from '../theme';
import { formatId, capitalize, translateStat } from '../utils/format';

const MAX_STAT = 255; // highest possible base stat

// 0.4 -> "0,4 m"   6 -> "6,0 kg"
const formatMeasure = (value, unit) => `${value.toFixed(1).replace('.', ',')} ${unit}`;

export default function DetailScreen({ pokemonId, onBack }) {
  const [pokemon, setPokemon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [reloadKey, setReloadKey] = useState(0); // "Reintentar"

  // CONCEPT: useEffect dependency array — request again only if the id or reloadKey change
  useEffect(() => {
    const controller = new AbortController();

    const loadDetail = async () => {
      setLoading(true);
      setError(null);
      setNotFound(false);
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
          setError('No se pudo cargar la ficha del Pokémon. Revisa tu internet.');
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadDetail();
    // CONCEPT: cleanup — leaving the detail cancels the pending request
    return () => controller.abort();
  }, [pokemonId, reloadKey]);

  const handleRetry = () => setReloadKey((prev) => prev + 1);

  // CONCEPT: interface states — loading, error, empty, success
  let content;
  if (loading) {
    content = <LoadingState message="Cargando ficha..." />;
  } else if (error) {
    content = <ErrorState message={error} onRetry={handleRetry} />;
  } else if (notFound || !pokemon) {
    content = <EmptyState message="Este Pokémon no existe." />;
  } else {
    content = (
      // A ScrollView is fine here: it is one fixed card, not a long list
      <ScrollView contentContainerStyle={styles.content}>
        {/* CONCEPT: a remote Image needs explicit width and height */}
        <Image source={{ uri: pokemon.image }} style={styles.image} />
        <Text style={styles.number}>{formatId(pokemon.id)}</Text>
        <Text style={styles.name}>{capitalize(pokemon.name)}</Text>

        <View style={styles.types}>
          {pokemon.types.map((type) => (
            <TypeBadge key={type} type={type} />
          ))}
        </View>

        <View style={styles.measures}>
          <View style={styles.measureBox}>
            <Text style={styles.measureValue}>{formatMeasure(pokemon.height, 'm')}</Text>
            <Text style={styles.measureLabel}>Altura</Text>
          </View>
          <View style={styles.measureBox}>
            <Text style={styles.measureValue}>{formatMeasure(pokemon.weight, 'kg')}</Text>
            <Text style={styles.measureLabel}>Peso</Text>
          </View>
        </View>

        <Text style={styles.section}>Estadísticas base</Text>
        {pokemon.stats.map((stat) => (
          <StatBar
            key={stat.name}
            label={translateStat(stat.name)}
            value={stat.value}
            max={MAX_STAT}
          />
        ))}
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Always visible, even while loading or after an error */}
      <Pressable style={styles.backButton} onPress={onBack}>
        <Text style={styles.backText}>← Volver a la lista</Text>
      </Pressable>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backButton: {
    alignSelf: 'flex-start',
    margin: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
  },
  backText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  image: {
    width: 220,
    height: 220,
  },
  number: {
    marginTop: spacing.sm,
    color: colors.textMuted,
    fontSize: 16,
  },
  name: {
    color: colors.text,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  types: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  measures: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  measureBox: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  measureValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  measureLabel: {
    color: colors.textMuted,
    fontSize: 13,
  },
  section: {
    alignSelf: 'stretch',
    color: colors.primaryDark,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
});