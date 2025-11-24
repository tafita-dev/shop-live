import React, { useEffect, useState, ErrorInfo, useRef } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context'; // ⬅️ NOUVEL IMPORT

import {
  View,
  ActivityIndicator,
  Text,
  Button,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

import { CartProvider } from '@/components/contexts/CartContext';
import { PaperProvider } from 'react-native-paper';
import { usePushNotification } from '@/useNotifications';

// Empêcher l'auto hide du splash
SplashScreen.preventAutoHideAsync();

// -------------------------------------
// 🔊 Gestion du son de notification
// -------------------------------------
const notificationSound = new Audio.Sound();
let soundLoaded = false;

async function playNotificationSound() {
  try {
    if (!soundLoaded) {
      await notificationSound.loadAsync(
        require('../assets/Facebook-Notification.mp3'),
      );
      soundLoaded = true;
    }
    await notificationSound.stopAsync();
    await notificationSound.setPositionAsync(0);
    await notificationSound.playAsync();
  } catch (e) {
    console.warn('Erreur lecture son:', e);
  }
}

// -------------------------------------
// 🔔 Notification flottante type Messenger
// -------------------------------------
type FloatingProps = {
  notification: Notifications.Notification;
  isVisible: boolean;
  onPress: () => void;
};

const FloatingNotification = ({
  notification,
  isVisible,
  onPress,
}: FloatingProps) => {
  const translateY = useSharedValue(isVisible ? 0 : -200);

  useEffect(() => {
    translateY.value = withTiming(isVisible ? 0 : -200, {
      duration: 300,
    });
  }, [isVisible, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const content = notification.request.content;

  return (
    // 💡 NOTA : floatingContainer doit rester 'absolute' par rapport au RootLayout entier
    <Animated.View style={[styles.floatingContainer, animatedStyle]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        style={styles.floatingCard}
      >
        <View style={styles.floatingIcon}>
          <Text style={{ color: '#fff', fontSize: 18 }}>💬</Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.floatingTitle} numberOfLines={1}>
            {content.title || 'Nouveau message'}
          </Text>
          <Text style={styles.floatingText} numberOfLines={2}>
            {content.body}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ----------------------------------------
// 🛡️ Boundary des erreurs
// ----------------------------------------
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: any) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ERROR BOUNDARY CAUGHT:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Erreur</Text>
          <Text style={styles.errorMessage}>Une erreur est survenue.</Text>
          <Button
            title="Recharger"
            onPress={() => this.setState({ hasError: false })}
            color="#EC4899"
          />
        </View>
      );
    }
    return this.props.children;
  }
}

// ----------------------------------------
// ROOT LAYOUT
// ----------------------------------------
export default function RootLayout() {
  const frameworkReady = useFrameworkReady();
  const [appIsReady, setAppIsReady] = useState(false);
  const { notification: latestNotification } = usePushNotification();

  const [currentNotification, setCurrentNotification] =
    useState<Notifications.Notification | null>(null);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!latestNotification) return;

    setCurrentNotification(latestNotification);
    playNotificationSound();
    setVisible(true);

    if (timerRef.current) clearTimeout(timerRef.current);

    (timerRef.current as any) = setTimeout(() => {
      setVisible(false);
    }, 6000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [latestNotification]);

  const handlePressNotif = () => {
    setVisible(false);
  };

  useEffect(() => {
    if (frameworkReady && !appIsReady) {
      setTimeout(() => {
        setAppIsReady(true);
        SplashScreen.hideAsync();
      }, 400);
    }
  }, [frameworkReady, appIsReady]);

  if (!appIsReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#FFF" />
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider>
        <ErrorBoundary>
          <CartProvider>
            {/* 🔔 Notification flottante - doit rester en position absolue au-dessus de tout */}

            {/* 💡 Encapsulation de la navigation principale dans SafeAreaView */}
            {/* La SafeAreaView assure que le contenu de la Stack est à l'intérieur des zones sûres */}
            <SafeAreaView
              style={[
                styles.safeArea,
                // Laissez la SafeArea gérer la marge supérieure de base.
                // La marge conditionnelle est généralement gérée par la stack ou la route elle-même.
                // Si vous voulez une marge supplémentaire lorsque la notification est visible :
                {
                  paddingTop: visible ? (Platform.OS === 'ios' ? 40 : 20) : 0,
                },
              ]}
              edges={['right', 'bottom', 'left']} // Laissons la notification en 'absolute' gérer le haut
            >
              <Stack screenOptions={{ headerShown: false }}>
                {/* <Stack.Screen name="index" /> */}
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(client)" />
                <Stack.Screen name="(vendor)" />
                <Stack.Screen name="(livrer)" />
                <Stack.Screen name="(vendorLivrer)" />
                <Stack.Screen name="+not-found" />
              </Stack>
            </SafeAreaView>
            {currentNotification && (
              <FloatingNotification
                notification={currentNotification}
                isVisible={visible}
                onPress={handlePressNotif}
              />
            )}
            <StatusBar style="auto" />
          </CartProvider>
        </ErrorBoundary>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}

// ----------------------------------------
// STYLES
// ----------------------------------------
const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
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
    marginTop: 10,
    textAlign: 'center',
  },

  // ⬅️ NOUVEAU STYLE pour la SafeAreaView
  safeArea: {
    flex: 1,
    backgroundColor: '#fff', // Important pour éviter les fonds transparents sous la barre
  },

  // ---- Notification flottante ---
  floatingContainer: {
    position: 'absolute',
    // La SafeAreaView gère maintenant la zone sûre du contenu principal.
    // La notification flottante doit être fixée en haut de l'écran physique.
    top: Platform.OS === 'ios' ? 40 : 36, // Légèrement ajusté pour iOS (sous l'encoche)
    left: 0,
    right: 0,
    zIndex: 9999,
  },

  floatingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 15,
    backgroundColor: '#fff',
    borderRadius: 15,
    ...Platform.select({
      android: { elevation: 8 },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
    }),
  },

  floatingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EC4899',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  floatingTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  floatingText: {
    fontSize: 13,
    color: '#666',
  },
});
