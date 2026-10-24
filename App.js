import { useState } from 'react';
import { View, Pressable, Text } from 'react-native';
import LoadingState from './src/components/LoadingState';
import ErrorState from './src/components/ErrorState';
import EmptyState from './src/components/EmptyState';

export default function App() {
  const [state, setState] = useState('loading');

  return (
    <View style={{ flex: 1, paddingTop: 60 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
        {['loading', 'error', 'empty'].map((name) => (
          <Pressable key={name} onPress={() => setState(name)}>
            <Text style={{ padding: 12, fontWeight: 'bold' }}>{name}</Text>
          </Pressable>
        ))}
      </View>

      {state === 'loading' && <LoadingState message="Cargando Pokémon..." />}
      {state === 'error' && <ErrorState onRetry={() => setState('loading')} />}
      {state === 'empty' && <EmptyState message='No existe ningún Pokémon llamado "xyz".' />}
    </View>
  );
}