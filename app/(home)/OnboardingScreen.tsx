import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// Importez votre hook de navigation Expo Router
import { useRouter } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// ⚠️ Assurez-vous d'avoir une image de logo dans votre dossier assets
// Par exemple : require('../assets/logo.png')
const AppLogo = require('../../assets/images/icon.png');

export default function OnboardingScreen({}) {
  // Si vous utilisez ce composant directement dans une route Expo Router
  const router = useRouter();

  // Utilisation alternative si vous voulez le rendre plus générique :
  // const handlePress = onContinue ? onContinue : () => router.push('/home');

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      // SafeAreaView assure que le contenu ne chevauche pas les barres système
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {/* 1. Logo ou Image */}
          <Image source={AppLogo} style={styles.logo} resizeMode="contain" />

          {/* 2. Texte de Bienvenue */}
          <Text style={styles.title}>Bienvenue sur notre Application !</Text>
          <Text style={styles.subtitle}>
            Découvrez une nouvelle façon de gérer vos commandes et livraisons.
          </Text>
        </View>

        {/* 3. Bouton Continuer */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace('/(client)')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Continuer</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'space-between', // Aligner le contenu en haut et le bouton en bas
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center', // Centrer verticalement le logo et les textes
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 40,
    // Ajoutez ici des styles pour votre logo si nécessaire
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#EC4899', // Utilisation de la couleur rose de vos autres composants
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10, // Un peu d'espace au-dessus du bas de la SafeArea
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
