import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../theme';

export default function StatBar({ label, value, max }) {
  // An invalid value shows "—" and an empty bar instead of "NaN%"
  const isValid = Number.isFinite(value) && Number.isFinite(max) && max > 0;
  // CONCEPT: proportional width — the bar fills value/max of the track (between 0 % and 100 %)
  const percentage = isValid ? Math.min(Math.max(value / max, 0), 1) * 100 : 0;

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{isValid ? value : '—'}</Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percentage}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    width: 100,
    color: colors.text,
    fontSize: 14,
  },
  value: {
    width: 40,
    textAlign: 'right',
    marginRight: spacing.sm,
    color: colors.text,
    fontWeight: 'bold',
  },
  track: {
    flex: 1,
    height: 10,
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
  },
});