import React, { useEffect, useState, ErrorInfo } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import * as SplashScreen from 'expo-splash-screen';
import {
  View,
  ActivityIndicator,
  Text,
  Button,
  StyleSheet,
} from 'react-native';
import { CartProvider } from '@/components/contexts/CartContext';
import { PaperProvider } from 'react-native-paper';

// Empêche la fermeture automatique du splash screen
SplashScreen.preventAutoHideAsync();

/**
 * Composant pour gérer les erreurs et éviter que l'application ne plante.
 * C'est la principale amélioration pour "n'exploser autre composant".
 */
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: any) {
    // Met à jour l'état pour que le prochain rendu affiche l'UI de secours.
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Vous pouvez également enregistrer l'erreur dans un service de journalisation d'erreurs
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Afficher l'UI de secours
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>
            💥 Oops, une erreur est survenue !
          </Text>
          <Text style={styles.errorMessage}>
            Nous sommes désolés, l'application a rencontré un problème. Veuillez
            réessayer.
          </Text>
          <Button
            title="Recharger l'application"
            onPress={() => this.setState({ hasError: false })}
            color="#EC4899"
          />
        </View>
      );
    }

    return this.props.children;
  }
}

export default function RootLayout() {
  const frameworkReady = useFrameworkReady();
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    if (frameworkReady && !appIsReady) {
      // Retard optionnel pour une meilleure UX si l'initialisation est trop rapide
      setTimeout(() => {
        setAppIsReady(true);
        SplashScreen.hideAsync();
      }, 500); // Délai de 500ms
    }
  }, [frameworkReady, appIsReady]);

  if (!appIsReady) {
    // Écran de chargement initial (le splash screen est encore visible ou on affiche l'indicateur)
    return (
      <View style={styles.loadingContainer}>
        {/* On utilise une couleur plus vive pour l'indicateur si le fond est blanc */}
        <ActivityIndicator size="large" color="#EC4899" />
        <StatusBar style="dark" />
      </View>
    );
  }

  return (
    // L'ajout de l'ErrorBoundary rend l'application plus résiliente
    <PaperProvider>
      <ErrorBoundary>
        <CartProvider>
          <Stack screenOptions={{ headerShown: false }}>
            {/* ⚡️ Structure des routes principales */}

            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(client)" />
            <Stack.Screen name="(vendor)" />
            <Stack.Screen name="(livrer)" />
            <Stack.Screen name="(vendorLivrer)" />
            <Stack.Screen name="+not-found" />
          </Stack>
        </CartProvider>
        {/* Utiliser 'auto' pour que la couleur de la barre d'état s'adapte au fond de l'écran actuel */}
        <StatusBar style="auto" />
      </ErrorBoundary>
    </PaperProvider>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff', // Fond blanc pour l'indicateur de chargement
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#EC4899',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
    marginBottom: 20,
  },
});
