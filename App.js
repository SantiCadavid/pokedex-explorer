import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { fetchPokemonList, fetchPokemonDetail } from './src/services/pokemonService';

export default function App() {
  useEffect(() => {
    const test = async () => {
      const list = await fetchPokemonList(0);
      console.log('LIST:', list.results[0], 'hasMore:', list.hasMore);
      const detail = await fetchPokemonDetail('  Pikachu ');
      console.log('DETAIL:', detail);
      try {
        await fetchPokemonDetail('noexiste');
      } catch (e) {
        console.log('404 test:', e.message, e.status);
      }
    };
    test();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Mira la terminal</Text>
    </View>
  );
}