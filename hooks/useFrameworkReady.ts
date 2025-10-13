// app/hooks/useFrameworkReady.ts
import { useState, useEffect } from 'react';
import * as Font from 'expo-font';

export function useFrameworkReady() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      try {
        await Font.loadAsync({
          Poppins: require('../assets/fonts/SpaceMono-Regular.ttf'), // chemin relatif correct
        });
      } catch (error) {
        console.error('Erreur lors du chargement :', error);
      } finally {
        setReady(true);
      }
    };

    prepare();
  }, []);

  return ready;
}
