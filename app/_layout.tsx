import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import * as SplashScreen from 'expo-splash-screen';
import { View, ActivityIndicator } from 'react-native';

// Empêche la fermeture automatique du splash screen
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const frameworkReady = useFrameworkReady();

  useEffect(() => {
    if (frameworkReady) {
      SplashScreen.hideAsync();
    }
  }, [frameworkReady]);

  if (!frameworkReady) {
    // Affiche un écran de chargement propre pendant l’initialisation
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#fff',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color="#EC4899" />
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        {/* ⚡️ Structure des routes principales */}
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(client)" />
        <Stack.Screen name="(vendor)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}
