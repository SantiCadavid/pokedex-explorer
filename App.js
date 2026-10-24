import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { colors, typeColors } from './src/theme';
import { formatId, capitalize, translateType, translateStat } from './src/utils/format';

export default function App() {
  useEffect(() => {
    console.log('formatId:', formatId(25), formatId(1), formatId(1025));
    console.log('capitalize:', capitalize('pikachu'));
    console.log('types:', translateType('fire'), translateType('electric'), translateType('xyz'));
    console.log('stats:', translateStat('hp'), translateStat('special-attack'));
    console.log('colors:', colors.primary, typeColors.electric);
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Mira la terminal</Text>
    </View>
  );
}