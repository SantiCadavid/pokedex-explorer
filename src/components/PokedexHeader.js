import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';

// Top of the device: big blue lens, three small lights and the title
export default function PokedexHeader() {
  return (
    <View style={styles.header}>
      <View style={styles.lensOuter}>
        <View style={styles.lens}>
          <View style={styles.lensShine} />
        </View>
      </View>

      <View style={styles.lights}>
        <View style={[styles.light, { backgroundColor: colors.lightRed }]} />
        <View style={[styles.light, { backgroundColor: colors.lightYellow }]} />
        <View style={[styles.light, { backgroundColor: colors.lightGreen }]} />
      </View>

      <Text style={styles.title}>PokéDex Explorer</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 4,
    borderBottomColor: colors.bodyDark,
    marginBottom: spacing.md,
  },
  lensOuter: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.white,
    borderWidth: 3,
    borderColor: colors.frame,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lens: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.lens,
    borderWidth: 2,
    borderColor: colors.frame,
  },
  lensShine: {
    position: 'absolute',
    top: 6,
    left: 7,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.lensShine,
  },
  lights: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    marginLeft: spacing.sm,
  },
  light: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.frame,
    marginLeft: 6,
  },
  title: {
    flex: 1,
    textAlign: 'right',
    color: colors.white,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.5,
    textShadowColor: colors.bodyDark,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
});